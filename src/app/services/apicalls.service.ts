import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { appinfo } from '../../environments/environment';

@Injectable()

export class ApiCalls {
  readonly baseurl = 'http://localhost:8000/';
  constructor(private https: HttpClient) {}
  
  login(emp: any) {
    return this.https.post(this.baseurl + appinfo.info.login, emp);
  }
  registration(emp: any) {
    return this.https.post(this.baseurl + appinfo.info.registration, emp);
  }
  getallusers(id) {
    return this.https.post(this.baseurl + appinfo.info.allusers, id);
  }
  sendrequest(object) {
    return this.https.post(this.baseurl + appinfo.info.sendrequest, object);
  }
  getrequests(id) {
    return this.https.post(this.baseurl + appinfo.info.getrequests, id);
  }
  getrequestlist(id) {
    console.log(id);
    return this.https.post(this.baseurl + appinfo.info.getrequestlist, id);
  }
  acceptrequest(id) {
    return this.https.post(this.baseurl + appinfo.info.acceptrequest, id);
  }
  getfriends(id) {
    return this.https.post(this.baseurl + appinfo.info.getfriends, id);
  }
  reject(id) {
    return this.https.post(this.baseurl + appinfo.info.reject, id);
  }
  removefriend(id) {
    return this.https.post(this.baseurl + appinfo.info.removefriend, id);
  }
  getmessages(id) {
    return this.https.post(this.baseurl + appinfo.info.getmessages, id);
  }
  messagestatechange(data) {
    return this.https.post(this.baseurl + appinfo.info.messagestatechange, data);
  }
}
