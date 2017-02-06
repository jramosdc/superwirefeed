import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { Component } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { FirebaseObjectObservable } from 'angularfire2';
import { User, authService } from '../services/authService';
import { httpService } from '../services/httpService';
import { SearchBarService } from '../services/searchBar';

declare var StripeCheckout: any;

@Component({
  selector: 'view-post',
  host: {},
  template: require('./viewpost.html')
})
export class ViewPostComponent {
  User: User;
  postid: string;
  Domain: string;
  post: FirebaseObjectObservable<{}>;
  activeCategory: string;
  categories: Array<string>;
  stripeHandler: any;
  stripeTokenId: string;
  previewUrl: string;
  previewType: string;

  constructor(private as: authService, private router: Router, private route: ActivatedRoute, sanitizer: DomSanitizer, private http: httpService, private sb: SearchBarService) {
    this.User = this.as.emptyUser();
    this.User = this.as.getUser();
    this.Domain = this.as.getDomain();
    this.as.setActivePageTitle('View Post');
    this.categories = this.as.getCategories();
    this.route.params.subscribe(params => {
      this.postid = params['postid'];
      console.log('this.postid', this.postid);
      if (this.postid) {
        this.as.loadPost(this.postid).subscribe((post) => {
          this.post = post;
          // this.post['purl'] = post.pdfLink ? sanitizer.bypassSecurityTrustResourceUrl((post.pdfLink).replace('http:', '')) : post.pdfLink;
          // this.post['gurl'] = sanitizer.bypassSecurityTrustResourceUrl(post.gsheetLink);
          setTimeout(() => {
            $('.linkify')['linkify']();
            $('.collapsible')['collapsible']({ accordion: false });
            $("img").addClass("responsive-img");
            if (this.post['detail']) { $('#postDetails').html(this.post['detail']); }
            if (this.post['csvToJson']) {
              this.openInPreview('content', post['csvToJson']);
            }
          });
        });
        this.sb.setHiddenSearchBar(true);

        this.initializeStripeModal();
      }
    });
  }

  initializeStripeModal() {
    this.stripeHandler = StripeCheckout.configure({
      key: 'pk_test_YRZWal2Y7LLhtMfQsAV0HKa9',
      image: 'https://s3.amazonaws.com/stripe-uploads/acct_16lS7BHW1tZsRCeemerchant-icon-1481257880232-logo-white.png',
      locale: 'auto',
      token: (token, args) => {
        this.stripeTokenId = token.id;
        console.log('token-----: ', this.stripeTokenId)
        this.agreementModelPopup();
        // You can access the token ID with `token.id`.
        // Get the token ID to your server-side code for use.
      }
    });

    // Close Checkout on page navigation:
    window.addEventListener('popstate', () => {
      this.stripeHandler.close();
    });
  }

  openInPreview (type, url) {
    this.previewType = type

    if (type === 'url') {
      this.previewUrl = url
    } else if (type === 'content') {
      // this.displayTable(this.post['csvToJson']);
    }
  }

  onStripeBtnClick() {
    // Open Checkout with further options:
    event.preventDefault();
    this.stripeHandler.open({
      name: 'Superwire, Inc.',
      description: 'Buy a Post',
      amount: 100,
      currency: 'usd',
      address: false,
    });
    // this.stripeHandler.open({
    //     key: 'pk_test_YRZWal2Y7LLhtMfQsAV0HKa9',
    //     address: false,
    //     amount: 100, /* expects an integer */
    //     currency: 'usd',
    //     name: 'Purchase',
    //     description: 'Description',
    //     panelLabel: 'Checkout',
    //     // token: (token) => {
    //     //     console.log('token: ', token)
    //     // }
    // });
  }

  returnMoment(timestamp) {
    if (timestamp) {
      return moment(timestamp).format('DD MMM');
    } else {
      return '';
    }
  }
  wordsCount(description){
    if(description){
      let wordsCount = description.replace(/(<([^>]+)>)/gi, "").trim().split(/\s+/).length;  //Regex to remove html tags and count number of words
      let timeInMin = Math.ceil(1/60 * (60/200 * wordsCount));
      return timeInMin + ' mins read';
    }else {
      return '';
    }
  }
  parsePostDetail(description : string){
    let htmlRegex = /(<([^>]+)>)/gi;    //Regex to remove html tags
    return description.replace(htmlRegex, "");
  }

  displayTable(dataJSON) {
    let data = dataJSON;
    let tableDiv = document.getElementById("fullTable");
    let tbl = document.createElement("table");
    let tblHead = document.createElement("thead");
    let tblBody = document.createElement("tbody");
    // var Headerrow = document.createElement("tr");
    // for (var heading in data[0]) {
    //   console.log('heading', heading)
    //   var cell = document.createElement("td");
    //   var cellText = document.createTextNode(heading);
    //   cell.appendChild(cellText);
    //   Headerrow.appendChild(cell);
    // }
    // tblBody.appendChild(Headerrow);
    for (let j = 0; j < data.length; j++) {
      let row = document.createElement('tr');
      for (let obj in data[j]) {
        let cell = document.createElement('td');
        let cellText = document.createTextNode(data[j][obj]);
        cell.appendChild(cellText);
        row.appendChild(cell);
      }
      tblBody.appendChild(row);
      tblBody.appendChild(row);
    }

    tbl.appendChild(tblBody);
    tableDiv.appendChild(tbl);
    setTimeout(() => {
      tbl.setAttribute("class", "striped highlight centered responsive-table");
    }, 1000)
  }

  agreementModelPopup() {
    $('#agreementModal')['openModal']();
  }

  agreementModelClose() {
    $('#agreementModal')['closeModal']();
  }

  onAgreement() {
    console.log('i agree!')
    this.agreementModelClose();
    this.as.ccCharge(100, this.stripeTokenId)
      .then(data => {
        console.log('on success; ', data)
      })
      .catch(err => {
        console.log('on err; ', err)
      });
  }
  navigate(postid: string){
    console.log('postid', postid);
    this.router.navigate(['editpost', postid]);
    // this.as.setActiveFeedID(this.FeedID);
  }

}

// Papa.parse('https://docs.google.com/spreadsheets/d/1se-tAna5Nlei8K7weGc-A9jDafoV8DLQP-sqd7Iq0Ns/pubhtml?gid=74699649&single=true', {
//   download: true,
//   delimiter: ",",
//   skipemptylines: true,
//   header: false,
//   complete: function(results, file){
//     console.log('data finsingh: ', results, file);
//   }
// })