import { Injectable } from '@angular/core';
import {environment} from "../../../environments/environment.development";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {PostDisplay} from "../../model/Post-display";
import {Post} from "../../model/Post";
import {ImagePost} from "../../model/Image-post";
import {Users} from "../../model/Users";
import {PostComment} from "../../model/Post-comment";

const apiUrl = environment.apiUrl
let headers : any;
//   new HttpHeaders({
//   'Authorization': `Bearer ${token}`
// });
@Injectable({
  providedIn: 'root'
})
export class PostService {

  constructor(private http:HttpClient) {
    let token =window.localStorage.getItem("token");
    headers =new HttpHeaders().set('Authorization', `${token}`);
  }

  findAllPostNewFeed(users: any):Observable<any>{
    console.log(headers)
    return this.http.get<PostDisplay[]>(apiUrl+`/post/${users.id}`, {headers});
  }

  findAllImgPost(posts: Post[]):Observable<any>{

    return this.http.post<Post[]>(apiUrl + `/post/image`, posts, {headers});
  }

  findLikePost(posts: Post[]):Observable<any>{
    return this.http.post<Post[]>(apiUrl + `/post/list/like`, posts, {headers});
  }
  findCountLikePost(posts: Post[]):Observable<any> {
    return this.http.post<Post[]>(apiUrl + `/post/like`, posts, {headers});
  }

  findCountLikeOnePost(post: Post):Observable<any> {
    return this.http.post<Post>(apiUrl + `/post/get/like`, post, {headers});
  }

  findCountCommentPost(posts: Post[]):Observable<any>{
    return this.http.post<Post[]>(apiUrl + `/post/comment`, posts, {headers});
  }

  findCountCommentOnePost(post: Post):Observable<any> {
    return this.http.post<Post>(apiUrl + `/post/get/comment`, post, {headers});
  }
  findAllPostProfile(id:number):Observable<any>{
    return this.http.get<PostDisplay[]>(apiUrl+`/post/profile/${id}`, {headers});
  }
  findAllPostWallFriend( idFriend:number, idUser:number):Observable<any>{
    return this.http.get<PostDisplay[]>(apiUrl+`/post/wall/${idFriend}/${idUser}`, {headers});
  }

  deletePost(id:number):Observable<any>{
    return this.http.delete<any>(apiUrl+`/post/${id}`, {headers});
  }


  createPost(post: Post): Observable<any>{
    return this.http.post<Post>(apiUrl + `/post`, post, {headers});
  }

  getAllPostStatus(): Observable<any>{
    return this.http.get<any>(apiUrl + `/post/status`, {headers});
  }

  createPostImg(imagePost: ImagePost[]): Observable<any>{
    return this.http.post<any>(apiUrl + `/post/create/img`, imagePost, {headers});
  }

  getPost(id: number | undefined): Observable<Post>{
    return this.http.get<Post>(apiUrl + `/post/get/${id}`, {headers});
  }

  getPostDisplay(id: number | undefined, id2: number | undefined): Observable<PostDisplay> {
    return this.http.get<PostDisplay>(apiUrl + `/post/display/get/${id}/${id2}`, {headers});
  }

  editPost(post: Post): Observable<any>{
    return this.http.put<any>(apiUrl + `/post`, post, {headers});
  }

  editImgPost(list: number[]): Observable<any>{
    return this.http.put<any>(apiUrl + `/post/image`, list, {headers})
  }

  getImg(id: any): Observable<ImagePost[]>{
    return this.http.get<ImagePost[]>(apiUrl + `/post/image/${id}`, {headers})
  }

  getListLikePost(post: Post): Observable<Users[]>{
    return this.http.post<Users[]>(apiUrl + `/post/list/get/like`, post, {headers});
  }

  likePost(idUser?:number, idPost?:number): Observable<any>{
    return this.http.get<any>(apiUrl +`/post/interact/like/${idUser}/${idPost}`, {headers})
  }
  getListComment(id:number | undefined):Observable<PostComment[]> {
    return this.http.get<PostComment[]>(apiUrl +`/post/${id}/comment`, {headers})

  }
  getAllListComment(posts: Post[]):Observable<any>{
    return this.http.post<any>(apiUrl +`/post/list/comment`,posts, {headers})

  }
  addComment(postComment:PostComment):Observable<PostComment>{
    return this.http.post<PostComment>(apiUrl +`/post/interact/comment`,postComment, {headers})
  }

  deleteComment(id:number):Observable<any>{
    return this.http.delete<any>(apiUrl +`/post/comment/${id}`, {headers})
  }

  editComment(id:number,postComment:PostComment):Observable<any>{
    return this.http.put<any>(apiUrl +`/post/comment/${id}`,postComment, {headers})
  }
  getCommentById(id:number):Observable<any>{
    return this.http.get<any>(apiUrl +`/post/interact/comment/${id}`, {headers})
  }

  getCountComment(postsComment:PostComment[][]):Observable<any>{
    return this.http.post<any>(apiUrl +`/post/comment/countlike`,postsComment, {headers})
  }

  getCountCommentOnePost(postsComment:PostComment[]):Observable<any>{
    return this.http.post<any>(apiUrl +`/post/comment/countlike/get`,postsComment, {headers})
  }

  getCheckLikeComment(postsComment: PostComment[][], id: number | undefined):Observable<any> {
    return this.http.post<any>(apiUrl + `/post/comment/check/like/${id}`, postsComment, {headers})
  }

  getCheckLikeCommentOnePost(postsComment: PostComment[], id: number | undefined):Observable<any> {
    return this.http.post<any>(apiUrl + `/post/comment/check/like/get/${id}`, postsComment, {headers})
  }

  likeComment(idUser:number, idCmt:number):Observable<any>{
    return this.http.get<any>(apiUrl +`/post/interact/comment/like/${idUser}/${idCmt}`, {headers})
  }
}
