import { HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotificationType } from 'src/app/enum/notification-type.enum';
import { User } from 'src/app/model/User';
import { AuthenticationService } from 'src/app/service/authentication.service';
import { NotificationService } from 'src/app/service/notification.service';
import { UserService } from 'src/app/service/user.service';
import { SharedDataService } from 'src/app/service/shared-data.service';
import { Router } from '@angular/router';
import { FileUploadStatus } from 'src/app/model/file-upload-status';
import { Role } from 'src/app/enum/role.enum';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
  public user: User;
  public refreshing: boolean;
  public currentUserName: string;
  private subscriptions: Subscription[] = [];
  public fileName: string;
  public profileImage: File;
  public fileStatus = new FileUploadStatus();

  constructor(private authenticationService: AuthenticationService, 
    private userService: UserService,
    private router: Router,
    private sharedDataService: SharedDataService,
    private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.user = this.authenticationService.getUserFromLocalStorage();
  }

  public onProfileImageChange(fileName: string, profileImage: File): void {
    this.fileName = fileName;
    this.profileImage = profileImage;
  }

  public onUpdateCurrentUser(user: User): void {
    this.refreshing = true;
    this.currentUserName = this.user.username;
    const formData = this.userService.createUserFormdata(this.currentUserName, user, this.profileImage);
    this.subscriptions.push(
      
      this.userService.updateUser(formData).subscribe(
        (response: User) => {
          this.authenticationService.addUserToLocalCache(response);
          this.sharedDataService.sendGetUsersEvent();
          this.fileName=null;
          this.profileImage=null;
          this.sendNotification(NotificationType.SUCCESS, `${response.firstName}\'s profile updated successfully`);
          this.refreshing = false;
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
          this.refreshing = false;
          this.profileImage=null;
        }
      )
    )
    
  }


  sendNotification(notificationType: NotificationType, message: string) {
    if(message){
      this.notificationService.notify(notificationType, message);
    }
    else{
      this.notificationService.notify(notificationType, 'An error occurred, please try again');
    }
  }

  public onLogOut(): void {
    this.authenticationService.logOut();
    this.router.navigate(['/login']);
    this.sendNotification(NotificationType.SUCCESS, 'You have been logged out.');
  }

  public updateProfileImage(): void {
    document.getElementById('profile-image-input').click();
  }

  public onUpdateProfileImage(): void {
    const formData = new FormData();
    formData.append('username', this.user.username);
    formData.append('profileImage', this.profileImage);
    this.subscriptions.push(
      this.userService.updateProfileImage(formData).subscribe(
        (event: HttpEvent<any>) => {
          this.reportUploadProgress(event);
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
          this.fileStatus.status = 'done';
        }
      )
    )
  }

  reportUploadProgress(event: HttpEvent<any>) {
    switch (event.type) {
      case HttpEventType.UploadProgress:
        this.fileStatus.percentage = Math.round(100 * event.loaded / event.total);
        this.fileStatus.status = 'progress';
        break;
      case HttpEventType.Response:
        if(event.status === 200) {
          this.user.profileImageUrl = `${event.body.profileImageUrl}?time=${new Date().getTime()}`;
          this.sendNotification(NotificationType.SUCCESS, 'profile image uploaded');
          this.fileStatus.status = 'done';
          break;
        }else{
          this.sendNotification(NotificationType.ERROR, 'Unable to upload image, please try again');
          break;
        }
      default:
        'finished all process';
    }
  }

  public get isAdmin(): boolean {
    return this.getUserRole() === Role.ADMIN || this.getUserRole() === Role.SUPER_ADMIN;
  }

  public get isManager(): boolean {
    return this.isAdmin || this.getUserRole() === Role.SUPER_ADMIN;
  }

  public get isManagerOrAdmin(): boolean {
    return this.isAdmin || this.isManager;
  }

  private getUserRole(): string {
    return this.authenticationService.getUserFromLocalStorage()?.role;
  }

  ngOnDestroy(): void{
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}
