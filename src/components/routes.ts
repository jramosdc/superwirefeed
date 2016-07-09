import { provideRouter, RouterConfig }  from '@angular/router';

import { FeedsComponent } from './feeds/feeds';
import { PostsComponent } from './posts/posts';
import { NewPostComponent } from './newpost/newpost';
import { EditPostComponent } from './editpost/editpost';
import { ViewPostComponent } from './viewpost/viewpost';
import { ProfileComponent } from './profile/profile';

const routes: RouterConfig = [
  { path: "feeds", component: FeedsComponent },
  { path: "newpost", component: NewPostComponent },
  { path: "posts/:feedid", component: PostsComponent },
  { path: "editpost/:postid", component: EditPostComponent },
  { path: "post/:postid", component: ViewPostComponent },
  { path: "profile/:userid", component: ProfileComponent },
  { path: "", redirectTo: "feeds", terminal: true }
];

export const APP_ROUTER_PROVIDERS = [
  provideRouter(routes)
];