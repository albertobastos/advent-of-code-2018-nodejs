console.time("d17");
const rl = require("./utils").getInputRL("d17");

const CLAY = "#";
const WATER = "~";
const WATER_FLOW = "|";
const CLAY_INPUT = []; // { x, y, contents: CLAY, WATER }

function programReadLine(rl) {
  let regexLine = /([xy])=(\d+)(..)?(\d+)?, ([xy])=(\d+)(..)?(\d+)?/;
  rl.on("line", line => {
    let match = regexLine.exec(line);
    if (match) {
      let [_1, var1, start1, _2, end1, var2, start2, _3, end2] = [...match];
      let contents = parseLineContents(var1, start1, end1, var2, start2, end2);
      for (let xi = contents.x.from; xi <= contents.x.to; xi++) {
        for (let yi = contents.y.from; yi <= contents.y.to; yi++) {
          CLAY_INPUT.push({ x: xi, y: yi });
        }
      }
    }
  });

  rl.on("close", () => {
    let data = run(CLAY_INPUT);
    console.log("Answer (part I):", data.part1); // expected: 33724
    console.log("Answer (part II):", data.part2); // expected: ?
    console.timeEnd("d17");
  });
}

function run(clayInput) {
  let data = {
    part1: null,
    part2: null,
    minY: clayInput.reduce((min, { y }) => (min === null || y < min ? y : min), null),
    maxY: clayInput.reduce((max, { y }) => (max === null || y > max ? y : max), null),
    filledByXY: clayInput.reduce((map, { x, y }) => {
      map[strXY({ x, y })] = CLAY;
      return map;
    }, {})
  };

  let cursor = { x: 500, y: 0 };
  flowWater(data, { ...cursor });

  data.part1 = Object.values(data.filledByXY).filter(contents => contents === WATER || contents === WATER_FLOW).length;
  data.part2 = Object.values(data.filledByXY).filter(contents => contents === WATER).length;

  //printData(data);

  return data;
}

function flowWater(data, cursor) {
  if (cursor.y >= data.maxY) return; // recursion end condition

  //console.log("flow", cursor);

  let cursorDown = { ...cursor, y: cursor.y + 1 };
  let cursorLeft = { ...cursor, x: cursor.x - 1 };
  let cursorRight = { ...cursor, x: cursor.x + 1 };

  if (isEmpty(data, cursorDown)) {
    // can keep flowing down, call recursively
    if (cursorDown.y >= data.minY) fill(data, cursorDown, WATER_FLOW); // careful, answer expects only water from first row with clay!
    flowWater(data, cursorDown);
  }

  if (isStale(data, cursorDown) && isEmpty(data, cursorLeft)) {
    // we have either stale water or clay below and free space to the left, water can flow that way
    fill(data, cursorLeft, WATER_FLOW);
    flowWater(data, cursorLeft);
  }

  if (isStale(data, cursorDown) && isEmpty(data, cursorRight)) {
    // we have either stale water or clay below and free space to the right, water can flow that way
    fill(data, cursorRight, WATER_FLOW);
    flowWater(data, cursorRight);
  }

  if (isStale(data, cursorDown) && hasWallLeft(data, cursor) && hasWallRight(data, cursor)) {
    // we are either stale water or clay below and walls on both sides, water will fill that space
    fillLeft(data, cursor, WATER);
    fillRight(data, cursor, WATER);
    fill(data, cursor, WATER);
  }
}

function isEmpty(data, cursor) {
  return !getContents(data, cursor);
}

function isStale(data, cursor) {
  return [WATER, CLAY].indexOf(getContents(data, cursor)) > -1;
}

function isClay(data, cursor) {
  return getContents(data, cursor) === CLAY;
}

function hasWallLeft(data, cursor) {
  let offset = -1;
  while (true) {
    let cursorOffset = { ...cursor, x: cursor.x + offset };
    if (isEmpty(data, cursorOffset)) return false;
    if (isClay(data, cursorOffset)) return true;
    offset--;
  }
}

function hasWallRight(data, cursor) {
  let offset = 1;
  while (true) {
    let cursorOffset = { ...cursor, x: cursor.x + offset };
    if (isEmpty(data, cursorOffset)) return false;
    if (isClay(data, cursorOffset)) return true;
    offset++;
  }
}

function fillLeft(data, cursor, contents) {
  let offset = -1;
  while (true) {
    let cursorOffset = { ...cursor, x: cursor.x + offset };
    if (isClay(data, cursorOffset)) return;
    fill(data, cursorOffset, contents);
    offset--;
  }
}

function fillRight(data, cursor, contents) {
  let offset = 1;
  while (true) {
    let cursorOffset = { ...cursor, x: cursor.x + offset };
    if (isClay(data, cursorOffset)) return;
    fill(data, cursorOffset, contents);
    offset++;
  }
}

function getContents(data, cursor) {
  return data.filledByXY[strXY(cursor)];
}

function fill(data, cursor, contents) {
  data.filledByXY[strXY(cursor)] = contents;
}

function strXY({ x, y }) {
  return `${x},${y}`;
}

function parseLineContents(var1, start1, end1, var2, start2, end2) {
  let contents = {}; // "x": { from, to }, "y": { from, to }
  contents[var1] = { from: Number(start1), to: end1 !== undefined ? Number(end1) : Number(start1) };
  contents[var2] = { from: Number(start2), to: end2 !== undefined ? Number(end2) : Number(start2) };
  return contents;
}

function printData(data) {
  let boundaries = Object.keys(data.filledByXY)
    .map(xy => xy.split(",").map(Number))
    .reduce(
      (acc, [x, y]) => {
        acc.minX = Math.min(acc.minX, x);
        acc.maxX = Math.max(acc.maxX, x);
        acc.minY = Math.min(acc.minY, y);
        acc.maxY = Math.max(acc.maxY, y);
        return acc;
      },
      {
        minX: Infinity,
        maxX: -Infinity,
        minY: Infinity,
        maxY: -Infinity
      }
    );

  let str = "";
  for (let yi = boundaries.minY; yi <= boundaries.maxY; yi++) {
    for (let xi = boundaries.minX; xi <= boundaries.maxX; xi++) {
      str += getContents(data, { x: xi, y: yi }) || ".";
    }
    str += "\n";
  }

  console.log(boundaries);
  console.log(str);
}

programReadLine(rl);
