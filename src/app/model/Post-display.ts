// @ts-ignore
import { Users} from "./Users";
import {PostStatus} from "./Post-status";

export interface PostDisplay {
  id?:number,
  users?:Users,
  content?:string,
  createAt?:Date,
  postStatus?:PostStatus,
  checkUserLiked?:boolean
}
