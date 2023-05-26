import { Component } from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {AngularFireStorage, AngularFireStorageReference} from "@angular/fire/compat/storage";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import * as moment from "moment/moment";
import Swal from "sweetalert2";
import {Stomp} from "@stomp/stompjs";
import {PostDisplay} from "../../model/Post-display";
import {Users} from "../../model/Users";
import {ImagePost} from "../../model/Image-post";
import {PostComment} from "../../model/Post-comment";
import {PostStatus} from "../../model/Post-status";
import {Notifications} from "../../model/Notifications";
import {Post} from "../../model/Post";
import {Conversation} from "../../model/Conversation";
import {PostService} from "../../service/post/post.service";
import {UserService} from "../../service/user/user.service";
import {NotificationService} from "../../service/notification/notification.service";
import {ChatService} from "../../service/chat/chat.service";

@Component({
  selector: 'app-post-detail',
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.css']
})
export class PostDetailComponent {

  data = localStorage.getItem("user")
  // @ts-ignore
  user: Users = JSON.parse(this.data)
  postsDisplay: PostDisplay[] = [];
  listFriend: Users[] = [];
  listImgPost: ImagePost[] = [];
  listFriendPost: Users[] = [];
  listImg: any[] = [];
  listComment: PostComment[] = [];
  listAllComment: PostComment[] = [];
  listCommentLike: number[] = [];
  listCheckLikeComment: boolean[][] = [];
  countLike: any;
  countComment: any;
  listPostStatus: PostStatus[] = [];
  listImgCreate: ImagePost[] = [];
  imageFiles: any[] = [];
  imgSrc: string[] = [];
  timeMoment: any;
  timeMomentComment: any[] = []
  listRequest: Users[] = [];
  listNotification: Notifications[] = [];
  countNotSeen: number = 0
  timeNotificationMoment: any[] = [];
  countOther: any[] = [];
  pathName!: string
  flag!: false;
  postCm?: Post;
  postId?: any = this.routerActive.snapshot.paramMap.get("id")
  postDetail!: PostDisplay
  commentP?: PostComment
  private stompClient: any;
  numToShow = 3;

  commentForm: FormGroup = new FormGroup({
    content: new FormControl()
  })
  listAllConversation: Conversation[] = [];
  listMemberName: any [] = []
  listAvatarMember: any [] = []

  commentFormEdit: FormGroup = new FormGroup({
    id: new FormControl(),
    content: new FormControl(),
    cmtAt: new FormControl(),
    post: new FormGroup({
      id: new FormControl()
    })
  })

  showMore() {
    this.numToShow += 5;
  }

  showLess() {
    this.numToShow -= 5;
  }

  postForm: FormGroup = new FormGroup({
    content: new FormControl(),
    postStatus: new FormGroup({
      id: new FormControl("1")
    })
  })
  // upload file c2
  arrFileInFireBase: AngularFireStorageReference | undefined
  checkUploadMultiple = false;

  ngOnInit(): void {
    // @ts-ignore
    this.findAllFriend()
    this.getAllPostStatus()
    // this.onMoveTop()
    this.findListRequest()
    this.getPost()
    this.getAllNotification()
    this.connect()
    this.getAllConversation()
  }

  getChatRoom(conversation: Conversation){
    window.localStorage.setItem("roomChat", JSON.stringify(conversation));
    this.router.navigate(['/message']);
  }

  onMoveTop() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        window.scrollTo(0, 0);
      }
    })
  }

  constructor(private postService: PostService,
              private userService: UserService,
              private storage: AngularFireStorage,
              private routerActive: ActivatedRoute,
              private notificationService: NotificationService,
              private router: Router,
              private chatService:ChatService) {

  }

  connect() {
    const socket = new WebSocket('ws://localhost:8080/ws/websocket');
    this.stompClient = Stomp.over(socket);
    const _this = this;
    this.stompClient.connect({}, function () {
      _this.stompClient.subscribe('/topic/greetings', function (notification: any) {
        _this.getAllNotification()
        _this.findListRequest()
        _this.findAllFriend()
      })
    })
  }

  sendNotification() {
    // @ts-ignore
    this.stompClient.send('/app/hello', {}, this.user.id.toString());
  }

  searchUserByNameContaining(name: string) {
    window.localStorage.setItem("nameUser", JSON.stringify(name));
    this.userService.findUsersByNameContaining(name).subscribe(data => {
      window.localStorage.setItem("listUser", JSON.stringify(data));
      this.router.navigate(['/search-friend']);

    })
  }

  getAllNotification() {
    this.timeNotificationMoment = []

    this.notificationService.getNotification(this.user.id).subscribe(data => {
      this.listNotification = data
      this.countNotSeen = 0
      for (let j = 0; j < this.checkValidNotification().length; j++) {
        this.timeNotificationMoment.push(moment(this.listNotification[j].notificationAt).fromNow())
        if (!this.checkValidNotification()[j].status) {
          this.countNotSeen++
        }
      }
      this.countOtherNotification(this.listNotification);
    })
  }

  countOtherNotification(notification: Notifications[]) {
    this.notificationService.countOther(notification).subscribe(data => {
      this.countOther = data
    })
  }

  checkValidNotification() {
    for (let t = 0; t < this.listNotification.length; t++) {
      if (this.listNotification[t]?.users?.id == this.user.id) {
        this.listNotification.splice(t, 1)
        t--;
      }
      if (this.listNotification[t]?.notificationType?.id == 1) {
        let flag = true;
        for (let k = 0; k < this.listFriend.length; k++) {
          if (this.listNotification[t].users?.id == this.listFriend[k].id) {
            flag = false;
          }
        }
        if (flag) {
          this.listNotification.splice(t, 1)
          t--;
        }
      }
    }
    return this.listNotification;
  }

  seenNotification(notification: Notifications) {
    this.notificationService.seenNotification(notification.id).subscribe(() =>{
      this.getAllNotification()
      this.router.navigate(['/postDetail/' + notification?.post?.id])
      this.router.routeReuseStrategy.shouldReuseRoute = function () {
        return false;
      };
      this.getPost()
    });
  }

  findAllFriend() {
    // @ts-ignore
    this.userService.findAllFriend(this.user.id).subscribe((data) => {
      this.listFriend = data
    })
  }

  getPost() {
    this.postService.getPostDisplay(this.postId, this.user.id).subscribe(data => {
      this.postDetail = data
      this.findFriendLike(data)
      this.timeMoment = moment(this.postDetail.createAt).fromNow()
      this.findAllImgPost(data)
      this.findFriendLike(data)
      this.findCountLike(data)
      this.findCountComment(data)
      this.getAllListComment(data)
    })
  }

  findFriendLike(posts: Post) {
    this.postService.getListLikePost(posts).subscribe(like => {
      this.listFriendPost = like
    })
  }

  findCountLike(post: Post) {
    this.postService.findCountLikeOnePost(post).subscribe(countLike => {
      this.countLike = countLike
    })
  }

  deleteRequest(friendRequestId: any) {
    this.userService.deleteRequest(this.user.id, friendRequestId).subscribe(() => {
      this.findListRequest()
      this.sendNotification()
    })
  }

  confirmRequest(friendRequestId: any) {
    this.userService.confirmRequest(this.user.id, friendRequestId).subscribe(() => {
      this.findListRequest()
      this.sendNotification()
    })
  }

  findCountComment(post: Post) {
    this.postService.findCountCommentOnePost(post).subscribe(countComment => {
      this.countComment = countComment
    })
  }

  addComment(id: any) {
    this.postService.getPost(id).subscribe(post => {
      const postComment = this.commentForm.value
      postComment.users = this.user
      postComment.post = post

      this.postService.addComment(postComment).subscribe(() => {
        this.getPost()
        this.commentForm.reset()
        this.sendNotification()
      })
    })
  }


  getCommentById(id: number) {
    this.postService.getCommentById(id).subscribe((data) => {
      this.commentP = data
      this.commentFormEdit.patchValue(data)
      console.log(data)
    })
  }

  editComment() {
    const postComment = this.commentFormEdit.value
    postComment.users = this.user
    postComment.cmtAt = this.commentP?.cmtAt
    // @ts-ignore
    this.postService.editComment(this.commentP.id, postComment).subscribe(() => {
      this.getPost()
      document.getElementById("edit-comment")?.click()
    })
  }

  deleteComment(id: number) {
    this.postService.deleteComment(id).subscribe(() => {
      this.getPost()
    })
  }


  getAllListComment(post: Post) {
    this.postService.getListComment(post.id).subscribe(data => {
      if (data != null){
        this.listAllComment = data
        for (let f = 0; f < data.length; f++) {
          // @ts-ignore
          this.timeMomentComment[f] = moment(data[f].cmtAt).fromNow()
        }
        this.getListCommentLike()
        this.getListCheckLikeComment()
      }
    })
  }

  likeComment(id: number) {
    // @ts-ignore
    this.postService.likeComment(this.user.id, id).subscribe(() => {
      this.getPost()
      this.sendNotification()
    })
  }


  findAllImgPost(post: Post) {
    this.postService.getImg(post.id).subscribe(img => {
      this.listImgPost = img
      // @ts-ignore
      this.listImg = [];
      for (let j = 0; j < this.listImgPost.length; j++) {
        // @ts-ignore
        let imageObject1 = {
          image: this.listImgPost[j].img,
          thumbImage: this.listImgPost[j].img,
        };
        this.listImg.push(imageObject1);
        if (j == this.listImgPost.length -1){
          console.log(this.listImg)
        }
      }

    })
  }

  getCommentByIdPost(id: number) {
    this.postService.getListComment(id).subscribe(data => {
      this.listComment = data
    })
  }

  getAllPostStatus() {
    this.postService.getAllPostStatus().subscribe(data => {
      this.listPostStatus = data;
    })
  }

  submitAvatar(event: any) {
    this.imageFiles = event.target.files;
    for (let i = 0; i < this.imageFiles.length; i++) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imgSrc.push(e.target.result);
      };
      reader.readAsDataURL(this.imageFiles[i]);
    }
  }

  i = 0;


  findListRequest() {
    // @ts-ignore
    this.userService.findListRequestFriend(this.user.id).subscribe((data) => {
      this.listRequest = data

    })
  }

  likePost(idPost?: number) {
    this.postService.likePost(this.user.id, idPost).subscribe(() => {
      this.sendNotification()
      this.getPost()
    })
  }

  deleteImgCreate(id: any | undefined) {
    this.imgSrc.splice(id, 1);
    let a: any[] = []
    for (let i = 0; i < this.imageFiles.length; i++) {
      if (i != id) {
        a.push(this.imageFiles[i])
      }
    }
    this.imageFiles = a
  }

  logOut() {
    this.userService.logOut(this.user).subscribe(()=>{
      localStorage.removeItem("user");
      this.sendNotification()
      this.router.navigate(['']);
    })
  }

  getListCommentLike() {
    this.postService.getCountCommentOnePost(this.listAllComment).subscribe(data => {
      this.listCommentLike = data
    })
  }

  getListCheckLikeComment() {
    this.postService.getCheckLikeCommentOnePost(this.listAllComment, this.user.id).subscribe(data => {
      this.listCheckLikeComment = data
    })
  }


  getAllConversation() {
    // @ts-ignore
    this.chatService.getAllConversation(this.user).subscribe(data => {
      this.listAllConversation = data
      this.chatService.findAllMemberInConversation(data).subscribe(dataMember => {
        for (let i = 0; i < dataMember.length; i++) {
          if (this.listAllConversation[i].type === 1) {
            for (let j = 0; j < dataMember[i].length; j++) {
              if (dataMember[i][j].id !== this.user.id) {
                this.listMemberName.push(dataMember[i][j].name)
                this.listAvatarMember.push(dataMember[i][j].avatar)
                break;
              }
            }
          } else {
            this.listAvatarMember.push("https://phunugioi.com/wp-content/uploads/2021/11/Hinh-anh-nhom-ban-than-tao-dang-vui-ve-ben-bo-bien-395x600.jpg")
            if (data[i].name !== null){
              this.listMemberName.push(data[i].name)
            }else {
              this.listMemberName[i] = ""
              for (let j = 0; j < dataMember[i].length; j++) {
                this.listMemberName[i] += dataMember[i][j].name
                if (j < dataMember[i].length - 1) {
                  this.listMemberName[i] += `, `;
                }
              }
            }
          }
        }
      })
    })
  }

}
