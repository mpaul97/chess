export class Space {
  constructor(
    public file: string = '',
    public rank: number = 0,
    public hasPiece: boolean = false,
    public isTakeable: boolean = false,
    public x: number = 0,
    public y: number = 0
  ) {}
}
