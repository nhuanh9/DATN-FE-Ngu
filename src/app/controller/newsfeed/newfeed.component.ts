import {Component, OnInit} from '@angular/core';
import {Conversation} from "../../model/Conversation";
import {PostDisplay} from "../../model/Post-display";
import {Users} from "../../model/Users";
import {ImagePost} from "../../model/Image-post";
import {PostComment} from "../../model/Post-comment";
import {PostStatus} from "../../model/Post-status";
import {Notifications} from "../../model/Notifications";
import {Post} from "../../model/Post";
import * as moment from 'moment';
import {FormGroup, FormControl} from "@angular/forms";
import {AngularFireStorage, AngularFireStorageReference} from "@angular/fire/compat/storage";
import {NavigationEnd, Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {PostService} from 'src/app/service/post/post.service';
import {UserService} from "../../service/user/user.service";
import {Stomp} from "@stomp/stompjs";
import {NotificationService} from 'src/app/service/notification/notification.service';
import {ChatService} from 'src/app/service/chat/chat.service';
import {CometChat} from "@cometchat-pro/chat";

@Component({
  selector: 'app-newfeed',
  templateUrl: './newfeed.component.html',
  styleUrls: ['./newfeed.component.css']
})
export class NewfeedComponent implements OnInit {
  data = localStorage.getItem("user")
  // @ts-ignore
  user: Users = JSON.parse(this.data)
  postsDisplay: PostDisplay[] = [];
  listFriend: Users[] = [];
  listImgPost: ImagePost[][] = [];
  listFriendPost: Users[][] = [];
  listImg: any[] = [];
  listComment: PostComment[] = [];
  listAllComment: PostComment[][] = [];
  listCommentLike: number[][] = [];
  listCheckLikeComment: boolean[][] = [];
  countLike: any[] = [];
  countComment: any[] = [];
  listPostStatus: PostStatus[] = [];
  listImgCreate: ImagePost[] = [];
  imageFiles: any[] = [];
  imgSrc: string[] = [];
  timeMoment: any[] = []
  timeMomentComment: any[][] = []
  listRequest: Users[] = [];
  listNotification: Notifications[] = [];
  countNotSeen: number = 0
  timeNotificationMoment: any[] = [];
  countOther: any[] = [];
  pathName!: string
  flag!: false;
  postCm?: Post
  commentP?: PostComment
  numToShow = 3;
  showFullContent: boolean = false;
  maxHeight: number = 30;


  private stompClient: any;
  listSearchFriend: Users[] = []

  commentForm: FormGroup = new FormGroup({
    content: new FormControl()
  })

  commentFormEdit: FormGroup = new FormGroup({
    id: new FormControl(),
    content: new FormControl(),
    cmtAt: new FormControl(),
    post: new FormGroup({
      id: new FormControl()
    })
  })
  listAllConversation: Conversation[] = [];
  listMemberName: any [] = []
  listAvatarMember: any [] = []

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
    this.findAll()
    this.findAllFriend()
    this.getAllPostStatus()
    // this.onMoveTop()
    this.findListRequest()
    this.connect()
    this.getAllConversation()
  }

  showMore() {
    this.numToShow += 5;
  }

  showLess() {
    this.numToShow -= 5;
  }

  toggleShowFullContent() {
    this.showFullContent = !this.showFullContent;
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
              private notificationService: NotificationService,
              private router: Router,
              private chatService: ChatService,
              private toastr: ToastrService) {

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

  getAllNotification() {
    this.timeNotificationMoment = []
    this.notificationService.getNotification(this.user.id).subscribe(data => {
      this.listNotification = data
      for (let j = 0; j < this.checkValidNotification().length; j++) {
        this.timeNotificationMoment.push(moment(this.listNotification[j].notificationAt).fromNow())
      }
      this.countNotSeen = 0
      for (let i = 0; i < this.checkValidNotification().length; i++) {
        // @ts-ignore
        if (!this.checkValidNotification()[i].status) {
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
    this.notificationService.seenNotification(notification.id).subscribe(() => {
      this.getAllNotification()
    });
  }

  findAllFriend() {
    // @ts-ignore
    this.userService.findAllFriend(this.user.id).subscribe((data) => {
      this.listFriend = data
      this.getAllNotification()
    })
  }

  findAll() {
    this.postService.findAllPostNewFeed(this.user).subscribe((post) => {
      this.postsDisplay = post
      for (let j = 0; j < post.length; j++) {
        this.timeMoment.push(moment(post[j].createAt).fromNow())
      }
      this.findAllImgPost(post)
      this.findFriendLike(post)
      this.findCountLike(post)
      this.findCountComment(post)
      this.getAllListComment(post)

    })
  }

  findFriendLike(posts: Post[]) {
    this.postService.findLikePost(posts).subscribe(like => {
      if (like != null) {
        this.listFriendPost = like
      }
    })
  }

  findCountLike(posts: Post[]) {
    this.postService.findCountLikePost(posts).subscribe(countLike => {
      this.countLike = countLike
    })
  }

  deleteRequest(friendRequestId: any) {
    this.userService.deleteRequest(this.user.id, friendRequestId).subscribe(() => {
      this.findListRequest()
      // this.sendNotification()
    })
  }

  confirmRequest(friendRequestId: any) {
    this.userService.confirmRequest(this.user.id, friendRequestId).subscribe(() => {
      this.findListRequest()
      // this.sendNotification()
    })
  }

  findCountComment(posts: Post[]) {
    this.postService.findCountCommentPost(posts).subscribe(countComment => {
      this.countComment = countComment
    })
  }

  addComment(post: Post) {
    const postComment = this.commentForm.value;
    postComment.users = this.user;
    postComment.idParent = post.id;
    postComment.parentType = true;

    this.postService.addComment(postComment).subscribe(() => {
      this.findAll()
      this.commentForm.reset()
      // this.sendNotification();
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
    postComment.cmtAt = this.commentP?.cmtAt
    // @ts-ignore
    this.postService.editComment(postComment.id, postComment).subscribe(() => {
      this.findAll()
      document.getElementById("edit-comment")?.click();
    })
  }

  deleteComment(id: number) {
    this.postService.deleteComment(id).subscribe(() => {
      this.findAll()
    })
  }


  getAllListComment(posts: Post[]) {
    this.postService.getAllListComment(posts).subscribe(data => {
      if (data != null) {
        this.listAllComment = data
        // console.log(moment(data[2][1].cmtAt).fromNow())
        for (let e = 0; e < data.length; e++) {
          if (data[e].length > 0) {
            this.timeMomentComment[e] = []
            for (let f = 0; f < data[e].length; f++) {
              // @ts-ignore
              this.timeMomentComment[e][f] = moment(data[e][f].cmtAt).fromNow()
            }
          } else {
            this.timeMomentComment[e] = []
          }
        }
      }
      this.getListCommentLike()
      this.getListCheckLikeComment()
    })
  }

  likeComment(id: number) {
    // @ts-ignore
    this.postService.likeComment(this.user.id, id).subscribe(() => {
      this.findAll()
    })
  }


  findAllImgPost(posts: Post[]) {
    this.postService.findAllImgPost(posts).subscribe(img => {
      this.listImgPost = img
      for (let i = 0; i < this.listImgPost.length; i++) {
        // @ts-ignore
        this.listImg[i] = [];
        for (let j = 0; j < this.listImgPost[i].length; j++) {
          // @ts-ignore
          let imageObject1 = {
            image: this.listImgPost[i][j].img,
            thumbImage: this.listImgPost[i][j].img,
          };
          this.listImg[i].push(imageObject1);
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

  createPost() {
    const post = this.postForm.value
    post.users = this.user
    this.postService.createPost(post).subscribe(data => {
      console.log(data)
      this.timeMoment = []
      // @ts-ignore
      if (this.imageFiles.length === 0) {
        // this.sendNotification()
        this.postForm.reset();
        // @ts-ignore
        this.postForm.get("postStatus")?.get("id").setValue(1)
        this.findAll();
        document.getElementById("btn-close")?.click()
        this.success()
      } else {
        this.createPostImg(data)
      }
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

  createPostImg(post: Post) {
    console.log(this.imageFiles)
    console.log(post)
    if (this.imageFiles !== undefined) {
      this.checkUploadMultiple = true
      this.arrFileInFireBase = this.storage.ref(this.imageFiles[this.i].name);
      this.arrFileInFireBase.put(this.imageFiles[this.i]).then(data => {
        return data.ref.getDownloadURL();
      }).then(url => {
        this.checkUploadMultiple = false
        let imagePost: ImagePost = {
          posts: post,
          img: url
        }
        console.log(imagePost)
        this.listImgCreate.push(imagePost)
      }).then(() => {
        this.i++
        if (this.i < this.imageFiles.length) {
          this.createPostImg(post)
        } else {
          this.i = 0
          this.postService.createPostImg(this.listImgCreate).subscribe(() => {
            this.findAll()
          })
          document.getElementById("btn-close")?.click()
          document.getElementById("btn-close")?.click()
          this.postForm.reset();
          // @ts-ignore
          this.postForm.get("postStatus")?.get("id").setValue(1)
          this.imageFiles = []
          this.imgSrc = []
          // this.sendNotification()
          this.success()
        }
      })
    }
  }

  findListRequest() {
    // @ts-ignore
    this.userService.findListRequestFriend(this.user.id).subscribe((data) => {
      this.listRequest = data
      console.log(this.listRequest)
    })
  }

  likePost(idPost?: number) {
    this.postService.likePost(this.user.id, idPost).subscribe(() => {
      // this.sendNotification();
      this.findAll()
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
    console.log(this.user)
    this.userService.logOut(this.user).subscribe(() => {
      localStorage.clear();
      // this.sendNotification()
      this.router.navigate(['/']);
    })
  }

  getChatRoom(conversation: Conversation) {
    window.localStorage.setItem("roomChat", JSON.stringify(conversation));
    this.router.navigate(['/message']);
  }

  getListCommentLike() {
    this.postService.getCountComment(this.listAllComment).subscribe(data => {
      this.listCommentLike = data
    })
  }

  getListCheckLikeComment() {
    this.postService.getCheckLikeComment(this.listAllComment, this.user.id).subscribe(data => {
      this.listCheckLikeComment = data
    })
  }

  searchUserByNameContaining(name: string) {
    window.localStorage.setItem("nameUser", JSON.stringify(name));
    this.userService.findUsersByNameContaining(name).subscribe(data => {
      window.localStorage.setItem("listUser", JSON.stringify(data));
      this.router.navigate(['/search-friend']);

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
            if (data[i].name !== null) {
              this.listMemberName.push(data[i].name)
            } else {
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

  onLoginError: boolean = false;
  errorMsg: string = "";

  onLogin(UID: any) {
    //@ts-ignore
    CometChat.login(UID, COMETCHAT_CONSTANTS.AUTH_KEY).then(
      (user) => {
        console.log("Login Successful:", {user});
        this.router.navigate(["/message"]);
      },
      (error) => {
        //@ts-ignore
        console.log("Login failed with exception:", {error});
        this.onLoginError = true;
        this.errorMsg = error.message;
      }
    );
  }

  success(): void {
    this.toastr.success('Create post successfully !', 'Success');
  }

}
