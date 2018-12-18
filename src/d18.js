console.time("d18");
const rl = require("./utils").getInputRL("d18");

const OPEN = ".";
const TREES = "|";
const LUMBERYARD = "#";

function programReadLine(rl) {
  const INPUT_GRID = []; // [y][x]
  rl.on("line", line => {
    INPUT_GRID.push(line.split(""));
  });

  rl.on("close", () => {
    console.log("Answer (part I):", runPart1(INPUT_GRID, 10).result);
    console.log("Answer (part II):", runPart2(INPUT_GRID, 1000000000).result);
    console.timeEnd("d18");
  });
}

function runPart1(initialGrid, minutes) {
  let data = {
    result: null,
    grid: JSON.parse(JSON.stringify(initialGrid)),
    size: initialGrid[0] ? initialGrid[0].length : 0,
    minute: 0
  };

  while (data.minute < minutes) {
    data.grid = runMinute(data);
    data.minute++;

    // printData(data);
  }

  //printData(data);
  data.result = count(data, TREES) * count(data, LUMBERYARD);

  return data;
}

function runPart2(initialGrid, minutes) {
  let data = {
    result: null,
    grid: JSON.parse(JSON.stringify(initialGrid)),
    size: initialGrid[0] ? initialGrid[0].length : 0,
    minute: 0
  };

  let history = {}; // strGrid: minute

  while (data.minute < minutes) {
    data.grid = runMinute(data);
    data.minute++;

    let strGrid = JSON.stringify(data.grid);
    let prev = history[strGrid];

    if (prev) {
      // pattern found, prev --> data.minute is the loop
      let loopLength = data.minute - prev;
      // advance as much as we can
      while (data.minute < minutes) {
        data.minute += loopLength;
      }
      data.minute -= loopLength;
      // start over with the actual grid and only the remaining minutes (without history check!)
      return runPart1(data.grid, minutes - data.minute);
    } else {
      history[strGrid] = data.minute;
    }
  }

  //printData(data);
  data.result = count(data, TREES) * count(data, LUMBERYARD);

  return data;
}

function runMinute({ grid, size }) {
  // init blank grid
  let newGrid = new Array(size);
  for (let i = 0; i < size; i++) newGrid[i] = new Array(size);

  for (let yi = 0; yi < size; yi++) {
    for (let xi = 0; xi < size; xi++) {
      newGrid[yi][xi] = newState(grid, size, xi, yi);
    }
  }

  return newGrid;
}

function newState(grid, size, x, y) {
  let adjacent = getAdjacent(grid, size, x, y);
  switch (grid[y][x]) {
    case OPEN:
      return adjacent.filter(adj => adj === TREES).length >= 3 ? TREES : OPEN;
    case TREES:
      return adjacent.filter(adj => adj === LUMBERYARD).length >= 3 ? LUMBERYARD : TREES;
    case LUMBERYARD:
      return adjacent.find(adj => adj === LUMBERYARD) && adjacent.find(adj => adj === TREES) ? LUMBERYARD : OPEN;
    default:
      throw new Error("Unexpected grid contents: " + grid[y][x]);
  }
}

function getAdjacent(grid, size, x, y) {
  let adj = [];
  for (let xi = x - 1; xi <= x + 1; xi++) {
    for (let yi = y - 1; yi <= y + 1; yi++) {
      if (xi >= 0 && xi < size && yi >= 0 && yi < size && (xi !== x || yi !== y)) {
        adj.push(grid[yi][xi]);
      }
    }
  }
  return adj;
}

function count({ grid }, type) {
  return grid.map(row => row.filter(cell => cell === type).length).reduce((acc, curr) => acc + curr, 0);
}

function printData({ grid, minute }) {
  console.log("After minute", minute);
  grid.forEach(row => {
    console.log(row.join(""));
  });
  console.log();
}

programReadLine(rl);
