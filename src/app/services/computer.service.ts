import { Injectable } from '@angular/core';
import { Info } from 'src/models/info';
import { Space } from 'src/models/space';

@Injectable({
  providedIn: 'root'
})
export class ComputerService {

  constructor() {

  }

  getRandomInt(max: number) : number {
    return Math.floor(Math.random() * max);
  }

  getComputerPieceSpace(pieces: Info[]) : [string, number] {
    let tempPieces = pieces.filter(x => !x.isWhite());
    let targetPiece = tempPieces[this.getRandomInt(tempPieces.length)];
    return [targetPiece.file, targetPiece.rank];
  };

  getComputerPlayableSpace(playableSpaces: Space[]) : [string, number] {
    let targetSpace = playableSpaces[this.getRandomInt(playableSpaces.length)];
    return [targetSpace.file, targetSpace.rank];
  };

}
