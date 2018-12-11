console.time("d11");
const rl = require("./utils").getInputRL("d11");

const GRID_SIZE = 300;
const PART1_SQUARE_SIZE = 3;

function programReadLine(rl) {
  let sn = null;
  rl.on("line", line => {
    sn = Number(line);
  });

  rl.on("close", () => {
    //sn = 18; // example

    let grid = createGrid(sn);
    console.log("Answer (part I):", processPart1(grid));

    //let best = bestSquare(grid, 300);
    //console.log("Answer (part II):", best);

    console.timeEnd("d11");
  });
}

function processPart1(grid) {
  let bestPower = null;
  let bestCoord = null;
  for (let x = 1; x < GRID_SIZE - PART1_SQUARE_SIZE; x++) {
    for (let y = 1; y < GRID_SIZE - PART1_SQUARE_SIZE; y++) {
      let power = calculateSquare(grid, x, y, PART1_SQUARE_SIZE);
      if (bestPower == null || power > bestPower) {
        bestPower = power;
        bestCoord = x + "," + y;
      }
    }
  }
  return bestCoord;
}

function calculateSquare(grid, x, y, squareWidth) {
  //console.log("square", x, y, squareWidth);
  let sum = 0;
  for (let dx = 0; dx < squareWidth; dx++) {
    for (let dy = 0; dy < squareWidth; dy++) {
      let cell = getCellLevel(grid, x + dx, y + dy);
      //console.log("add", x + dx, y + dy, cell);
      sum += cell;
    }
  }
  return sum;
}

function createGrid(sn) {
  let grid = new Array(GRID_SIZE * GRID_SIZE);
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      grid[_2dto1d(GRID_SIZE, x, y)] = getPowerLevel(sn, x + 1, y + 1);
    }
  }
  return grid;
}

function getPowerLevel(sn, x, y) {
  let rackID = x + 10;
  let tmp = (rackID * y + sn) * rackID;
  return ((tmp % 1000) - (tmp % 100)) / 100 - 5;
}

function getCellLevel(grid, x, y) {
  let level = grid[_2dto1d(GRID_SIZE, x - 1, y - 1)];
  return level;
}

function _2dto1d(width, x, y) {
  // converts matrix coordinates (2d) into array coordinates (1d)
  return width * y + x;
}

programReadLine(rl);
