import { Component, OnInit } from '@angular/core';
import * as io from 'socket.io-client';
import { ApiCalls } from '../../services/apicalls.service';

@Component({
  selector: 'app-request',
  templateUrl: './request.component.html',
  styleUrls: ['./request.component.scss'],
})

export class RequestComponent implements OnInit {
  localdata: any;
  objectofid: any;
  datas = [];
  newdatas = [];
  constructor(private api: ApiCalls) {}

  ngOnInit() {
    this.localdata = JSON.parse(localStorage.getItem('accessToken'));
    console.log(this.localdata.uid);
    console.log(this.datas);
    this.objectofid = {
      id: this.localdata.uid,
    };
    const socket = io('http://localhost:8000');

    socket.emit('startconnnection', { connencted: this.localdata.uid });
    socket.on('online users', (data) => {
      console.log(data.online);
      this.newdatas = data.online;
    });
    const getFruit = this.newdatas.findIndex(
      (d) => d.user === this.localdata.uid
    );
    console.log(getFruit);
    console.log(this.newdatas);

    socket.on('accept message', (data) => {
      console.log(data);
      this.datas.push(data);
    });
    this.api.getrequests(this.objectofid).subscribe((data: any) => {
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < data.length; i++) {
        this.datas.push(data[i]);
        console.log(data);
      }
    });
    // }
  }

  /**
   * fucntion for accept friend request
   * @param id id of accepted friend request
   */
  acceptfriendrequest(id) {
    console.log(id);
    console.log(this.datas[0].id);
    const getFruit = this.datas.findIndex((d) => d.id === id);
    console.log(getFruit);
    this.datas.splice(getFruit, 1);
    console.log(this.datas);
    console.log(this.localdata.uid);
    const newobject = {
      to: this.localdata.uid,
      from: id,
    };
    const socket = io('http://localhost:8000');
    socket.emit('acceptrequest', {
      to: this.localdata.uid,
      from: id,
    });
  }

  /**
   * for reject friend req
   * @param id if the user is reject the friend request id is deifne which friend
   */
  rejectrequest(id) {
    const getFruit = this.datas.findIndex((d) => d.id === id);
    console.log(getFruit);
    this.datas.splice(getFruit, 1);
    const idobject = {
      from: id,
      to: this.localdata.uid,
    };
    this.api.reject(idobject).subscribe((data) => {
      console.log(data);
    });
    const socket = io('http://localhost:8000');
    socket.emit('buttonshow', {
      message: 'buttondiabe',
      from: id,
      to: this.localdata.uid,
    });
  }
}