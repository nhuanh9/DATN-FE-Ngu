import {Users} from "./Users";
import {Post} from "./Post";
import {NotificationType} from "./Notification-type";

export interface Notifications {
  id?: number
  users?: Users
  post?: Post
  notificationType?: NotificationType
  notificationAt?: Date
  status?: boolean
}
