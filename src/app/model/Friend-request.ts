import {Users} from "./Users";

export interface FriendRequest {
  id:number,
  usersRequest?:Users,
  usersReceive?:Users,
  status?:boolean
}
