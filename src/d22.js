console.time("d22");
const rl = require("./utils").getInputRL("d22");

let DEPTH;
let TARGET; // {x, y}

let erosion_levels = {}; // `x,y`: erosionLevel

const ROCKY = 0;
const WET = 1;
const NARROW = 2;

function programReadLine(rl) {
  const depthRegex = /depth: (\d+)/;
  const depthTarget = /target: (\d+),(\d+)/;
  rl.on("line", line => {
    let depthMatch = depthRegex.exec(line);
    let targetMatch = depthTarget.exec(line);
    if (depthMatch) {
      DEPTH = Number(depthMatch[1]);
    } else if (targetMatch) {
      TARGET = {
        x: Number(targetMatch[1]),
        y: Number(targetMatch[2])
      };
    }
  });

  rl.on("close", () => {
    console.log(DEPTH);
    console.log(TARGET);
    console.log("Answer (Part 1):", runPart1());
    console.log("Answer (Part 2):");
    console.timeEnd("d22");
  });
}

function runPart1() {
  let sum = 0;
  for (let x = 0; x <= TARGET.x; x++) {
    for (let y = 0; y <= TARGET.y; y++) {
      sum += getErosionLevel(x, y) % 3;
    }
  }
  return sum;
}

function getErosionLevel(x, y) {
  let xy = `${x},${y}`;
  let level = erosion_levels[xy];
  if (level === undefined) {
    level = (getGeologicIndex(x, y) + DEPTH) % 20183;
    erosion_levels[xy] = level;
  }
  return level;
}

function getGeologicIndex(x, y) {
  if (x === 0 && y === 0) {
    return 0;
  }
  if (x === TARGET.x && y === TARGET.y) {
    return 0;
  }
  if (x === 0 || y === 0) {
    return x * 16807 + y * 48271;
  }
  return getErosionLevel(x - 1, y) * getErosionLevel(x, y - 1);
}

programReadLine(rl);
