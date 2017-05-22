import { RegFlow } from './../regflow/regflow';
import { Component, OnInit, ViewChild, trigger, transition, style, animate } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { User, authService } from '../services/authService';
import { SearchBarService } from '../services/searchBar';

declare var CryptoJS;

@Component({
  selector: 'navbar',
  host: {},
  template: require('./navbar.html'),
  animations: [
    trigger(
      'modalSlider', [
        transition(':enter', [
          style({ transform: 'translateX(100%)', opacity: 0, height: 0 }),
          animate('200ms', style({ transform: 'translateX(0)', opacity: 1 }))
        ]),
        transition(':leave', [
          style({ transform: 'translateX(0)', opacity: 1 }),
          animate('200ms', style({ transform: 'translateX(-100%)', opacity: 0, height: 0 }))
        ])
      ]
    ),
    trigger(
      'modalFader', [
        transition(':enter', [
          style({ opacity: 0 }),
          animate('200ms', style({ opacity: 1 }))
        ]),
        transition(':leave', [
          style({ opacity: 1 }),
          animate('200ms', style({ opacity: 0 }))
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
  regFlowLoading: boolean = false;
  regFlowError: boolean = false;
  search$;
  isSearchBarHidden: Object;
  Step: number;
  StepLimit: number;
  UserInfo: { interests: Array<string>, feedId: string, feedName: string, feedCategory: Array<string>, about: string, userName: string };
  Interests: string[] = ['Politics', 'Economy', 'Sports', 'Technology', 'Science', 'Design'];
  FeedCategories: string[] = ['News', 'Communications', 'Research', 'Data', 'Visualizations', 'Design', 'Misc'];

  constructor(public as: authService, private router: Router, private route: ActivatedRoute, private sb: SearchBarService) {
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
      feedId: '',
      feedName: '',
      feedCategory: [],
      about: '',
      userName: ''
    };
    this.route.queryParams.subscribe((params: Params) => {
      if (params['login']) this.loginModal();
      if (params['auth']) {
        let auth = params['auth'];
        console.log('auth', auth)
        let decrypted = CryptoJS.AES.decrypt(auth, 'Superwire');
        console.log('auth2', decrypted.toString(CryptoJS.enc.Utf8));
        localStorage.setItem('firebase:authUser:AIzaSyCAmbNu5u6Pqguv3jRLx9ElyhhnIyIZnEo:[DEFAULT]', decrypted.toString(CryptoJS.enc.Utf8));
      }
      if (params['reg']) {
        $('#regflowModal')['openModal']();
        console.log('useid', params['userid'])
        this.UserInfo.userName = params['userid'] ? params['userid'] : '';
      }
    })
  }

  ngOnInit() {
    $('.button-collapse')['sideNav']({
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

  selectInterestsChange() {
    this.UserInfo.interests = $('#interests').val();
  }

  selectFeedCategoryChange() {
    this.UserInfo.feedCategory = $('#feedCategory').val();
  }

  onSubmit(d) {
    if (d.valid) {
      if (this.Step == 4) {
        if (this.UserInfo.feedCategory.length > 0) this.Step += 1;
      } else if (this.Step == 1) {
        if (this.UserInfo.interests.length > 0) this.Step += 1;
      } else {
        this.Step += 1;
      }

    }
    if (this.Step > this.StepLimit) this.StepLimit = this.Step
    this.regflow();
  }

  onDot(step) {
    if (step <= this.StepLimit) this.Step = step;
    this.regflow();
  }

  regflow() {
    var t = window.setTimeout(() => {
      $('#interests')['material_select'](this.selectInterestsChange.bind(this))
      $('#feedCategory')['material_select'](this.selectFeedCategoryChange.bind(this))
      window.clearTimeout(t)
    }, 0);

    console.log(this.UserInfo);
    this.UserInfo.feedId = this.UserInfo.userName;
    if (this.UserInfo.feedName && this.UserInfo.feedCategory.length > 0 && this.UserInfo.interests.length > 0 && this.UserInfo.about) {
      this.regFlowLoading = true;
      let profile = {
        'feedId': this.UserInfo.feedId,
        'feedName': this.UserInfo.feedName,
        'bio': this.UserInfo.about,
        'private': 'false',
        'category': this.UserInfo.feedCategory,
        'interests': this.UserInfo.interests,
        'authEmail': [],
        'postCategories': [],
        'profileImageURL': 'http://www.freeiconspng.com/uploads/profile-icon-9.png',
        'backgroundImageURL': 'http://cdn.allwallpaper.in/wallpapers/2048x1152/13547/light-minimalistic-soft-shading-gradient-background-2048x1152-wallpaper.jpg',
        'useBackgroundImage': false
      };
      this.as.updateUserProfile(this.UserInfo.userName, profile)
        .then((res) => {
          let feed = {
            'feedName': this.UserInfo.feedName,
            'description': '',
            'private': 'false',
            'category': this.UserInfo.feedCategory,
            'authEmail': [],
            'postCategories': [],
            'timestamp': firebase.database['ServerValue'].TIMESTAMP,
            'useBackgroundImage': false,
            'owner': {
              'uid': this.User.uid,
              'userid': this.UserInfo.userName,
              'profileImageURL': 'http://www.freeiconspng.com/uploads/profile-icon-9.png',
              'backgroundImageURL': 'http://cdn.allwallpaper.in/wallpapers/2048x1152/13547/light-minimalistic-soft-shading-gradient-background-2048x1152-wallpaper.jpg'
            }
          };
          this.as.updateFeed(this.UserInfo.feedId, feed)
            .then((res) => {
              this.regFlowLoading = false;
              console.log('Profile and Feed Updated.');
            }).catch((err) => {
              console.log('Reg Flow Update Feed Failed!', err);
              this.regFlowError = true;
              $('#errorRegFlow').html(err.toString());
            });
        }).catch((err) => {
          console.log('Req Flow Update Profile Failed!', err);
          this.regFlowError = true;
          $('#errorRegFlow').html(err.toString());
        });
    }

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
    $('.button-collapse')['sideNav']('hide');
    // $('#regflowModal')['openModal']();
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
        this.as.createUserProfile(res.uid, user.name.trim().toLowerCase().split(' ').join(''), user.email.toLowerCase()).then(() => {
          console.log('Profile is Created!');
          console.log('User is Registered & Logged In!');
          $('#errorRegister').html('');
          $('#registerModal')['closeModal']();
          $('#regflowModal')['openModal']();
          this.UserInfo.userName = user.name.trim().toLowerCase().split(' ').join('');
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
