import { Component, Input, OnInit } from '@angular/core';
import { ChessService } from 'src/app/services/chess.service';
import { Info } from 'src/models/info';
import { Space } from 'src/models/space';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {

  files: string[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  ranks: number[] = [8, 7, 6, 5, 4, 3, 2, 1];

  pieces: Info[] = [];

  selectedPiece: Info = new Info();

  started: boolean = false;
  isYourTurn: boolean = false;

  allSpaces: Space[] = [];
  playableSpaces: Space[] = [];

  takenPieces: Info[] = [];

  @Input() userInfo: any = {}
  @Input() gameInfo: any = {}

  constructor(private cs: ChessService) {
    this.cs.madeMove.subscribe((data) => {
      this.gameInfo.turn = data.nextTurn
      this.pieces[data.index].rank = data.rank;
      this.pieces[data.index].file = data.file;
      this.pieces[data.index].hasMoved = true;
      this.playableSpaces = [];

      let pieceSpaceIndex = this.allSpaces.findIndex(x => x.rank === data.rank && x.file === data.file);
      let clickedSpaceIndex = this.allSpaces.findIndex(x => x.rank === data.rank && x.file === data.file);
      this.allSpaces[pieceSpaceIndex].hasPiece = false; // old space
      this.allSpaces[clickedSpaceIndex].hasPiece = true; // new space
      this.allSpaces.map(x => x.isTakeable = false);

      if(data.nextTurn === this.userInfo.username) {
        this.isYourTurn = true
      }
      else {
        this.isYourTurn = false
      }
      let letter = ''
      if(this.pieces[data.index].type === 'knight') {
        letter = 'N'
      }
      else {
        letter = this.pieces[data.index].type[0].toUpperCase()
      }
      console.log(`Move recieved: ${data.username} moves ${letter}${data.file}${data.rank}`)
    })
  }

  ngOnInit(): void {
    this.initBlackPieces();
    this.initWhitePieces();
    this.initAllSpaces();

    if(this.userInfo.color === 'White') {
      this.isYourTurn = true
    }
  }

  makeMove(index: number, file: string, rank: number) {
    this.cs.makeMove(this.gameInfo.room, this.userInfo.username, index, file, rank)
  }

  // main logic
  spaceClicked(file: string, rank: number) {
    if(!this.isYourTurn) return 

    let piece = this.getPiece(file, rank);
    let clickedSpaceIndex = this.allSpaces.findIndex(x => x.rank === rank && x.file === file);
    if (piece) {
      if(this.userInfo.color.toUpperCase() !== piece.color.toUpperCase()) {
        return
      }
      else {
        this.selectedPiece = piece
      }
      this.findMoves(piece);
      // this.playableSpaces = this.filterPlayableSpaces();
    }
    let isSpacePlayable = this.playableSpaces.filter(x => x.file === file && x.rank === rank)[0];
    if (isSpacePlayable) {
      if (this.allSpaces[clickedSpaceIndex].isTakeable) {
        let takeablePiece = this.getPiece(file, rank);
        this.pieces = this.pieces.filter(x => x !== takeablePiece);
        this.takenPieces.push(takeablePiece as Info);
      };
      let index = this.pieces.findIndex(x => x.rank === this.selectedPiece.rank && x.file === this.selectedPiece.file);
      let pieceSpaceIndex = this.allSpaces.findIndex(x => x.rank === this.selectedPiece.rank && x.file === this.selectedPiece.file);
      if (index || index === 0) { // clicked space is playable
        this.pieces[index].rank = rank;
        this.pieces[index].file = file;
        this.pieces[index].hasMoved = true;
        this.makeMove(index, file, rank)
        this.playableSpaces = [];
        this.allSpaces[pieceSpaceIndex].hasPiece = false; // old space
        this.allSpaces[clickedSpaceIndex].hasPiece = true; // new space
        this.allSpaces.map(x => x.isTakeable = false);
      };
    }
  }

  findMoves(piece: Info) {
    this.getPlayableSpaces(piece)
  }

  getPlayableSpaces(piece: Info) {
    if (piece.isPawn()) {
      this.playableSpaces = this.getPawnMoves(piece);
    } else if (piece.isKnight()) {
      this.playableSpaces = this.getKnightMoves(piece.file, piece.rank);
    } else if (piece.isBishop()) {
      this.playableSpaces = this.getBishopMoves(piece.file, piece.rank);
    } else if (piece.isRook()) {
      this.playableSpaces = this.getRookMoves(piece.file, piece.rank);
    } else if (piece.isQueen()) {
      this.playableSpaces = this.getQueenMoves(piece.file, piece.rank);
    } else {
      this.playableSpaces = this.getKingMoves(piece.file, piece.rank);
    };
  }

  // piece moves
  getPawnMoves(piece: Info) : Space[] {
    let spaces: Space[] = [];
    let multiplier: number = piece.color === 'white' ? 1 : -1;
    let firstSpace = this.allSpaces.find(x => x.file === piece.file && x.rank === piece.rank + 1*multiplier);
    let secondSpace = this.allSpaces.find(x => x.file === piece.file && x.rank === piece.rank + 2*multiplier);
    if (!piece.hasMoved) {
      if (!firstSpace?.hasPiece) {
        spaces.push(new Space(piece.file, piece.rank + 1*multiplier));
      };
      if (!firstSpace?.hasPiece && !secondSpace?.hasPiece) {
        spaces.push(new Space(piece.file, piece.rank + 2*multiplier));
      };
    } else {
      if (!firstSpace?.hasPiece) {
        spaces.push(new Space(piece.file, piece.rank + 1*multiplier));
      };
    };
    return spaces;
  }

  getKnightMoves(file: string, rank: number) : Space[] {
    let spaces: Space[] = [];
    let validSpaces = [[1, 2], [-1, 2], [-2, 1], [2, 1], [1, -2], [-1, -2], [-2, -1], [2, -1]];
    for (let [vertical, horizontal] of validSpaces) {
      let targetFile = this.files[this.getFileIndex(file) + vertical];
      let targetRank = rank + horizontal;
      let allSpacesIndex = this.allSpaces.findIndex(x => x.rank === targetRank && x.file === targetFile);
      if (targetFile && targetRank && this.allSpaces[allSpacesIndex]) {
        if (!this.allSpaces[allSpacesIndex].hasPiece) {
          let targetPiece = this.getPiece(targetFile, targetRank);
          if (this.selectedPiece.color !== targetPiece?.color) {
            spaces.push(new Space(targetFile, targetRank));
          }
        } else {
          let targetPiece = this.getPiece(targetFile, targetRank);
          if (this.selectedPiece.color !== targetPiece?.color) {
            this.allSpaces[allSpacesIndex].isTakeable = true;
            spaces.push(new Space(targetFile, targetRank));
          }
        }
      }
    }
    return spaces;
  }

  getBishopMoves(file: string, rank: number) : Space[] {
    let spaces: Space[] = [];
    let upRightValid: boolean = true;
    let upLeftValid: boolean = true;
    let downLeftValid: boolean = true;
    let downRightValid: boolean = true;
    for (var i = 1; i < 8; i++) {
      // up right diagonal
      if (upRightValid) {
        let [isValid, space] = this.getLongMoves(file, rank, i, [1, 1], upRightValid);
        upRightValid = isValid;
        spaces.push(space);
      }
      // up left diagonal
      if (upLeftValid) {
        let [isValid, space] = this.getLongMoves(file, rank, i, [-1, 1], upLeftValid);
        upLeftValid = isValid;
        spaces.push(space);
      }
      // down left diagonal
      if (downLeftValid) {
        let [isValid, space] = this.getLongMoves(file, rank, i, [-1, -1], downLeftValid);
        downLeftValid = isValid;
        spaces.push(space);
      }
      // down right diagonal
      if (downLeftValid) {
        let [isValid, space] = this.getLongMoves(file, rank, i, [1, -1], downRightValid);
        downRightValid = isValid;
        spaces.push(space);
      }
    };
    return spaces
  }

  getRookMoves(file: string, rank: number) : Space[] {
    let spaces: Space[] = [];
    let upValid: boolean = true;
    let downValid: boolean = true;
    let leftValid: boolean = true;
    let rightValid: boolean = true;
    for (var i = 1; i < 8; i++) {
      // up
      if (upValid) {
        let [isValid, space] = this.getLongMoves(file, rank, i, [0, 1], upValid);
        upValid = isValid;
        spaces.push(space);
      }
      // down
      if (downValid) {
        let [isValid, space] = this.getLongMoves(file, rank, i, [0, -1], downValid);
        downValid = isValid;
        spaces.push(space);
      }
      // left
      if (leftValid) {
        let [isValid, space] = this.getLongMoves(file, rank, i, [-1, 0], leftValid);
        leftValid = isValid;
        spaces.push(space);
      }
      // right
      if (rightValid) {
        let [isValid, space] = this.getLongMoves(file, rank, i, [1, 0], rightValid);
        rightValid = isValid;
        spaces.push(space);
      }
    }
    return spaces;
  }

  getLongMoves(file: string, rank: number, i: number, multipliers: [number, number], isValid: boolean) : [boolean, Space] {
    let targetFile = this.files[this.getFileIndex(file) + i*multipliers[0]];
    if (targetFile === undefined) {
      isValid = false;
    }
    let targetRank = rank + i*multipliers[1];
    if (!this.ranks.includes(targetRank)) {
      isValid = false;
    }
    let allSpacesIndex = this.allSpaces.findIndex(x => x.rank === targetRank && x.file === targetFile);
    if (isValid && this.allSpaces[allSpacesIndex].hasPiece) {
      let targetPiece = this.getPiece(targetFile, targetRank);
      if (this.selectedPiece.color === targetPiece?.color) {
        isValid = false;
      }
    }
    return [isValid, new Space(targetFile, targetRank)]
  }

  getQueenMoves(file: string, rank: number) : Space[] {
    let spaces: Space[] = [];
    spaces.push(...this.getBishopMoves(file, rank));
    spaces.push(...this.getRookMoves(file, rank));
    return spaces;
  }

  getKingMoves(file: string, rank: number) : Space[] {
    let spaces: Space[] = [];
    let validSpaces = [[-1, 1], [1, 1], [0, 1], [0, -1], [-1, 0], [1, 0], [-1, -1], [1, -1]];
    for (let [vertical, horizontal] of validSpaces) {
      let targetFile = this.files[this.getFileIndex(file) + vertical];
      let targetRank = rank + horizontal;
      let allSpacesIndex = this.allSpaces.findIndex(x => x.rank === targetRank && x.file === targetFile);
      if (targetFile && targetRank && this.allSpaces[allSpacesIndex]) {
        if (!this.allSpaces[allSpacesIndex].hasPiece) {
          let targetPiece = this.getPiece(targetFile, targetRank);
          if (this.selectedPiece.color !== targetPiece?.color) {
            spaces.push(new Space(targetFile, targetRank));
          }
        }
      }
    }
    return spaces;
  }

  // filterPlayableSpaces() : Space[] {
  //   for (let space of this.playableSpaces) {
      
  //   }
  // }

  // helpers
  getFileIndex(file: string) {
    return this.files.indexOf(file);
  }

  isPlayable(file: string, rank: number) : boolean {
    if (this.playableSpaces.some(x => x.file === file && x.rank === rank)) {
      return true
    }
    return false
  }

  getPiece(file: string, rank: number) : Info | undefined {
    return this.pieces.filter(x => x.file === file && x.rank === rank)[0];
  }

  reset() {
    this.started = false;
    this.allSpaces = [];
    this.playableSpaces = [];
    this.pieces = [];
    this.selectedPiece = new Info();
    this.takenPieces = [];
    this.initBlackPieces();
    this.initWhitePieces();
    this.initAllSpaces();
  }

  // initial functions
  initBlackPieces() {
    // pawns
    for (let file of this.files) {
      this.pieces.push(new Info('black', 'pawn', file, 7))
    };
    // rooks
    this.pieces.push(new Info('black', 'rook', 'a', 8));
    this.pieces.push(new Info('black', 'rook', 'h', 8));
    // knights
    this.pieces.push(new Info('black', 'knight', 'b', 8));
    this.pieces.push(new Info('black', 'knight', 'g', 8));
    // bishops
    this.pieces.push(new Info('black', 'bishop', 'c', 8));
    this.pieces.push(new Info('black', 'bishop', 'f', 8));
    // queen
    this.pieces.push(new Info('black', 'queen', 'd', 8));
    // king
    this.pieces.push(new Info('black', 'king', 'e', 8));
  }

  initWhitePieces() {
    // pawns
    for (let file of this.files) {
      this.pieces.push(new Info('white', 'pawn', file, 2))
    };
    // rooks
    this.pieces.push(new Info('white', 'rook', 'a', 1));
    this.pieces.push(new Info('white', 'rook', 'h', 1));
    // knights
    this.pieces.push(new Info('white', 'knight', 'b', 1));
    this.pieces.push(new Info('white', 'knight', 'g', 1));
    // bishops
    this.pieces.push(new Info('white', 'bishop', 'c', 1));
    this.pieces.push(new Info('white', 'bishop', 'f', 1));
    // queen
    this.pieces.push(new Info('white', 'queen', 'd', 1));
    // king
    this.pieces.push(new Info('white', 'king', 'e', 1));
  }

  initAllSpaces() {
    this.files.forEach((file, y) => {
      this.ranks.forEach((rank, x) => {
        if (this.getPiece(file, rank)) {
          this.allSpaces.push(new Space(file, rank, true, false, x, y));
        } else {
          this.allSpaces.push(new Space(file, rank, false, false, x, y));
        }
      })
    })
  }

}
