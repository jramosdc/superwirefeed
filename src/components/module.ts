import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { FormsModule }   from '@angular/forms';
import { HttpModule }     from '@angular/http';
import { FIREBASE_PROVIDERS, defaultFirebase, AuthMethods, AuthProviders, firebaseAuthConfig } from "angularfire2";

import { AppComponent }  from './app/app';
import { ApplicationComponents, AppRoutes } from './routes';
import { ApplicationServices } from "./services/bootstrapServices";
import { ApplicationDirectives } from './directives/sharedDirectives';
// import { ApplicationPipes } from './pipes/sharedPipes';

@NgModule({
    imports: [
        BrowserModule,
        RouterModule.forRoot(AppRoutes),
        FormsModule,
        HttpModule
    ],
    providers: [
        ...FIREBASE_PROVIDERS,
        defaultFirebase({
            apiKey: "AIzaSyCAmbNu5u6Pqguv3jRLx9ElyhhnIyIZnEo",
            authDomain: "superwireapp.firebaseapp.com",
            databaseURL: "https://superwireapp.firebaseio.com",
            storageBucket: "superwireapp.appspot.com",
        }),
        firebaseAuthConfig({ provider: AuthProviders.Password, method: AuthMethods.Password }),
        ...ApplicationServices
    ],
    // pipes: [],
    declarations: [AppComponent, ...ApplicationComponents, ...ApplicationDirectives],
    bootstrap: [AppComponent]
})
export class AppModule { }