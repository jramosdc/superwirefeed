// <reference path="../../../typings/tsd.d.ts">

import { Component, OnInit } from '@angular/core';
import { RouterLink, Router, RouteParams } from "@angular/router-deprecated";
import { User, authService } from '../services/authService';

@Component({
    selector: 'editpost',
    host: {
        class: 'col s12'
    },
    styleUrls: ['components/editpost/editpost.css'],
    templateUrl: 'components/editpost/editpost.html',
    directives: [RouterLink]
})
export class EditPostComponent implements OnInit {

    User: User = {
        password: {
            email: '',
            profileImageURL: ''
        },
        uid: '',
        feed: {
            id: '',
            name: '',
            userid: ''
        }
    }

    detail: string
    postid: string
    UserID: string
    postLoading: boolean

    constructor(private as: authService, private router: Router, private params: RouteParams) {
        this.User = this.as.getUser();
        this.as.setRoute('Edit Post', null);
        this.as.setActivePageTitle('Edit Post');
        this.postid = this.params.get('postid');
        if (this.postid) {
            this.as.loadPost(this.postid).subscribe((post) => {
                // this.post = post;
                $('#title').val(post.title);
                this.detail = post.detail;
                tinymce.activeEditor.setContent(post.detail);
                $('#priority').val(post.priority);
                $('#type').val(post.types);
                $('#categories').val(post.category);
                $('select').material_select();
                this.UserID = post.owner.userid;
            })
        }
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
                    console.log('tiny init');
                });
            }
        });
        console.log('ng init');
    }

    updatePost(title: HTMLInputElement, priority: HTMLSelectElement, type: HTMLSelectElement, category: HTMLSelectElement) {
		if (title.value == '' || this.detail == '' || priority.value == '' || $(type).val() == '') return
        this.postLoading = true;
        this.as.updatePost(this.postid, title.value, this.detail, priority.value, $(type).val(), category.value, (err) => {
            if (err) {
                console.log("Post Update Failed!", err);
                $('#errorPost').html(err);
                this.postLoading = false;
            } else {
                title.value = '';
                this.detail = '';
                priority.value = '';
                type.value = '';
                category.value = '';
                console.log('Post is Updated!');
                $('#errorPost').html('');
                this.postLoading = false;
                this.router.navigate(['/Posts', { feedid: this.User.feed.id }]);
            }
        });
    }

}
