import {RouterModule, Routes} from "@angular/router";
import {LoginComponent} from "./controller/login/login.component";
import {NgModule} from "@angular/core";
import {RegisterComponent} from "./controller/register/register.component";
import {NewfeedComponent} from "./controller/newsfeed/newfeed.component";
import {ProfileComponent} from "./controller/profile/profile.component";
import {EditProfileComponent} from "./controller/edit-profile/edit-profile.component";
import {FriendProfileComponent} from "./controller/friend-profile/friend-profile.component";
import {SearchFriendComponent} from "./controller/search-friend/search-friend.component";
import {PostDetailComponent} from "./controller/post-detail/post-detail.component";
import {PrivacySettingComponent} from "./controller/privacy-setting/privacy-setting.component";
import {MessageComponent} from "./controller/message/message.component";
import {ErrorComponent} from "./controller/error/error.component";

const routes: Routes = [
  {path: '', component: LoginComponent},
  {path: 'register', component: RegisterComponent},
  {path: 'newsfeed', component: NewfeedComponent},
  {path: 'profile', component: ProfileComponent },
  {path: 'edit-profile', component: EditProfileComponent},
  {path: 'friend-profile/:id', component: FriendProfileComponent},
  {path: 'search-friend', component: SearchFriendComponent},
  {path: 'post-detail/:id', component: PostDetailComponent },
  {path: 'privacy', component: PrivacySettingComponent },
  {path: 'message', component: MessageComponent},
  {path: 'error', component: ErrorComponent}

]

@NgModule({
  imports: [RouterModule.forRoot(routes, {scrollPositionRestoration: 'enabled'})],
  exports: [RouterModule]
})
export class AppRoutingModule {

}
