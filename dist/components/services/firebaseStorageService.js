// <reference path="../../../typings/index.d.ts">
System.register(['@angular/core'], function(exports_1, context_1) {
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
    var core_1;
    var FirebaseStorageService;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            }],
        execute: function() {
            FirebaseStorageService = (function () {
                function FirebaseStorageService() {
                    this.storageRef = firebase.storage().ref('/');
                    // super();
                }
                FirebaseStorageService.prototype.fileUpload = function (file, path) {
                    var _this = this;
                    // file: is file or Blob named mountains.jpg
                    // path: where to save
                    return new Promise(function (res, rej) {
                        // Create the file metadata
                        // let metadata: any = {
                        //     contentType: 'image/jpeg'
                        // };
                        // Upload file and metadata to the object 'images/mountains.jpg'
                        var uploadTask = _this.storageRef.child(path + file.name).put(file);
                        // Listen for state changes, errors, and completion of the upload.
                        uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, function (snapshot) {
                            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                            var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            console.log('Upload is ' + progress + '% done');
                            switch (snapshot.state) {
                                case firebase.storage.TaskState.PAUSED:
                                    console.log('Upload is paused');
                                    break;
                                case firebase.storage.TaskState.RUNNING:
                                    console.log('Upload is running');
                                    break;
                            }
                        }, function (error) {
                            switch (error.code) {
                                case 'storage/unauthorized':
                                    // User doesn't have permission to access the object
                                    console.log('User doesn\'t have permission to access the object');
                                    rej('User doesn\'t have permission to access the object');
                                    break;
                                case 'storage/canceled':
                                    // User canceled the upload
                                    console.log('User canceled the upload');
                                    rej('User canceled the upload');
                                    break;
                                case 'storage/unknown':
                                    // Unknown error occurred, inspect error.serverResponse
                                    console.log('Unknown error occurred, inspect error.serverResponse');
                                    rej('Unknown error occurred, inspect error.serverResponse');
                                    break;
                            }
                        }, function () {
                            // Upload completed successfully, now we can get the download URL
                            // var downloadURL = uploadTask.snapshot.downloadURL;
                            res(uploadTask.snapshot.downloadURL);
                        }); // uploadTask
                    }); // promise
                }; // fileUpload
                FirebaseStorageService = __decorate([
                    core_1.Injectable(), 
                    __metadata('design:paramtypes', [])
                ], FirebaseStorageService);
                return FirebaseStorageService;
            }());
            exports_1("FirebaseStorageService", FirebaseStorageService);
        }
    }
});
