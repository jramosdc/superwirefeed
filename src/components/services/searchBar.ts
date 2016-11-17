import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable()
export default class SearchBarService {
    search$: Subject<string>;
    observerable$: Observable<string>;
    observer;

    constructor() {
        this.observerable$ = Observable.create((observer) => {
            this.observer = observer;
        });
        this.search$ = new Subject<string>();
    }

}