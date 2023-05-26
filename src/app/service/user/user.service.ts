import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from "@angular/common/http";
import {Users} from "../../model/Users";
import {Observable} from "rxjs";
import {environment} from "../../../environments/environment.development";
import {UserUpdate} from "../../model/UserUpdate";
import {FriendRequest} from "../../model/Friend-request";

const API_URL = environment.apiUrl
let headers : any
@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private httpClient:HttpClient) {
    let token =window.localStorage.getItem("token");
    headers =new HttpHeaders().set('Authorization', `${token}`);
  }

  login(user: Users):  Observable<any>{
    return this.httpClient.post<any>(API_URL + '/login', user);
  }
  register(user: Users): Observable<Users> {
    return this.httpClient.post<Users>(API_URL + '/register', user);
  }
  showAllUser():Observable<Users[]>{
    return this.httpClient.get<Users[]>(API_URL+"/users", {headers})
  }
  checkEmailAndPass(user: Users):Observable<Users[]>{
    return this.httpClient.post<any>(API_URL+ "/checkUser", user)
  }
  logOut(user:any):Observable<any>{
    return this.httpClient.post<any>(API_URL + '/logoutUser', user);
  }
  permissionComment(user:any):Observable<any>{
    return this.httpClient.post<any>(API_URL + '/permission' , user, {headers});
  }

  findUserById(id: number): Observable<Users> {
    return this.httpClient.get<Users>(`${API_URL}/users/${id}`, {headers})
  }

  findAllFriend(id: number | undefined):Observable<Users[]>{
    return this.httpClient.get<Users[]>(`${API_URL}/users/friend/${id}`, {headers})
  }

  searchPostOnWall(id: number | undefined, content: string):Observable<any>{
    return this.httpClient.get<any>(`${API_URL}/post/wall/${id}/search?search=${content}`, {headers})
  }

  changePassword(userUpdate: Users):Observable<any>{
    return this.httpClient.put<any>(API_URL+'/changePw',userUpdate,{headers})
  }

  editProfile(user: Users):Observable<any>{
    return this.httpClient.put<any>(API_URL+"/users/" + user.id, user, {headers})
  }

  findMutualFriends(idFriend:number, idUser:number): Observable<Users[]>{
    return this.httpClient.get<Users[]>(`${API_URL}/friend/mutual/${idFriend}/${idUser}`, {headers})
  }
  findFriendOfFriend(id:number):Observable<Users[]>{
    return this.httpClient.get<Users[]>(`${API_URL}/friend/${id}`, {headers})
  }

  findListRequestFriend(id:number):Observable<Users[]>{
    return this.httpClient.get<Users[]>(`${API_URL}/friend/list/request/${id}`, {headers})
  }

  requestFriend(friendRequest: FriendRequest): Observable<FriendRequest> {
    return this.httpClient.post<FriendRequest>(`${API_URL}/friend`,friendRequest, {headers});
  }
  checkRequest(id1:number, id2:number):Observable<any>{
    return this.httpClient.get<any>(`${API_URL}/friend/checkRequest/${id1}/${id2}`, {headers});
  }
  deleteRequest(id1:number|undefined, id2:number|undefined):Observable<any> {
    return this.httpClient.delete<any>(`${API_URL}/friend/${id1}/${id2}`, {headers});
  }

  confirmRequest(id1:number|undefined, id2:number|undefined):Observable<any> {
    return this.httpClient.get<any>(`${API_URL}/friend/accept/${id1}/${id2}`, {headers});
  }
  findUsersByNameContaining(name:string):Observable<Users[]>{
    return this.httpClient.get<Users[]>(API_URL +"/users/search?search="+name, {headers})
  }
  loginAdmin(user: Users): Observable<Users> {
    return this.httpClient.post<Users>(API_URL + '/admin/login', user, {headers});
  }
  blockAndActive(user: Users):Observable<any>{
    return this.httpClient.post<any>(API_URL+"/admin",user, {headers})
  }

  getListCountMutualFriend(id:number,user:Users[]):Observable<any>{
    return this.httpClient.post<any>(`${API_URL}/friend/mutual/search/${id}`,user, {headers})
  }

  countFriend(users:Users[]):Observable<any>{
    return this.httpClient.post<any>(API_URL+"/friend/sum",users, {headers})
  }

}
