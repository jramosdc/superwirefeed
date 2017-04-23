import { SearchCategory } from './searchCategory';
import { DatePipe } from '@angular/common';
import { OrderByPipe } from './orderby';
import { SearchPostTitlePipe } from './searchPostTitle';

export const ApplicationPipes: Array<any> = [
    SearchCategory,
    OrderByPipe,
    DatePipe,
    SearchPostTitlePipe
]