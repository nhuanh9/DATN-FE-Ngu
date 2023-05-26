import { Injectable } from '@angular/core';
import {environment} from "../../../environments/environment.development";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Users} from "../../model/Users";
import {Observable} from "rxjs";
import {Conversation} from "../../model/Conversation";
import {Messages} from "../../model/Message";


const apiUrl = environment.apiUrl
let headers : any
@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private http: HttpClient) {
      let token =window.localStorage.getItem("token");
      headers =new HttpHeaders().set('Authorization', `${token}`);
  }

  getAllPersonalConversation(user: Users): Observable<any> {
    return this.http.get<Conversation[]>(apiUrl + `/chat/room/${user.id}`, {headers});
  }

  getAllGroupConversation(user: Users): Observable<any> {
    return this.http.get<Conversation[]>(apiUrl + `/chat/room/group/${user.id}`, {headers});
  }

  getAllConversation(user: Users): Observable<any> {
    return this.http.get<Conversation[]>(apiUrl + `/chat/room/all/${user.id}`, {headers});
  }

  createGroupConversation(users: Users[]): Observable<any>{
    return this.http.post<any>(apiUrl + `/chat/group`, users, {headers});
  }

  getMessage(id: number | undefined): Observable<any> {
    return this.http.get<Messages[]>(apiUrl + `/chat/message/${id}`, {headers});
  }

  findAllMemberInConversation(conversations: Conversation[]): Observable<any> {
    return this.http.post<Users[][]>(apiUrl + `/chat/member`, conversations, {headers});
  }

  findMember(id: number | undefined): Observable<Users[]> {
    return this.http.get<Users[]>(apiUrl + `/chat/member/${id}`, {headers});
  }

  sendMessage(message: Messages): Observable<any> {
    return this.http.post<any>(apiUrl + `/chat`, message, {headers});
  }

  getPersonalConversation(id1: any, id2: any): Observable<any> {
    return this.http.get<Conversation>(apiUrl + `/chat/room/${id1}/${id2}`, {headers});
  }

  changeNameGroup(conversation: Conversation): Observable<any>{
    return this.http.put<any>(apiUrl + `/chat/changeName`, conversation, {headers});
  }

}
