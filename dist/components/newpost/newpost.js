// <reference path="../../../typings/index.d.ts">
System.register(['@angular/core', "@angular/router", '../services/authService'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var core_1, router_1, authService_1;
    var NewPostComponent;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (router_1_1) {
                router_1 = router_1_1;
            },
            function (authService_1_1) {
                authService_1 = authService_1_1;
            }],
        execute: function() {
            NewPostComponent = (function () {
                function NewPostComponent(as, router) {
                    this.as = as;
                    this.router = router;
                    this.categories = [];
                    this.User = this.as.emptyUser();
                    this.User = this.as.getUser();
                    this.categories = this.as.getPostCategories();
                    this.as.setActivePageTitle('New Post');
                }
                NewPostComponent.prototype.ngOnInit = function () {
                    var _this = this;
                    // $('select').material_select();
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
                        setup: function (editor) {
                            editor.on('change', function (e) {
                                _this.detail = editor.getContent();
                            });
                        }
                    });
                };
                NewPostComponent.prototype.submitPost = function (valid, newpost) {
                    var _this = this;
                    event.preventDefault();
                    if (!valid) {
                        return;
                    }
                    this.postLoading = true;
                    var post = {
                        title: newpost.title,
                        detail: newpost.detail,
                        priority: newpost.priority,
                        types: newpost.type,
                        category: newpost.category,
                        pdfLink: newpost.pdfLink ? newpost.pdfLink : '',
                        gsheetLink: newpost.gsheetLink ? newpost.gsheetLink : '',
                        owner: {
                            uid: this.User.uid,
                            userid: this.User.feed.userid,
                            feedid: this.User.feed.id
                        },
                        timestamp: firebase.database.ServerValue.TIMESTAMP
                    };
                    this.as.submitPost(post).then(function (res) {
                        console.log('Post is Submitted!');
                        $('#errorPost').html('');
                        _this.postLoading = false;
                        _this.router.navigate(['posts', _this.User.feed.id]);
                    }).catch(function (err) {
                        console.log('Post Submit Failed!', err);
                        $('#errorPost').html(err);
                        _this.postLoading = false;
                    });
                };
                NewPostComponent = __decorate([
                    core_1.Component({
                        selector: 'newpost',
                        host: {
                            class: 'col s12'
                        },
                        styleUrls: ['components/newpost/newpost.css'],
                        templateUrl: 'components/newpost/newpost.html',
                        directives: [router_1.ROUTER_DIRECTIVES]
                    }), 
                    __metadata('design:paramtypes', [authService_1.authService, router_1.Router])
                ], NewPostComponent);
                return NewPostComponent;
            }());
            exports_1("NewPostComponent", NewPostComponent);
        }
    }
});
