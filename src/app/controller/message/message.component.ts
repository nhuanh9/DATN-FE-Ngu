import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import {AngularFireStorage} from "@angular/fire/compat/storage";
import {Router} from "@angular/router";
import {Stomp} from "@stomp/stompjs";
import * as moment from "moment";
import {FormControl, FormGroup} from "@angular/forms";
import {Users} from "../../model/Users";
import {Conversation} from "../../model/Conversation";
import {Messages} from "../../model/Message";
import {Notifications} from "../../model/Notifications";
import {PostService} from "../../service/post/post.service";
import {UserService} from "../../service/user/user.service";
import {NotificationService} from "../../service/notification/notification.service";
import {ChatService} from "../../service/chat/chat.service";

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent{

}
// export class MessageComponent implements OnInit, AfterViewChecked {
//   data = localStorage.getItem("user")
//   // @ts-ignore
//   user: Users = JSON.parse(this.data)
//   listFriend: Users[] = [];
//   listRequest: Users[] = [];
//   listPersonalConversation: Conversation[] = [];
//   listAllConversation: Conversation[] = [];
//   listGroupConversation: Conversation[] = [];
//   listUserConversation: Users[][] = [];
//   listUserGroup: Users[][] = [];
//   listNameGroup: string[] = [];
//   listStringUserConversation: string[] = [];
//   listStringUserImgConversation: string[] = [];
//   userNameChat?: string;
//   userImgChat?: string;
//   listMessage: Messages[] = [];
//   listNotification: Notifications[] = [];
//   countNotSeen: number = 0
//   timeNotificationMoment: any[] = [];
//   countOther: any[] = [];
//   userSearch: Users[] = [];
//   userAddGroup: Users[] = [];
//   listMutualFriend: number[] = [];
//   private stompClient: any;
//   listMemberName: any [] = []
//   listAvatarMember: any [] = []
//   conversationNow!: Conversation
//   messageForm: FormGroup = new FormGroup({
//     content: new FormControl()
//   })
//
//   searchPeople: FormGroup = new FormGroup({
//     searchInput: new FormControl()
//   })
//   // @ts-ignore
//   search: string = JSON.parse(localStorage.getItem("nameUser"))
//
//   ngOnInit(): void {
//     this.findAllFriend()
//     this.findListRequest()
//     this.connect()
//     this.getAllNotification()
//     this.getAllPersonalConversation()
//     this.getAllGroupConversation()
//     this.fromFriendProfile()
//     this.getAllConversation()
//
//   }
//
//   constructor(private postService: PostService,
//               private userService: UserService,
//               private storage: AngularFireStorage,
//               private notificationService: NotificationService,
//               private chatService: ChatService,
//               private router: Router) {
//   }
//
//   ngAfterViewChecked(): void {
//     if (this.conversationNow != null) {
//       document.getElementById("showChat")!.click()
//     }
//   }
//
//   getChatRoom(conversation: Conversation){
//     window.localStorage.setItem("roomChat", JSON.stringify(conversation));
//     this.router.navigate(['/message']);
//   }
//
//   sendMessage(conversation: Conversation) {
//     const message: Messages = this.messageForm.value
//     message.users = this.user
//     message.conversation = conversation
//     this.chatService.sendMessage(message).subscribe(() => {
//       this.getAllPersonalConversation()
//       this.getAllGroupConversation()
//       this.chatService.getMessage(conversation.id).subscribe(data => {
//         this.listMessage = data
//         this.messageForm.reset()
//         this.sendNotification()
//       })
//     })
//   }
//
//   searchMember(name: string) {
//     this.userSearch = []
//     this.userSearch = this.listFriend.filter(user => {
//       return user.firstName?.toLowerCase().includes(name.toLowerCase()) || user.lastName?.toLowerCase().includes(name.toLowerCase())
//     })
//   }
//
//   addToGroup(user: Users) {
//     this.userAddGroup.push(user)
//   }
//
//   submitGroup() {
//     if (this.userAddGroup.length > 0) {
//       this.userAddGroup.push(this.user)
//       this.chatService.createGroupConversation(this.userAddGroup).subscribe(() => {
//         this.getAllGroupConversation()
//         document.getElementById("close-modal")!.click()
//
//         this.userAddGroup = []
//       })
//     }
//   }
//
//   closeModal() {
//     // @ts-ignore
//     this.searchPeople.reset()
//     this.userAddGroup = []
//     this.userSearch = []
//   }
//
//   deleteMemberFromGroup(index: number) {
//     this.userAddGroup.splice(index, 1)
//   }
//
//   fromFriendProfile() {
//     // @ts-ignore
//     this.conversationNow = JSON.parse(localStorage.getItem("roomChat"))
//     if (this.conversationNow !== null) {
//       this.chatService.getMessage(this.conversationNow?.id).subscribe(data => {
//         this.listMessage = data
//         this.chatService.findMember(this.conversationNow?.id).subscribe(data => {
//           if (this.conversationNow.type == 1) {
//             for (let i = 0; i < data.length; i++) {
//               if (data[i].id !== this.user.id) {
//                 this.userNameChat = data[i].firstName+" "+ data[i].lastName;
//                 this.userImgChat = data[i].avatar
//                 break;
//               }
//             }
//           }else {
//             this.userImgChat = "https://phunugioi.com/wp-content/uploads/2021/11/Hinh-anh-nhom-ban-than-tao-dang-vui-ve-ben-bo-bien-395x600.jpg"
//             if (this.conversationNow.name != null){
//               this.userNameChat = this.conversationNow.name
//             }else {
//               this.userNameChat = ""
//               for (let j = 0; j < data.length; j++) {
//                 this.userNameChat += data[j].firstName;
//                 if (j < data.length - 1) {
//                   this.userNameChat += `, `;
//                 }
//               }
//             }
//           }
//           localStorage.removeItem("roomChat");
//         })
//       })
//     }
//   }
//
//   changeNameGroup(conversation: Conversation, name: string) {
//     conversation.name = name
//     this.chatService.changeNameGroup(conversation).subscribe(() => {
//       document.getElementById("change-name")!.click()
//       this.getAllGroupConversation()
//       this.userNameChat = name
//     })
//   }
//
//   getAllConversation() {
//     // @ts-ignore
//     this.chatService.getAllConversation(this.user).subscribe(data => {
//       this.listAllConversation = data
//       this.chatService.findAllMemberInConversation(data).subscribe(dataMember => {
//         for (let i = 0; i < dataMember.length; i++) {
//           if (this.listAllConversation[i].type === 1) {
//             for (let j = 0; j < dataMember[i].length; j++) {
//               if (dataMember[i][j].id !== this.user.id) {
//                 this.listMemberName.push(dataMember[i][j].name)
//                 this.listAvatarMember.push(dataMember[i][j].avatar)
//                 break;
//               }
//             }
//           } else {
//             this.listAvatarMember.push("https://phunugioi.com/wp-content/uploads/2021/11/Hinh-anh-nhom-ban-than-tao-dang-vui-ve-ben-bo-bien-395x600.jpg")
//             if (data[i].name !== null){
//               this.listMemberName.push(data[i].name)
//             }else {
//               this.listMemberName[i] = ""
//               for (let j = 0; j < dataMember[i].length; j++) {
//                 this.listMemberName[i] += dataMember[i][j].name
//                 if (j < dataMember[i].length - 1) {
//                   this.listMemberName[i] += `, `;
//                 }
//               }
//             }
//           }
//         }
//       })
//     })
//   }
//
//   getAllPersonalConversation() {
//     this.chatService.getAllPersonalConversation(this.user).subscribe(data => {
//       this.listPersonalConversation = data
//       this.chatService.findAllMemberInConversation(this.listPersonalConversation).subscribe(data => {
//         this.listUserConversation = data
//         for (let i = 0; i < this.listUserConversation.length; i++) {
//           for (let j = 0; j < this.listUserConversation[i].length; j++) {
//             if (this.listUserConversation[i][j].id !== this.user.id) {
//               // @ts-ignore
//               this.listStringUserConversation[i] = this.listUserConversation[i][j].name
//               // @ts-ignore
//               this.listStringUserImgConversation[i] = this.listUserConversation[i][j].avatar
//             }
//           }
//         }
//       })
//     })
//   }
//
//
//   getAllGroupConversation() {
//     this.chatService.getAllGroupConversation(this.user).subscribe(data => {
//       this.listGroupConversation = data
//       this.chatService.findAllMemberInConversation(this.listGroupConversation).subscribe(data => {
//         this.listUserGroup = data;
//         this.listNameGroup = []
//         for (let i = 0; i < this.listGroupConversation.length; i++) {
//           if (this.listGroupConversation[i].name != null) {
//             // @ts-ignore
//             this.listNameGroup[i] = this.listGroupConversation[i].name
//           } else {
//             this.listNameGroup[i] = "";
//             for (let j = 0; j < this.listUserGroup[i].length; j++) {
//               this.listNameGroup[i] += this.listUserGroup[i][j].firstName
//               if (j < this.listUserGroup[i].length - 1) {
//                 this.listNameGroup[i] += `, `;
//               }
//             }
//           }
//         }
//       })
//     })
//   }
//
//   transferChatDetail(id: number, conversation: Conversation, typeId: number) {
//     this.chatService.getMessage(conversation?.id).subscribe(data => {
//       this.conversationNow = conversation
//       this.listMessage = data
//       if (typeId == 1) {
//         this.userNameChat = this.listStringUserConversation[id]
//         this.userImgChat = this.listStringUserImgConversation[id]
//       }
//       if (typeId == 2) {
//         this.userNameChat = this.listNameGroup[id]
//         this.userImgChat = "https://phunugioi.com/wp-content/uploads/2021/11/Hinh-anh-nhom-ban-than-tao-dang-vui-ve-ben-bo-bien-395x600.jpg"
//       }
//     })
//   }
//
//   connect() {
//     const socket = new WebSocket('ws://localhost:8080/ws/websocket');
//     this.stompClient = Stomp.over(socket);
//     const _this = this;
//     this.stompClient.connect({}, function () {
//       _this.stompClient.subscribe('/topic/greetings', function (notification: any) {
//         _this.getAllNotification()
//         _this.findListRequest()
//         _this.findAllFriend()
//         _this.getAllPersonalConversation()
//         _this.chatService.getMessage(_this.conversationNow.id).subscribe(data => {
//           _this.listMessage = data
//           _this.messageForm.reset()
//         })
//       })
//     })
//   }
//
//   sendNotification() {
//     // @ts-ignore
//     this.stompClient.send('/app/hello', {}, this.user.id.toString());
//   }
//
//   getAllNotification() {
//     this.timeNotificationMoment = []
//     this.notificationService.getNotification(this.user.id).subscribe(data => {
//       this.listNotification = data
//       for (let j = 0; j < this.checkValidNotification().length; j++) {
//         this.timeNotificationMoment.push(moment(this.listNotification[j].notificationAt).fromNow())
//       }
//       this.countNotSeen = 0
//       for (let i = 0; i < this.checkValidNotification().length; i++) {
//         // @ts-ignore
//         if (!this.checkValidNotification()[i].status) {
//           this.countNotSeen++
//         }
//
//       }
//       this.countOtherNotification(this.listNotification);
//     })
//   }
//
//   countOtherNotification(notification: Notifications[]) {
//     this.notificationService.countOther(notification).subscribe(data => {
//       this.countOther = data
//     })
//   }
//
//   checkValidNotification() {
//     for (let t = 0; t < this.listNotification.length; t++) {
//       if (this.listNotification[t]?.users?.id == this.user.id) {
//         this.listNotification.splice(t, 1)
//         t--;
//       }
//       if (this.listNotification[t]?.notificationType?.id == 1) {
//         let flag = true;
//         for (let k = 0; k < this.listFriend.length; k++) {
//           if (this.listNotification[t].users?.id == this.listFriend[k].id) {
//             flag = false;
//           }
//         }
//         if (flag) {
//           this.listNotification.splice(t, 1)
//           t--;
//         }
//       }
//     }
//     return this.listNotification;
//   }
//
//   seenNotification(notification: Notifications) {
//     this.notificationService.seenNotification(notification.id).subscribe(() => {
//       this.getAllNotification()
//     });
//   }
//
//   findAllFriend() {
//     // @ts-ignore
//     this.userService.findAllFriend(this.user.id).subscribe((data) => {
//       this.listFriend = data
//     })
//   }
//
//   confirmRequest(friendRequestId: any) {
//     this.userService.confirmRequest(this.user.id, friendRequestId).subscribe(() => {
//       this.findListRequest()
//       this.sendNotification()
//     })
//   }
//
//   findListRequest() {
//     // @ts-ignore
//     this.userService.findListRequestFriend(this.user.id).subscribe((data) => {
//       this.listRequest = data
//
//     })
//   }
//
//   logOut() {
//     this.userService.logOut(this.user).subscribe(() => {
//       localStorage.removeItem("user");
//       this.sendNotification()
//       this.router.navigate(['']);
//     })
//   }
//
//   deleteRequest(friendRequestId: any) {
//     this.userService.deleteRequest(this.user.id, friendRequestId).subscribe(() => {
//       this.findListRequest()
//       this.sendNotification()
//     })
//   }
//   searchUserByNameContaining(name:string){
//     this.userService.findUsersByNameContaining(name).subscribe(data=>{
//       this.router.navigate(['/search-friend']);
//       window.localStorage.setItem("listUser", JSON.stringify(data));
//       window.localStorage.setItem("nameUser", JSON.stringify(name));
//     })
//   }
// }

