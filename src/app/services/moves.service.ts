import { Injectable } from '@angular/core';
import { Direction } from 'src/models/direction';
import { Info } from 'src/models/info';
import { Space } from 'src/models/space';

@Injectable({
  providedIn: 'root'
})
export class MovesService {

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
  allSpaces: Space[] = [];

  playableSpaces: Space[] = [];

  whiteTakeableSpaces: Space[] = [];
  blackTakeableSpaces: Space[] = [];

  allWhitePlayableSpaces: Space[] = [];
  allBlackPlayableSpaces: Space[] = [];

  pawnWhiteTakeableSpaces: Space[] = [];
  pawnBlackTakeableSpaces: Space[] = [];

  blockingMoves: Space[] = [];

  kingPlayableSpaces: Space[] = [];

  // whiteInCheck: boolean = false;
  // blackInCheck: boolean = false;

  // // in check, no blocking or taking moves, no king moves
  // whiteInMate: boolean = false;
  // blackInMate: boolean = false;

  constructor() {}

  findMoves(selectedPiece: Info, lastMovedPiece: Info, piece: Info, isSaving: boolean) {
    if (selectedPiece.isWhite()) { // white to move
      if (piece.isWhite()) {
        this.getPlayableSpaces(piece, isSaving, selectedPiece);
        if (this.whiteInCheck) {
          // init with blocking moves
          let validFiles = this.blockingMoves.map(x => x.file);
          let validRanks = this.blockingMoves.map(x => x.rank);
          // can take last moved piece (checking piece)
          validFiles.push(lastMovedPiece.file);
          validRanks.push(lastMovedPiece.rank);
          // merge valid
          let validPositions = Array.from({ length: validFiles.length }, (val, index) => (validFiles[index] + validRanks[index]));
          let tempPlayableSpaces = this.playableSpaces.filter(x => validPositions.includes(x.file + x.rank));
          if (!selectedPiece.isKing()) {
            this.playableSpaces = tempPlayableSpaces;
          }
        }
      }
    } else { // black to move
      if (!piece.isWhite()) {
        this.getPlayableSpaces(piece, isSaving, selectedPiece);
        if (this.blackInCheck) {
          // init with blocking moves
          let validFiles = this.blockingMoves.map(x => x.file);
          let validRanks = this.blockingMoves.map(x => x.rank);
          // can take last moved piece (checking piece)
          validFiles.push(lastMovedPiece.file);
          validRanks.push(lastMovedPiece.rank);
          // merge valid
          let validPositions = Array.from({ length: validFiles.length }, (val, index) => (validFiles[index] + validRanks[index]));
          let tempPlayableSpaces = this.playableSpaces.filter(x => validPositions.includes(x.file + x.rank));
          if (!selectedPiece.isKing()) {
            this.playableSpaces = tempPlayableSpaces;
          }
        }
      }
    };
    return this.playableSpaces;
  }

  getPlayableSpaces(piece: Info, isSaving: boolean, selectedPiece: Info) {
    if (piece.isPawn()) {
      this.playableSpaces = this.getPawnMoves(piece, isSaving, selectedPiece);
    } else if (piece.isKnight()) {
      this.playableSpaces = this.getKnightMoves(piece.file, piece.rank, selectedPiece);
    } else if (piece.isBishop()) {
      this.playableSpaces = this.getBishopMoves(piece.file, piece.rank, selectedPiece);
    } else if (piece.isRook()) {
      this.playableSpaces = this.getRookMoves(piece.file, piece.rank, selectedPiece);
    } else if (piece.isQueen()) {
      this.playableSpaces = this.getQueenMoves(piece.file, piece.rank, selectedPiece);
    } else {
      this.playableSpaces = this.getKingMoves(piece.file, piece.rank, isSaving, selectedPiece);
    };
  }

  // piece moves
  getPawnMoves(piece: Info, isSaving: boolean, selectedPiece: Info) : Space[] {
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
    if (isSaving) spaces = [];
    let firstTakeableSpace = this.allSpaces.find(x => x.file === this.files[this.getFileIndex(piece.file)-1] && x.rank === piece.rank + 1*multiplier);
    let secondTakeableSpace = this.allSpaces.find(x => x.file === this.files[this.getFileIndex(piece.file)+1] && x.rank === piece.rank + 1*multiplier);
    if (firstTakeableSpace) {
      spaces = this.getPawnTakeableMoves(spaces, firstTakeableSpace, selectedPiece);
    }
    if (secondTakeableSpace) {
      spaces = this.getPawnTakeableMoves(spaces, secondTakeableSpace, selectedPiece);
    }
    return spaces;
  }

  getPawnTakeableMoves(spaces: Space[], space: Space, selectedPiece: Info) {
    if (space.hasPiece || (space.enPassant && space.enPassantColor !== selectedPiece.color)) {
      let targetPiece = this.getPiece(space.file, space.rank);
      if (selectedPiece.color !== targetPiece?.color) {
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

  getKnightMoves(file: string, rank: number, selectedPiece: Info) : Space[] {
    let spaces: Space[] = [];
    let validSpaces = [[1, 2], [-1, 2], [-2, 1], [2, 1], [1, -2], [-1, -2], [-2, -1], [2, -1]];
    if (!selectedPiece.isPinned) {
      for (let [vertical, horizontal] of validSpaces) {
        let targetFile = this.files[this.getFileIndex(file) + vertical];
        let targetRank = rank + horizontal;
        let allSpacesIndex = this.allSpaces.findIndex(x => x.rank === targetRank && x.file === targetFile);
        if (targetFile && targetRank && this.allSpaces[allSpacesIndex]) {
          if (!this.allSpaces[allSpacesIndex].hasPiece) {
            let targetPiece = this.getPiece(targetFile, targetRank);
            if (selectedPiece.color !== targetPiece?.color) {
              spaces.push(new Space(targetFile, targetRank));
            } else if (selectedPiece.color === targetPiece.color) {
              let pieceIndex = this.pieces.findIndex(x => x === targetPiece);
              this.pieces[pieceIndex].isProtected = true;
            }
          } else {
            let targetPiece = this.getPiece(targetFile, targetRank);
            if (selectedPiece.color !== targetPiece?.color) {
              this.allSpaces[allSpacesIndex].isTakeable = true;
              spaces.push(new Space(targetFile, targetRank, true, true));
            }
          }
        }
      }
    }
    return spaces;
  }

  getBishopMoves(file: string, rank: number, selectedPiece: Info) : Space[] {
    let spaces: Space[] = [];
    let upRightValid: boolean = true;
    let upLeftValid: boolean = true;
    let downLeftValid: boolean = true;
    let downRightValid: boolean = true;
    for (var i = 1; i < 8; i++) {
      // up right diagonal
      if (upRightValid) {
        let [isValid, space, isTakeable] = this.getLongMoves(file, rank, i, [1, 1], upRightValid, selectedPiece);
        upRightValid = isValid;
        if (isValid || isTakeable) {
          spaces.push(space);
        }
      }
      // up left diagonal
      if (upLeftValid) {
        let [isValid, space, isTakeable] = this.getLongMoves(file, rank, i, [-1, 1], upLeftValid, selectedPiece);
        upLeftValid = isValid;
        if (isValid || isTakeable) {
          spaces.push(space);
        }
      }
      // down left diagonal
      if (downLeftValid) {
        let [isValid, space, isTakeable] = this.getLongMoves(file, rank, i, [-1, -1], downLeftValid, selectedPiece);
        downLeftValid = isValid;
        if (isValid || isTakeable) {
          spaces.push(space);
        }
      }
      // down right diagonal
      if (downRightValid) {
        let [isValid, space, isTakeable] = this.getLongMoves(file, rank, i, [1, -1], downRightValid, selectedPiece);
        downRightValid = isValid;
        if (isValid || isTakeable) {
          spaces.push(space);
        }
      }
    };
    return spaces
  }

  getRookMoves(file: string, rank: number, selectedPiece: Info) : Space[] {
    let spaces: Space[] = [];
    let upValid: boolean = true;
    let downValid: boolean = true;
    let leftValid: boolean = true;
    let rightValid: boolean = true;
    for (var i = 1; i < 8; i++) {
      // up
      if (upValid) {
        let [isValid, space, isTakeable] = this.getLongMoves(file, rank, i, [0, 1], upValid, selectedPiece);
        upValid = isValid;
        if (isValid || isTakeable) {
          spaces.push(space);
        }
      }
      // down
      if (downValid) {
        let [isValid, space, isTakeable] = this.getLongMoves(file, rank, i, [0, -1], downValid, selectedPiece);
        downValid = isValid;
        if (isValid || isTakeable) {
          spaces.push(space);
        }
      }
      // left
      if (leftValid) {
        let [isValid, space, isTakeable] = this.getLongMoves(file, rank, i, [-1, 0], leftValid, selectedPiece);
        leftValid = isValid;
        if (isValid || isTakeable) {
          spaces.push(space);
        }
      }
      // right
      if (rightValid) {
        let [isValid, space, isTakeable] = this.getLongMoves(file, rank, i, [1, 0], rightValid, selectedPiece);
        rightValid = isValid;
        if (isValid || isTakeable) {
          spaces.push(space);
        }
      }
    }
    return spaces;
  }

  getLongMoves(file: string, rank: number, i: number, multipliers: [number, number], isValid: boolean, selectedPiece: Info) : [boolean, Space, boolean] {
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
    if (selectedPiece.isPinned) {
      let inverseDirection = this.getInverseDirection(selectedPiece.pinnedDir.abbr)?.abbr;
      if (direction !== inverseDirection) {
        return [false, new Space(targetFile, targetRank), false];
      }
    };
    let allSpacesIndex = this.allSpaces.findIndex(x => x.rank === targetRank && x.file === targetFile);
    if (isValid && this.allSpaces[allSpacesIndex].hasPiece) {
      let targetPiece = this.getPiece(targetFile, targetRank);
      if (selectedPiece.color === targetPiece?.color) {
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

  getQueenMoves(file: string, rank: number, selectedPiece: Info) : Space[] {
    let spaces: Space[] = [];
    spaces.push(...this.getBishopMoves(file, rank, selectedPiece));
    spaces.push(...this.getRookMoves(file, rank, selectedPiece));
    return spaces;
  }

  getKingMoves(file: string, rank: number, isSaving: boolean, selectedPiece: Info) : Space[] {
    let spaces: Space[] = [];
    let validSpaces = [[-1, 1], [1, 1], [0, 1], [0, -1], [-1, 0], [1, 0], [-1, -1], [1, -1]];
    for (let [vertical, horizontal] of validSpaces) {
      let targetFile = this.files[this.getFileIndex(file) + vertical];
      let targetRank = rank + horizontal;
      let allSpacesIndex = this.allSpaces.findIndex(x => x.rank === targetRank && x.file === targetFile);
      let inWhitePlayable = this.allWhitePlayableSpaces.findIndex(x => x.rank === targetRank && x.file === targetFile);
      let inBlackPlayable = this.allBlackPlayableSpaces.findIndex(x => x.rank === targetRank && x.file === targetFile);
      if ((selectedPiece.isWhite() && inBlackPlayable === -1) || (!selectedPiece.isWhite() && inWhitePlayable === -1) || isSaving) {
        if (targetFile && targetRank && this.allSpaces[allSpacesIndex]) {
          let targetPiece = this.getPiece(targetFile, targetRank);
          if (!this.allSpaces[allSpacesIndex].hasPiece) {
            let playableSpaces = selectedPiece.isWhite() ? this.allBlackPlayableSpaces : this.allWhitePlayableSpaces;
            selectedPiece.isWhite() ? playableSpaces.push(...this.pawnBlackTakeableSpaces) : playableSpaces.push(...this.pawnWhiteTakeableSpaces);
            if (!isSaving && !playableSpaces.find(x => x.file === targetFile && x.rank === targetRank)) {
              spaces.push(new Space(targetFile, targetRank, false, false, 0, 0, '', true));
            } else if (isSaving) {
              spaces.push(new Space(targetFile, targetRank, false, false, 0, 0, '', true));
            }
          } else {
            if (selectedPiece.color.length > 0) {
              if (selectedPiece.color !== targetPiece?.color && !targetPiece?.isProtected) {
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
    if ((selectedPiece.isWhite() && !this.whiteInCheck) || (!selectedPiece.isWhite() && !this.blackInCheck)) {
      if (!selectedPiece.hasMoved) {
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

  // helpers
  getSpace(file: string, rank: number) : Space | undefined {
    return this.allSpaces.find(x => x.file === file && x.rank === rank);
  }

  getFileIndex(file: string) {
    return this.files.indexOf(file);
  }

  getPiece(file: string, rank: number) : Info | undefined {
    return this.pieces.filter(x => x.file === file && x.rank === rank)[0];
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

  // getters and setters
  setPieces(pieces: Info[]) {
    this.pieces = pieces;
  };

  getPieces() {
    return this.pieces;
  };

  setAllSpaces(allSpaces: Space[]) {
    this.allSpaces = allSpaces;
  };

  getAllSpaces() {
    return this.allSpaces;
  };

}
