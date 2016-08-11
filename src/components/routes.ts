// <reference path="../../typings/index.d.ts">

import { Routes } from '@angular/router';

import { FeedsComponent } from './feeds/feeds';
import { PostsComponent } from './posts/posts';
import { NewPostComponent } from './newpost/newpost';
import { EditPostComponent } from './editpost/editpost';
import { ViewPostComponent } from './viewpost/viewpost';
import { ProfileComponent } from './profile/profile';

export const AppRoutes: Routes = [
  { path: "feeds", component: FeedsComponent },
  { path: "newpost", component: NewPostComponent },
  { path: "posts/:feedid", component: PostsComponent },
  { path: "editpost/:postid", component: EditPostComponent },
  { path: "post/:postid", component: ViewPostComponent },
  { path: "profile/:userid", component: ProfileComponent },
  { path: "", redirectTo: "feeds", terminal: true }
];

export const ApplicationComponents = [FeedsComponent, PostsComponent, NewPostComponent, EditPostComponent, ViewPostComponent, ProfileComponent];