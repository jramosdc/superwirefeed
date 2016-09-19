// <reference path="../../../typings/index.d.ts">

import { SafeResourceUrl, DomSanitizationService } from '@angular/platform-browser';
import { Component } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { FirebaseObjectObservable } from 'angularfire2';
import { User, authService } from '../services/authService';
import { httpService } from '../services/httpService';

@Component({
    selector: 'viewpost',
    host: {
        class: 'col s12'
    },
    styleUrls: ['components/viewpost/viewpost.css'],
    templateUrl: 'components/viewpost/viewpost.html'
})
export class ViewPostComponent {

    User: User;
    postid: string
    post: FirebaseObjectObservable<{}>

    constructor(private as: authService, private router: Router, private route: ActivatedRoute, sanitizer: DomSanitizationService, private http: httpService) {
        this.User = this.as.emptyUser();
        this.User = this.as.getUser();
        this.as.setActivePageTitle('View Post');
        this.route.params.subscribe(params => {
            this.postid = params['postid'];
            if (this.postid) {
                this.as.loadPost(this.postid).subscribe((post) => {
                    this.post = post;
                    this.post['purl'] = sanitizer.bypassSecurityTrustResourceUrl(post.pdfLink);
                    this.post['gurl'] = sanitizer.bypassSecurityTrustResourceUrl(post.gsheetLink);
                    setTimeout(() => {
                        $('.linkify').linkify();
                        $('.collapsible').collapsible({accordion : false});
                        $("img").addClass("responsive-img");
                        if(this.post['detail']) { $('#postDetails').html(this.post['detail']); }
                        if(this.post['csvToJson']) {
                            this.displayTable(post['csvToJson']);
                        }   
                    });
                });
            }
        });
    }

    returnMoment(timestamp) {
        if (timestamp) {
            return moment().to(timestamp);
        } else {
            return ''
        }
    }

    displayTable(dataJSON) {
        let data = dataJSON;
        let tableDiv = document.getElementById("fullTable");
        let tbl = document.createElement("table");
        let tblHead = document.createElement("thead");
        let tblBody = document.createElement("tbody");
        // var Headerrow = document.createElement("tr");
        // for (var heading in data[0]) {
        //     console.log('heading', heading)
        //     var cell = document.createElement("td");
        //     var cellText = document.createTextNode(heading);
        //     cell.appendChild(cellText);
        //     Headerrow.appendChild(cell);
        // }
        // tblBody.appendChild(Headerrow);
        for (let j = 0; j < data.length; j++) {
            let row = document.createElement("tr");
            for (let obj in data[j]) {
                let cell = document.createElement("td");
                let cellText = document.createTextNode(data[j][obj]);
                cell.appendChild(cellText);
                row.appendChild(cell);
            }
            tblBody.appendChild(row);
        }
        tbl.appendChild(tblBody);
        tableDiv.appendChild(tbl);
        setTimeout(()=>{
            tbl.setAttribute("class", "striped highlight centered responsive-table");
        },1000)
    }

}

// Papa.parse('https://docs.google.com/spreadsheets/d/1se-tAna5Nlei8K7weGc-A9jDafoV8DLQP-sqd7Iq0Ns/pubhtml?gid=74699649&single=true', {
//     download: true, 
//     delimiter: ",", 
//     skipemptylines: true, 
//     header: false,
//     complete: function(results, file){
//         console.log('data finsingh: ', results, file);
//     }
// })