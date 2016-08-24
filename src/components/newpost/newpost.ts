// <reference path="../../../typings/index.d.ts">

import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { User, authService } from '../services/authService';
import { embedlyService, IEmbedly } from '../services/embedlyService';

@Component({
    selector: 'newpost',
    host: {
        class: 'col s12'
    },
    styleUrls: ['components/newpost/newpost.css'],
    templateUrl: 'components/newpost/newpost.html'
})
export class NewPostComponent implements OnInit {

    User: User;
    detail: string;
    postLoading: boolean;
    categories: Array<string> = [];

    constructor(private as: authService, private router: Router, private embedly: embedlyService) {
        this.User = this.as.emptyUser();
        this.User = this.as.getUser();
        this.categories = this.as.getPostCategories();
        this.as.setActivePageTitle('New Post');
    }

    ngOnInit() {
        // $('select').material_select();
        tinymce['remove']();
        tinymce['init']({
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

    submitPost(valid, newpost) {
        console.log('sdddddsdsdsdsdsdsdsdsd');
        event.preventDefault();
        if (!valid) { return; }
        this.postLoading = true;
        let post = {
            title: newpost.title,
            detail: newpost.detail,
            priority: newpost.priority,
            types: newpost.type,
            category: newpost.category,
            pdfLink: newpost.pdfLink ? newpost.pdfLink : '',
            gsheetLink: newpost.gsheetLink ? newpost.gsheetLink : '',
            mainUrl: newpost.mainUrl ? newpost.mainUrl : '',
            owner: {
                uid: this.User.uid,
                userid: this.User.feed.userid,
                feedid: this.User.feed.id
            },
            timestamp: firebase.database['ServerValue'].TIMESTAMP
        };

        this.embedly.extractAPI(newpost.mainUrl).then((data: IEmbedly) => {
            
            post['embedly'] = data;

            this.as.submitPost(post).then(res => {
                console.log('Post is Submitted!');
                $('#errorPost').html('');
                this.postLoading = false;
                this.router.navigate(['posts', this.User.feed.id]);
            }).catch(err => {
                console.log('Post Submit Failed!', err);
                $('#errorPost').html(err);
                this.postLoading = false;
            });

        });

    }

}
