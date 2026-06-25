import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class SearchBarService {
    search$: Subject<string>;
    searchBar: { isHidden: boolean } = <any>{};
    observerable$: Observable<string>;
    observer;

    constructor() {
        this.observerable$ = Observable.create((observer) => {
            this.observer = observer;
        });
        this.search$ = new Subject<string>();
        this.searchBar.isHidden = false;
    }

    setHiddenSearchBar(b: boolean): { isHidden: boolean } {
        this.searchBar.isHidden = b;
        return this.searchBar;
    }

}