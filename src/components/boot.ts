import { bootstrap } from "@angular/platform-browser-dynamic" ;
import { provide } from "@angular/core";
import { HTTP_PROVIDERS } from "@angular/http";
import { FORM_PROVIDERS } from "@angular/common";
import { ROUTER_PROVIDERS } from "@angular/router-deprecated";
import { FIREBASE_PROVIDERS, defaultFirebase, AuthMethods, AuthProviders, firebaseAuthConfig } from "angularfire2";
import { SERVICE_PROVIDER } from "./services/bootstrapServices"

import {AppComponent} from './app/app'

bootstrap(AppComponent, [
    HTTP_PROVIDERS,
    FORM_PROVIDERS,
    ROUTER_PROVIDERS,
    FIREBASE_PROVIDERS,
    defaultFirebase('https://superwireapp.firebaseio.com'),
    firebaseAuthConfig({ provider: AuthProviders.Password, method: AuthMethods.Password }),
    SERVICE_PROVIDER
]);