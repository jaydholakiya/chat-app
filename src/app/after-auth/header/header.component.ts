import { Component, OnInit } from '@angular/core';
import * as io from 'socket.io-client';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})

export class HeaderComponent implements OnInit {
  localdata: any;
  displayname: any;
  uid: any;
  img1: string;

  constructor( private routes: Router) { }

  ngOnInit() {
    this.localdata = JSON.parse(localStorage.getItem('accessToken'));
    console.log(this.localdata.uid);
    this.img1 = 'http://localhost:8000/images/' + this.localdata.image;
    this.displayname = this.localdata.displayName;
    this.uid = this.localdata.uid;
    const socket = io('http://localhost:8000');
  }

  /**
   * on lotggout loclstorage clear and socket disconnected
   */
  logout() {
    const socket = io('http://localhost:8000');
    socket.emit('id', {id: this.localdata.uid});
    socket.emit('disconnect');
    localStorage.removeItem('accessToken');
    this.routes.navigate(['/login']);
  }

  openNav(){
    this.routes.navigate(['/dashboard']);
  }
}