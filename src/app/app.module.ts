import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {LoginComponent} from './controller/login/login.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import {NgImageSliderModule} from "ng-image-slider";
import {AngularFireModule} from "@angular/fire/compat";
import {environment} from "../environments/environment";
import {AngularFireStorageModule} from "@angular/fire/compat/storage";
import {AngularFireDatabaseModule} from "@angular/fire/compat/database";
import {InfiniteScrollModule} from "ngx-infinite-scroll";
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatProgressBarModule} from '@angular/material/progress-bar';
// @ts-ignore
import {SweetAlert2Module} from "@sweetalert2/ngx-sweetalert2";
import {ToastrModule} from "ngx-toastr";
import {MatPaginatorModule} from "@angular/material/paginator";
import {NgxPaginationModule} from "ngx-pagination";
import { RegisterComponent } from './controller/register/register.component';
import { NewfeedComponent } from './controller/newsfeed/newfeed.component';
import { EditProfileComponent } from './controller/edit-profile/edit-profile.component';
import { ErrorComponent } from './controller/error/error.component';
import { FriendProfileComponent } from './controller/friend-profile/friend-profile.component';
import { MessageComponent } from './controller/message/message.component';
import { PostDetailComponent } from './controller/post-detail/post-detail.component';
import { PrivacySettingComponent } from './controller/privacy-setting/privacy-setting.component';
import { ProfileComponent } from './controller/profile/profile.component';
import { SearchFriendComponent } from './controller/search-friend/search-friend.component';
import {CometChatUI} from "../cometchat-pro-angular-ui-kit/CometChatWorkspace/src/components/CometChatUI/CometChat-Ui/cometchat-ui.module";
import {CometChatAvatar} from "../cometchat-pro-angular-ui-kit/CometChatWorkspace/src/components/Shared/CometChat-avatar/cometchat-avatar.module";
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    NewfeedComponent,
    EditProfileComponent,
    ErrorComponent,
    FriendProfileComponent,
    MessageComponent,
    PostDetailComponent,
    PrivacySettingComponent,
    ProfileComponent,
    SearchFriendComponent
  ],
  imports: [
    NgxPaginationModule,
    ToastrModule.forRoot({
      timeOut: 2000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    }),
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireStorageModule,
    AngularFireDatabaseModule,
    NgImageSliderModule,
    InfiniteScrollModule,
    BrowserAnimationsModule,
    MatProgressBarModule,
    SweetAlert2Module,
    FormsModule,
    MatPaginatorModule,
    CometChatAvatar,
    CometChatUI,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
