// <reference path="../../../typings/index.d.ts">

import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { User, authService } from '../services/authService';

@Component({
  selector: 'editpost',
  host: {
    class: 'col s12'
  },
  styleUrls: ['components/editpost/editpost.css'],
  templateUrl: 'components/editpost/editpost.html'
})
export class EditPostComponent implements OnInit {

  User: User;
  postid: string;
  post: Object = {};
  UserID: string;
  postLoading: boolean;
  categories: Array<string> = [];

  constructor(private as: authService, private router: Router, private route: ActivatedRoute) {
    this.User = this.as.emptyUser();
    this.User = this.as.getUser();
    this.categories = this.as.getPostCategories();
    this.as.setActivePageTitle('Edit Post');
    this.route.params.subscribe(params => {
      this.postid = params['postid'];
      this.as.loadPost(this.postid).subscribe(post => {
        this.post = post;
        this.UserID = post.owner.userid;
      });
    });
  }

  ngOnInit() {
    $('select').material_select();
    tinymce.remove();
    tinymce.init({
      selector: '#editor',
      height: 200,
      plugins: [
        'advlist autolink lists link image charmap print preview anchor',
        'searchreplace visualblocks code fullscreen',
        'insertdatetime media table contextmenu paste code'
      ],
      toolbar: 'insertfile undo redo | bold | bullist | link image',
      setup: (editor) => {
        editor.on('change', (e) => {
          this.post['detail'] = editor.getContent();
        });
        editor.on('init', (e) => {
          // console.log('tiny init');
          tinymce.activeEditor.setContent(this.post['detail']);
        });
      }
    });
    // console.log('ng init');
  }

  updatePost(valid, editpost) {
    event.preventDefault();
    if (!valid) { return; }
    this.postLoading = true;
    let post = {
      title: editpost.title,
      detail: editpost.detail,
      priority: editpost.priority,
      types: editpost.type,
      category: editpost.category,
      pdfLink: editpost.pdfLink ? editpost.pdfLink : '',
      gsheetLink: editpost.gsheetLink ? editpost.gsheetLink : '',
      timestamp: firebase.database.ServerValue.TIMESTAMP
    }
    this.as.updatePost(this.postid, post).then(res => {
      console.log('Post is Updated!');
      $('#errorPost').html('');
      this.postLoading = false;
      this.router.navigate(['/posts', this.User.feed.id]);
    }).catch(err => {
      console.log('Post Update Failed!', err);
      $('#errorPost').html(err);
      this.postLoading = false;
    });
  }

}
