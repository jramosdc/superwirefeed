// <reference path="../../../typings/index.d.ts">
System.register(['@angular/core', '@angular/router', '../services/authService'], function(exports_1, context_1) {
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
    var EditPostComponent;
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
            EditPostComponent = (function () {
                function EditPostComponent(as, router, route) {
                    var _this = this;
                    this.as = as;
                    this.router = router;
                    this.route = route;
                    this.post = {};
                    this.categories = [];
                    this.User = this.as.emptyUser();
                    this.User = this.as.getUser();
                    this.categories = this.as.getPostCategories();
                    this.as.setActivePageTitle('Edit Post');
                    this.route.params.subscribe(function (params) {
                        _this.postid = params['postid'];
                        _this.as.loadPost(_this.postid).subscribe(function (post) {
                            _this.post = post;
                            _this.UserID = post.owner.userid;
                        });
                    });
                }
                EditPostComponent.prototype.ngOnInit = function () {
                    var _this = this;
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
                        setup: function (editor) {
                            editor.on('change', function (e) {
                                _this.post['detail'] = editor.getContent();
                            });
                            editor.on('init', function (e) {
                                // console.log('tiny init');
                                tinymce.activeEditor.setContent(_this.post['detail']);
                            });
                        }
                    });
                    // console.log('ng init');
                };
                EditPostComponent.prototype.updatePost = function (valid, editpost) {
                    var _this = this;
                    event.preventDefault();
                    if (!valid) {
                        return;
                    }
                    this.postLoading = true;
                    var post = {
                        title: editpost.title,
                        detail: editpost.detail,
                        priority: editpost.priority,
                        types: editpost.type,
                        category: editpost.category,
                        pdfLink: editpost.pdfLink ? editpost.pdfLink : '',
                        gsheetLink: editpost.gsheetLink ? editpost.gsheetLink : '',
                        timestamp: firebase.database.ServerValue.TIMESTAMP
                    };
                    this.as.updatePost(this.postid, post).then(function (res) {
                        console.log('Post is Updated!');
                        $('#errorPost').html('');
                        _this.postLoading = false;
                        _this.router.navigate(['/posts', _this.User.feed.id]);
                    }).catch(function (err) {
                        console.log('Post Update Failed!', err);
                        $('#errorPost').html(err);
                        _this.postLoading = false;
                    });
                };
                EditPostComponent = __decorate([
                    core_1.Component({
                        selector: 'editpost',
                        host: {
                            class: 'col s12'
                        },
                        styleUrls: ['components/editpost/editpost.css'],
                        templateUrl: 'components/editpost/editpost.html',
                        directives: [router_1.ROUTER_DIRECTIVES]
                    }), 
                    __metadata('design:paramtypes', [authService_1.authService, router_1.Router, router_1.ActivatedRoute])
                ], EditPostComponent);
                return EditPostComponent;
            }());
            exports_1("EditPostComponent", EditPostComponent);
        }
    }
});
