import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { User, authService } from '../services/authService';
import { SearchBarService } from '../services/searchBar';

@Component({
  selector: 'navbar',
  host: {},
  template: require('./navbar.html')
})

export class NavbarComponent implements OnInit {
  User: User;
  activePage: Object;
  activeFeed: Object;
  loginLoading: boolean = false;
  registerLoading: boolean = false;
  recoverLoading: boolean = false;
  search$;
  isSearchBarHidden: Object;

  constructor(public as: authService, private router: Router, private sb: SearchBarService) {
    this.User = this.as.emptyUser();
    this.User = this.as.getUser();
    this.activePage = this.as.getActivePageTitle();
    this.activeFeed = this.as.getActiveFeed();
    this.isSearchBarHidden = this.sb.searchBar;
    this.search$ = this.sb.search$;
  }

  ngOnInit() {
    console.log('ngOnInit');
    $(".button-collapse")['sideNav']({
      menuWidth: 300,
      edge: 'right',
      closeOnClick: true
    });
  }

  home() {
    console.log('home');
    this.router.navigate(['feeds']);
  }

  navigate() {
    console.log('Navigate');
    if (this.activeFeed['id']) {
      this.router.navigate(['\posts', this.activeFeed['id']]);
      this.as.setActiveFeedID('');
    } else {
      this.router.navigate(['feeds']);
    }
  }

  loginModal() {
    console.log('Login Modal');
    $('#registerModal')['closeModal']();
    $('.button-collapse')['sideNav']('hide');
    $('#loginModal')['openModal']();
  }

  login(user) {
    console.log('user', user);
    this.loginLoading = true;
    this.as.login(user.email, user.password).then((res) => {
      this.User = this.as.getUser();
      console.log('User is Logged In!');
      $('#errorLogin').html('');
      $('#loginModal')['closeModal']();
      this.loginLoading = false;
    }).catch((err) => {
      console.log('Login Failed!', err);
      $('#errorLogin').html(err['message']);
      this.loginLoading = false;
    });
  }

  recoverModal() {
    console.log('recover modal');
    $('#loginModal')['closeModal']();
    $('#registerModal')['closeModal']();
    $('#recoverModal')['openModal']();
  }

  recover(data) {
    console.log('recover data', data);
    event.preventDefault();
    $('#errorRecover').html('');
    this.recoverLoading = true;
    this.as.recover(data.email).then(res => {
      console.log('Email Reset!', res);
      $('#errorRecover').html('');
      $('#recoverModal')['closeModal']();
      this.recoverLoading = false;
    }).catch((err) => {
      console.log('Email Reset Failed!', err);
      $('#errorRecover').html(err['message']);
      this.recoverLoading = false;
    });
  }

  registerModal() {
    console.log('create feed modal');
    $('#loginModal')['closeModal']();
    $(".button-collapse")['sideNav']('hide');
    $('#registerModal')['openModal']();
  }

  register(user, terms) {
    console.log('user', user);
    console.log('terms', terms);
    if (!terms) return $('#errorRegister').html('You have to agree on Superwire\'s terms to create an account');
    $('#errorRegister').html('');
    this.registerLoading = true;
    this.as.register(user.email.toLowerCase(), user.password).then((res) => {
      this.as.login(user.email.toLowerCase(), user.password).then((res) => {
        this.as.createUserProfile(res.uid, user.name.toLowerCase(), user.email.toLowerCase()).then(() => {
          console.log('Profile is Created!');
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
        console.log('Login Failed after Registration!', err);
        $('#errorRegister').html(err['message']);
        this.registerLoading = false;
      });
    }).catch((err) => {
      console.log('Register Failed!', err);
      if (err.message == 'The email address is already in use by another account.') {
        $('#errorRegister').html('Email is already in use, please choose a new one or recover password.');
      } else {
        $('#errorRegister').html(err['message']);
      }
      this.registerLoading = false;
    });
  }

  logout() {
    this.as.logout();
    console.log('User is Logged Out!');
    $('.button-collapse')['sideNav']('hide');
    this.router.navigate(['feeds']);
  }

}
