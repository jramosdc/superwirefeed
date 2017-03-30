import { Component, OnInit, ViewChild, trigger, transition, style, animate } from '@angular/core';
import { Router } from '@angular/router';
import { User, authService } from '../services/authService';
import { SearchBarService } from '../services/searchBar';

@Component({
  selector: 'navbar',
  host: {},
  template: require('./navbar.html'),
  animations: [
    trigger(
      'modalSlider', [
        transition(':enter', [
          style({transform: 'translateX(100%)', opacity: 0, height: 0}),
          animate('200ms', style({transform: 'translateX(0)', opacity: 1}))
        ]),
        transition(':leave', [
          style({transform: 'translateX(0)', opacity: 1 }),
          animate('200ms', style({transform: 'translateX(-100%)', opacity: 0, height: 0}))
        ])
      ]
    ),
    trigger(
      'modalFader', [
        transition(':enter', [
          style({opacity: 0}),
          animate('200ms', style({opacity: 1}))
        ]),
        transition(':leave', [
          style({opacity: 1}),
          animate('200ms', style({opacity: 0}))
        ])
      ]
    )
  ]
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
  Step: number;
  StepLimit: number;
  UserInfo: { interests: Array<string>, feedName: string, feedCategory: Array<string>, about: string};
  Interests: string[] = ['News', 'Communications', 'Marketing', 'Data', 'Visualizations', 'Statistics', 'Design'];
  FeedCategories: string[] = ['Visuals1', 'News1'];

  constructor(public as: authService, private router: Router, private sb: SearchBarService) {
    this.User = this.as.emptyUser();
    this.User = this.as.getUser();
    this.activePage = this.as.getActivePageTitle();
    this.activeFeed = this.as.getActiveFeed();
    this.isSearchBarHidden = this.sb.searchBar;
    this.search$ = this.sb.search$;
    this.Step = 0;
    this.StepLimit = 0;
    this.UserInfo = {
      interests: [],
      feedName: '',
      feedCategory: [],
      about: ''
    };
  }

  ngOnInit() {
    $(".button-collapse")['sideNav']({
      menuWidth: 300,
      edge: 'right',
      closeOnClick: true
    });
    // $('#regflowModal')['closeModal']();
  }

  home() {
    console.log('home');
    this.router.navigate(['feeds']);
  }

  onSubmit(d) {
    if (d.valid) this.Step += 1
    if (this.Step > this.StepLimit) this.StepLimit = this.Step

    var t = window.setTimeout(() => {
      $('#interests')['material_select'](this.selectInterestsChange.bind(this))
      $('#feedCategory')['material_select'](this.selectFeedCategoryChange.bind(this))
      window.clearTimeout(t)
    }, 0)

    console.log(this.UserInfo)
  }

  selectInterestsChange() {
    this.UserInfo.interests = $('#interests').val();
  }

  selectFeedCategoryChange() {
    this.UserInfo.feedCategory = $('#feedCategory').val();
  }

  onDot(step) {
    if (step <= this.StepLimit) this.Step = step;

    var t = window.setTimeout(() => {
      $('#interests')['material_select'](this.selectInterestsChange.bind(this))
      $('#feedCategory')['material_select'](this.selectFeedCategoryChange.bind(this))
      window.clearTimeout(t)
    }, 0)
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
    $('#recoverModal').removeClass('hide');
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
    $('#regflowModal')['openModal']();
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
