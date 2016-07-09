// <reference path="../../../typings/index.d.ts">

import { Component, OnInit } from '@angular/core';
import { ROUTER_DIRECTIVES, Router } from "@angular/router";
import { User, authService } from '../services/authService';

@Component({
    selector: 'newpost',
    host: {
        class: 'col s12'
    },
    styleUrls: ['components/newpost/newpost.css'],
    templateUrl: 'components/newpost/newpost.html',
    directives: [ROUTER_DIRECTIVES]
})
export class NewPostComponent implements OnInit {

    User: User;
    detail: string;
    postLoading: boolean;
    categories: Array<string> = [];
    
    constructor(private as: authService, private router: Router) {
        this.User = this.as.emptyUser();
        this.User = this.as.getUser();
        this.categories = this.as.getPostCategories();
        this.as.setActivePageTitle('New Post');
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
            }
        });
    }

    submitPost(title: HTMLInputElement, priority: HTMLSelectElement, type: HTMLSelectElement, category: HTMLSelectElement, pdfLink: HTMLInputElement, gsheetLink: HTMLInputElement) {
		if (title.value == '' || this.detail == '' || priority.value == '' || $(type).val() == '' ) return
        this.postLoading = true;
        let post = {
            title: title.value,
			detail: this.detail,
			priority: priority.value,
			types: $(type).val(),
            category: category.value,
            pdfLink: pdfLink.value ? pdfLink.value : '',
            gsheetLink: gsheetLink.value ? gsheetLink.value : '',
			owner: {
				uid: this.User.uid,
				userid: this.User.feed.userid,
				feedid: this.User.feed.id
			},
			timestamp: firebase.database.ServerValue.TIMESTAMP
        }
        this.as.submitPost(post).then(res => {
            title.value = '';
            this.detail = '';
            priority.value = '';
            type.value = '';
            category.value = '';
            pdfLink.value = '';
            gsheetLink.value = '';
            console.log('Post is Submitted!');
            $('#errorPost').html('');
            this.postLoading = false;
            this.router.navigate(['/Posts', this.User.feed.id]);
        }).catch(err => {
            console.log("Post Submit Failed!", err);
            $('#errorPost').html(err);
            this.postLoading = false;
        });
    }

}
