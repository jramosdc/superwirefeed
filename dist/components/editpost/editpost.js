// <reference path="../../../typings/index.d.ts">
System.register(['@angular/core', '@angular/router', '../services/authService', '../services/embedlyService', '../services/firebaseStorageService'], function(exports_1, context_1) {
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
    var core_1, router_1, authService_1, embedlyService_1, firebaseStorageService_1;
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
            },
            function (embedlyService_1_1) {
                embedlyService_1 = embedlyService_1_1;
            },
            function (firebaseStorageService_1_1) {
                firebaseStorageService_1 = firebaseStorageService_1_1;
            }],
        execute: function() {
            EditPostComponent = (function () {
                function EditPostComponent(as, router, route, embedly, storge) {
                    this.as = as;
                    this.router = router;
                    this.route = route;
                    this.embedly = embedly;
                    this.storge = storge;
                    this.post = {};
                    this.categories = [];
                    this.csvFile = null;
                    this.postObjReady = { embedlyApi: false, uploadFile: false };
                    this.User = this.as.emptyUser();
                    this.User = this.as.getUser();
                    this.categories = this.as.getPostCategories();
                    this.as.setActivePageTitle('Edit Post');
                }
                EditPostComponent.prototype.ngOnInit = function () {
                    var _this = this;
                    this.loadData().then(function () {
                        _this.viewInitialize();
                    });
                };
                EditPostComponent.prototype.handleFiles = function (evt) {
                    event.preventDefault();
                    var pattern = new RegExp("[0-9a-z]{1,}.(csv)$");
                    if (pattern.test(evt.target.files[0].name)) {
                        var size = parseInt(((evt.target.files[0].size / 1024) / 1024).toFixed(2));
                        if (size <= 1) {
                            this.csvFile = evt.target.files[0];
                        }
                        else {
                            document.getElementById('browseCSVFile')['value'] = null;
                            alert('Please CSV file size should be max 1mb');
                        }
                    }
                    else {
                        document.getElementById('browseCSVFile')['value'] = null;
                        alert('please select *.csv file');
                    }
                };
                EditPostComponent.prototype.loadData = function () {
                    var _this = this;
                    return new Promise(function (resolve, reject) {
                        _this.route.params.subscribe(function (params) {
                            _this.postid = params['postid'];
                            _this.as.loadPost(_this.postid).subscribe(function (post) {
                                _this.post = post;
                                _this.UserID = post.owner.userid;
                                resolve();
                            });
                        });
                    });
                };
                EditPostComponent.prototype.viewInitialize = function () {
                    var _this = this;
                    $('select').material_select();
                    tinymce.remove();
                    tinymce.init({
                        selector: '#editor',
                        height: 200,
                        plugins: [
                            'textpattern advlist autolink lists link image charmap print preview anchor',
                            'searchreplace visualblocks code fullscreen',
                            'insertdatetime media table contextmenu paste code'
                        ],
                        textpattern_patterns: [
                            { start: '*', end: '*', format: 'italic' },
                            { start: '**', end: '**', format: 'bold' },
                            { start: '#', format: 'h1' },
                            { start: '##', format: 'h2' },
                            { start: '###', format: 'h3' },
                            { start: '####', format: 'h4' },
                            { start: '#####', format: 'h5' },
                            { start: '######', format: 'h6' },
                            { start: '1. ', cmd: 'InsertOrderedList' },
                            { start: '* ', cmd: 'InsertUnorderedList' },
                            { start: '- ', cmd: 'InsertUnorderedList' }
                        ],
                        toolbar: 'insertfile undo redo | bold | bullist | link image',
                        setup: function (editor) {
                            editor.on('change', function (e) {
                                _this.post['detail'] = editor.getContent();
                            });
                            editor.on('init', function (e) {
                                // console.log('tiny init', this.post['detail']);
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
                        mainUrl: editpost.mainUrl ? editpost.mainUrl : '',
                        csvFilename: (this.csvFile) ? this.csvFile.name : this.post['csvFilename'],
                        timestamp: firebase.database['ServerValue'].TIMESTAMP
                    };
                    // convert CVS file to JSON
                    if (this.csvFile) {
                        Papa.parse(this.csvFile, {
                            complete: function (result) {
                                post["csvToJson"] = result.data;
                            }
                        });
                        // after file upload get download link storgae
                        this.storge.fileUpload(this.csvFile, 'posts/' + this.User.uid + '/' + this.csvFile.name + '/' + Date.now() + '/').then(function (url) {
                            post['gsheetLink'] = url;
                            _this.postObjReady.uploadFile = true;
                            _this.updateToFirebase(post); // save to firebase
                        }).catch(function (err) {
                            console.log('file not upload err', err);
                        });
                    }
                    else {
                        this.postObjReady.uploadFile = true;
                        this.updateToFirebase(post); // save to firebase
                    }
                    // checking if mailurl has changed then send request else nothing
                    if (editpost.mainUrl !== this.post['mainUrl']) {
                        // after extract data from embedly API save into post embedly property
                        this.embedly.extractAPI(editpost.mainUrl).then(function (data) {
                            post['embedly'] = data;
                            _this.postObjReady.embedlyApi = true;
                            _this.updateToFirebase(post); // save to firebase
                        });
                    }
                    else {
                        this.postObjReady.embedlyApi = true;
                        this.updateToFirebase(post); // save to firebase
                    }
                };
                EditPostComponent.prototype.updateToFirebase = function (post) {
                    var _this = this;
                    if (this.postObjReady.uploadFile && this.postObjReady.embedlyApi) {
                        this.as.updatePost(this.postid, post).then(function (res) {
                            console.log('Post is Updated!');
                            $('#errorPost').html('');
                            _this.postLoading = false;
                            _this.router.navigate(['/posts', _this.User.feed.id]);
                        }).catch(function (err) {
                            console.log('Post Update Failed!', err);
                            $('#errorPost').html(err.toString());
                            _this.postLoading = false;
                        });
                    }
                };
                EditPostComponent = __decorate([
                    core_1.Component({
                        selector: 'editpost',
                        host: {
                            class: 'col s12'
                        },
                        styleUrls: ['components/editpost/editpost.css'],
                        templateUrl: 'components/editpost/editpost.html'
                    }), 
                    __metadata('design:paramtypes', [authService_1.authService, router_1.Router, router_1.ActivatedRoute, embedlyService_1.embedlyService, firebaseStorageService_1.FirebaseStorageService])
                ], EditPostComponent);
                return EditPostComponent;
            }());
            exports_1("EditPostComponent", EditPostComponent);
        }
    }
});
