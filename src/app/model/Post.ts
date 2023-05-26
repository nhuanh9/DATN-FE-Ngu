// @ts-ignore
import {Users} from "./Users";
import {PostStatus} from "./Post-status";

export interface Post {
  id?:number,
  users?:Users,
  content?:string,
  createAt?:Date,
  countLikePost?: number,
  countComment?: number,
  postStatus?:PostStatus,
  status?: boolean
}
