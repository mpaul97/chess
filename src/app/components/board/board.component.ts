import { Component, Input, OnInit } from '@angular/core';
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
  isWhiteMove: boolean = true;

  allSpaces: Space[] = [];
  playableSpaces: Space[] = [];

  takenPieces: Info[] = [];

  constructor() {}

  ngOnInit(): void {
    this.initBlackPieces();
    this.initWhitePieces();
    this.initAllSpaces();
    this.takenPieces.push(...this.pieces);
  }

  // main logic
  spaceClicked(file: string, rank: number) {
    let piece = this.getPiece(file, rank);
    let clickedSpaceIndex = this.allSpaces.findIndex(x => x.rank === rank && x.file === file);
    if (piece) {
      if (this.isWhiteMove && piece.color === 'white') {
        this.selectedPiece = piece;
      } else if (!this.isWhiteMove && piece.color === 'black') {
        this.selectedPiece = piece;
      }
      this.findMoves(piece);
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
        this.isWhiteMove = !this.isWhiteMove;
        this.playableSpaces = [];
        this.allSpaces[pieceSpaceIndex].hasPiece = false; // old space
        this.allSpaces[clickedSpaceIndex].hasPiece = true; // new space
        this.allSpaces.map(x => x.isTakeable = false);
      };
    }
  }

  findMoves(piece: Info) {
    if (this.isWhiteMove) { // white to move
      if (piece.isWhite()) {
        this.getPlayableSpaces(piece);
      }
    } else { // black to move
      if (!piece.isWhite()) {
        this.getPlayableSpaces(piece);
      }
    }
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
    for (var i = 1; i < 8; i++) {
      // up right diagonal
      let targetFile = this.files[this.getFileIndex(file) + i];
      if (targetFile === undefined) {
        break;
      }
      let targetRank = rank + i;
      if (!this.ranks.includes(targetRank)) {
        break;
      }
      let allSpacesIndex = this.allSpaces.findIndex(x => x.rank === targetRank && x.file === targetFile);
      if (this.allSpaces[allSpacesIndex].hasPiece) {
        let targetPiece = this.getPiece(targetFile, targetRank);
        if (this.selectedPiece.color === targetPiece?.color) {
          break;
        }
      }
      spaces.push(new Space(targetFile, targetRank));
    };
    // up left diagonal
    for (var i = 1; i < 8; i++) {
      let targetFile = this.files[this.getFileIndex(file) - i];
      if (targetFile === undefined) {
        break;
      }
      let targetRank = rank + i;
      if (!this.ranks.includes(targetRank)) {
        break;
      }
      let allSpacesIndex = this.allSpaces.findIndex(x => x.rank === targetRank && x.file === targetFile);
      if (this.allSpaces[allSpacesIndex].hasPiece) {
        let targetPiece = this.getPiece(targetFile, targetRank);
        if (this.selectedPiece.color === targetPiece?.color) {
          break;
        }
      }
      spaces.push(new Space(targetFile, targetRank));
    };
    // down left diagonal
    for (var i = 1; i < 8; i++) {
      let targetFile = this.files[this.getFileIndex(file) - i];
      if (targetFile === undefined) {
        break;
      }
      let targetRank = rank - i;
      if (!this.ranks.includes(targetRank)) {
        break;
      }
      let allSpacesIndex = this.allSpaces.findIndex(x => x.rank === targetRank && x.file === targetFile);
      if (this.allSpaces[allSpacesIndex].hasPiece) {
        let targetPiece = this.getPiece(targetFile, targetRank);
        if (this.selectedPiece.color === targetPiece?.color) {
          break;
        }
      }
      spaces.push(new Space(targetFile, targetRank));
    };
    // down right diagonal
    for (var i = 1; i < 8; i++) {
      let targetFile = this.files[this.getFileIndex(file) + i];
      if (targetFile === undefined) {
        break;
      }
      let targetRank = rank - i;
      if (!this.ranks.includes(targetRank)) {
        break;
      }
      let allSpacesIndex = this.allSpaces.findIndex(x => x.rank === targetRank && x.file === targetFile);
      if (this.allSpaces[allSpacesIndex].hasPiece) {
        let targetPiece = this.getPiece(targetFile, targetRank);
        if (this.selectedPiece.color === targetPiece?.color) {
          break;
        }
      }
      spaces.push(new Space(targetFile, targetRank));
    };
    return spaces
  }

  getRookMoves(file: string, rank: number) : Space[] {
    let spaces: Space[] = [];
    // up
    for (var i = 1; i < 8; i++) {
      let targetFile = this.files[this.getFileIndex(file)];
      if (targetFile === undefined) {
        break;
      }
      let targetRank = rank + i;
      if (!this.ranks.includes(targetRank)) {
        break;
      }
      let allSpacesIndex = this.allSpaces.findIndex(x => x.rank === targetRank && x.file === targetFile);
      if (this.allSpaces[allSpacesIndex].hasPiece) {
        let targetPiece = this.getPiece(targetFile, targetRank);
        if (this.selectedPiece.color === targetPiece?.color) {
          break;
        }
      }
      spaces.push(new Space(targetFile, targetRank));
    };
    // down
    for (var i = 1; i < 8; i++) {
      let targetFile = this.files[this.getFileIndex(file)];
      if (targetFile === undefined) {
        break;
      }
      let targetRank = rank - i;
      if (!this.ranks.includes(targetRank)) {
        break;
      }
      let allSpacesIndex = this.allSpaces.findIndex(x => x.rank === targetRank && x.file === targetFile);
      if (this.allSpaces[allSpacesIndex].hasPiece) {
        let targetPiece = this.getPiece(targetFile, targetRank);
        if (this.selectedPiece.color === targetPiece?.color) {
          break;
        }
      }
      spaces.push(new Space(targetFile, targetRank));
    };
    // right
    for (var i = 1; i < 8; i++) {
      let targetFile = this.files[this.getFileIndex(file) + i];
      if (targetFile === undefined) {
        break;
      }
      let targetRank = rank;
      if (!this.ranks.includes(targetRank)) {
        break;
      }
      let allSpacesIndex = this.allSpaces.findIndex(x => x.rank === targetRank && x.file === targetFile);
      if (this.allSpaces[allSpacesIndex].hasPiece) {
        let targetPiece = this.getPiece(targetFile, targetRank);
        if (this.selectedPiece.color === targetPiece?.color) {
          break;
        }
      }
      spaces.push(new Space(targetFile, targetRank));
    };
    // left
    for (var i = 1; i < 8; i++) {
      let targetFile = this.files[this.getFileIndex(file) - i];
      if (targetFile === undefined) {
        break;
      }
      let targetRank = rank;
      if (!this.ranks.includes(targetRank)) {
        break;
      }
      let allSpacesIndex = this.allSpaces.findIndex(x => x.rank === targetRank && x.file === targetFile);
      if (this.allSpaces[allSpacesIndex].hasPiece) {
        let targetPiece = this.getPiece(targetFile, targetRank);
        if (this.selectedPiece.color === targetPiece?.color) {
          break;
        }
      }
      spaces.push(new Space(targetFile, targetRank));
    };
    return spaces;
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
    this.isWhiteMove = true;
    this.allSpaces = [];
    this.playableSpaces = [];
    this.pieces = [];
    this.selectedPiece = new Info();
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
