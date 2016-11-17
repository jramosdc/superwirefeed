import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { User, authService } from '../services/authService';
import { embedlyService, IEmbedly } from '../services/embedlyService';
import { FirebaseStorageService } from '../services/firebaseStorageService';
import { ImageCropperComponent, Bounds, CropperSettings } from 'ng2-img-cropper';
import SearchBar from '../services/searchBar';

declare var Papa: any, tinymce: any;

@Component({
    selector: 'editpost',
    host: {
        class: 'col s12'
    },
    styles: [require('./editpost.css')],
    template: require('./editpost.html')
})
export class EditPostComponent implements OnInit {

    User: User;
    postid: string;
    post: Object = {};
    UserID: string;
    postLoading: boolean;
    categories: Array<string> = [];
    csvFile: any = null;
    postObjReady: { embedlyApi: boolean, uploadFile: boolean } = { embedlyApi: false, uploadFile: false };

    // Cropper variables postImgData
    postImgData: any = {};
    cropperSettings_rectangle: CropperSettings = <any>{};
    imageSelected: boolean = true;
    imageUploading: boolean = false;
    postedImgUrl = null;
    @ViewChild('postCropper', undefined) postCropper: ImageCropperComponent;

    constructor(private as: authService, private router: Router, private route: ActivatedRoute, private embedly: embedlyService, private storge: FirebaseStorageService, private sb: SearchBar) {
        this.User = this.as.emptyUser();
        this.User = this.as.getUser();
        this.categories = this.as.getPostCategories();
        this.as.setActivePageTitle('Edit Post');

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
        this.loadData().then(() => {
            this.viewInitialize();
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


    private loadData() {
        return new Promise((resolve, reject) => {
            this.route.params.subscribe(params => {
                this.postid = params['postid'];
                this.as.loadPost(this.postid).subscribe(post => {
                    this.post = post;
                    this.UserID = post.owner.userid;
                    resolve();
                });
            });
        });
    }

    private viewInitialize() {
        $('select')['material_select']();
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
            setup: (editor) => {
                editor.on('change', (e) => {
                    this.post['detail'] = editor.getContent();
                });
                editor.on('init', (e) => {
                    // console.log('tiny init', this.post['detail']);
                    tinymce.activeEditor.setContent(this.post['detail']);
                });
            }
        });
        // console.log('ng init');
    }

    updatePost(valid, editpost) {
        event.preventDefault();
        if (!valid) { return; }
        this.postLoading = true;
        let post = {
            title: editpost.title,
            detail: editpost.detail,
            priority: editpost.priority,
            types: editpost.type,
            category: editpost.category,
            pdfLink: editpost.pdfLink ? editpost.pdfLink : '',
            gsheetLink: editpost.gsheetLink ? editpost.gsheetLink : '',
            mainUrl: editpost.mainUrl ? editpost.mainUrl : '',
            csvFilename: (this.csvFile) ? this.csvFile.name : this.post['csvFilename'],
            timestamp: firebase.database['ServerValue'].TIMESTAMP,
            image: ((this.postedImgUrl) ? this.postedImgUrl : ((this.post['image'] ? this.post['image'] : null))),
        }

        // convert CVS file to JSON
        if (this.csvFile) {
            Papa.parse(this.csvFile, {
                complete: (result) => {
                    post["csvToJson"] = result.data;
                }
            });

            // after file upload get download link storgae
            this.storge.fileUpload(this.csvFile, 'posts/' + this.User.uid + '/' + this.csvFile.name + '/' + Date.now() + '/').then(url => {
                post['gsheetLink'] = url;
                this.postObjReady.uploadFile = true;
                this.updateToFirebase(post);             // save to firebase
            }).catch(err => {
                console.log('file not upload err', err);
            });
        } else {
            this.postObjReady.uploadFile = true;
            this.updateToFirebase(post);             // save to firebase
        }

        // checking if mailurl has changed then send request else nothing
        if (editpost.mainUrl !== this.post['mainUrl']) {
            // after extract data from embedly API save into post embedly property
            this.embedly.extractAPI(editpost.mainUrl).then((data: IEmbedly) => {
                post['embedly'] = data;
                this.postObjReady.embedlyApi = true;
                this.updateToFirebase(post);             // save to firebase
            });
        } else {
            this.postObjReady.embedlyApi = true;
            this.updateToFirebase(post);             // save to firebase
        }

    }

    private updateToFirebase(post) {
        if (this.postObjReady.uploadFile && this.postObjReady.embedlyApi) {
            // for show updated on top feeds!
            this.as.updateFeed(this.User.feed.id, { 'timestamp': firebase.database['ServerValue'].TIMESTAMP });
            this.as.updatePost(this.postid, post).then(res => {
                console.log('Post is Updated!');
                $('#errorPost').html('');
                this.postLoading = false;
                this.router.navigate(['/posts', this.User.feed.id]);
            }).catch(err => {
                console.log('Post Update Failed!', err);
                $('#errorPost').html(err.toString());
                this.postLoading = false;
            });
        }
    }



    backgroundImagePopup() {
        event.preventDefault()
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
