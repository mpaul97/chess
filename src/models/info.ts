import { Direction } from "./direction";

export class Info {
  constructor(
    public color: string = '',
    public type: string = '',
    public file: string = '',
    public rank: number = 0,
    public hasMoved: boolean = false,
    public isProtected: boolean = false,
    public isPinned: boolean = false,
    public pinnedDir: Direction = new Direction()
  ) {}
  isWhite() {
    return this.color === 'white' ? true : false;
  }
  isPawn() {
    return this.type === 'pawn' ? true : false;
  }
  isKnight() {
    return this.type === 'knight' ? true : false;
  }
  isBishop() {
    return this.type === 'bishop' ? true : false;
  }
  isRook() {
    return this.type === 'rook' ? true : false;
  }
  isQueen() {
    return this.type === 'queen' ? true : false;
  }
  isKing() {
    return this.type === 'king' ? true : false;
  }
  getValue() {
    if (this.isPawn()) return 1;
    if (this.isKnight() || this.isBishop()) return 3;
    if (this.isRook()) return 5;
    if (this.isQueen()) return 9;
    return 0; 
  }
}
