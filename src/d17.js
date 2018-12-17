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
    let data = run(JSON.parse(JSON.stringify(CLAY_INPUT)));
    console.log("Answer (part I):", data.part1);
    console.log("Answer (part II):", data.part2);
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

  //printData(data, 494, 507, 0, data.maxY);

  return data;
}

function flowWater(data, cursor) {
  if (cursor.y >= data.maxY) return; // recursion end condition

  let cursorDown = { ...cursor, y: cursor.y + 1 };
  let cursorLeft = { ...cursor, x: cursor.x - 1 };
  let cursorRight = { ...cursor, x: cursor.x + 1 };

  //console.log("flow", cursor);

  if (isEmpty(data, cursorDown)) {
    fill(data, cursorDown, WATER_FLOW);
    flowWater(data, cursorDown);
  }

  if (isStale(data, cursorDown) && isEmpty(data, cursorLeft)) {
    fill(data, cursorLeft, WATER_FLOW);
    flowWater(data, cursorLeft);
  }

  if (isStale(data, cursorDown) && isEmpty(data, cursorRight)) {
    fill(data, cursorRight, WATER_FLOW);
    flowWater(data, cursorRight);
  }

  if (isBetweenWalls(data, cursor)) {
    fillToWalls(data, cursor);
    fill(data, cursor, WATER);
  }
}

function isBetweenWalls({ filledByXY }, cursor) {
  // see if we reach a wall on each side
  let wallLeft, wallRight;
  let offset = -1;
  searchLeft: while (true) {
    let cursorLeft = { ...cursor, x: cursor.x + offset };
    if (isEmpty({ filledByXY }, cursorLeft)) {
      wallLeft = false;
      break searchLeft;
    }
    if (isWall({ filledByXY }, cursorLeft)) {
      wallLeft = true;
      break searchLeft;
    }
    // water (either stale or flow), keep looking left
    offset--;
  }
  offset = 1;
  searchRight: while (true) {
    let cursorRight = { ...cursor, x: cursor.x + offset };
    if (isEmpty({ filledByXY }, cursorRight)) {
      wallRight = false;
      break searchRight;
    }
    if (isWall({ filledByXY }, cursorRight)) {
      wallRight = true;
      break searchRight;
    }
    // water (either stale or flow), keep looking right
    offset++;
  }
  return wallLeft && wallRight;
}

function fillToWalls({ filledByXY }, cursor) {
  let offset = -1;
  fillLeft: while (true) {
    let cursorLeft = { ...cursor, x: cursor.x + offset };
    if (isWall({ filledByXY }, cursorLeft)) {
      break fillLeft;
    }
    fill({ filledByXY }, cursorLeft, WATER);
    offset--;
  }
  offset = 1;
  fillRight: while (true) {
    let cursorRight = { ...cursor, x: cursor.x + offset };
    if (isWall({ filledByXY }, cursorRight)) {
      break fillRight;
    }
    fill({ filledByXY }, cursorRight, WATER);
    offset++;
  }
}

function isEmpty({ filledByXY }, cursor) {
  return !filledByXY[strXY(cursor)];
}

function isStale({ filledByXY }, cursor) {
  let contents = filledByXY[strXY(cursor)];
  return contents === WATER || contents === CLAY;
}

function isWall({ filledByXY }, cursor) {
  return filledByXY[strXY(cursor)] === CLAY;
}

function fill({ filledByXY }, cursor, contents) {
  //console.log("fill", cursor, contents);
  filledByXY[strXY(cursor)] = contents;
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

function printData(data, minX, maxX, minY, maxY) {
  let str = "";
  for (let yi = minY; yi <= maxY; yi++) {
    for (let xi = minX; xi <= maxX; xi++) {
      str += data.filledByXY[strXY({ x: xi, y: yi })] || ".";
    }
    str += "\n";
  }
  console.log(str);
}

programReadLine(rl);
