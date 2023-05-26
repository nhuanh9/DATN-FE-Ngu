import {Conversation} from "./Conversation";
import {Users} from "./Users";

export interface Messages {
  id?: number
  conversation?: Conversation
  users?: Users
  textAt?: Date
  content?: string
}
