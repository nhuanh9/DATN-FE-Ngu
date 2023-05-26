import {Role} from "./Role"
export interface Users{
  id?:number
  email?:string
  password?:string
  confirmPassword?:string
  firstName?:string
  lastName?:string
  phone?:string
  checkOn?:false
  birthday?:string
  gender?:string
  seeFriendPermission?:true
  avatar?:string
  address?:string
  hobby?:string
  verificationCode?:string
  enabled?:true
  role?:Role
}
