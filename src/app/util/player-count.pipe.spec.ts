import { PlayerCountPipe } from './player-count.pipe';

describe('PlayerCountPipe', () => {
  it('create an instance', () => {
    const pipe = new PlayerCountPipe();
    expect(pipe).toBeTruthy();
  });
});
