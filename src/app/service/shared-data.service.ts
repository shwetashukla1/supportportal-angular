import {  Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedDataService {

  private subject = new Subject<any>();
  sendGetUsersEvent() {
    this.subject.next();
  }
  getUsersEvent(): Observable<any> {
    return this.subject.asObservable();
  }
}