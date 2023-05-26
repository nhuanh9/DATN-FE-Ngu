import {Component, OnInit} from '@angular/core';
import {AngularFireStorage, AngularFireStorageReference} from "@angular/fire/compat/storage";
import {Users} from "../../model/Users";
import {PostDisplay} from "../../model/Post-display";
import {ImagePost} from "../../model/Image-post";
import {PostStatus} from "../../model/Post-status";
import {Notifications} from "../../model/Notifications";
import {Post} from "../../model/Post";
import {PostComment} from "../../model/Post-comment";
import {Conversation} from "../../model/Conversation";
import {FormGroup, FormControl} from "@angular/forms";
import {UserService} from "../../service/user/user.service";
import {PostService} from "../../service/post/post.service";
import {NotificationService} from "../../service/notification/notification.service";
import {ActivatedRoute, Router} from "@angular/router";
import {ChatService} from "../../service/chat/chat.service";
import {ToastrService} from "ngx-toastr";
import {Stomp} from "@stomp/stompjs";
import * as moment from 'moment';
import Swal from "sweetalert2";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  data = localStorage.getItem("user")
  // @ts-ignore
  user: Users = JSON.parse(this.data)
  arrFileInFireBase: AngularFireStorageReference | undefined
  listFriend: Users[] = [];
  listPostProfile: PostDisplay[] = []
  listFriendPost: Users[][] = [];
  listImgPost: ImagePost[][] = [];
  listPostStatus: PostStatus[] = [];
  listImg: any[] = [];
  listImgCreate: ImagePost[] = [];
  listNotification: Notifications[] = [];
  checkUploadMultiple = false;
  timeMoment: any[] = [];
  timeMomentComment: any[][] = []
  countLike: any[] = [];
  imageFiles: any[] = [];
  imgSrc: string[] = [];
  listImgDelete: number[] = [];
  listImgUpdate: ImagePost[] = [];
  countComment: any[] = [];
  timeNotificationMoment: any[] = [];
  countOther: any[] = [];
  listRequest: Users[] = [];
  post!: Post
  private stompClient: any;
  commentP?: PostComment
  listComment: PostComment[] = [];
  listAllComment: PostComment[][] = [];
  listCommentLike: number[][] = [];
  listCheckLikeComment: boolean[][] = [];
  countNotSeen: number = 0
  numToShow = 3;
  listPhoto: any[] = []

  listAllConversation: Conversation[] = [];
  listMemberName: any [] = []
  listAvatarMember: any [] = []

  postForm: FormGroup = new FormGroup({
    content: new FormControl(),
    postStatus: new FormGroup({
      id: new FormControl("1")
    })
  })

  postUpdateForm: FormGroup = new FormGroup({
    id: new FormControl(),
    users: new FormGroup({
      id: new FormControl()
    }),
    content: new FormControl(),
    createAt: new FormControl(),
    postStatus: new FormGroup({
      id: new FormControl()
    })
  })


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

  ngOnInit(): void {
    this.findAllFriend()
    this.findPostAllProfile()
    this.getAllPostStatus()
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


  constructor(private userService: UserService,
              private postService: PostService,
              private notificationService: NotificationService,
              private routerActive: ActivatedRoute,
              private storage: AngularFireStorage,
              private router: Router,
              private chatService: ChatService,
              private toastr: ToastrService) {
  }

  // @ts-ignore
  findAllFriend(): Users[] {
    // @ts-ignore
    this.userService.findAllFriend(this.user.id).subscribe((data) => {
      this.listFriend = data
      this.getAllNotification()
    })
  }

  getChatRoom(conversation: Conversation) {
    window.localStorage.setItem("roomChat", JSON.stringify(conversation));
    this.router.navigate(['/message']);
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

  seenNotification(id: number | undefined) {
    this.notificationService.seenNotification(id).subscribe();
  }

  findPostAllProfile() {
    // @ts-ignore
    this.postService.findAllPostProfile(this.user.id).subscribe(data => {
      this.listPostProfile = data
      for (let j = 0; j < this.listPostProfile.length; j++) {
        this.timeMoment.push(moment(this.listPostProfile[j].createAt).fromNow())
      }
      this.findAllImgPost(data)
      this.findFriendLike(data)
      this.findCountLike(data)
      this.findCountComment(data)
      this.getAllListComment(data)

    })
  }

  findFriendLike(posts: Post[]) {
    this.postService.findLikePost(posts).subscribe(like => {
      this.listFriendPost = like
    })
  }

  findCountLike(posts: Post[]) {
    this.postService.findCountLikePost(posts).subscribe(countLike => {
      this.countLike = countLike
    })
  }

  findCountComment(posts: Post[]) {
    this.postService.findCountCommentPost(posts).subscribe(countComment => {
      this.countComment = countComment
    })
  }


  findAllImgPost(posts: Post[]) {
    this.postService.findAllImgPost(posts).subscribe(img => {
      this.listImgPost = img
      this.listPhoto = []
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

          // @ts-ignore
          if (this.listImgPost[i][j].posts.users.id === this.user.id) {
            this.listPhoto.push(this.listImgPost[i][j])
          }
        }
      }
    })
  }

  deletePost(id: any) {
    Swal.fire({
      title: 'Are you sure you want to delete?',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes'
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.postService.deletePost(id).subscribe(() => {
          this.findPostAllProfile()
        })
      }
    })
  }

  searchOnWall(content: string) {
    this.userService.searchPostOnWall(this.user.id, content).subscribe((data) => {
      this.listPostProfile = data
    })

  }

  searchUserByNameContaining(name: string) {
    this.userService.findUsersByNameContaining(name).subscribe(data => {
      this.router.navigate(['/search-friend']);
      window.localStorage.setItem("listUser", JSON.stringify(data));
      window.localStorage.setItem("nameUser", JSON.stringify(name));
    })
  }

  getPost(id: any) {
    this.postService.getPost(id).subscribe(data => {
      this.postUpdateForm.patchValue(data)
      this.getImg(data.id)
    })
  }

  getImg(id: any) {
    this.postService.getImg(id).subscribe(data => {
      this.listImgUpdate = data;
    })
  }

  editPost() {
    const post = this.postUpdateForm.value
    post.users = this.user
    this.postService.editPost(post).subscribe(() => {
      this.postService.editImgPost(this.listImgDelete).subscribe(() => {
        if (this.imageFiles.length == 0) {
          document.getElementById("btn-close-edit")?.click()
          this.success()
          this.findPostAllProfile()
        }
        this.createPostImg(post)

        this.findPostAllProfile()
      })

    })
  }

  submitAvatar(event: any) {
    this.imgSrc = []
    this.imageFiles = event.target.files;
    for (let i = 0; i < this.imageFiles.length; i++) {
      console.log(this.imageFiles[i])
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imgSrc.push(e.target.result);
      };
      reader.readAsDataURL(this.imageFiles[i]);
    }
  }

  getAllPostStatus() {
    this.postService.getAllPostStatus().subscribe(data => {
      this.listPostStatus = data;
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

  editListImgDelete(id: any, index: any) {
    this.listImgUpdate.splice(index, 1)
    this.listImgDelete.push(id);
    console.log(this.listImgDelete)
  }

  clearImgSrc() {
    this.imgSrc = []
    this.listImgDelete = []
    this.imageFiles = []
  }

  t = 0;

  createPostImg(post: Post) {
    if (this.imageFiles.length > 0) {
      this.checkUploadMultiple = true
      this.arrFileInFireBase = this.storage.ref(this.imageFiles[this.t].name);
      this.arrFileInFireBase.put(this.imageFiles[this.t]).then(data => {
        return data.ref.getDownloadURL();
      }).then(url => {
        this.checkUploadMultiple = false
        let imagePost: ImagePost = {
          posts: post,
          img: url
        }
        this.listImgCreate.push(imagePost)
      }).then(() => {
        this.t++
        if (this.t < this.imageFiles.length) {
          this.createPostImg(post)
        } else {
          this.t = 0
          this.postService.createPostImg(this.listImgCreate).subscribe(() => {
            this.findPostAllProfile()
          })
          document.getElementById("btn-close-edit")?.click()
          this.imgSrc = []
          this.imageFiles = []
          this.checkUploadMultiple = false
          this.success()
        }
      })
    }
  }

  logOut() {
    this.userService.logOut(this.user).subscribe(() => {
      localStorage.clear();
      // this.sendNotification()
      this.router.navigate(['']);
    })
  }

  findListRequest() {
    // @ts-ignore
    this.userService.findListRequestFriend(this.user.id).subscribe((data) => {
      this.listRequest = data

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


  likePost(idPost?: number) {
    this.postService.likePost(this.user.id, idPost).subscribe(() => {
      this.findPostAllProfile()
    })
  }

  addComment(post: Post) {
    const postComment = this.commentForm.value
    postComment.users = this.user
    postComment.posts = post

    this.postService.addComment(postComment).subscribe(() => {
      this.findPostAllProfile()
      this.commentForm.reset()
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
      this.findPostAllProfile()
      document.getElementById("edit-comment")?.click()
    })
  }

  deleteComment(id: number) {
    this.postService.deleteComment(id).subscribe(() => {
      this.findPostAllProfile()
    })
  }


  getAllListComment(posts: Post[]) {
    this.postService.getAllListComment(posts).subscribe(data => {
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
      this.getListCommentLike()
      this.getListCheckLikeComment()
    })
  }

  likeComment(id: number) {
    // @ts-ignore
    this.postService.likeComment(this.user.id, id).subscribe(() => {
      this.findPostAllProfile()
    })
  }

  getCommentByIdPost(id: number) {
    this.postService.getListComment(id).subscribe(data => {
      this.listComment = data
    })
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
  postsDisplay: PostDisplay[] = [];
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


  success(): void {
    this.toastr.success('Edit post successfully !', 'Success');
  }

}
