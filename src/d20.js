console.time("d20");
const rl = require("./utils").getInputRL("d20");

const STEPS = {
  N: { dx: +0, dy: -1 },
  S: { dx: +0, dy: +1 },
  W: { dx: -1, dy: +0 },
  E: { dx: +1, dy: +0 }
};

let FULL_PATH;

function programReadLine(rl) {
  rl.on("line", line => {
    FULL_PATH = line.split("").slice(1, line.length - 1); // exclude first and last
  });

  rl.on("close", () => {
    let result = run([...FULL_PATH]);
    console.log("Answer (part I):", result.part1);
    console.log("Answer (part II):", result.part2);
    console.timeEnd("d20");
  });
}

function run(path) {
  let current = newChild();
  let maxDoors = -Infinity;
  let rooms = {}; // "x,y" -> minimum doors required
  let over1000doors = 0;

  path.forEach((char, idx) => {
    switch (char) {
      case "(":
        // open alternatives
        newCurrent = newChild(current);
        current = newCurrent;
        break;
      case ")":
        // choose branch with less steps
        current = current.parent;
        if (!current.branches.find(x => x.doors === current.doors)) {
          // no empty branch, we cannot skip them
          current.doors = Math.min(...current.branches.map(x => x.doors));
        }
        // reset the branches list in case a new branch group comes up at the same level
        current.branches = [];
        break;
      case "|":
        // add new branch
        newCurrent = newChild(current.parent);
        current = newCurrent;
        break;
      default:
        // one more step on the current path
        let step = STEPS[char];
        current.x += step.dx;
        current.y += step.dy;
        current.doors++;
        maxDoors = Math.max(maxDoors, current.doors);
        let xy = `${current.x},${current.y}`;
        rooms[xy] = rooms[xy] || current.doors;
        rooms[xy] = Math.min(rooms[xy], current.doors);
        if (current.doors >= 1000) over1000doors++;
        break;
    }
  });

  over1000doors = Object.keys(rooms).filter(xy => rooms[xy] >= 1000).length;

  return {
    part1: maxDoors,
    part2: over1000doors
  };
}

function newChild(parent) {
  let node = {
    x: parent ? parent.x : 0,
    y: parent ? parent.y : 0,
    doors: parent ? parent.doors : 0,
    parent: parent,
    branches: []
  };

  if (parent) parent.branches.push(node);

  return node;
}

programReadLine(rl);
