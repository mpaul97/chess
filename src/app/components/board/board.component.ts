import { Component, Input, OnInit } from '@angular/core';
import { Direction } from 'src/models/direction';
import { Info } from 'src/models/info';
import { Space } from 'src/models/space';
import { ComputerService } from 'src/app/services/computer.service';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {

  files: string[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  ranks: number[] = [8, 7, 6, 5, 4, 3, 2, 1];

  directions: Direction[] = [
    new Direction(1, 1, 'ur'),
    new Direction(-1, 1, 'ul'),
    new Direction(-1, -1, 'dl'),
    new Direction(1, -1, 'dr'),
    new Direction(0, 1, 'u'),
    new Direction(0, -1, 'd'),
    new Direction(-1, 0, 'l'),
    new Direction(1, 0, 'r')
  ];

  pieces: Info[] = [];

  selectedPiece: Info = new Info();

  started: boolean = false;
  isWhiteMove: boolean = true;

  allSpaces: Space[] = [];
  playableSpaces: Space[] = [];

  whiteTakeableSpaces: Space[] = [];
  blackTakeableSpaces: Space[] = [];

  allWhitePlayableSpaces: Space[] = [];
  allBlackPlayableSpaces: Space[] = [];

  pawnWhiteTakeableSpaces: Space[] = [];
  pawnBlackTakeableSpaces: Space[] = [];

  lastMovedPiece: Info = new Info();

  isSaving: boolean = false;

  takenPieces: Info[] = [];

  blockingMoves: Space[] = [];

  kingPlayableSpaces: Space[] = [];

  whiteInCheck: boolean = false;
  blackInCheck: boolean = false;

  // in check, no blocking or taking moves, no king moves
  whiteInMate: boolean = false;
  blackInMate: boolean = false;

  // promotion
  togglePromotion: boolean = false;
  promotionSpace: Space = new Space();
  promotionColor: string = '';
  promotionPieces: Info[] = [];

  //computer
  computerToggle: boolean = false;

  // scores
  whiteScore: number = 0;
  blackScore: number = 0;

  constructor(
    public computerService: ComputerService
  ) {}

  ngOnInit(): void {
    this.initBlackPieces();
    this.initWhitePieces();
    this.initAllSpaces();
  }

  // main logic
  spaceClicked(file: string, rank: number) {
    if (this.whiteInMate) {
      console.log("White is Mated!!!");
      return;
    } else if (this.blackInMate) {
      console.log("Black is Mated!!!");
      return;
    };
    let piece = this.getPiece(file, rank);
    // new index
    let clickedSpaceIndex = this.allSpaces.findIndex(x => x.rank === rank && x.file === file);
    if (piece) {
      if (this.togglePromotion) this.togglePromotion = false;
      if (this.isWhiteMove && piece.color === 'white') {
        this.selectedPiece = piece;
        this.allSpaces.map(x => x.containsSelectedPiece = false);
        this.allSpaces[clickedSpaceIndex].containsSelectedPiece = true;
      } else if (!this.isWhiteMove && piece.color === 'black') {
        this.selectedPiece = piece;
        this.allSpaces.map(x => x.containsSelectedPiece = false);
        this.allSpaces[clickedSpaceIndex].containsSelectedPiece = true;
      }
      this.findMoves(piece);
    }
    let isSpacePlayable = this.playableSpaces.find(x => x.file === file && x.rank === rank);
    if (isSpacePlayable) {
      this.started = true;
      if (this.allSpaces[clickedSpaceIndex].isTakeable && !this.allSpaces[clickedSpaceIndex].enPassant) {
        let takeablePiece = this.getPiece(file, rank);
        this.pieces = this.pieces.filter(x => x !== takeablePiece);
        this.takenPieces.push(takeablePiece as Info);
        if (takeablePiece?.isWhite()) this.blackScore += takeablePiece.getValue();
        if (takeablePiece && !takeablePiece?.isWhite()) this.whiteScore += takeablePiece.getValue();
      };
      // EN PASSANT
      if (this.selectedPiece.isPawn() && this.allSpaces[clickedSpaceIndex].enPassant) {
        let multiplier = this.selectedPiece.isWhite() ? -1 : 1;
        let pawn = this.pieces.find(x => x.file === file && x.rank === rank + multiplier);
        if (pawn && pawn.color !== this.selectedPiece.color) {
          this.pieces = this.pieces.filter(x => x !== pawn);
          this.takenPieces.push(pawn as Info);
          this.allSpaces[clickedSpaceIndex].enPassant = false;
          this.allSpaces[clickedSpaceIndex].enPassantColor = '';
          let allSpacesPieceIndex = this.allSpaces.findIndex(x => x.file === pawn?.file && x.rank === pawn?.rank);
          this.allSpaces[allSpacesPieceIndex].hasPiece = false;
          if (pawn.isWhite()) this.blackScore += pawn.getValue();
          if (!pawn.isWhite()) this.whiteScore += pawn.getValue();
        }
      }
      let index = this.pieces.findIndex(x => x.rank === this.selectedPiece.rank && x.file === this.selectedPiece.file);
      // old index
      let pieceSpaceIndex = this.allSpaces.findIndex(x => x.rank === this.selectedPiece.rank && x.file === this.selectedPiece.file);
      if (index || index === 0) { // clicked space is playable
        this.enPassantLogic(clickedSpaceIndex); // remove invalid enPassant spaces
        this.performCastling(isSpacePlayable, file, rank);
        this.checkPromotion(this.pieces[index], file, rank);
        this.pieces[index].rank = rank;
        this.pieces[index].file = file;
        this.pieces[index].hasMoved = true;
        this.playableSpaces = [];
        this.whiteTakeableSpaces = [];
        this.blackTakeableSpaces = [];
        this.allWhitePlayableSpaces = [];
        this.allBlackPlayableSpaces = [];
        this.pawnWhiteTakeableSpaces = [];
        this.pawnBlackTakeableSpaces = [];
        this.isWhiteMove = !this.isWhiteMove;
        this.allSpaces[pieceSpaceIndex].hasPiece = false; // old space
        this.allSpaces[clickedSpaceIndex].hasPiece = true; // new space
        this.allSpaces.map((x) => { x.isTakeable = false; x.containsSelectedPiece = false });
        this.lastMovedPiece = this.selectedPiece;
        this.whiteInCheck = false;
        this.blackInCheck = false;
        this.pieces.map((x) => { x.isProtected = false; x.isPinned = false; x.pinnedDir = new Direction() });
        this.savePlayableSpaces();
        this.findAllChecks();
        this.computerLogic();
      }; // end clicked space is playable
    }; // end space is playable
  }

  computerLogic() {
    if (this.computerToggle && this.lastMovedPiece.isWhite()) {
      while (this.playableSpaces.length === 0) {
        let [computerFile, computerRank] = this.computerService.getComputerPieceSpace(this.pieces);
        this.spaceClicked(computerFile, computerRank);
      }
      setTimeout(() => {
        let [playableFile, playableRank] = this.computerService.getComputerPlayableSpace(this.playableSpaces);
        this.spaceClicked(playableFile, playableRank);
      }, 1000);
    }
  }

  promotionClicked(piece: Info, file: string, rank: number) {
    let oldPieceIndex = this.pieces.findIndex(x => x.file === file && x.rank === rank);
    let oldPiece = this.pieces[oldPieceIndex];
    this.pieces[oldPieceIndex] = new Info(piece.color, piece.type, file, rank, oldPiece.hasMoved, oldPiece.isProtected, oldPiece.isPinned, oldPiece.pinnedDir);
    this.promotionSpace = new Space();
    this.promotionColor = '';
    this.promotionPieces = [];
  }

  findMoves(piece: Info) {
    if (this.isWhiteMove) { // white to move
      if (piece.isWhite()) {
        this.getPlayableSpaces(piece);
        if (this.whiteInCheck) {
          // init with blocking moves
          let validFiles = this.blockingMoves.map(x => x.file);
          let validRanks = this.blockingMoves.map(x => x.rank);
          // can take last moved piece (checking piece)
          validFiles.push(this.lastMovedPiece.file);
          validRanks.push(this.lastMovedPiece.rank);
          // merge valid
          let validPositions = Array.from({ length: validFiles.length }, (val, index) => (validFiles[index] + validRanks[index]));
          let tempPlayableSpaces = this.playableSpaces.filter(x => validPositions.includes(x.file + x.rank));
          if (!this.selectedPiece.isKing()) {
            this.playableSpaces = tempPlayableSpaces;
          }
        }
      }
    } else { // black to move
      if (!piece.isWhite()) {
        this.getPlayableSpaces(piece);
        if (this.blackInCheck) {
          // init with blocking moves
          let validFiles = this.blockingMoves.map(x => x.file);
          let validRanks = this.blockingMoves.map(x => x.rank);
          // can take last moved piece (checking piece)
          validFiles.push(this.lastMovedPiece.file);
          validRanks.push(this.lastMovedPiece.rank);
          // merge valid
          let validPositions = Array.from({ length: validFiles.length }, (val, index) => (validFiles[index] + validRanks[index]));
          let tempPlayableSpaces = this.playableSpaces.filter(x => validPositions.includes(x.file + x.rank));
          if (!this.selectedPiece.isKing()) {
            this.playableSpaces = tempPlayableSpaces;
          }
        }
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
          if (firstTakeableSpace) this.pawnWhiteTakeableSpaces.push(firstTakeableSpace);
          if (secondTakeableSpace) this.pawnWhiteTakeableSpaces.push(secondTakeableSpace);
        } else {
          if (firstTakeableSpace) this.pawnBlackTakeableSpaces.push(firstTakeableSpace);
          if (secondTakeableSpace) this.pawnBlackTakeableSpaces.push(secondTakeableSpace);
        }
      };
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
          if (piece.isWhite()) {
            this.allWhitePlayableSpaces.push(space);
          } else {
            this.allBlackPlayableSpaces.push(space);
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
    let king = this.pieces.find(x => x.color === color && x.isKing());
    if (king) this.getPlayableSpaces(king);
    let inTakeable = takeableSpaces.findIndex(x => x.file === king?.file && x.rank === king?.rank);
    if (inTakeable !== -1) {
      if (color === 'white') {
        this.whiteInCheck = true;
        if (king) {
          this.blockingMoves = this.getBlockingMoves(king);
          this.kingPlayableSpaces = this.playableSpaces;
          let isCheckingPieceTakeable = this.whiteTakeableSpaces.find(x => x.rank === this.lastMovedPiece.rank && x.file === this.lastMovedPiece.file);
          if (!isCheckingPieceTakeable && this.playableSpaces.length === 0 && this.blockingMoves.length === 0) {
            this.whiteInMate = true;
            this.whiteInCheck = false;
          }
        }
      } else {
        this.blackInCheck = true;
        if (king) {
          this.blockingMoves = this.getBlockingMoves(king);
          this.kingPlayableSpaces = this.playableSpaces;
          let isCheckingPieceTakeable = this.blackTakeableSpaces.find(x => x.rank === this.lastMovedPiece.rank && x.file === this.lastMovedPiece.file);
          if (!isCheckingPieceTakeable && this.playableSpaces.length === 0 && this.blockingMoves.length === 0) {
            this.blackInMate = true;
            this.blackInCheck = false;
          }
        }
      }
    };
    this.playableSpaces = [];
  };

  getBlockingMoves(king: Info) : Space[] {
    let spaces = [];
    let takeableSpaces = king.isWhite() ? this.blackTakeableSpaces : this.whiteTakeableSpaces;
    let kingPosition = [king.file, king.rank];
    let kingTakingDirectionAbbr = takeableSpaces.find(x => x.file === kingPosition[0] && x.rank === kingPosition[1])?.directionAbbr;
    let direction = this.directions.find(x => x.abbr === kingTakingDirectionAbbr);
    if (direction) {
      let inverseDirection = [direction.x*-1, direction.y*-1];
      let kingFileIndex = this.getFileIndex(kingPosition[0] as string);
      let kingRankIndex = this.ranks.findIndex(x => x === kingPosition[1]);
      for (let i = 1; i <= 8; i++) {
        if (kingRankIndex === undefined) break;
        let targetFile = this.files[kingFileIndex + inverseDirection[0]*i];
        if (!targetFile) break;
        let targetRank = this.ranks[kingRankIndex] + inverseDirection[1]*i;
        if (!targetRank) break;
        if (this.getPiece(targetFile, targetRank)) break;
        let playableSpaces = king.isWhite() ? this.allWhitePlayableSpaces : this.allBlackPlayableSpaces;
        for (let space of playableSpaces) {
          console.log(space)
        }
        let space = playableSpaces.find(x => x.file === targetFile && x.rank === targetRank);
        let sameSpaces = playableSpaces.filter(x => x.file === targetFile && x.rank === targetRank);
        if (space && ((space.isKingSpace && sameSpaces.length < 1) || (!space.isKingSpace))) spaces.push(space);
      }
    }
    return spaces;
  };

  checkPromotion(piece: Info, file: string, rank: number) {
    let promotionPieceNames = ['rook', 'knight', 'bishop', 'queen'];
    if (piece.isPawn()) {
      if (piece.isWhite() && rank === 8) {
        this.togglePromotion = !this.togglePromotion;
        this.promotionSpace = new Space(file, rank);
        this.promotionColor = 'white';
        for (let name of promotionPieceNames) {
          this.promotionPieces.push(new Info(this.promotionColor, name));
        }
      } else if (!piece.isWhite() && rank === 1) {
        this.togglePromotion = !this.togglePromotion;
        this.promotionSpace = new Space(file, rank);
        this.promotionColor = 'black';
        for (let name of promotionPieceNames) {
          this.promotionPieces.push(new Info(this.promotionColor, name));
        }
      }
    }
  }

  enPassantLogic(allSpacesIndex: number) {
    if (this.selectedPiece.isPawn()) {
      let spaceRank = this.allSpaces[allSpacesIndex].rank;
      let pieceRank = this.selectedPiece.rank;
      if (Math.abs(spaceRank - pieceRank) === 2) {
        let multiplier = this.selectedPiece.isWhite() ? 1 : -1;
        let passantRank = pieceRank + multiplier;
        let passantIndex = this.allSpaces.findIndex(x => x.file === this.selectedPiece.file && x.rank === passantRank);
        this.allSpaces[passantIndex].enPassant = true;
        this.selectedPiece.isWhite() ? this.allSpaces[passantIndex].enPassantColor = 'white' : this.allSpaces[passantIndex].enPassantColor = 'black';
      }
    };
    this.allSpaces.map((x) => {
      if (x.enPassant && x.enPassantColor !== this.selectedPiece.color) {
        x.enPassant = false;
        x.enPassantColor = '';
      }
    })
  }

  // pins
  checkKingBehind(space: Space) {
    let directionAbbr = space.directionAbbr;
    let direction = this.directions.find(x => x.abbr === directionAbbr);
    if (direction) {
      for (var i = 1; i <= 8; i++) {
        let targetFile = this.files[this.getFileIndex(space.file)+direction.x*i];
        if (!targetFile) break;
        let targetRank = this.ranks[this.ranks.indexOf(space.rank + direction.y*i)];
        if (!targetRank) break;
        let targetPiece = this.getPiece(targetFile, targetRank);
        if (targetPiece && !targetPiece.isKing()) break;
        if (targetPiece && targetPiece.isKing()){
          let pinPiece = this.getPiece(space.file, space.rank);
          if (pinPiece) {
            let pieceIndex = this.pieces.indexOf(pinPiece);
            this.pieces[pieceIndex].isPinned = true;
            this.pieces[pieceIndex].pinnedDir = direction;
          }
        }
      }
    }
  }

  // piece moves
  getPawnMoves(piece: Info) : Space[] {
    let spaces: Space[] = [];
    let multiplier: number = piece.isWhite() ? 1 : -1;
    let firstSpace = this.allSpaces.find(x => x.file === piece.file && x.rank === piece.rank + 1*multiplier);
    let secondSpace = this.allSpaces.find(x => x.file === piece.file && x.rank === piece.rank + 2*multiplier);
    if (!piece.isPinned || (piece.pinnedDir.x === 0 && piece.pinnedDir.y === multiplier*-1)) {
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
    };
    // if (this.isSaving) spaces = [];
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
    if (space.hasPiece || (space.enPassant && space.enPassantColor !== this.selectedPiece.color)) {
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
    if (!this.selectedPiece.isPinned) {
      for (let [vertical, horizontal] of validSpaces) {
        let targetFile = this.files[this.getFileIndex(file) + vertical];
        let targetRank = rank + horizontal;
        let allSpacesIndex = this.allSpaces.findIndex(x => x.rank === targetRank && x.file === targetFile);
        if (targetFile && targetRank && this.allSpaces[allSpacesIndex]) {
          if (!this.allSpaces[allSpacesIndex].hasPiece) {
            let targetPiece = this.getPiece(targetFile, targetRank);
            if (this.selectedPiece.color !== targetPiece?.color) {
              spaces.push(new Space(targetFile, targetRank));
            } else if (this.selectedPiece.color === targetPiece.color) {
              let pieceIndex = this.pieces.findIndex(x => x === targetPiece);
              this.pieces[pieceIndex].isProtected = true;
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
    let direction = this.directions.find(x => x.x === multipliers[0] && x.y === multipliers[1])?.abbr;
    let targetFile = this.files[this.getFileIndex(file) + i*multipliers[0]];
    let isTakeable = false;
    let takeableSpace = undefined;
    if (targetFile === undefined) {
      isValid = false;
    };
    let targetRank = rank + i*multipliers[1];
    if (!this.ranks.includes(targetRank)) {
      isValid = false;
    };
    if (this.selectedPiece.isPinned) {
      let inverseDirection = this.getInverseDirection(this.selectedPiece.pinnedDir.abbr)?.abbr;
      if (direction !== inverseDirection) {
        return [false, new Space(targetFile, targetRank), false];
      }
    };
    let allSpacesIndex = this.allSpaces.findIndex(x => x.rank === targetRank && x.file === targetFile);
    if (isValid && this.allSpaces[allSpacesIndex].hasPiece) {
      let targetPiece = this.getPiece(targetFile, targetRank);
      if (this.selectedPiece.color === targetPiece?.color) {
        let pieceIndex = this.pieces.findIndex(x => x === targetPiece);
        this.pieces[pieceIndex].isProtected = true;
        isValid = false;
      } else {
        this.allSpaces[allSpacesIndex].isTakeable = true;
        takeableSpace = new Space(targetFile, targetRank, true, true, 0, 0, direction);
        this.checkKingBehind(takeableSpace);
        isTakeable = true;
        isValid = false;
        if (targetPiece?.isKing()) {
          isValid = true;
        }
      }
    };
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
            let playableSpaces = this.selectedPiece.isWhite() ? this.allBlackPlayableSpaces : this.allWhitePlayableSpaces;
            this.selectedPiece.isWhite() ? playableSpaces.push(...this.pawnBlackTakeableSpaces) : playableSpaces.push(...this.pawnWhiteTakeableSpaces);
            if (!this.isSaving && !playableSpaces.find(x => x.file === targetFile && x.rank === targetRank)) {
              spaces.push(new Space(targetFile, targetRank, false, false, 0, 0, '', true));
            } else if (this.isSaving) {
              spaces.push(new Space(targetFile, targetRank, false, false, 0, 0, '', true));
            }
          } else {
            if (this.selectedPiece.color.length > 0) {
              if (this.selectedPiece.color !== targetPiece?.color && !targetPiece?.isProtected) {
                this.allSpaces[allSpacesIndex].isTakeable = true;
                spaces.push(new Space(targetFile, targetRank, true, true, 0, 0, '', true));
              }
            }
          }
        }
      }
    };
    // castling
    let [rCastleValid, lCastleValid] = this.checkCastling(file, rank);
    if ((this.selectedPiece.isWhite() && !this.whiteInCheck) || (!this.selectedPiece.isWhite() && !this.blackInCheck)) {
      if (!this.selectedPiece.hasMoved) {
        if (rCastleValid) {
          let targetFile = this.files[this.getFileIndex(file) + 2];
          let targetRank = rank;
          if (!this.getSpace(targetFile, targetRank)?.isTakeable) {
            spaces.push(new Space(targetFile, targetRank, false, false, 0, 0, '', true, false, true));
          }
        };
        if (lCastleValid) {
          let targetFile = this.files[this.getFileIndex(file) - 2];
          let targetRank = rank;
          if (!this.getSpace(targetFile, targetRank)?.isTakeable) {
            spaces.push(new Space(targetFile, targetRank, false, false, 0, 0, '', true, false, true));
          }
        }
      }
    };
    return spaces;
  };

  checkCastling(file: string, rank: number) {
    let rCastle = false;
    let lCastle = false;
    let rightPieces = [];
    let leftPieces = [];
    for (let vertical of [1, 2, 3, 4]) {
      let targetFileR = this.files[this.getFileIndex(file) + vertical];
      let targetRankR = rank;
      let pieceR = this.getPiece(targetFileR, targetRankR);
      if (pieceR) rightPieces.push(pieceR);
      let targetFileL = this.files[this.getFileIndex(file) + vertical*-1];
      let targetRankL = rank;
      let pieceL = this.getPiece(targetFileL, targetRankL);
      if (pieceL) leftPieces.push(pieceL);
    };
    // check right pieces
    if (rightPieces.length === 1) {
      if (rightPieces[0].isRook() && !rightPieces[0].hasMoved) {
        rCastle = true;
      }
    };
    // check left pieces
    if (leftPieces.length === 1) {
      if (leftPieces[0].isRook() && !leftPieces[0].hasMoved) {
        lCastle = true;
      }
    };
    return [rCastle, lCastle];
  };

  performCastling(isSpacePlayable: Space, file: string , rank: number) {
    if (isSpacePlayable.isCastle) {
      let currFile = this.selectedPiece.file;
      let pastIndex = this.getFileIndex(file);
      let currIndex = this.getFileIndex(currFile);
      let rookPiecesIndex = undefined;
      let newRookSpace = undefined;
      if (pastIndex > currIndex) { // right castle
        let currRookSpace = [this.files[pastIndex+1], rank];
        newRookSpace = [this.files[pastIndex-1], rank];
        rookPiecesIndex = this.pieces.findIndex(x => x.file === currRookSpace[0] && x.rank === currRookSpace[1]);
      };
      if (pastIndex < currIndex) { // left castle
        let currRookSpace = [this.files[pastIndex-2], rank];
        newRookSpace = [this.files[pastIndex+1], rank];
        rookPiecesIndex = this.pieces.findIndex(x => x.file === currRookSpace[0] && x.rank === currRookSpace[1]);
      };
      if (newRookSpace && rookPiecesIndex) {
        let oldFile = this.pieces[rookPiecesIndex].file;
        let newFile = newRookSpace[0] as string;
        let allSpacesOldIndex = this.allSpaces.findIndex(x => x.file === oldFile && x.rank === rank);
        let allSpacesNewIndex = this.allSpaces.findIndex(x => x.file === newFile && x.rank === rank);
        this.pieces[rookPiecesIndex].file = newFile;
        this.pieces[rookPiecesIndex].hasMoved = true;
        this.allSpaces[allSpacesOldIndex].hasPiece = false;
        this.allSpaces[allSpacesNewIndex].hasPiece = true;
      }
    };
  }

  // helpers
  getSpace(file: string, rank: number) : Space | undefined {
    return this.allSpaces.find(x => x.file === file && x.rank === rank);
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

  reset() {
    this.started = false;
    this.isWhiteMove = true;
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
    this.whiteTakeableSpaces = [];
    this.blackTakeableSpaces = [];
    this.allWhitePlayableSpaces = [];
    this.allBlackPlayableSpaces = [];
    this.pawnWhiteTakeableSpaces = [];
    this.pawnBlackTakeableSpaces = [];
  }

  getInverseDirection(abbr: string) {
    if (abbr.includes('u')) {
      abbr = abbr.replace('u','d');
    } else if (abbr.includes('d')) {
      abbr = abbr.replace('d','u');
    };
    if (abbr.includes('l')) {
      abbr = abbr.replace('l','r');
    } else if (abbr.includes('r')) {
      abbr = abbr.replace('r','l');
    };
    return this.directions.find(x => x.abbr === abbr);
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

};
