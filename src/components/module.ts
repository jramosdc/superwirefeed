import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AngularFireModule, AuthProviders, AuthMethods } from 'angularfire2';
import { EditorModule, SharedModule } from 'primeng/primeng';

import { AppComponent } from './app/app';
import { ApplicationComponents, AppRoutes } from './routes';
import { ApplicationServices } from './services/bootstrapServices';
import { ApplicationDirectives } from './directives/sharedDirectives';
import { TagInputComponent } from './tag-input/tag-input.component';
import { TagInputItemComponent } from './tag-input/tag-input-item.component';
import { RatingModule } from 'ngx-rating';

// import { ApplicationPipes } from './pipes/sharedPipes';

// pipes
import { SearchCategory } from './pipes/searchCategory';
import { OrderByPipe } from './pipes/orderby';
import { SearchPostTitlePipe } from './pipes/searchPostTitle';
import { ObjectToArray } from './pipes/objectToArrays';
import { TruncatePipe } from './pipes/truncate';


@NgModule({
  imports: [
    BrowserModule
    , RouterModule.forRoot(AppRoutes)
    , FormsModule
    , HttpModule
    , AngularFireModule.initializeApp(
      {
        apiKey: 'AIzaSyCAmbNu5u6Pqguv3jRLx9ElyhhnIyIZnEo',
        authDomain: 'superwireapp.firebaseapp.com',
        databaseURL: 'https://superwireapp.firebaseio.com',
        storageBucket: 'superwireapp.appspot.com',
      }
      , {
        provider: AuthProviders.Password,
        method: AuthMethods.Password
      })
    , EditorModule, SharedModule
    , RatingModule
  ]
  , declarations: [AppComponent, ...ApplicationComponents, ...ApplicationDirectives, TagInputComponent, TagInputItemComponent,
    // pipes
    SearchCategory, OrderByPipe, SearchPostTitlePipe, ObjectToArray, TruncatePipe
  ]
  , providers: [...ApplicationServices]
  , bootstrap: [AppComponent]
})
export class AppModule { }
