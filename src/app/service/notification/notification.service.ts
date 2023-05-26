import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {Notifications} from "../../model/Notifications";
import {environment} from "../../../environments/environment.development";


const apiUrl = environment.apiUrl
let headers : any
@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private http: HttpClient) {
    let token =window.localStorage.getItem("token");
    headers =new HttpHeaders().set('Authorization', `${token}`);
  }

  getNotification(id: number | undefined): Observable<Notifications[]> {
    return this.http.get<Notifications[]>(apiUrl + `/notification/${id}`, {headers});
  }

  seenNotification(id: number | undefined): Observable<any> {
    return this.http.get<any>(apiUrl + `/notification/seen/${id}`, {headers})
  }

  countOther(notification: Notifications[]): Observable<any> {
    return this.http.post<any>(apiUrl + `/notification/other`, notification, {headers});
  }
}
