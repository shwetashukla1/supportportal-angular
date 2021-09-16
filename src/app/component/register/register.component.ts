import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NotificationType } from 'src/app/enum/notification-type.enum';
import { User } from 'src/app/model/User';
import { AuthenticationService } from 'src/app/service/authentication.service';
import { NotificationService } from 'src/app/service/notification.service';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit, OnDestroy {
  public showLoading: boolean;
  public subcriptions: Subscription[] = [];

  constructor(private router: Router, private authenticationService: AuthenticationService,
              private notificationService: NotificationService) { }

  ngOnInit(): void {
    if(this.authenticationService.isLoggedIn()){
      this.router.navigateByUrl('/user/management');
    }
  }

  public onRegister(user: User): void {
    console.log(user);
    this.showLoading = true;
    this.subcriptions.push(
      this.authenticationService.register(user).subscribe(
        (response: User) => {
          this.showLoading = false;
          this.sendNotification(NotificationType.SUCCESS, `A new account created for ${response.firstName}.
          Please check you email for password to login.`);
          this.router.navigate(['/login']);
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
          this.showLoading = false;
        }
      )
    )
  }
  private sendNotification(notificationType: NotificationType, message: any) {
    if(message) {
      this.notificationService.notify(notificationType, message);
    }
    else{
      this.notificationService.notify(notificationType, 'An error occured, Please try again.');
      this.showLoading = false;
    }
  }

  ngOnDestroy(): void{
    this.subcriptions.forEach(sub => sub.unsubscribe());
  }

}
