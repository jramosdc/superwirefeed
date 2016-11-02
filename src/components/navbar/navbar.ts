import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User, authService } from '../services/authService';

@Component({
  selector: 'navbar',
  host: {},
  styles: [
    // require('../materialize/index.scss'),
    // require('./navbar.scss')
  ],
  template: require('./navbar.html')
})

export class NavbarComponent implements OnInit {
  User: User;
  activePage: Object;
  activeFeed: Object;
  loginLoading: boolean = false;
  registerLoading: boolean = false;

  constructor(public as: authService, private router: Router) {
    this.User = this.as.emptyUser();
    this.User = this.as.getUser();
    this.activePage = this.as.getActivePageTitle();
    this.activeFeed = this.as.getActiveFeed();
  }

  ngOnInit() {
    $(".button-collapse")['sideNav']({
      menuWidth: 300,
      edge: 'right',
      closeOnClick: true
    });
  }

  navigate() {
    if (this.activeFeed['id']) {
      this.router.navigate(['\posts', this.activeFeed['id']]);
      this.as.setActiveFeedID('');
    } else {
      this.router.navigate(['feeds']);
    }
  }

  loginModal() {
    $(".button-collapse")['sideNav']('hide');
    $('#loginModal')['openModal']();
  }

  login(user) {
    this.loginLoading = true;
    this.as.login(user.email, user.password).then((res) => {
      this.User = this.as.getUser();
      console.log('User is Logged In!');
      $('#errorLogin').html('');
      $('#loginModal')['closeModal']();
      this.loginLoading = false;
    }).catch((err) => {
      console.log("Login Failed!", err);
      $('#errorLogin').html(err['message']);
      this.loginLoading = false;
    });
  }

  registerModal() {
    $(".button-collapse")['sideNav']('hide');
    $('#registerModal')['openModal']();
  }

  register(user) {
    this.registerLoading = true;
    this.as.register(user.email.toLowerCase(), user.password).then((res) => {
      this.as.login(user.email.toLowerCase(), user.password).then((res) => {
        this.as.createUserProfile(res.uid, user.name.toLowerCase(), user.email.toLowerCase()).then(() => {
          console.log('Profile is Created!')
          console.log('User is Registered & Logged In!');
          this.router.navigate(['/profile', user.name.toLowerCase()]);
          $('#errorRegister').html('');
          $('#registerModal')['closeModal']();
          this.registerLoading = false;
        }).catch((err) => {
          console.log('Profile Creation Failed!', err)
        });

        // after login send email verification
        this.as.sendEmailVerfication();

      }).catch((err) => {
        console.log("Login Failed after Registration!", err);
        $('#errorRegister').html(err['message']);
        this.registerLoading = false;
      });
    }).catch((err) => {
      console.log("Register Failed!", err);
      $('#errorRegister').html(err['message']);
      this.registerLoading = false;
    });
  }

  logout() {
    this.as.logout();
    console.log('User is Logged Out!');
    $(".button-collapse")['sideNav']('hide');
    this.router.navigate(['feeds']);
  }

}
