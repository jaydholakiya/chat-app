import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { LoginComponent } from './pre-auth/login/login.component';
import { ApiCalls } from './services/apicalls.service';
import { DashboardComponent } from './after-auth/dashboard/dashboard.component';
import { RegistrationComponent } from './pre-auth/registration/registration.component';
import { AuthGuard } from './services/authService.service';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { SecurePage } from './services/protected.service';
import { ChatComponent } from './after-auth/chat/chat.component';
import { UsersComponent } from './after-auth/users/users.component';
import { RequestComponent } from './after-auth/request/request.component';
import { FriendsComponent } from './after-auth/friends/friends.component';
import { HeaderComponent } from './after-auth/header/header.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    RegistrationComponent,
    ChatComponent,
    UsersComponent,
    RequestComponent,
    FriendsComponent,
    HeaderComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    NgxUiLoaderModule,
    AppRoutingModule,
    HttpClientModule,
  ],
  providers: [ApiCalls,
    AuthGuard,
    SecurePage
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
