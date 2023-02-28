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

  whiteTakeableSpaces: Space[] = [];
  blackTakeableSpaces: Space[] = [];

  allWhitePlayableSpaces: Space[] = [];
  allBlackPlayableSpaces: Space[] = [];

  isSaving: boolean = false;

  takenPieces: Info[] = [];
  whiteInCheck: boolean = false;
  blackInCheck: boolean = false;

  // in check, no blocking or taking moves, no king moves
  whiteInMate: boolean = false;
  blackInMate: boolean = false;

  @Input() userInfo: any = {}
  @Input() gameInfo: any = {}
  moves: any[] = new Array()
  messages: any[] = new Array()
  inputMessage: string = ""
  isChat: boolean = false
  gameInfoControls: any = [
    {name: "Moves", value: false},
    {name: "Chat", value: true}
  ]
  // TODO: EMOTES!!!!
  constructor(private cs: ChessService) {

    // for(let i = 0; i < 100; i++) {
    //   this.moves.push({
    //     username: 'username',
    //     letter: 'A',
    //     file: 2,
    //     rank: 2
    //   })
    // }
    this.cs.madeMove.subscribe((data) => {
      this.gameInfo.turn = data.nextTurn

      let pieceSpaceIndex = data.oldIndex // old

      this.pieces[data.index].rank = data.rank;
      this.pieces[data.index].file = data.file;
      this.pieces[data.index].hasMoved = true;

      let clickedSpaceIndex = this.allSpaces.findIndex(x => x.rank === data.rank && x.file === data.file); // new

      this.playableSpaces = [];
      this.whiteTakeableSpaces = [];
      this.blackTakeableSpaces = [];

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
      this.moves.push({
        username: data.username,
        letter: letter,
        file: data.file,
        rank: data.rank,
        didTake: data.didTake
      })
      console.log(`Move recieved: ${data.username} moves ${letter}${data.file}${data.rank}`)
    })
    this.cs.pieceTaken.subscribe((data: any) => {
      if(data.username === this.userInfo.username) return 
      console.log(`Take recieved: ${data.username} takes ${JSON.stringify(data.takeablePiece)}`)

      let index = this.pieces.findIndex(piece => 
                piece.color === data.takeablePiece.color &&
                piece.rank === data.takeablePiece.rank &&
                piece.file === data.takeablePiece.file &&
                piece.type === data.takeablePiece.type &&
                piece.hasMoved === data.takeablePiece.hasMoved &&
                piece.isProtected === data.takeablePiece.isProtected
      )
      this.pieces.splice(index, 1)
      this.takenPieces.push(data.takeablePiece as Info);
    })
    this.cs.otherPartyDisconnect.subscribe(() => {
      location.reload()
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

  makeMove(index: number, file: string, rank: number, oldIndex: number, didTake: boolean) {
    this.cs.makeMove(this.gameInfo.room, this.userInfo.username, index, file, rank, oldIndex, didTake)
  }
  // main logic
  spaceClicked(file: string, rank: number) {
    if(!this.isYourTurn) return 
    let didTake: boolean = false

    if (this.whiteInMate) {
      console.log("White is Mated!!!");
      return;
    } else if (this.blackInMate) {
      console.log("Black is Mated!!!");
      return;
    }
    let piece = this.getPiece(file, rank);
    // new index
    let clickedSpaceIndex = this.allSpaces.findIndex(x => x.rank === rank && x.file === file);

    if (piece && !this.allSpaces[clickedSpaceIndex].isTakeable) {
      if(this.userInfo.color.toUpperCase() !== piece.color.toUpperCase()) {
        return
      }
      else {
        this.selectedPiece = piece
      }
      this.findMoves(piece);
    };
    let isSpacePlayable = this.playableSpaces.find(space => (space.rank === rank) && (space.file === file));
    if (isSpacePlayable) {
      if (this.allSpaces[clickedSpaceIndex].isTakeable) {
        let takeablePiece = this.getPiece(file, rank);
        this.pieces = this.pieces.filter(x => x !== takeablePiece);
        this.takenPieces.push(takeablePiece as Info);
        didTake = true
        this.cs.takePiece(takeablePiece as Info, this.gameInfo.room, this.userInfo.username)
      };
      let index = this.pieces.findIndex(x => x.rank === this.selectedPiece.rank && x.file === this.selectedPiece.file);
      // old index
      let pieceSpaceIndex = this.allSpaces.findIndex(x => x.rank === this.selectedPiece.rank && x.file === this.selectedPiece.file);
      if (index || index === 0) { // clicked space is playable
        this.pieces[index].rank = rank;
        this.pieces[index].file = file;
        this.pieces[index].hasMoved = true;
        this.makeMove(index, file, rank, pieceSpaceIndex, didTake)
        this.playableSpaces = [];
        this.whiteTakeableSpaces = [];
        this.blackTakeableSpaces = [];
        this.allWhitePlayableSpaces = [];
        this.allBlackPlayableSpaces = [];
        this.allSpaces[pieceSpaceIndex].hasPiece = false; // old space
        this.allSpaces[clickedSpaceIndex].hasPiece = true; // new space
        this.allSpaces.map(x => x.isTakeable = false);
        this.savePlayableSpaces();
        this.findAllChecks();
      };
    };
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

  savePlayableSpaces() {
    this.isSaving = true;
    for (let piece of this.pieces) {
      this.selectedPiece = piece;
      this.getPlayableSpaces(piece);
      if (piece.isPawn()) {
        let multiplier: number = piece.isWhite() ? 1 : -1;
        let firstTakeableSpace = this.allSpaces.find(x => x.file === this.files[this.getFileIndex(piece.file)-1] && x.rank === piece.rank + 1*multiplier);
        let secondTakeableSpace = this.allSpaces.find(x => x.file === this.files[this.getFileIndex(piece.file)+1] && x.rank === piece.rank + 1*multiplier);
        if (piece.isWhite()) {
          if (firstTakeableSpace) this.allWhitePlayableSpaces.push(firstTakeableSpace);
          if (secondTakeableSpace) this.allWhitePlayableSpaces.push(secondTakeableSpace);
        } else {
          if (firstTakeableSpace) this.allBlackPlayableSpaces.push(firstTakeableSpace);
          if (secondTakeableSpace) this.allBlackPlayableSpaces.push(secondTakeableSpace);
        }
      }
      for (let space of this.playableSpaces) {
        let targetPiece = this.getPiece(space.file, space.rank);
        if (space.hasPiece && targetPiece && targetPiece.color !== piece.color) {
            if (piece.isWhite()) {
              this.whiteTakeableSpaces.push(space);
            } else {
              this.blackTakeableSpaces.push(space);
            }
          }
        if (!space.hasPiece) {
          if (!piece.isPawn()) {
            if (piece.isWhite()) {
              this.allWhitePlayableSpaces.push(space);
            } else {
              this.allBlackPlayableSpaces.push(space);
            }
          }
        }
      }
    };
    this.playableSpaces = [];
    this.isSaving = false;
    this.selectedPiece = new Info();
  }

  findAllChecks() {
    this.getCheck('white', this.blackTakeableSpaces);
    this.getCheck('black', this.whiteTakeableSpaces);
  }

  getCheck(color: string, takeableSpaces: Space[]) {
    // white in check
    let king = this.pieces.find(x => x.color === color && x.isKing());
    if (king) this.getPlayableSpaces(king);
    let inTakeable = takeableSpaces.findIndex(x => x.file === king?.file && x.rank === king?.rank);
    if (inTakeable !== -1) {
      if (color === 'white') {
        this.whiteInCheck = true;
        let isCheckingPieceTakeable = !this.whiteTakeableSpaces.find(x => x.rank === this.selectedPiece.rank && x.file === this.selectedPiece.file);
        if (isCheckingPieceTakeable && this.playableSpaces.length === 0) {
          this.whiteInMate = true;
          this.whiteInCheck = false;
        }
      } else {
        this.blackInCheck = true;
        let isCheckingPieceTakeable = !this.blackTakeableSpaces.find(x => x.rank === this.selectedPiece.rank && x.file === this.selectedPiece.file)
        if (isCheckingPieceTakeable && this.playableSpaces.length === 0) {
          this.blackInMate = true;
          this.blackInCheck = false;
        }
      }
    };
    this.playableSpaces = [];
  };

  // piece moves
  getPawnMoves(piece: Info) : Space[] {
    let spaces: Space[] = [];
    let multiplier: number = piece.isWhite() ? 1 : -1;
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
    let firstTakeableSpace = this.allSpaces.find(x => x.file === this.files[this.getFileIndex(piece.file)-1] && x.rank === piece.rank + 1*multiplier);
    let secondTakeableSpace = this.allSpaces.find(x => x.file === this.files[this.getFileIndex(piece.file)+1] && x.rank === piece.rank + 1*multiplier);
    if (firstTakeableSpace) {
      spaces = this.getPawnTakeableMoves(spaces, firstTakeableSpace);
    }
    if (secondTakeableSpace) {
      spaces = this.getPawnTakeableMoves(spaces, secondTakeableSpace);
    }
    return spaces;
  }

  getPawnTakeableMoves(spaces: Space[], space: Space) {
    if (space?.hasPiece) {
      let targetPiece = this.getPiece(space.file, space.rank);
        if (this.selectedPiece.color !== targetPiece?.color) {
          spaces.push(new Space(space.file, space.rank, true, true));
          let firstTakeableSpaceIndex = this.allSpaces.findIndex(x => x === space);
          this.allSpaces[firstTakeableSpaceIndex].isTakeable = true;
        } else {
          let pieceIndex = this.pieces.findIndex(x => x === targetPiece);
          this.pieces[pieceIndex].isProtected = true;
        }
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
            spaces.push(new Space(targetFile, targetRank, true, true));
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
        let [isValid, space, isTakeable] = this.getLongMoves(file, rank, i, [1, 1], upRightValid);
        upRightValid = isValid;
        if (isValid || isTakeable) {
          spaces.push(space);
        }
      }
      // up left diagonal
      if (upLeftValid) {
        let [isValid, space, isTakeable] = this.getLongMoves(file, rank, i, [-1, 1], upLeftValid);
        upLeftValid = isValid;
        if (isValid || isTakeable) {
          spaces.push(space);
        }
      }
      // down left diagonal
      if (downLeftValid) {
        let [isValid, space, isTakeable] = this.getLongMoves(file, rank, i, [-1, -1], downLeftValid);
        downLeftValid = isValid;
        if (isValid || isTakeable) {
          spaces.push(space);
        }
      }
      // down right diagonal
      if (downRightValid) {
        let [isValid, space, isTakeable] = this.getLongMoves(file, rank, i, [1, -1], downRightValid);
        downRightValid = isValid;
        if (isValid || isTakeable) {
          spaces.push(space);
        }
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
        let [isValid, space, isTakeable] = this.getLongMoves(file, rank, i, [0, 1], upValid);
        upValid = isValid;
        if (isValid || isTakeable) {
          spaces.push(space);
        }
      }
      // down
      if (downValid) {
        let [isValid, space, isTakeable] = this.getLongMoves(file, rank, i, [0, -1], downValid);
        downValid = isValid;
        if (isValid || isTakeable) {
          spaces.push(space);
        }
      }
      // left
      if (leftValid) {
        let [isValid, space, isTakeable] = this.getLongMoves(file, rank, i, [-1, 0], leftValid);
        leftValid = isValid;
        if (isValid || isTakeable) {
          spaces.push(space);
        }
      }
      // right
      if (rightValid) {
        let [isValid, space, isTakeable] = this.getLongMoves(file, rank, i, [1, 0], rightValid);
        rightValid = isValid;
        if (isValid || isTakeable) {
          spaces.push(space);
        }
      }
    }
    return spaces;
  }

  getLongMoves(file: string, rank: number, i: number, multipliers: [number, number], isValid: boolean) : [boolean, Space, boolean] {
    let targetFile = this.files[this.getFileIndex(file) + i*multipliers[0]];
    let isTakeable = false;
    let takeableSpace = undefined;
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
      } else {
        this.allSpaces[allSpacesIndex].isTakeable = true;
        takeableSpace = new Space(targetFile, targetRank, true, true);
        isTakeable = true;
        isValid = false;
      }
    }
    if (takeableSpace) {
      return [isValid, takeableSpace, isTakeable]
    }
    return [isValid, new Space(targetFile, targetRank), isTakeable]
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
      let inWhitePlayable = this.allWhitePlayableSpaces.findIndex(x => x.rank === targetRank && x.file === targetFile);
      let inBlackPlayable = this.allBlackPlayableSpaces.findIndex(x => x.rank === targetRank && x.file === targetFile);
      if ((this.selectedPiece.isWhite() && inBlackPlayable === -1) || (!this.selectedPiece.isWhite() && inWhitePlayable === -1) || this.isSaving) {
        if (targetFile && targetRank && this.allSpaces[allSpacesIndex]) {
          let targetPiece = this.getPiece(targetFile, targetRank);
          if (!this.allSpaces[allSpacesIndex].hasPiece) {
            spaces.push(new Space(targetFile, targetRank));
          } else {
            if (this.selectedPiece.color !== targetPiece?.color && !targetPiece?.isProtected) {
              this.allSpaces[allSpacesIndex].isTakeable = true;
              spaces.push(new Space(targetFile, targetRank, true, true));
            }
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
    this.allSpaces = [];
    this.playableSpaces = [];
    this.pieces = [];
    this.selectedPiece = new Info();
    this.takenPieces = [];
    this.initBlackPieces();
    this.initWhitePieces();
    this.initAllSpaces();
    this.whiteInCheck = false;
    this.blackInCheck = false;
    this.whiteInMate = false;
    this.blackInMate = false;
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

  sendMessage() {
    
  }
}
