import {Component, OnInit} from '@angular/core';
import {PostDisplay} from "../../model/Post-display";
import {Users} from "../../model/Users";
import {ImagePost} from "../../model/Image-post";
import {Notifications} from "../../model/Notifications";
import {PostComment} from "../../model/Post-comment";
import {FormGroup, FormControl} from "@angular/forms";
import {Conversation} from "../../model/Conversation";
import {PostService} from "../../service/post/post.service";
import {UserService} from "../../service/user/user.service";
import {ActivatedRoute, Router} from "@angular/router";
import {NotificationService} from "../../service/notification/notification.service";
import {ChatService} from "../../service/chat/chat.service";
import {ToastrService} from "ngx-toastr";
import * as moment from 'moment';
import {Stomp} from "@stomp/stompjs";
import {Post} from "../../model/Post";

@Component({
  selector: 'app-friend-profile',
  templateUrl: './friend-profile.component.html',
  styleUrls: ['./friend-profile.component.css']
})
export class FriendProfileComponent implements OnInit {
  data = localStorage.getItem("user")
  // @ts-ignore
  user: Users = JSON.parse(this.data)
  postsDisplayFriend: PostDisplay[] = [];
  listFriend: Users[] = [];
  existF?:boolean;
  timeMoment: any[] = [];
  listMutualFriend: Users[] = [];
  listFriendOfFriend: Users[] = [];
  listImgPost: ImagePost[][] = [];
  listFriendPost: Users[][] = [];
  listImg: any[] = [];
  countLike: any[] = [];
  checkRequestFr?:boolean;
  checkRequestFr2?:boolean;
  countComment: any[] = [];
  listRequest:Users[] = [];
  listNotification: Notifications[] = [];
  timeNotificationMoment: any[] = [];
  countOther: any[] = [];
  countNotSeen:number = 0
  private stompClient: any;
  numToShow = 3;
  listPhoto:any[] = []


  // @ts-ignore
  //nick wall
  friend: Users

  // @ts-ignore
  idFiend: number = this.routerActive.snapshot.paramMap.get("id")
  commentP?:PostComment
  listComment: PostComment[] = [];
  listAllComment: PostComment[][] = [];
  listCommentLike: number[][] = [];
  listCheckLikeComment: boolean[][] = [];
  timeMomentComment: any[][] = []
  commentForm:FormGroup = new FormGroup({
    content: new FormControl()
  })
  listAllConversation: Conversation[] = [];
  listMemberName: any [] = []
  listAvatarMember: any [] = []

  commentFormEdit:FormGroup = new FormGroup({
    id:new FormControl(),
    content: new FormControl(),
    cmtAt: new FormControl(),
    post: new FormGroup({
      id:new FormControl()
    })
  })

  ngOnInit(): void {
    this.findAllPostFriend()
    this.findAllFriend()
    this.findFriend()
    this.findFriendOfFriend()
    this.findMutualFriend()
    this.connect()
    this.findListRequest()

  }
  showMore() {
    this.numToShow += 5;
  }

  showLess() {
    this.numToShow -= 5;
  }

  constructor(private postService: PostService,
              private userService: UserService,
              private routerActive: ActivatedRoute,
              private notificationService: NotificationService,
              private chatService: ChatService,
              private router: Router,
              private toastr:ToastrService
  ) {
  }

  findAllPostFriend() {

    // @ts-ignore
    this.postService.findAllPostWallFriend(this.idFiend, this.user.id).subscribe(data => {
      this.postsDisplayFriend = data
      for (let j = 0; j < this.postsDisplayFriend.length; j++) {
        this.timeMoment.push(moment(this.postsDisplayFriend[j].createAt).fromNow())
      }
      this.findAllImgPost(data)
      this.findFriendLike(data)
      this.findCountLike(data)
      this.findCountComment(data)
      this.getAllListComment(data)
      this.getAllConversation()

    })
  }

  connect(){
    const socket = new WebSocket('ws://localhost:8080/ws/websocket');
    this.stompClient = Stomp.over(socket);
    const _this = this;
    this.stompClient.connect({}, function (){
      _this.stompClient.subscribe('/topic/greetings', function (notification: any) {
        _this.getAllNotification()
        _this.findListRequest()
        _this.findAllFriend()
      })
    })
  }

  goToRoomChat(){
    this.chatService.getPersonalConversation(this.user.id, this.idFiend).subscribe(data =>{
      window.localStorage.setItem("roomChat", JSON.stringify(data));
      this.router.navigate(['/message']);
    })
  }

  getChatRoom(conversation: Conversation){
    window.localStorage.setItem("roomChat", JSON.stringify(conversation));
    this.router.navigate(['/message']);
  }

  sendNotification(){
    // @ts-ignore
    this.stompClient.send('/app/hello',{}, this.user.id.toString());
  }

  getAllNotification(){
    this.timeNotificationMoment = []
    this.notificationService.getNotification(this.user.id).subscribe(data =>{
      this.listNotification = data
      for (let j = 0; j < this.checkValidNotification().length; j++){
        this.timeNotificationMoment.push(moment(this.listNotification[j].notificationAt).fromNow())
      }
      this.countNotSeen = 0
      for (let i = 0; i <this.checkValidNotification().length ; i++) {
        // @ts-ignore
        if (!this.checkValidNotification()[i].status){
          this.countNotSeen++
        }

      }
      this.countOtherNotification(this.listNotification);
    })
  }

  countOtherNotification(notification: Notifications[]){
    this.notificationService.countOther(notification).subscribe(data =>{
      this.countOther = data
    })
  }

  checkValidNotification(){
    for (let t = 0; t < this.listNotification.length; t++){
      if (this.listNotification[t]?.users?.id == this.user.id){
        this.listNotification.splice(t,1)
        t--;
      }
      if (this.listNotification[t]?.notificationType?.id == 1 ){
        let flag = true;
        for (let k = 0; k < this.listFriend.length; k++){
          if (this.listNotification[t].users?.id == this.listFriend[k].id){
            flag = false;
          }
        }
        if (flag){
          this.listNotification.splice(t,1)
          t--;
        }
      }
    }
    return this.listNotification;
  }

  seenNotification(id: number | undefined){
    this.notificationService.seenNotification(id).subscribe();
  }

  checkExist(user: Users) {
    for (let i = 0; i < this.listMutualFriend.length; i++) {
      if (user.id === this.listMutualFriend[i].id) {
        return 1
      }
      if (user.id === this.user.id) {
        return 0
      }

    }
    return -1;
  }

  checkFriendExist(user: Users): boolean{
    for (let i = 0; i < this.listFriend.length; i++) {
      if (user.id === this.listFriend[i].id){
        return true;
      }
    }
    return false;
  }

  checkExistFriend() {
    this.existF = false
    for (let i = 0; i < this.listFriendOfFriend.length; i++) {
      if (this.user.id === this.listFriendOfFriend[i].id) {
        this.existF = true
      }
    }
    if (!this.friend.seeFriendPermission && !this.existF){
      this.listFriendOfFriend = []
      this.listMutualFriend = []
    }
  }

  findFriend() {
    this.userService.findUserById(this.idFiend).subscribe(data => {
      this.friend = data
      if (!this.friend.enabled){
        this.router.navigate(['error'])
      }
      this.checkRequest()
      this.checkRequest2()
      this.router.routeReuseStrategy.shouldReuseRoute = function () {
        return false;
      };
    })
  }

  requestFriend(user: Users) {
    // @ts-ignore
    const friendRequest: FriendRequest = {
      usersReceive: user,
      usersRequest: this.user,
      status: false
    }
    console.log(friendRequest)
    // @ts-ignore
    this.userService.requestFriend(friendRequest).subscribe(() => {
      this.checkExistFriend()
      this.checkRequest()
      // this.sendNotification()
    },() =>{
      location.reload()
    })

  }
  checkRequest(){
    // @ts-ignore
    this.userService.checkRequest(this.user.id,this.friend.id).subscribe(data =>{
      this.checkRequestFr = data
    })
  }

  checkRequest2(){
    // @ts-ignore
    this.userService.checkRequest(this.friend.id,this.user.id).subscribe(data =>{
      this.checkRequestFr2 = data
    })
  }

  findListRequest(){
    // @ts-ignore
    this.userService.findListRequestFriend(this.user.id).subscribe((data)=>{
      this.listRequest = data

    })
  }

  deleteRequest(){
    this.userService.deleteRequest(this.user.id, this.friend.id).subscribe(()=>{
      this.findFriendOfFriend()
      this.checkExistFriend();
      this.checkRequest();
      this.checkRequest2();
      // this.sendNotification()
    })
  }

  deleteRequestById(friendRequestId: any) {
    this.userService.deleteRequest(this.user.id, friendRequestId).subscribe(() => {
      this.findListRequest()
      // this.sendNotification()
    })
  }
  confirmRequest(friendRequestId: any){
    this.userService.confirmRequest(this.user.id, friendRequestId).subscribe(()=>{
      this.findFriendOfFriend()
      this.checkExistFriend();
      this.checkRequest();
      this.checkRequest2();
      // this.sendNotification()
    })
  }

  findAllFriend() {
    // @ts-ignore
    this.userService.findAllFriend(this.user.id).subscribe((data) => {
      this.listFriend = data
      this.getAllNotification()
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
      console.log(img)
      console.log(this.friend.id)
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
          if (this.listImgPost[i][j].posts.users.id === this.friend.id && this.listImgPost.posts.postStatus.id !=2){
            this.listPhoto.push(this.listImgPost[i][j])
          }
        }
        console.log(this.listPhoto)
      }
      console.log(this.listPhoto)
    })
  }


  findMutualFriend() {
    // @ts-ignore
    this.userService.findMutualFriends(this.idFiend, this.user.id).subscribe((data) => {
      if (!this.friend.seeFriendPermission && !this.existF){
        this.listFriendOfFriend = []
        this.listMutualFriend = []
      }else {
        this.listMutualFriend = data
      }
    })
  }

  findFriendOfFriend() {
    this.userService.findFriendOfFriend(this.idFiend).subscribe(data => {
      this.listFriendOfFriend = data
      this.checkExistFriend()

    })
  }

  routerProfile(id?: number) {
    this.router.navigate(['/friendProfile/' + id])
    window.onload
  }

  logOut() {
    this.userService.logOut(this.user).subscribe(()=>{
      localStorage.clear();
      // this.sendNotification()
      this.router.navigate(['']);
    })
  }

  likePost(idPost?: number) {
    this.postService.likePost(this.user.id, idPost).subscribe(() => {
      this.findAllPostFriend()
    })
  }

  addComment(post:Post) {
    // if (!post.users?.commentPermission && !this.existF) {
    //   this.error()
    // }else {
      const postComment = this.commentForm.value
      postComment.users = this.user
      postComment.idParent = post.id;
      postComment.parentType = true;

      this.postService.addComment(postComment).subscribe(() => {
        this.findAllPostFriend()
        this.commentForm.reset()
      })
    // }
  }

  success(): void {
    this.toastr.success('Success !', 'Success');
  }

  error(): void {
    this.toastr.warning('You need to be friends to comment on this post!', 'Warning')
  }

  warning(): void {
    this.toastr.warning('Account be blocked', 'Warning')
  }


  getCommentById(id:number){
    this.postService.getCommentById(id).subscribe((data)=>{
      this.commentP = data
      this.commentFormEdit.patchValue(data)
      console.log(data)
    })
  }
  editComment(){
    const postComment = this.commentFormEdit.value
    postComment.users = this.user
    postComment.cmtAt = this.commentP?.cmtAt
    // @ts-ignore
    this.postService.editComment(this.commentP.id,postComment).subscribe(() =>{
      this.findAllPostFriend()
      document.getElementById("edit-comment")?.click()
    })
  }

  deleteComment(id:number){
    this.postService.deleteComment(id).subscribe(()=>{
      this.findAllPostFriend()
    })
  }


  getAllListComment(posts: Post[]) {
    this.postService.getAllListComment(posts).subscribe(data => {
      this.listAllComment = data
      // console.log(moment(data[2][1].cmtAt).fromNow())
      for (let e = 0; e < data.length; e++){
        if (data[e].length > 0) {
          this.timeMomentComment[e] = []
          for (let f = 0; f < data[e].length; f++) {
            // @ts-ignore
            this.timeMomentComment[e][f] = moment(data[e][f].cmtAt).fromNow()
          }
        }else {
          this.timeMomentComment[e] = []
        }
      }
      this.getListCommentLike()
      this.getListCheckLikeComment()
    })
  }

  likeComment(id:number){
    // @ts-ignore
    this.postService.likeComment(this.user.id, id).subscribe(()=>{
      this.findAllPostFriend()
    })
  }
  getCommentByIdPost(id: number) {
    this.postService.getListComment(id).subscribe(data => {
      this.listComment = data
    })
  }

  getListCommentLike(){
    this.postService.getCountComment(this.listAllComment).subscribe(data=>{
      this.listCommentLike = data
    })
  }

  getListCheckLikeComment(){
    this.postService.getCheckLikeComment(this.listAllComment, this.user.id).subscribe(data=>{
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


  searchUserByNameContaining(name:string){
    this.userService.findUsersByNameContaining(name).subscribe(data=>{
      this.router.navigate(['/search-friend']);
      window.localStorage.setItem("listUser", JSON.stringify(data));
      window.localStorage.setItem("nameUser", JSON.stringify(name));
    })
  }
}
