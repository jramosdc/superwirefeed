// <reference path="../../../typings/index.d.ts">
System.register(['@angular/core', "@angular/router", '../services/authService', '../services/embedlyService', '../services/firebaseStorageService'], function(exports_1, context_1) {
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
            },
            function (embedlyService_1_1) {
                embedlyService_1 = embedlyService_1_1;
            },
            function (firebaseStorageService_1_1) {
                firebaseStorageService_1 = firebaseStorageService_1_1;
            }],
        execute: function() {
            NewPostComponent = (function () {
                function NewPostComponent(as, router, embedly, storge) {
                    this.as = as;
                    this.router = router;
                    this.embedly = embedly;
                    this.storge = storge;
                    this.categories = [];
                    this.csvFile = null;
                    this.postObjReady = { embedlyApi: false, uploadFile: false };
                    this.User = this.as.emptyUser();
                    this.User = this.as.getUser();
                    this.categories = this.as.getPostCategories();
                    this.as.setActivePageTitle('New Post');
                    this.defaultModelInitialization();
                }
                NewPostComponent.prototype.defaultModelInitialization = function () {
                    this._priority = 'Low';
                    this.ty = null;
                };
                NewPostComponent.prototype.ngOnInit = function () {
                    var _this = this;
                    // $('select').material_select();
                    tinymce['remove']();
                    tinymce['init']({
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
                                _this.detail = editor.getContent();
                            });
                        }
                    });
                    var that = this;
                    // multiple select options
                    $('select[multiple] option').mousedown(function (e) {
                        that.ty = (that.ty == null) ? [] : that.ty;
                        e.preventDefault();
                        var value = $(this).val().split(': ')[1].replace(/'/g, '');
                        if (!$(this).prop('selected')) {
                            that.ty.push(value);
                        }
                        else {
                            that.ty.splice(that.ty.indexOf(value), 1);
                            that.ty = (that.ty.length === 0) ? null : that.ty;
                        }
                        $(this).prop('selected', $(this).prop('selected') ? false : true);
                        // $(this).prop('selected', !$(this).prop('selected'));
                        return false;
                    });
                };
                NewPostComponent.prototype.handleFiles = function (evt) {
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
                        mainUrl: newpost.mainUrl ? newpost.mainUrl : '',
                        csvFilename: (this.csvFile) ? this.csvFile.name : '',
                        csvToJson: '',
                        owner: {
                            uid: this.User.uid,
                            userid: this.User.feed.userid,
                            feedid: this.User.feed.id
                        },
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
                            _this.postToFirebase(post); // save to firebase
                        }).catch(function (err) {
                            console.log('file not upload err', err);
                        });
                    }
                    else {
                        this.postObjReady.uploadFile = true;
                        this.postToFirebase(post); // save to firebase
                    }
                    // after extract data from embedly API save into post embedly property
                    this.embedly.extractAPI(newpost.mainUrl).then(function (data) {
                        post['embedly'] = data;
                        _this.postObjReady.embedlyApi = true;
                        _this.postToFirebase(post); // save to firebase
                    });
                }; // submitPost
                NewPostComponent.prototype.postToFirebase = function (post) {
                    var _this = this;
                    if (this.postObjReady.uploadFile && this.postObjReady.embedlyApi) {
                        this.as.submitPost(post).then(function (res) {
                            console.log('Post is Submitted!');
                            $('#errorPost').html('');
                            _this.postLoading = false;
                            _this.router.navigate(['posts', _this.User.feed.id]);
                        }).catch(function (err) {
                            console.log('Post Submit Failed!', err);
                            $('#errorPost').html(err.toString());
                            _this.postLoading = false;
                        });
                    }
                }; // postToFirebase
                NewPostComponent = __decorate([
                    core_1.Component({
                        selector: 'newpost',
                        host: {
                            class: 'col s12'
                        },
                        styleUrls: ['components/newpost/newpost.css'],
                        templateUrl: 'components/newpost/newpost.html'
                    }), 
                    __metadata('design:paramtypes', [authService_1.authService, router_1.Router, embedlyService_1.embedlyService, firebaseStorageService_1.FirebaseStorageService])
                ], NewPostComponent);
                return NewPostComponent;
            }());
            exports_1("NewPostComponent", NewPostComponent);
        }
    }
});
