import { Component, OnInit } from '@angular/core';
import { ApiCalls } from '../../services/apicalls.service';
import * as io from 'socket.io-client';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.scss']
})

export class FriendsComponent implements OnInit {
  localdata: any;
  objectofid: { id: any; };
  datas = [];

  constructor( private api: ApiCalls) { }

  ngOnInit() {
    const socket = io('http://localhost:8000');
    this.localdata = JSON.parse(localStorage.getItem('accessToken'));
    socket.emit('startconnnection', { connencted: this.localdata.uid });

    /**
     * newfirend of other user accept request
     */
    socket.on('newfriend', data => {
      console.log(data);
      this.datas.push(data);
    });

    this.localdata = JSON.parse(localStorage.getItem('accessToken'));
    console.log(this.localdata.uid);
    this.objectofid = {
      id: this.localdata.uid
    };

    /**
     * api for get friend list from db
     */
    this.api.getfriends(this.objectofid).subscribe((res: any) => {
      console.log(res);
      // tslint:disable-next-line: quotemark
      if (res === "sorry you don't have friends") {
        console.log('No friends.');
      } else {
      for (let i = 0; i < res.length; i++) {
        this.datas.push(res[i]);
      }
  }
    });
  }

  /**
   * remove friend button click function
   * @param id id of friend which is removed
   */
  removefriend(id) {
    console.log(id);
    const newid = {
      local: this.localdata.uid,
      from: id,
    };
    const getFruit = this.datas.findIndex(d => d.id === id);
    console.log(getFruit);
    this.datas.splice(getFruit, 1);
    console.log(newid);
    this.api.removefriend(newid).subscribe((res: any) => {});
  }
}