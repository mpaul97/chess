import { Direction } from "./direction";

export class Space {
  constructor(
    public file: string = '',
    public rank: number = 0,
    public hasPiece: boolean = false,
    public isTakeable: boolean = false,
    public x: number = 0,
    public y: number = 0,
    public directionAbbr: string = '',
    public isKingSpace: boolean = false,
    public containsSelectedPiece = false,
    public isCastle: boolean = false,
    public enPassant: boolean = false
  ) {}
}
