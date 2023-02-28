import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'chessNotation'
})
export class ChessNotationPipe implements PipeTransform {

  transform(move: any): string {
    let notation: string = ""

    notation = `${move.letter === 'P' ? '' : move.letter}` +
               `${move.didTake ? 'x' : ''}` +
               `${move.file}` +
               `${move.rank}`

    return notation
  }

}
