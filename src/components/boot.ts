import { bootstrap } from "@angular/platform-browser-dynamic";
import { enableProdMode } from "@angular/core";
import { HTTP_PROVIDERS } from "@angular/http";
import { FORM_PROVIDERS } from "@angular/common";
import { FIREBASE_PROVIDERS, defaultFirebase, AuthMethods, AuthProviders, firebaseAuthConfig } from "angularfire2";

import { APP_ROUTER_PROVIDERS } from './routes';
import { SERVICE_PROVIDER } from "./services/bootstrapServices";

import { AppComponent } from './app/app'

enableProdMode();

bootstrap(AppComponent, [
    HTTP_PROVIDERS,
    FORM_PROVIDERS,
    FIREBASE_PROVIDERS,
    defaultFirebase({
        apiKey: "AIzaSyCAmbNu5u6Pqguv3jRLx9ElyhhnIyIZnEo",
        authDomain: "superwireapp.firebaseapp.com",
        databaseURL: "https://superwireapp.firebaseio.com",
        storageBucket: "superwireapp.appspot.com",
    }),
    firebaseAuthConfig({ provider: AuthProviders.Password, method: AuthMethods.Password }),
    APP_ROUTER_PROVIDERS,
    SERVICE_PROVIDER
]).catch(err => {
    console.log(err);
});