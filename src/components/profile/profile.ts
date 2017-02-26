import { Component, OnInit, ViewChild, Type } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { User, authService, FirebaseListObservable } from '../services/authService';
import { ImageCropperComponent, Bounds, CropperSettings } from 'ng2-img-cropper';
import { SearchBarService } from '../services/searchBar';

@Component({
  selector: 'profile',
  host: {
    class: 'col s12'
  },
  template: require('./profile.html')
})
export class ProfileComponent extends Type implements OnInit {

  User: User;
  domain: string;
  userid: string;
  editMode: boolean = false;
  profileLoading: boolean = false;
  profile: Object;
  deleteLoading: boolean;
  authList: Array<string> = [];
  authNew: Array<string> = [];
  postCategoryList: Array<string> = [];
  postCategoryNew: Array<string> = [];
  following: any[] = [];
  followers: any[] = [];
  posts: FirebaseListObservable<any[]>;
  categories: Array<string>;

  // Cropper variables
  profileImgData: any = {};
  backgroundImgData: any = {};
  cropperSettings_round: CropperSettings;
  cropperSettings_rectangle: CropperSettings;
  imageSelected: boolean = true;
  imageUploading: boolean = false;

  @ViewChild('profileCropper', undefined) profileCropper: ImageCropperComponent;
  @ViewChild('bgCropper', undefined) bgCropper: ImageCropperComponent;

  public validEmailPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  constructor(private as: authService, private route: ActivatedRoute, private router: Router, private sb: SearchBarService) {

    super();

    this.User = this.as.emptyUser();
    this.User = this.as.getUser();
    this.as.setActivePageTitle('Profile');
    this.domain = this.as.getDomain();
    this.categories = this.as.getCategories();
    this.route.params.subscribe(params => {
      this.userid = params['userid'];
      if (this.userid) {
        this.as.getFollowers(this.userid).subscribe((followers) => this.followers = followers);
        this.as.getFollowing(this.userid).subscribe((following) => this.following = following);
        this.as.getUserProfile(this.userid).subscribe((profile) => {
          this.profile = profile;
          this.posts = this.as.loadPosts(this.profile['feedId']);   // geting posts for item published
          if (profile['backgroundImageURL']) {
            setTimeout(() => {
              $('#bgImage').attr("style", 'width: 100%; height: 200px; background: url("' + profile['backgroundImageURL'] + '") center center no-repeat; background-size: cover;');
            }, 100);
          }
        });
      }
    });

    // for angular2 Corpper (round)
    this.cropperSettings_round = new CropperSettings();
    this.cropperSettings_round.width = 200;
    this.cropperSettings_round.height = 200;
    this.cropperSettings_round.keepAspect = false;
    this.cropperSettings_round.croppedWidth = 200;
    this.cropperSettings_round.croppedHeight = 200;
    this.cropperSettings_round.canvasWidth = 400;
    this.cropperSettings_round.canvasHeight = 200;
    this.cropperSettings_round.minWidth = 100;
    this.cropperSettings_round.minHeight = 100;
    this.cropperSettings_round.rounded = true;
    this.cropperSettings_round.minWithRelativeToResolution = false;
    this.cropperSettings_round.cropperDrawSettings.strokeColor = 'rgba(255,255,255,1)';
    this.cropperSettings_round.cropperDrawSettings.strokeWidth = 1;
    this.cropperSettings_round.noFileInput = true;

    // for angular2 Corpper (rectangle)
    this.cropperSettings_rectangle = new CropperSettings();
    this.cropperSettings_rectangle.width = 400;
    this.cropperSettings_rectangle.height = 200;
    this.cropperSettings_rectangle.keepAspect = false;
    this.cropperSettings_rectangle.croppedWidth = 400;
    this.cropperSettings_rectangle.croppedHeight = 200;
    this.cropperSettings_rectangle.canvasWidth = 400;
    this.cropperSettings_rectangle.canvasHeight = 200;
    this.cropperSettings_rectangle.minWidth = 200;
    this.cropperSettings_rectangle.minHeight = 100;
    this.cropperSettings_rectangle.rounded = false;
    this.cropperSettings_rectangle.minWithRelativeToResolution = false;
    this.cropperSettings_rectangle.cropperDrawSettings.strokeColor = 'rgba(255,255,255,1)';
    this.cropperSettings_rectangle.cropperDrawSettings.strokeWidth = 1;
    this.cropperSettings_rectangle.noFileInput = true;

    this.sb.setHiddenSearchBar(true);

  }

  ngOnInit() {
    $(window).scroll(function () {
      let space = $(window).innerHeight() - $('.fab')['offsetTop'] + $('.fab')['offsetHeight'];
      if (space < 200) {
        $('.fab').css('margin-bottom', '150px');
      }
    });
  }

  edit() {
    this.editMode = true;
    setTimeout(() => {
      $('#useBG').prop('checked', this.profile['useBackgroundImage']);
      $('#bio').val(this.profile['bio']);
      $('#feedId').val(this.profile['feedId']);
      $('#feedName').val(this.profile['feedName']);
      $('#description').val(this.profile['description']);
      if (this.profile['private'] === 'true') {
        $('#pyes').prop('checked', true);
      } else {
        $('#pno').prop('checked', true);
      }
      $('#category').val(this.profile['category']);
      $('select')['material_select']();
      if (this.profile['authEmail']) {
        this.profile['authEmail'].forEach(val => {
          this.authList.push(val);
        });
      }
      if (this.profile['postCategories']) {
        this.profile['postCategories'].forEach(val => {
          this.postCategoryList.push(val);
        });
      }
    });
  }

  update(bio: HTMLSelectElement, feedId: HTMLSelectElement, feedName: HTMLSelectElement, description: HTMLSelectElement, pyes: HTMLInputElement, pno: HTMLInputElement, category: HTMLSelectElement, useBG: HTMLInputElement) {
    if (bio.value === '' || feedId.value === '' || feedName.value === '' || description.value === '' || category.value === '') return
    this.profileLoading = true;
    // $.merge(this.authList, this.authNew)
    this.authNew.splice(0);
    // $.merge(this.postCategoryList, this.postCategoryNew)
    this.postCategoryNew.splice(0);
    let profile = {
      'bio': bio.value,
      'feedId': feedId.value.toLowerCase(),
      'feedName': feedName.value,
      'description': description.value,
      'private': $(pyes).prop('checked') ? 'true' : 'false',
      'category': category.value,
      'authEmail': this.authList,
      'postCategories': this.postCategoryList,
      'profileImageURL': this.User.password.profileImageURL ? this.User.password.profileImageURL : "http://www.freeiconspng.com/uploads/profile-icon-9.png",
      'backgroundImageURL': this.User.backgroundImageURL ? this.User.backgroundImageURL : 'http://cdn.allwallpaper.in/wallpapers/2048x1152/13547/light-minimalistic-soft-shading-gradient-background-2048x1152-wallpaper.jpg',
      'useBackgroundImage': useBG.checked
    };
    this.as.updateUserProfile(this.userid, profile)
      .then((res) => {
        let feed = {
          'feedName': feedName.value,
          'description': description.value,
          'private': $(pyes).prop('checked') ? 'true' : 'false',
          'category': category.value,
          'authEmail': this.authList,
          'postCategories': this.postCategoryList,
          'timestamp': firebase.database['ServerValue'].TIMESTAMP,
          'useBackgroundImage': useBG.checked,
          'owner': {
            'uid': this.User.uid,
            'userid': this.userid,
            'profileImageURL': this.User.password.profileImageURL ? this.User.password.profileImageURL : 'http://www.freeiconspng.com/uploads/profile-icon-9.png',
            'backgroundImageURL': this.User.backgroundImageURL ? this.User.backgroundImageURL : 'http://cdn.allwallpaper.in/wallpapers/2048x1152/13547/light-minimalistic-soft-shading-gradient-background-2048x1152-wallpaper.jpg'
          }
        }
        this.as.updateFeed(feedId.value.toLowerCase(), feed)
          .then((res) => {
            this.editMode = false;
            this.profileLoading = false;
            $('#errorProfile').html('');
            this.authList.splice(0);
            this.postCategoryList.splice(0);
            console.log('Profile and Feed Updated.');
          }).catch((err) => {
            console.log('Feed Update Failed!', err);
            $('#errorProfile').html(err.toString());
          })
      }).catch((err) => {
        console.log('Profile Update Failed!', err);
        $('#errorProfile').html(err.toString());
      });
  }

  confirmDelete() {
    $('#confirmDeleteModel')['openModal']();
  }

  delete(answer: string) {
    this.deleteLoading = true;
    if (answer === 'yes') {
      this.as.deleteAll(this.profile['feedId'], this.userid, this.User.uid).then(res => {
        console.log('User, Profile and Feed Deleted!')
        $('#errorDelete').html('');
        $('#confirmDeleteModel')['closeModal']();
        this.deleteLoading = false;
        this.router.navigate(['/feeds']);
      }).catch(err => {
        console.log('Delete All Failed: ', err);
        $('#errorDelete').html(err);
        this.deleteLoading = false;
      })
    } else {
      $('#errorDelete').html('');
      $('#confirmDeleteModel')['closeModal']();
      this.deleteLoading = false;
    }
  }

  addAuthEmail(email: HTMLInputElement) {
    this.authNew.push(email.value);
    email.value = '';
  }

  addPostCategory(postCategory: HTMLInputElement) {
    if (postCategory.value === '') return
    if ((this.postCategoryList.length + this.postCategoryNew.length) < 4) {
      this.postCategoryNew.push(postCategory.value);
      postCategory.value = '';
    } else {
      $('#errorPostCategory').html('Not Allow more then four!');
    }
  }

  removePostCategory(type: string, category: string) {
    if (type === 'new') {
      this.postCategoryNew = $.grep(this.postCategoryNew, val => {
        return val != category;
      })
    } else if (type === 'list') {
      this.postCategoryList = $.grep(this.postCategoryList, val => {
        return val != category;
      })
    }
  }

  profileModelOpen() {
    $('#profileModal')['openModal']();
  }

  profileModelClose() {
    $('#profileModal')['closeModal']();
    this.imageSelected = true;
    this.profileImgData = {};
  }

  uploadProfileImage() {
    this.imageUploading = true;
    this.as.uploadUserImg(this.User.feed.userid, this.profileImgData.image).then((url) => {
      this.as.updateUserProfile(this.User.feed.userid, { profileImageURL: url }).then((data) => {
        this.as.updateFeed(this.User.feed.id + '/owner', { profileImageURL: url }).then((d) => {
          this.imageUploading = false;
          this.profileModelClose();
        });
      });
    });
  }

  cropped(bounds: Bounds) {
    console.log(bounds);
  }

  /**
   * Used to send image to second cropper @param $event
  */
  profileChangeListener($event) {
    let image: any = new Image();
    let file: File = $event.target.files[0];
    let myReader: FileReader = new FileReader();

    myReader.onloadend = (loadEvent: any) => {
      image.src = loadEvent.target.result;
      this.profileCropper.setImage(image);
      //data2 image on select image
      this.profileImgData.image = loadEvent.target.result
    };
    myReader.readAsDataURL(file);
  }

  backgroundChangeListener($event) {
    console.log($event)
    let image: any = new Image();
    let file: File = $event.target.files[0];
    let myReader: FileReader = new FileReader();

    myReader.onloadend = (loadEvent: any) => {
      image.src = loadEvent.target.result;
      this.bgCropper.setImage(image);
      //data2 image on select image
      this.backgroundImgData.image = loadEvent.target.result
    };
    myReader.readAsDataURL(file);
  }

  tagInputEventCatch($event) {
    this.postCategoryList = $event;
  }

  emailInputEventCatch($event) {
    this.authList = $event;
  }

  backgroundImagePopup() {
    $('#backgroundModal')['openModal']();
    //  $('#bgInputFile').click();
  }

  backgroundModelClose() {
    $('#backgroundModal')['closeModal']();
    this.imageSelected = true;
    this.backgroundImgData = {};
  }

  uploadBackgroundImage() {
    this.imageUploading = true;
    this.as.uploadUserImg('bg-' + this.User.feed.userid, this.backgroundImgData.image).then((url) => {
      this.as.updateUserProfile(this.User.feed.userid, { backgroundImageURL: url }).then((data) => {
        this.as.updateFeed(this.User.feed.id + '/owner', { backgroundImageURL: url }).then((d) => {
          this.imageUploading = false;
          this.backgroundModelClose();
        });
      });
    });
  }

  followingSys() {
    let me = this.User.feed.userid;
    let userFollowingObj = {}
    userFollowingObj[this.userid] = this.profile['feedId'];
    // userFollowing[this.User.feed.userid] = { }
    // userFollowing[this.User.feed.userid][this.userid] = this.userid;

    let followerId = this.userid;
    let userFollowerObj = {}
    userFollowerObj[this.User.feed.userid] = this.User.feed.id;
    // userFollower[this.userid] = { }
    // userFollower[this.userid][this.User.feed.userid] = this.User.feed.userid

    this.as.toggleFollowSystem(me, userFollowingObj, followerId, userFollowerObj);
  }

  followerModelPopup() {
    $('#followersModal')['openModal']();
  }

  followerModelClose() {
    $('#followersModal')['closeModal']();
  }

  followingModelPopup() {
    $('#followingModal')['openModal']();
  }

  followingModelClose() {
    $('#followingModal')['closeModal']();
  }


}
