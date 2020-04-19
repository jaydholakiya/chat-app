import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { CustomValidators } from '../../services/custom-validators';
import { ApiCalls } from '../../services/apicalls.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})

export class RegistrationComponent implements OnInit {
  profileForm: FormGroup;
  new: any;
  objectimage: any;
  domSanitizer: any;
  img1: any;
  newimage: string;

  constructor(private fb: FormBuilder, private api: ApiCalls, private routes: Router) { }

  ngOnInit() {

    this.profileForm = this.fb.group({
      username: ['', Validators.required],
      Emailid: ['', [Validators.required, Validators.email]],
      password: [
        null,
        [
          Validators.required,
          Validators.compose([
            CustomValidators.patternValidator(/\d/, { hasNumber: true }),
            CustomValidators.patternValidator(/[A-Z]/, {
              hasCapitalCase: true
            }),
            CustomValidators.patternValidator(/[a-z]/, { hasSmallCase: true }),
            CustomValidators.patternValidator(/[!@#\$%\^&?]/, {
              haslengthCase: true
            }),
            ,
          ]),
          Validators.minLength(8)
        ]
      ],
      image: ['', Validators.required],
      cpassword: [ null, [Validators.required, Validators.compose([CustomValidators.matchValues('password'),      ])]]
    });
  }

  onSubmit(event) {
    this.fd.append('uploadfile', this.selectedFile, this.selectedFile.name);
    this.fd.append('displayName', this.profileForm.value.username);
    this.fd.append('Emailid',  this.profileForm.value.Emailid);
    this.fd.append('password', this.profileForm.value.password);

    console.log(this.new);
    this.api.registration(this.fd).subscribe((res: any) => {
      console.log(res.message);
      if(res.message === 'successfully resgisterd') {
        this.routes.navigate(['/login']);
      } else {
        this.profileForm.reset();
        this.routes.navigate(['/login']);
      }
      });
  }

  onlogin() {
    this.routes.navigate(['/login']);
  }
  // tslint:disable-next-line:member-ordering
  selectedFile: File = null;
  // tslint:disable-next-line:member-ordering
  fd = new FormData();
  createFormData(event) {
  // tslint:disable-next-line:no-angle-bracket-type-assertion
  this.selectedFile = <File> event.target.files[0];
  }
}