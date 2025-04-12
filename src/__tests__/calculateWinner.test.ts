import { calculateWinner } from '../components/TicTacToe3D';

describe('calculateWinner', () => {
  it('returns null when there is no winner', () => {
    const cube = Array(4).fill(null).map(() => Array(4).fill(null).map(() => Array(4).fill(null)));
    const result = calculateWinner(cube);
    expect(result.winner).toBeNull();
    expect(result.line).toBeNull();
  });

  it('detects a winning line along the X-axis', () => {
    const cube = Array(4).fill(null).map(() => Array(4).fill(null).map(() => Array(4).fill(null)));
    cube[0][0][0] = cube[1][0][0] = cube[2][0][0] = cube[3][0][0] = 'X';
    const result = calculateWinner(cube);
    expect(result.winner).toBe('X');
    expect(result.line).toEqual([[0, 0, 0], [1, 0, 0], [2, 0, 0], [3, 0, 0]]);
  });

  it('detects a winning line along the XYZ diagonal', () => {
    const cube = Array(4).fill(null).map(() => Array(4).fill(null).map(() => Array(4).fill(null)));
    cube[0][0][0] = cube[1][1][1] = cube[2][2][2] = cube[3][3][3] = 'O';
    const result = calculateWinner(cube);
    expect(result.winner).toBe('O');
    expect(result.line).toEqual([[0, 0, 0], [1, 1, 1], [2, 2, 2], [3, 3, 3]]);
  });

  // Add more tests for other directions and edge cases
});
