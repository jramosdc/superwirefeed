import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from "@angular/router";
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
    _priority: any;                 // priority model for default value in our form
    _license: any;                 // priority model for default value in our form
    ty: string[];                  // selected types
    csvFile: any = null;
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

        this.defaultModelInitialization();
        this.sb.setHiddenSearchBar(true);


    }

    defaultModelInitialization() {
        this._priority = 'Low';
        this.ty = null;
        this._license = '0';
    }

    ngOnInit() {
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
            valid_elements : '*[*]',
            toolbar: 'insertfile undo redo | bold | bullist | link image',
            setup: (editor) => {
                editor.on('change', (e) => {
                    this.detail = editor.getContent();
                });
            }
        });

        let that = this;
        // multiple select options
        $('select[multiple] option').mousedown(function (e) {
            that.ty = (that.ty == null) ? [] : that.ty;
            e.preventDefault();
            let value = $(this).val().split(': ')[1].replace(/'/g, '');
            if (!$(this).prop('selected')) {
                that.ty.push(value)
            } else {
                that.ty.splice(that.ty.indexOf(value), 1);
                that.ty = (that.ty.length === 0) ? null : that.ty;
            }
            $(this).prop('selected', $(this).prop('selected') ? false : true);
            // $(this).prop('selected', !$(this).prop('selected'));
            return false;
        });
    }

    handleFiles(evt) {
        event.preventDefault();
        let pattern = new RegExp("[0-9a-z]{1,}.(csv)$");
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
    }

    submitPost(valid, newpost) {
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

        // convert CVS file to JSON
        if (this.csvFile) {
            Papa.parse(this.csvFile, {
                complete: (result) => {
                    post["csvToJson"] = result.data;
                }
            });

            // after file upload get download link storgae
            this.storge.fileUpload(this.csvFile, 'posts/' + this.User.uid + '/' + this.csvFile.name + '/' + Date.now() + '/')
                .then(url => {
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



    } // submitPost

    private postToFirebase(post) {
        if (this.postObjReady.uploadFile && this.postObjReady.embedlyApi) {
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
        }
    } // postToFirebase

    backgroundImagePopup() {
        event.preventDefault();
        $('#backgroundModal')['openModal']();
    }

    backgroundModelClose() {
        event.preventDefault()
        $('#backgroundModal')['closeModal']();
        this.imageSelected = true;
        this.postImgData['image'] = null;
    }

    backgroundChangeListener($event) {
        event.preventDefault()
        console.log($event)
        let image: any = new Image();
        let file: File = $event.target.files[0];
        console.log('file: ', file);
        let myReader: FileReader = new FileReader();

        myReader.onloadend = (loadEvent: any) => {
            image.src = loadEvent.target.result;
            this.postCropper.setImage(image);
            //data2 image on select image
            this.postImgData.image = loadEvent.target.result
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
