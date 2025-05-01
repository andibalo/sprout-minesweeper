import * as readline from 'readline';

const MAX_GRID_LENGTH = 50;
const DEFAULT_GRID_LENGTH = 3;

export class Minesweeper {
  rl: readline.Interface;
  gridLength: number;
  mineCount: number;
  grid: string[][];
  revealed: boolean[][];
  gameOver: boolean;

  constructor(gridLength: number, mineCount: number) {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    this.gridLength = gridLength;
    this.mineCount = mineCount;
    this.grid = [];
    this.revealed = [];
    this.gameOver = false;

    this.initGrid();
    this.placeMines();
    this.calculateAdjacentMines();

    // Uncomment to see the grid with mines
    // console.log(this.grid);
  }

  initGrid(): void {
    for (let i = 0; i < this.gridLength; i++) {
      this.grid[i] = Array(this.gridLength).fill('0');
      this.revealed[i] = Array(this.gridLength).fill(false);
    }
  }

  placeMines(): void {
    let minesPlaced = 0;

    while (minesPlaced < this.mineCount) {
      const row = Math.floor(Math.random() * this.gridLength);
      const col = Math.floor(Math.random() * this.gridLength);

      if (this.grid[row][col] !== '*') {
        this.grid[row][col] = '*';
        minesPlaced++;
      }
    }
  }

  calculateAdjacentMines(): void {
    for (let i = 0; i < this.gridLength; i++) {
      for (let j = 0; j < this.gridLength; j++) {
        if (this.grid[i][j] === '*') continue;

        let mineCount = 0;
        for (let x = -1; x <= 1; x++) {
          for (let y = -1; y <= 1; y++) {
            const newRow = i + x;
            const newCol = j + y;

            if (
              newRow >= 0 &&
              newCol >= 0 &&
              newRow < this.gridLength &&
              newCol < this.gridLength
            ) {
              if (this.grid[newRow][newCol] === '*') mineCount++;
            }
          }
        }

        if (mineCount > 0) this.grid[i][j] = mineCount.toString();
      }
    }
  }

  printGrid(): void {
    for (let i = 0; i < this.gridLength; i++) {
      let row = '';
      for (let j = 0; j < this.gridLength; j++) {
        row += this.revealed[i][j] ? this.grid[i][j] : '#';
        row += ' ';
      }
      console.log(row);
    }
  }

  revealCell(row: number, col: number): void {
    if (this.gameOver || this.revealed[row][col]) return;

    this.revealed[row][col] = true;

    if (this.grid[row][col] === '*') {
      this.gameOver = true;
      console.log('Game Over! You hit a mine!');
    }

    if (this.checkWin()) {
      this.gameOver = true;
      console.log('Congratulations! You won the game!');
    }
  }

  checkWin(): boolean {
    for (let i = 0; i < this.gridLength; i++) {
      for (let j = 0; j < this.gridLength; j++) {
        if (this.grid[i][j] !== '*' && !this.revealed[i][j]) {
          return false;
        }
      }
    }
    return true;
  }

  getInput(): void {
    this.rl.question('Enter your move (row,col): ', (input) => {
      const [row, col] = input.split(',').map(Number);

      if (row >= 0 && row < this.gridLength && col >= 0 && col < this.gridLength) {
        this.revealCell(row, col);
      } else {
        console.log('Invalid move. Try again.');
      }

      this.printGrid();

      if (!this.gameOver) {
        this.getInput();
        return;
      } else {
        this.rl.close();
      }
    });
  }

  start(): void {
    this.printGrid();
    this.getInput();
  }
}

function askForGridLength(): Promise<number> {
  const gridLengthReader = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    const ask = () => {
      gridLengthReader.question(
        `Enter grid length to create n x n matrix (optional, default is ${DEFAULT_GRID_LENGTH}): `,
        (input) => {
          if (input.trim() === '') {
            resolve(DEFAULT_GRID_LENGTH);
            gridLengthReader.close();
            return;
          }

          let gridLength = parseInt(input);

          if (isNaN(gridLength) || gridLength <= 0) {
            console.log('Invalid input. Please enter a valid number greater than 0.');
            ask();
            return;
          }

          if (gridLength > MAX_GRID_LENGTH) {
            console.log(`Invalid input. Max grid length is ${MAX_GRID_LENGTH}`);
            ask();
            return;
          }

          resolve(gridLength);
          gridLengthReader.close();
        }
      );
    };

    ask();
  });
}

function askForMineCount(gridLength: number): Promise<number> {
  const mineCountReader = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    const ask = () => {
      mineCountReader.question(
        'Enter number of mines (optional, default is grid length): ',
        (input) => {
          if (input.trim() === '') {
            resolve(gridLength);
            mineCountReader.close();
            return;
          }

          let mineCount = parseInt(input);

          if (isNaN(mineCount) || mineCount <= 0) {
            console.log('Invalid input. Please enter a valid number greater than 0.');
            ask();
            return;
          }

          if (mineCount > gridLength * gridLength) {
            console.log('Mine count must be less than total grid count');
            ask();
            return;
          }

          resolve(mineCount);
          mineCountReader.close();
        }
      );
    };

    ask();
  });
}

async function main(): Promise<void> {
  console.log('Welcome to Minesweeper!');

  let gridLength = DEFAULT_GRID_LENGTH;
  let mineCount = DEFAULT_GRID_LENGTH;

  gridLength = await askForGridLength();

  mineCount = await askForMineCount(gridLength);

  console.log(`Chosen grid size is ${gridLength}x${gridLength}. Total grids: ${gridLength * gridLength}`);
  console.log(`Mine count: ${mineCount}`);
  console.log('\n----------------GAME START----------------\n');
  const game = new Minesweeper(gridLength, mineCount);
  game.start();
}

main();