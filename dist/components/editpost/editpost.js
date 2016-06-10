// <reference path="../../../typings/tsd.d.ts">
System.register(['@angular/core', "@angular/router-deprecated", '../services/authService'], function(exports_1, context_1) {
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
    var core_1, router_deprecated_1, authService_1;
    var EditPostComponent;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (router_deprecated_1_1) {
                router_deprecated_1 = router_deprecated_1_1;
            },
            function (authService_1_1) {
                authService_1 = authService_1_1;
            }],
        execute: function() {
            EditPostComponent = (function () {
                function EditPostComponent(as, router, params) {
                    var _this = this;
                    this.as = as;
                    this.router = router;
                    this.params = params;
                    this.User = {
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
                    };
                    this.User = this.as.getUser();
                    this.as.setRoute('Edit Post', null);
                    this.as.setActivePageTitle('Edit Post');
                    this.postid = this.params.get('postid');
                    if (this.postid) {
                        this.as.loadPost(this.postid).subscribe(function (post) {
                            // this.post = post;
                            $('#title').val(post.title);
                            _this.detail = post.detail;
                            tinymce.activeEditor.setContent(post.detail);
                            $('#priority').val(post.priority);
                            $('#type').val(post.types);
                            $('#categories').val(post.category);
                            $('select').material_select();
                            _this.UserID = post.owner.userid;
                        });
                    }
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
                                _this.detail = editor.getContent();
                            });
                            editor.on('init', function (e) {
                                console.log('tiny init');
                            });
                        }
                    });
                    console.log('ng init');
                };
                EditPostComponent.prototype.updatePost = function (title, priority, type, category) {
                    var _this = this;
                    if (title.value == '' || this.detail == '' || priority.value == '' || $(type).val() == '')
                        return;
                    this.postLoading = true;
                    this.as.updatePost(this.postid, title.value, this.detail, priority.value, $(type).val(), category.value, function (err) {
                        if (err) {
                            console.log("Post Update Failed!", err);
                            $('#errorPost').html(err);
                            _this.postLoading = false;
                        }
                        else {
                            title.value = '';
                            _this.detail = '';
                            priority.value = '';
                            type.value = '';
                            category.value = '';
                            console.log('Post is Updated!');
                            $('#errorPost').html('');
                            _this.postLoading = false;
                            _this.router.navigate(['/Posts', { feedid: _this.User.feed.id }]);
                        }
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
                        directives: [router_deprecated_1.RouterLink]
                    }), 
                    __metadata('design:paramtypes', [authService_1.authService, router_deprecated_1.Router, router_deprecated_1.RouteParams])
                ], EditPostComponent);
                return EditPostComponent;
            }());
            exports_1("EditPostComponent", EditPostComponent);
        }
    }
});
