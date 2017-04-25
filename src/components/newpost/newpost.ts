import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { User, authService } from '../services/authService';
import { embedlyService, IEmbedly } from '../services/embedlyService';
import { FirebaseStorageService } from '../services/firebaseStorageService';
import { ImageCropperComponent, Bounds, CropperSettings } from 'ng2-img-cropper';
import { SearchBarService } from '../services/searchBar';
var Papa = require('../../lib/papaparse');

declare var tinymce: any;

@Component({
    selector: 'newpost',
    host: {
        class: 'col s12'
    },
    styles: [require('./newpost.css')],
    template: require('./newpost.html')
})
export class NewPostComponent implements OnInit {

    User: User;
    detail: string;
    postLoading: boolean;
    categories: Array<string> = [];
    licenses: Array<string> = ['CC-BY (free)', 'CC-BY-ND', 'Selling/Attribution ($35)', 'Selling/Exclusive ($200)'];
    dropdown = { breaking: false, types: [] };
    csvFile: any = null;
    pdfFile: Array<any> = [];
    pdfFileLinks: any = {};
    pdfFilesName: any = {};
    images: Array<any> = [];
    imagesLinks: any = {};
    csvLinks: any = {};
    postObjReady: { embedlyApi: boolean, uploadFile: boolean } = { embedlyApi: false, uploadFile: false };
    // Cropper variables postImgData
    postImgData: any = {};
    cropperSettings_rectangle: CropperSettings = <any>{};
    imageSelected: boolean = true;
    imageUploading: boolean = false;
    postedImgUrl = null;
    @ViewChild('postCropper', undefined) postCropper: ImageCropperComponent;

    constructor(private as: authService, private router: Router, private embedly: embedlyService, private storge: FirebaseStorageService, private sb: SearchBarService) {
        this.User = this.as.emptyUser();
        this.User = this.as.getUser();
        this.categories = this.as.getPostCategories();
        this.as.setActivePageTitle('New Post');

        // for angular2 Corpper (rectangle)
        this.cropperSettings_rectangle = new CropperSettings();
        this.cropperSettings_rectangle.width = 400;
        this.cropperSettings_rectangle.height = 200;
        this.cropperSettings_rectangle.keepAspect = false;
        this.cropperSettings_rectangle.croppedWidth = 400;
        this.cropperSettings_rectangle.croppedHeight = 200;
        this.cropperSettings_rectangle.canvasWidth = 400;
        this.cropperSettings_rectangle.canvasHeight = 200;
        this.cropperSettings_rectangle.minWidth = 200;
        this.cropperSettings_rectangle.minHeight = 100;
        this.cropperSettings_rectangle.rounded = false;
        this.cropperSettings_rectangle.minWithRelativeToResolution = false;
        this.cropperSettings_rectangle.cropperDrawSettings.strokeColor = 'rgba(255,255,255,1)';
        this.cropperSettings_rectangle.cropperDrawSettings.strokeWidth = 1;
        this.cropperSettings_rectangle.noFileInput = true;
        this.sb.setHiddenSearchBar(true);
    }

    ngOnInit() {
        // $('select').material_select();
        tinymce['remove']();
        tinymce['init']({
            selector: '#editor',
            height: 200,
            menubar: false,
            statusbar: false,
            plugins: [
                'textpattern advlist autolink lists link image charmap print preview anchor',
                'searchreplace visualblocks code fullscreen',
                'insertdatetime media table contextmenu paste code'
            ],
            content_css: [
                '//fonts.googleapis.com/css?family=Roboto:300,300i,400,400i',
                '//www.mucholab.net/css/tinymce.css'],
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
            valid_elements: '*[*]',
            toolbar: 'undo redo | insert | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image code',
            setup: (editor) => {
                editor.on('change', (e) => {
                    this.detail = editor.getContent();
                });
            }
        });

        // let that = this;
        // multiple select options
        // $('select[multiple] option').mousedown(function (e) {
        //     that.ty = (that.ty == null) ? [] : that.ty;
        //     e.preventDefault();
        //     let value = $(this).val().split(': ')[1].replace(/'/g, '');
        //     if (!$(this).prop('selected')) {
        //         that.ty.push(value)
        //     } else {
        //         that.ty.splice(that.ty.indexOf(value), 1);
        //         that.ty = (that.ty.length === 0) ? null : that.ty;
        //     }
        //     $(this).prop('selected', $(this).prop('selected') ? false : true);
        //     // $(this).prop('selected', !$(this).prop('selected'));
        //     return false;
        // });
    }

    typeAddRemove(type: string) {
        let add = true;
        this.dropdown.types.map((ty, I) => {
            if (ty === type) {
                this.dropdown.types.splice(I, 1);
                add = false;
            }
        })
        if (add) this.dropdown.types.push(type);
    }

    handleFiles(evt) {
        event.preventDefault();
        if (evt.target.id == 'browseCSVFile') {
            let pattern = new RegExp('[0-9a-z]{1,}.(csv)$');
            if (pattern.test(evt.target.files[0].name)) {
                let size = parseInt(((evt.target.files[0].size / 1024) / 1024).toFixed(2));
                if (size <= 1) {
                    this.csvFile = evt.target.files[0];
                } else {
                    document.getElementById('browseCSVFile')['value'] = null;
                    alert('Please CSV file size should be max 1mb');
                }
            } else {
                document.getElementById('browseCSVFile')['value'] = null;
                alert('please select *.csv file');
            }
        } else if (evt.target.id == 'browsePdfFile') {
            this.pdfFile = [];
            let pattern = new RegExp('[0-9a-z]{1,}.(pdf)$');
            for (let i = 0; i < evt.target.files.length; i++) {
                if (pattern.test(evt.target.files[i].name)) {
                    this.pdfFile[i] = evt.target.files[i];
                } else {
                    document.getElementById('browsePdfFile')['value'] = null;
                    alert('please select *.pdf file');
                }
            }
        } else if (evt.target.id == 'browseImages') {
            this.images = [];
            let pattern = new RegExp('[0-9a-z]{1,}.(jpe?g|png|gif|bmp)$');
            for (let i = 0; i < evt.target.files.length; i++) {
                if (pattern.test(evt.target.files[i].name)) {
                    let size = parseInt(((evt.target.files[i].size / 1024) / 1024).toFixed(2)); //size in mbs
                    if (size <= 10) {
                        this.images[i] = evt.target.files[i];
                    } else {
                        document.getElementById('browseImages')['value'] = null;
                        alert('Image size should be max 10mb');
                    }
                } else {
                    document.getElementById('browseImages')['value'] = null;
                    alert('please select image with a proper name');
                }
            }
        }
    }

    submitPost(valid, newpost) {
        console.log('valid', valid);
        console.log('newpost', newpost);
        console.log('dropdown', this.dropdown);
        event.preventDefault();
        if (!valid) { return; }
        if (this.dropdown.types.length === 0) { return; }
        this.as.submitPost({}).then(res => {
            let postid = res.path.o[1];
            this.postLoading = true;
            let post = {
                title: newpost.title,
                detail: newpost.detail,
                priority: newpost.priority,
                license: newpost.license,
                types: this.dropdown.types,
                category: newpost.category,
                pdfFile: newpost.pdfFile ? newpost.pdfFile : '',
                gsheetFile: newpost.gsheetFile ? newpost.gsheetFile : '',
                pdfLink: newpost.pdfLink ? newpost.pdfLink : '',
                gsheetLink: newpost.gsheetLink ? newpost.gsheetLink : '',
                images: newpost.images ? newpost.images : '',
                mainUrl: newpost.mainUrl ? newpost.mainUrl : '',
                // csvFilename: (this.csvFile) ? this.csvFile.name : '',
                csvToJson: '',
                coverImage: this.postedImgUrl,
                owner: {
                    uid: this.User.uid,
                    userid: this.User.feed.userid,
                    feedid: this.User.feed.id
                },
                timestamp: firebase.database['ServerValue'].TIMESTAMP
            };
            if (this.pdfFile.length > 0) {
                this.uploadFile(this.pdfFile, postid)
                    .then(urls => {
                        if (urls) {
                            for (let i = 0; i < urls.length; i++) {
                                let pdfId: any = this.as.getFileId({});
                                pdfId = pdfId.path.o[1];
                                this.pdfFileLinks[pdfId] = urls[i];
                            }
                            post['pdfFile'] = this.pdfFileLinks;
                            this.postObjReady.uploadFile = true;
                            this.postToFirebase(postid, post);
                        }
                    })
                    .catch(err => {
                        console.log('err', err);
                    });
            }
            if (this.images.length > 0) {
                this.uploadFile(this.images, postid)
                    .then(urls => {
                        if (urls) {
                            for (let i = 0; i < urls.length; i++) {
                                let imageId: any = this.as.getFileId({});
                                imageId = imageId.path.o[1];
                                this.imagesLinks[imageId] = urls[i];
                            }
                            post['images'] = this.imagesLinks;
                            this.postObjReady.uploadFile = true;
                            this.postToFirebase(postid, post);
                        }
                    })
                    .catch(err => {
                        console.log('err', err);
                    });
            }
            // convert CVS file to JSON
            if (this.csvFile) {
                Papa.parse(this.csvFile, {
                    complete: (result) => {
                        post['csvToJson'] = result.data;
                    }
                });
                // after file upload get download link storage
                this.storge.fileUpload(this.csvFile, 'posts/' + this.User.uid + '/' + postid + '/' + this.csvFile.name + '/' + Date.now() + '/')
                    .then(url => {
                        let csvId: any = this.as.getFileId({});
                        csvId = csvId.path.o[1];
                        this.csvLinks[csvId] = url;
                        post['gsheetFile'] = this.csvLinks;
                        this.postObjReady.uploadFile = true;
                        this.postToFirebase(postid, post);             // save to firebase
                    }).catch(err => {
                        console.log('file not upload err', err);
                    });
            } else {
                this.postObjReady.uploadFile = true;
                this.postToFirebase(postid, post);             // save to firebase
            }
            // after extract data from embedly API save into post embedly property
            this.embedly.extractAPI(newpost.mainUrl).then((data: IEmbedly) => {
                post['embedly'] = data;
                this.postObjReady.embedlyApi = true;
                this.postToFirebase(postid, post);             // save to firebase
            });
        }).catch(err => {
            console.log('err', err);
        });

        /*console.log('event', event);
        console.log('valid', valid);
        console.log('newpost', newpost);
        event.preventDefault();
        if (!valid) { return; }
        this.postLoading = true;
        let post = {
            title: newpost.title,
            detail: newpost.detail,
            priority: newpost.priority,
            license: newpost.license,
            types: newpost.type,
            category: newpost.category,
            pdfLink: newpost.pdfLink ? newpost.pdfLink : '',
            gsheetLink: newpost.gsheetLink ? newpost.gsheetLink : '',
            mainUrl: newpost.mainUrl ? newpost.mainUrl : '',
            csvFilename: (this.csvFile) ? this.csvFile.name : '',
            csvToJson: '',
            image: this.postedImgUrl,
            owner: {
                uid: this.User.uid,
                userid: this.User.feed.userid,
                feedid: this.User.feed.id
            },
            timestamp: firebase.database['ServerValue'].TIMESTAMP
        };
        console.log('post', post);
        // convert CVS file to JSON
        if (this.csvFile) {
            Papa.parse(this.csvFile, {
                complete: (result) => {
                    post["csvToJson"] = result.data;
                }
            });
            // after file upload get download link storage
            this.storge.fileUpload(this.csvFile, 'posts/' + this.User.uid + '/' + this.csvFile.name + '/' + Date.now() + '/')
                .then(url => {
                    console.log('url', url);
                    post['gsheetLink'] = url;
                    this.postObjReady.uploadFile = true;
                    this.postToFirebase(post);             // save to firebase
                }).catch(err => {
                    console.log('file not upload err', err);
                });
        } else {
            this.postObjReady.uploadFile = true;
            this.postToFirebase(post);             // save to firebase
        }
        // after extract data from embedly API save into post embedly property
        this.embedly.extractAPI(newpost.mainUrl).then((data: IEmbedly) => {
            post['embedly'] = data;
            this.postObjReady.embedlyApi = true;
            this.postToFirebase(post);             // save to firebase
        });
*/
    } // submitPost

    private uploadFile(files, postid) {
        let promiseArray: Array<any> = [];
        for (let i = 0; i < files.length; i++) {
            promiseArray.push(
                new Promise((resolve, reject) => {
                    this.storge.fileUpload(files[i], 'posts/' + this.User.uid + '/' + postid + '/' + files[i].name + '/' + Date.now() + '/')
                        .then(url => {
                            resolve(url);
                        })
                        .catch(err => {
                            reject(err);
                        });
                })
            )
        }
        return Promise.all(promiseArray)
            .then(urls => {
                return urls;
            });
    }

    private postToFirebase(postid, post) {
        if (this.postObjReady.uploadFile && this.postObjReady.embedlyApi) {
            // for show updated on top feeds!
            this.as.updateFeed(this.User.feed.id, { 'timestamp': firebase.database['ServerValue'].TIMESTAMP });
            this.as.setPost(postid, post).then(res => {
                console.log('Post is Submitted!');
                $('#errorPost').html('');
                this.postedImgUrl = null;
                this.postLoading = false;
                this.router.navigate(['posts', this.User.feed.id]);
            }).catch(err => {
                console.log('Post Submit Failed!', err);
                $('#errorPost').html(err.toString());
                this.postLoading = false;
            });
        }

        /*if (this.postObjReady.uploadFile && this.postObjReady.embedlyApi) {
            // for show updated on top feeds!
            this.as.updateFeed(this.User.feed.id, { 'timestamp': firebase.database['ServerValue'].TIMESTAMP });
            this.as.submitPost(post).then(res => {
                console.log('Post is Submitted!');
                $('#errorPost').html('');
                this.postedImgUrl = null;
                this.postLoading = false;
                this.router.navigate(['posts', this.User.feed.id]);
            }).catch(err => {
                console.log('Post Submit Failed!', err);
                $('#errorPost').html(err.toString());
                this.postLoading = false;
            });
        }*/
    } // postToFirebase

    backgroundImagePopup() {
        event.preventDefault();
        $('#backgroundModal')['openModal']();
    }

    backgroundModelClose() {
        event.preventDefault();
        $('#backgroundModal')['closeModal']();
        this.imageSelected = true;
        this.postImgData['image'] = null;
    }

    backgroundChangeListener($event) {
        event.preventDefault();
        let image: any = new Image();
        let file: File = $event.target.files[0];
        let myReader: FileReader = new FileReader();

        myReader.onloadend = (loadEvent: any) => {
            image.src = loadEvent.target.result;
            this.postCropper.setImage(image);
            // data2 image on select image
            // this.postImgData.image = loadEvent.target.result
        };
        myReader.readAsDataURL(file);
    }

    uploadBackgroundImage() {
        this.imageUploading = true;
        this.as.uploadPostImg(this.postImgData.image).then(imgUrl => {
            console.log('imgUrl: ', imgUrl);
            this.postedImgUrl = imgUrl;
            this.imageUploading = false;
            this.backgroundModelClose();
        });
    }



}