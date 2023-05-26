import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Users} from "../../model/Users";
import {UserService} from "../../service/user/user.service";
import {Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {async} from "rxjs";
import {HttpErrorResponse} from "@angular/common/http";
import {COMETCHAT_CONSTANTS} from "../../../CONSTS";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup
  user!: Users
  private stompClient: any;
  userList: Users[] = [];

  constructor(private userService: UserService,
              private router: Router,
              private toastr: ToastrService) {
  }

  ngOnInit(): void {
    // this.userService.showAllUser().subscribe((data) => {
    //   console.log(data)
    //   this.userList = data
    // }
    // )

    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.pattern("^(.+)@(\\S+)$")]),
      password: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z0-9]*$'), Validators.minLength(6), Validators.maxLength(32)])
    });
  }

  login() {
    this.user = this.loginForm.value;
    // @ts-ignore
    this.user.checkOn = true
    new Promise<boolean>((resolve, reject) => {
      this.userService.checkEmailAndPass(this.user).subscribe(() => {
        resolve(true);
      }, (error: HttpErrorResponse) => {
        if (error.status === 400) {
          resolve(false);
        }
      });
    }).then((res) => {
      if (res) {
        new Promise<boolean>((resolve, reject) => {
          this.userService.login(this.user).subscribe(data => {
            console.log(data)
            window.localStorage.setItem("user", JSON.stringify(data.users));
            window.localStorage.setItem("token", data.token);
            resolve(true);
          }, () => {
            resolve(false);
          });
        }).then((res) => {
          if(res) {
            this.success()
            this.router.navigate(['/newsfeed']);
          } else {
            this.warning();
          }
        })
      } else {
        this.error();
      }
    })
      .catch(e => {
      console.log(e)
    })
  }



  success(): void {
    this.toastr.success('Login Success !', 'Success');
  }

  error(): void {
    this.toastr.error('Password or Username not match !', 'Error')
  }

  warning(): void {
    this.toastr.warning('Account be blocked', 'Warning')
  }
}
