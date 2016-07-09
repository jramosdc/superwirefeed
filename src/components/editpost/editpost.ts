// <reference path="../../../typings/tsd.d.ts">

import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ROUTER_DIRECTIVES, Router, ActivatedRoute } from "@angular/router";
import { User, authService } from '../services/authService';

@Component({
    selector: 'editpost',
    host: {
        class: 'col s12'
    },
    styleUrls: ['components/editpost/editpost.css'],
    templateUrl: 'components/editpost/editpost.html',
    directives: [ROUTER_DIRECTIVES]
})
export class EditPostComponent implements OnInit, AfterViewInit {

    User: User;
    detail: string;
    postid: string;
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
                    this.detail = editor.getContent();
                });
                editor.on('init', (e) => {
                    // console.log('tiny init');
                });
            }
        });
        // console.log('ng init');
    }

    ngAfterViewInit() {
        if (this.postid) {
            this.as.loadPost(this.postid).subscribe((post) => {
                setTimeout( () => {
                    $('#title').val(post.title);
                    this.detail = post.detail;
                    tinymce.activeEditor.setContent(post.detail);
                    $('#priority').val(post.priority);
                    $('#type').val(post.types);
                    $('#categories').val(post.category);
                    $('#pdfLink').val(post.pdfLink);
                    $('#gsheetLink').val(post.gsheetLink);
                    $('select').material_select();
                    this.UserID = post.owner.userid;    
                });
            })
        }
    }

    updatePost(title: HTMLInputElement, priority: HTMLSelectElement, type: HTMLSelectElement, category: HTMLSelectElement, pdfLink: HTMLInputElement, gsheetLink: HTMLInputElement) {
		if (title.value == '' || this.detail == '' || priority.value == '' || $(type).val() == '') return
        this.postLoading = true;
        let post = {
            title: title.value,
			detail: this.detail,
			priority: priority.value,
			types: $(type).val(),
            category: category.value,
            pdfLink: pdfLink.value ? pdfLink.value : '',
            gsheetLink: gsheetLink.value ? gsheetLink.value : '',
			timestamp: firebase.database.ServerValue.TIMESTAMP
        }
        this.as.updatePost(this.postid, post).then(res => {
            title.value = '';
            this.detail = '';
            priority.value = '';
            type.value = '';
            category.value = '';
            pdfLink.value = '';
            gsheetLink.value = '';
            console.log('Post is Updated!');
            $('#errorPost').html('');
            this.postLoading = false;
            this.router.navigate(['/posts', this.User.feed.id]);
        }).catch(err => {
            console.log("Post Update Failed!", err);
            $('#errorPost').html(err);
            this.postLoading = false;
        });
    }

}
