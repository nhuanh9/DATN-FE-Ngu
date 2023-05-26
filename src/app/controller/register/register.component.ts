import {Component, OnInit} from '@angular/core';
import {Users} from "../../model/Users";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {UserService} from "../../service/user/user.service";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup
  user!: Users
  userList: Users[] = [];

  constructor(private userService: UserService,
              private router: Router,
              private routerActive: ActivatedRoute,
              private toastr: ToastrService) {
  }

  ngOnInit(): void {
    this.registerForm = new FormGroup({
      firstName: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z0-9]*$')]),
      lastName: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z0-9]*$')]),
      password: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z0-9]*$'), Validators.minLength(6), Validators.maxLength(32)]),
      confirmPassword: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z0-9]*$'), Validators.minLength(6), Validators.maxLength(32)]),
      email: new FormControl('', [Validators.required, Validators.pattern("^(.+)@(\\S+)$")]),
    })

    this.userService.showAllUser().subscribe((data) => {
      this.userList = data
    })
  }

  register() {
    this.user = this.registerForm.value;
    let flag = true;
    if (!(this.checkEmailExist(this.registerForm.get('email')?.value))) {
      if (this.registerForm.get('password')?.value == this.registerForm.get('confirmPassword')?.value) {
        if (flag) {
          this.userService.register(this.user).subscribe(data => {
            // window.localStorage.setItem("user", JSON.stringify(data));
            this.router.navigate(['']); // chuyển hướng sang đăng nhập
            this.success()
          })
          flag = false;
        }
      }
      if (flag) {
        this.errorPassword()
        flag = false
      }
    }
    if (flag) {
      this.errorEmail()
      flag = false
    }
  }

  checkEmailExist(email: string): boolean {
    for (let i = 0; i < this.userList.length; i++) {
      if (this.userList[i].email == email) {
        return true;
      }
    }
    return false;
  }

  success(): void {
    this.toastr.success('Please check your email!', 'Success');
  }

  errorEmail(): void {
    this.toastr.error('Email is existing !', 'Error')
  }

  errorPassword(): void {
    this.toastr.warning('Password & Confirm Password is not match ', 'Warning')
  }


}
