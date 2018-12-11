console.time("d11");
const rl = require("./utils").getInputRL("d11");

function programReadLine(rl) {
  let sn = null;
  rl.on("line", line => {
    sn = Number(line);
  });

  rl.on("close", () => {
    let grid = createGrid(sn, 300);
    let { x, y } = bestSquareWithSize(grid, 300, 3);

    console.log("Answer (part I):", `${x},${y}`);
    console.log("Answer (part II):");

    console.timeEnd("d11");
  });
}

function createGrid(sn, size) {
  let grid = {}; // 'x.y': power level
  let rackID, powerLevel, tmp;
  for (let x = 1; x <= size; x++) {
    for (let y = 1; y <= size; y++) {
      rackID = x + 10;
      tmp = (rackID * y + sn) * rackID;
      powerLevel = ((tmp % 1000) - (tmp % 100)) / 100 - 5;
      grid[`${x},${y}`] = powerLevel;
    }
  }
  return grid;
}

function bestSquareWithSize(grid, gridSize, targetSize) {
  let maxPower = null;
  let maxX = null;
  let maxY = null;
  for (let x = 1; x <= gridSize - targetSize; x++) {
    for (let y = 1; y <= gridSize - targetSize; y++) {
      let value = squareValue(grid, x, y, targetSize);
      if (maxPower === null || value > maxPower) {
        maxPower = value;
        maxX = x;
        maxY = y;
      }
    }
  }
  return { x: maxX, y: maxY, power: maxPower };
}

function squareValue(grid, x, y, size) {
  let sum = 0;
  for (let i = x; i < x + size; i++) {
    for (let j = y; j < y + size; j++) {
      sum += grid[`${i},${j}`];
    }
  }
  return sum;
}

programReadLine(rl);

/**
const getPower = (serial, x, y) => {
    const rackID = x + 10;
    const power = (rackID * y + serial) * rackID;
    const hundreds = Math.floor((power % 1000) / 100);
    return hundreds - 5;
};

module.exports = (input) => {
    const serial = Number(input);

    let bestCoord = '';
    let bestSum = 0;

    for (let y = 1; y <= 300; y += 1) {
        for (let x = 1; x <= 300; x += 1) {
            const maxSize = Math.min(301 - x, 301 - y);
            let powerSum = 0;
            for (let s = 0; s < maxSize; s += 1) {
                for (let dx = 0; dx < s; dx += 1) {
                    powerSum += getPower(serial, x + dx, y + s);
                }
                for (let dy = 0; dy < s; dy += 1) {
                    powerSum += getPower(serial, x + s, y + dy);
                }
                powerSum += getPower(serial, x + s, y + s);
                if (powerSum > bestSum) {
                    bestSum = powerSum;
                    bestCoord = x + ',' + y + ',' + (s + 1);
                }
            }
        }
        console.log(y);
    }

    return bestCoord;
};
 */
