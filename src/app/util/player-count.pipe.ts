import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'playerCount'
})
export class PlayerCountPipe implements PipeTransform {

  transform(room: any): number {
    let count = 0
    if(room.playerOne) {
      count++
    }
    if(room.playerTwo) {
      count++
    }
    return count
  }

}
