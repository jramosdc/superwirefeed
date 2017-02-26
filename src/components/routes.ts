import { Routes } from '@angular/router';

import { UiKit } from './uikit/uikit';
import { RegFlow } from './regflow/regflow.ts';
import { FeedsComponent } from './feeds/feeds';
import { PostsComponent } from './posts/posts';
import { FullPostComponent } from './fullpost/fullpost';
import { NewPostComponent } from './newpost/newpost';
import { EditPostComponent } from './editpost/editpost';
import { ViewPostComponent } from './viewpost/viewpost';
import { ProfileComponent } from './profile/profile';
import { SubscriptionComponent } from './subscription/subscription';

export const AppRoutes: Routes = [
  { path: "uikit", component: UiKit },
  { path: "regflow", component: RegFlow },
  { path: "feeds", component: FeedsComponent },
  { path: "newpost", component: NewPostComponent },
  { path: "posts/:feedid", component: PostsComponent },
  { path: "fullpost/:feedid", component: FullPostComponent },
  { path: "editpost/:postid", component: EditPostComponent },
  { path: "post/:postid", component: ViewPostComponent },
  { path: "profile/:userid", component: ProfileComponent },
  { path: "subscription/:postid", component: SubscriptionComponent },
  { path: "", redirectTo: "feeds", pathMatch: 'full' }
];

export const ApplicationComponents = [UiKit, FeedsComponent, PostsComponent, FullPostComponent, NewPostComponent, EditPostComponent, ViewPostComponent, ProfileComponent, SubscriptionComponent];
