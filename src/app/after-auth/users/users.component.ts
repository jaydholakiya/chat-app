import { Component, OnInit } from '@angular/core';
import { ApiCalls } from '../../services/apicalls.service';
import * as io from 'socket.io-client';
import * as $ from 'jquery';
import { NgxUiLoaderService } from 'ngx-ui-loader';
@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  data = [];
  localdata: any;
  uid: any;
  newrequest: any;
  datas: any;
  accept: any;
  newdata: any;
  constructor(private api: ApiCalls, private ngxService: NgxUiLoaderService) {}


  ngOnInit() {
    this.localdata = JSON.parse(localStorage.getItem('accessToken'));
    this.uid = {uid: this.localdata.uid };
    const local = JSON.parse(localStorage.getItem('accessToken'));

    /**
     * api for get all users if already friend then dont splice it
     */

    this.api.getallusers(this.uid).subscribe((data: any) => {
      console.log(data);
      const getname = data.findIndex(data => data.id === local.uid);
      data.splice(getname, 1);
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < data.length; i++) {
      this.data.push(data[i]);  }
      console.log(this.data);
    });


    /**
     * if already request a friend then button diable functionality witrh api call to request
     */
    this.api.getrequestlist(this.uid).subscribe((data: any) => {
      console.log(data);
      this.newdata = data;
      for (const [i, v] of this.newdata.entries()) {
        setTimeout(() => {
          $(`#abc` + v).prop('disabled', true);
     }, 1000);
      }
   });
   
    const socket = io('http://localhost:8000');
    socket.emit('startconnnection', { connencted: this.localdata.uid });
    socket.on('newbutton', data => {
    console.log(data);
    $(`#abc${data}`).prop('disabled', false);
    console.log(`${data}`);
    });
    socket.on('userafterremove', data => {
      console.log(data);
      this.data.push(data);
    });
  }

  /**
   * request send fucntion
   * @param id to whom the request is to be send
  */

  requestsend(id) {
    const socket = io('http://localhost:8000');
    socket.emit('request', {
      to: id,
      from: this.uid.uid,
      message: 'friend request'
    });
    socket.on('accept message', data => {
      console.log(data);
      this.datas = data;
    });
    $(`#abc${id}`).prop('disabled', true);
  }
}