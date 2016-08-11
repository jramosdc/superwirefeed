import { SearchCategory } from './searchCategory';
import { DatePipe } from "@angular/common";
import { OrderBy } from "./orderby";
import { SearchPostTitlePipe } from './searchPostTitle';


export const ApplicationPipes: Array<any> = [
    SearchCategory,
    OrderBy,
    DatePipe,
    SearchPostTitlePipe
]