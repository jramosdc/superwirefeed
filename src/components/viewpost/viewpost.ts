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
  post: Object;
  activeCategory: string;
  categories: Array<string>;
  stripeHandler: any;
  stripeTokenId: string;
  previewUrl: string;
  previewType: string;
  postPayment: boolean = false;
  userAsset: boolean = false;
  filesDownloaidng: boolean = false;

  constructor(private as: authService, private router: Router, private route: ActivatedRoute, sanitizer: DomSanitizer, private http: httpService, private sb: SearchBarService) {
    this.User = this.as.emptyUser();
    this.User = this.as.getUser();
    this.Domain = this.as.getDomain();
    this.as.setActivePageTitle('View Post');
    this.categories = this.as.getCategories();
    this.route.params.subscribe(params => {
      this.postid = params['postid'];
      if (this.postid) {
        this.as.loadPost(this.postid).subscribe((post) => {
          this.post = post;
          // this.post['purl'] = post.pdfLink ? 
            // sanitizer.bypassSecurityTrustResourceUrl((post.pdfLink).replace('http:', '')) : post.pdfLink;
          // this.post['gurl'] = sanitizer.bypassSecurityTrustResourceUrl(post.gsheetLink);
          setTimeout(() => {
            // $('.linkify')['linkify']();
            $('.collapsible')['collapsible']({ accordion: false });
            $('img').addClass('responsive-img');
            if (this.post['detail']) { $('#postDetails').html(this.post['detail']); }
            console.log(this.userAsset);
            console.log(this.post['csvToJson']);
            if ((this.post['license'] == 1 || this.post['license'] == 2 || this.userAsset) && this.post['csvToJson']) {
              this.openInPreview('content', post['csvToJson']);
            }
          });
        });
        this.sb.setHiddenSearchBar(true);
        this.initializeStripeModal();
      }
      this.as.user$.subscribe(user => {
        if (user.uid) {
          this.as.getUserAsset(user.uid, this.postid).subscribe((data) => {
            if (data.$value) {
              this.userAsset = data.$value;
              if (this.post['csvToJson']) {
                setTimeout(() => {
                  this.openInPreview('content', this.post['csvToJson']);
                });
              }
            }
          });
        }
      });
      /*if(this.User){

      }*/
    });
  }

  initializeStripeModal() {
    this.stripeHandler = StripeCheckout.configure({
      key: 'pk_test_YRZWal2Y7LLhtMfQsAV0HKa9',
      image: 'https://s3.amazonaws.com/stripe-uploads/acct_16lS7BHW1tZsRCeemerchant-icon-1481257880232-logo-white.png',
      locale: 'auto',
      token: (token, args) => {
        console.log('token', token);
        this.stripeTokenId = token.id;
        console.log('token-----: ', this.stripeTokenId);
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

  openInPreview(type, url) {
    this.previewType = type;
    console.log('type', type);
    if (type === 'url') {
      this.previewUrl = url
    } else if (type === 'content') {
      this.displayTable(this.post['csvToJson']);
    }
  }

  onStripeBtnClick() {
    console.log('onStripeBtnClick');
    // Open Checkout with further options:
    let amount = this.post['license'] === "3" ? 35 * 100 : this.post['license'] === "4" ? 200 * 100 : 0;
    event.preventDefault();
    this.stripeHandler.open({
      name: 'Superwire, Inc.',
      description: 'Buy a Post',
      amount: amount,
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
    console.log(dataJSON);
    let data = dataJSON;
    let tableDiv = document.getElementById("fullTable");
    let tbl = document.createElement("table");
    let tblHead = document.createElement("thead");
    let tblBody = document.createElement("tbody");
    /*var Headerrow = document.createElement("tr");
    for (var heading in data[0]) {
      console.log('heading', heading)
      var cell = document.createElement("td");
      var cellText = document.createTextNode(heading);
      cell.appendChild(cellText);
      Headerrow.appendChild(cell);
    }
    tblBody.appendChild(Headerrow);*/
    for (let j = 0; j < data.length-1; j++) {
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
    }, 1000);
  }

  agreementModelPopup() {
    $('#agreementModal')['openModal']();
  }

  agreementModelClose() {
    $('#agreementModal')['closeModal']();
  }

  onAgreement() {
    // this.agreementModelClose();
    this.postPayment = true;
    this.as.ccCharge(100, this.stripeTokenId)
      .then(data => {
        console.log('on success; ', data);
        this.as.buyPost(this.User.uid, this.postid)
            .then(res => {
              this.postPayment = false;
              this.agreementModelClose();
              console.log('Data Saved');
            })
            .catch(err => {
              console.log('err', err);
            })
      })
      .catch(err => {
        console.log('on err; ', err)
      });
  }
  navigate(postid: string){
    this.router.navigate(['editpost', postid]);
    // this.as.setActiveFeedID(this.FeedID);
  }

  download(post: Object) {
    this.filesDownloaidng = true;
    this.as.download(post)
      .then(res => {
        console.log('data', res);
        if (res['success']) {
          this.as.getFile(res['data']);
          this.filesDownloaidng = false;
        }
      });
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