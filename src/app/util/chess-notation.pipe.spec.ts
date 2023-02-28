import { ChessNotationPipe } from './chess-notation.pipe';

describe('ChessNotationPipe', () => {
  it('create an instance', () => {
    const pipe = new ChessNotationPipe();
    expect(pipe).toBeTruthy();
  });
});
