import { Pipe, PipeTransform } from '@angular/core';
import { FishCapture } from '../models/fish-capture';
import { User } from '../models/user';

@Pipe({
  name: 'userFilter'
})
export class UserFilterPipe implements PipeTransform {
  transform(captures: FishCapture[], users: User[], search: string): FishCapture[] {
    if (!search) return captures;
    const lower = search.toLowerCase();
    return captures.filter(capture => {
      const user = users.find(u => u.id === capture.userId);
      return user?.fullName.toLowerCase().includes(lower);
    });
  }
}
