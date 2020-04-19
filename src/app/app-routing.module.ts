import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './pre-auth/login/login.component';
import { DashboardComponent } from './after-auth/dashboard/dashboard.component';
import { RegistrationComponent } from './pre-auth/registration/registration.component';
// import { SecurePage } from './services/protected.service';
import { AuthGuard } from './services/authService.service';
import { ChatComponent } from './after-auth/chat/chat.component';
import { UsersComponent } from './after-auth/users/users.component';
import { RequestComponent } from './after-auth/request/request.component';
import { FriendsComponent } from './after-auth/friends/friends.component';
import { HeaderComponent } from './after-auth/header/header.component';

const routes: Routes = [
  {path: '', redirectTo: 'login', pathMatch: 'full'},
  {path: 'login', canActivate: [AuthGuard], component: LoginComponent},
  {
    path: 'dashboard',
    // canActivate: [SecurePage],
   component: DashboardComponent},
  {path: 'registration', canActivate: [AuthGuard], component: RegistrationComponent},
  {path: 'chat',
  //  canActivate: [SecurePage], 
   component: ChatComponent},
  {path: 'users',
  //  canActivate: [SecurePage], 
   component: UsersComponent},
  {path: 'request',
  //  canActivate: [SecurePage], 
   component: RequestComponent},
  {path: 'friends',
  //  canActivate: [SecurePage],
    component: FriendsComponent},
  {path: 'header', 
  // canActivate: [SecurePage], 
  component: HeaderComponent} 
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
