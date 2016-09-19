// <reference path="../../../typings/index.d.ts">
System.register(['@angular/platform-browser', '@angular/core', "@angular/router", '../services/authService', '../services/httpService'], function(exports_1, context_1) {
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
    var platform_browser_1, core_1, router_1, authService_1, httpService_1;
    var ViewPostComponent;
    return {
        setters:[
            function (platform_browser_1_1) {
                platform_browser_1 = platform_browser_1_1;
            },
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (router_1_1) {
                router_1 = router_1_1;
            },
            function (authService_1_1) {
                authService_1 = authService_1_1;
            },
            function (httpService_1_1) {
                httpService_1 = httpService_1_1;
            }],
        execute: function() {
            ViewPostComponent = (function () {
                function ViewPostComponent(as, router, route, sanitizer, http) {
                    var _this = this;
                    this.as = as;
                    this.router = router;
                    this.route = route;
                    this.http = http;
                    this.User = this.as.emptyUser();
                    this.User = this.as.getUser();
                    this.as.setActivePageTitle('View Post');
                    this.route.params.subscribe(function (params) {
                        _this.postid = params['postid'];
                        if (_this.postid) {
                            _this.as.loadPost(_this.postid).subscribe(function (post) {
                                _this.post = post;
                                _this.post['purl'] = sanitizer.bypassSecurityTrustResourceUrl(post.pdfLink);
                                _this.post['gurl'] = sanitizer.bypassSecurityTrustResourceUrl(post.gsheetLink);
                                setTimeout(function () {
                                    $('.linkify').linkify();
                                    $('.collapsible').collapsible({ accordion: false });
                                    $("img").addClass("responsive-img");
                                    if (_this.post['detail']) {
                                        $('#postDetails').html(_this.post['detail']);
                                    }
                                    if (_this.post['csvToJson']) {
                                        _this.displayTable(post['csvToJson']);
                                    }
                                });
                            });
                        }
                    });
                }
                ViewPostComponent.prototype.returnMoment = function (timestamp) {
                    if (timestamp) {
                        return moment().to(timestamp);
                    }
                    else {
                        return '';
                    }
                };
                ViewPostComponent.prototype.displayTable = function (dataJSON) {
                    var data = dataJSON;
                    var tableDiv = document.getElementById("fullTable");
                    var tbl = document.createElement("table");
                    var tblHead = document.createElement("thead");
                    var tblBody = document.createElement("tbody");
                    // var Headerrow = document.createElement("tr");
                    // for (var heading in data[0]) {
                    //     console.log('heading', heading)
                    //     var cell = document.createElement("td");
                    //     var cellText = document.createTextNode(heading);
                    //     cell.appendChild(cellText);
                    //     Headerrow.appendChild(cell);
                    // }
                    // tblBody.appendChild(Headerrow);
                    for (var j = 0; j < data.length; j++) {
                        var row = document.createElement("tr");
                        for (var obj in data[j]) {
                            var cell = document.createElement("td");
                            var cellText = document.createTextNode(data[j][obj]);
                            cell.appendChild(cellText);
                            row.appendChild(cell);
                        }
                        tblBody.appendChild(row);
                    }
                    tbl.appendChild(tblBody);
                    tableDiv.appendChild(tbl);
                    setTimeout(function () {
                        tbl.setAttribute("class", "striped highlight centered responsive-table");
                    }, 1000);
                };
                ViewPostComponent = __decorate([
                    core_1.Component({
                        selector: 'viewpost',
                        host: {
                            class: 'col s12'
                        },
                        styleUrls: ['components/viewpost/viewpost.css'],
                        templateUrl: 'components/viewpost/viewpost.html'
                    }), 
                    __metadata('design:paramtypes', [authService_1.authService, router_1.Router, router_1.ActivatedRoute, platform_browser_1.DomSanitizationService, httpService_1.httpService])
                ], ViewPostComponent);
                return ViewPostComponent;
            }());
            exports_1("ViewPostComponent", ViewPostComponent);
        }
    }
});
// Papa.parse('https://docs.google.com/spreadsheets/d/1se-tAna5Nlei8K7weGc-A9jDafoV8DLQP-sqd7Iq0Ns/pubhtml?gid=74699649&single=true', {
//     download: true, 
//     delimiter: ",", 
//     skipemptylines: true, 
//     header: false,
//     complete: function(results, file){
//         console.log('data finsingh: ', results, file);
//     }
// }) 
