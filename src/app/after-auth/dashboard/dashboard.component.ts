import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  data: any;
  localdata: any;
  displayname: any;
  uid: any;

  constructor(private router: Router) {}

  ngOnInit() {
    /**
     * local storage access
     */
    this.localdata = JSON.parse(localStorage.getItem('accessToken'));
    console.log(this.localdata);
    this.displayname = this.localdata.displayName;
    this.uid = this.localdata.uid;
  }

  ondashboard() {
    this.router.navigate(['/chat']);
  }

  onusers() {
    this.router.navigate(['/users']);
  }

  onrequest() {
    this.router.navigate(['/request']);
  }

  friends() {
    this.router.navigate(['/friends']);
  }

}