export class Info {
  constructor(
    public color: string = '',
    public type: string = '',
    public file: string = '',
    public rank: number = 0,
    public hasMoved: boolean = false
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
}
