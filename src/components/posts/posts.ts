import { Component, OnDestroy, Injector } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirebaseListObservable } from 'angularfire2';
import { User, authService } from '../services/authService';
import SearchBar from '../services/searchBar';


@Component({
  selector: 'posts',
  host: {
    class: 'col s12'
  },
  template: require('./posts.html')
})
export class PostsComponent implements OnDestroy {

  User: User;
  Domain: string
  FeedID: string
  search: string
  activeCategory: string;
  categories: Array<string> = [];
  deletePostID: string
  posts: FirebaseListObservable<any[]>
  emailLoading: Boolean = false

  constructor(public as: authService, public route: ActivatedRoute, private router: Router, private sb: SearchBar) {
    this.Domain = this.as.getDomain();
    this.User = this.as.emptyUser();
    this.User = this.as.getUser();
    this.route.params.subscribe(params => {
      this.FeedID = params['feedid'];
    });

  }

  ngOnInit() {
    this.as.getFeedNameByFeedID(this.FeedID).subscribe(feed => {
      this.as.setActivePageTitle(feed.feedName);
      this.categories.splice(0);
      this.categories.push('All');
      if (feed['postCategories']) {
        feed['postCategories'].forEach((val: string) => {
          this.categories.push(val);
        });
      }
      if (feed.private === 'true' && feed.owner.uid !== this.User.uid) {
        if (sessionStorage['email']) {
          this.checkEmail(sessionStorage['email']);
        } else {
          $('#emailModel')['openModal']({ dismissible: false });
        }
      } else {
        this.posts = this.as.loadPosts(this.FeedID);
        // search posts by title
        this.sb.search$.debounceTime(30).subscribe(term => {
          this.posts = <any>this.as.loadPosts(this.FeedID)
            .map(posts => {
              return posts.filter(post => {
                if (post && post.title) {
                  return post.title.toLowerCase().indexOf(term.toLowerCase()) != -1;
                } else { return false; }
              });
            });
        });
      }
    });
    // $('ul.tabs')['tabs']();
  }

  ngOnDestroy() {
    this.sb.search$.unsubscribe();
  }

  navigate(type: string, id: string) {
    if (type === 'new') {
      this.router.navigate(['newpost']);
      this.as.setActiveFeedID(this.FeedID);
    } else if (type === 'edit') {
      this.router.navigate(['editpost', id]);
      this.as.setActiveFeedID(this.FeedID);
    } else if (type === 'view') {
      this.router.navigate(['post', id]);
      this.as.setActiveFeedID(this.FeedID);
    }
  }

  checkEmail(email: string) {
    this.emailLoading = true;
    this.as.checkEmail(this.FeedID, email).subscribe(res => {
      if (res.length > 0) {
        this.posts = this.as.loadPosts(this.FeedID);
        sessionStorage['email'] = email;
        $('#emailModel')['closeModal']();
        $('#errorEmail').html('');
        this.emailLoading = false;
      } else {
        $('#errorEmail').html('Not a vaild Email!');
        this.emailLoading = false;
      }
    })

  }

  closeEmail() {
    $('#errorEmail').html('');
    $('#emailModel')['closeModal']();
    this.router.navigate(['/feeds']);
  }

  deleteModel(postid) {
    this.deletePostID = postid;
    $('#deleteModel')['openModal']();
  }

  deletePost() {
    this.as.deletePost(this.deletePostID).then(res => {
      console.log('Post Deleted!');
    });
  }

  voteUp(ev) {
    this.as.voteUp(this.FeedID);

    // for preview only
    $(ev.target)
      .toggleClass('active')
      .siblings('.mdi')
      .removeClass('active');
  }

  voteDown(ev) {
    this.as.voteDown(this.FeedID);

    // for preview only
    $(ev.target)
      .toggleClass('active')
      .siblings('.mdi')
      .removeClass('active');
  }

  returnMoment(timestamp) {
    if (timestamp) {
      return moment().to(timestamp);
    } else {
      return ''
    }
  }

  // temporary solution to parse description
  // and fill data structure
  parseImgUrl(htmlDesc: string) {
    let regex = /(https?:\/\/[^">]+)(jpg|png)/gi
    let imgs = htmlDesc.match(regex)
    return imgs && imgs[0]
  }
  parseShortDescription(htmlDesc: string) {
    let regex = /[^-=\>/"%_<:;&]{55,}/gi
    let descriptions = htmlDesc.match(regex)
    return descriptions && descriptions[0]
  }

}
