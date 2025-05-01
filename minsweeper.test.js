import { Minesweeper } from './minesweeper';
import * as readline from 'readline'; 

describe('Minesweeper Game', () => {
  let game

  beforeEach(() => {
    game = new Minesweeper(3, 3); 
  });

  test('should initialize the grid with the correct number of mines', () => {
    let mineCount = 0;
    game.grid.forEach((row) => {
      row.forEach((cell) => {
        if (cell === '*') mineCount++;
      });
    });
    expect(mineCount).toBe(3); 
  });

  test('should reject invalid input outside of grid bounds in getInput', async () => {
    const invalidInputs = [
      [-1, 0], 
      [0, -1],
      [3, 0], 
      [0, 3],
    ];

    const mockQuestion = jest.spyOn(readline.Interface.prototype, 'question');
    const revealSpy = jest.spyOn(game, 'revealCell');

    for (const [row, col] of invalidInputs) {
      revealSpy.mockClear();

      mockQuestion.mockImplementationOnce((query, callback) => callback(`${row},${col}`));

      await game.getInput();

      expect(revealSpy).not.toHaveBeenCalled();
    }
  });

  test('should end the game when a mine is revealed', () => {
    game.grid[0][0] = '*';
    const revealSpy = jest.spyOn(game, 'revealCell');

    game.revealCell(0, 0);

    expect(game.gameOver).toBe(true); 
    expect(revealSpy).toHaveBeenCalledWith(0, 0); 
  });

  test('should win the game when all non-mine cells are revealed', () => {
    game.grid = [
      ['0', '1', '*'],
      ['0', '1', '*'],
      ['0', '1', '*'],
    ];

    game.revealed = [
      [true, false, false],
      [true, true, false],
      [true, true, false],
    ];

    game.revealCell(0, 1); 

    expect(game.gameOver).toBe(true);
  });
});