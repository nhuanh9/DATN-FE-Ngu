import {Users} from "./Users";
import {Post} from "./Post";

export interface PostComment {
  id:number,
  users:Users,
  // post:Post,
  idParent: number,
  parentType: boolean,
  content: string
  cmtAt:Date
  countLike: number,
  status: boolean
}
