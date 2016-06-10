import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'searchPostTitle'
})
export class SearchPostTitlePipe implements PipeTransform {
	transform(values, args?) {
        let filter = args;
        return filter ? values.filter(value=> value.title.toLocaleLowerCase().indexOf(filter) != -1) : values;
	}
}