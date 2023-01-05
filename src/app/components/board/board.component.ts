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

  constructor() {}

  ngOnInit(): void {
    this.initBlackPieces();
    this.initWhitePieces();
    this.initAllSpaces();
  }

  spaceClicked(file: string, rank: number) {
    let piece = this.getPiece(file, rank);
    if (piece) {
      this.findMoves(piece);
      this.selectedPiece = piece;
    } 
    let isSpacePlayable = this.playableSpaces.filter(x => x.file === file && x.rank === rank)[0];
    if (isSpacePlayable) {
      let index = this.pieces.findIndex(x => x.rank === this.selectedPiece.rank && x.file === this.selectedPiece.file);
      let pieceSpaceIndex = this.allSpaces.findIndex(x => x.rank === this.selectedPiece.rank && x.file === this.selectedPiece.file);
      let clickedSpaceIndex = this.allSpaces.findIndex(x => x.rank === rank && x.file === file);
      if (index) { // clicked space is playable
        this.pieces[index].rank = rank;
        this.pieces[index].file = file;
        this.pieces[index].hasMoved = true;
        this.isWhiteMove = !this.isWhiteMove;
        this.playableSpaces = [];
        this.allSpaces[pieceSpaceIndex].hasPiece = false; // old space
        this.allSpaces[clickedSpaceIndex].hasPiece = true; // new space
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
      if (piece.isWhite()) {
        if (!piece.hasMoved) {
          this.playableSpaces = [new Space(piece.file, piece.rank + 1), new Space(piece.file, piece.rank + 2)];
        } else {
          this.playableSpaces = [new Space(piece.file, piece.rank + 1)];
        }
      } else {
        if (!piece.hasMoved) {
          this.playableSpaces = [new Space(piece.file, piece.rank - 1), new Space(piece.file, piece.rank - 2)];
        } else {
          this.playableSpaces = [new Space(piece.file, piece.rank - 1)];
        }
      }
    } else if (piece.isKnight()) {
      this.playableSpaces = this.getKnightMoves(piece.file, piece.rank);
    } else if (piece.isBishop()) {
      this.playableSpaces = this.getBishopMoves(piece.file, piece.rank);
    }
  }

  getKnightMoves(file: string, rank: number) : Space[] {
    return [
      new Space(this.files[this.getFileIndex(file) + 1], rank + 2),
      new Space(this.files[this.getFileIndex(file) - 1], rank + 2),
      new Space(this.files[this.getFileIndex(file) - 2], rank + 1),
      new Space(this.files[this.getFileIndex(file) + 2], rank + 1),
      new Space(this.files[this.getFileIndex(file) + 1], rank - 2),
      new Space(this.files[this.getFileIndex(file) - 1], rank - 2),
      new Space(this.files[this.getFileIndex(file) - 2], rank - 1),
      new Space(this.files[this.getFileIndex(file) + 2], rank - 1)
    ]
  }

  getBishopMoves(file: string, rank: number) : Space[] {
    let spaces: Space[] = [];
    for (var i = 1; i < 8; i++) {
      let targetFile = this.files[this.getFileIndex(file) + i];
      let targetRank = rank + i;
      let allSpacesIndex = this.allSpaces.indexOf(x => x.file === targetFile && x.rank === targetRank);
      if (this.allSpaces[allSpacesIndex].hasPiece) {

      }
      spaces.push(new Space(targetFile, targetRank);
    }
    // return [
    //   new Space(this.files[this.getFileIndex(file) + 1], rank + 1)
    // ]
    return spaces
  }

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
          this.allSpaces.push(new Space(file, rank, true, x, y));
        } else {
          this.allSpaces.push(new Space(file, rank, false, x, y));
        }
      })
    })
  }

}
