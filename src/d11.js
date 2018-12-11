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
    console.log("Answer (part II):", processPart2(grid));

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
  let sum = 0;
  for (let dx = 0; dx < squareWidth; dx++) {
    for (let dy = 0; dy < squareWidth; dy++) {
      let cell = getCellLevel(grid, x + dx, y + dy);
      sum += cell;
    }
  }
  return sum;
}

function processPart2(grid) {
  let bestPower = null;
  let bestCoord = null;
  for (let x = 1; x <= GRID_SIZE; x++) {
    for (let y = 1; y <= GRID_SIZE; y++) {
      const maxSize = Math.min(GRID_SIZE - x + 1, GRID_SIZE - y + 1);
      let xysum = 0;
      for (let s = 0; s < maxSize; s++) {
        // add new row
        for (let dx = 0; dx < s; dx++) {
          xysum += getCellLevel(grid, x + dx, y + s);
        }
        // add new column
        for (let dy = 0; dy < s; dy++) {
          xysum += getCellLevel(grid, x + s, y + dy);
        }
        // add new lower-right corner
        xysum += getCellLevel(grid, x + s, y + s);

        if (bestPower === null || xysum > bestPower) {
          bestPower = xysum;
          bestCoord = x + "," + y + "," + (s + 1);
        }
      }
    }
  }
  return bestCoord;
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
