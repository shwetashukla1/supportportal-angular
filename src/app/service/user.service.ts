import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient,  HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../model/User'; 
import { CustomHttpResponse } from '../model/CustomHttpResponse';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private host = environment.apiUrl;

  constructor(private http: HttpClient) { }

  public getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.host}/user/list`);
  }

  public addUser(formData: FormData): Observable<User> {
    return this.http.post<User>(`${this.host}/user/add`, formData);
  }

  public updateUser(formData: FormData): Observable<User> {
    return this.http.post<User>(`${this.host}/user/update`, formData);
  }

  public resetPassword(email: string): Observable<CustomHttpResponse> {
    return this.http.get<CustomHttpResponse>(`${this.host}/user/resetPassword/${email}`);
  }

  public updateProfileImage(formData: FormData): Observable<HttpEvent<User>> {
    return this.http.post<User>(`${this.host}/user/updateProfileImage`, formData, 
    { reportProgress : true,
      observe : 'events'
    });
  }

  public deleteUser(username: string): Observable<CustomHttpResponse> {
    return this.http.delete<CustomHttpResponse>(`${this.host}/user/delete/${username}`);
  }

  public addUsersToLocalCache(users : User[]): void {
    localStorage.setItem('users',JSON.stringify(users))
  } 

  public getUsersFromLocalCache(): User[] {
    if(localStorage.getItem('users')){
      return JSON.parse(localStorage.getItem('users'))
    }
    return null;
  }

  public createUserFormdata(loggedInUsername: string, user: User, profileImage: File): FormData {
    const formdata = new FormData();
    formdata.append('currentUsername', loggedInUsername);
    formdata.append('firstName', user.firstName);
    formdata.append('lastName', user.lastName);
    formdata.append('username', user.username);
    formdata.append('email', user.email);
    formdata.append('role', user.role);
    formdata.append('profileImage', profileImage);
    formdata.append('isActive', JSON.stringify(user.active));
    formdata.append('isNotLocked', JSON.stringify(user.notLocked));
    return formdata;
  }

}
