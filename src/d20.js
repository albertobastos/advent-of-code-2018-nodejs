console.time("d20");
const rl = require("./utils").getInputRL("d20ex");

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
  let current = { count: 0, alternatives: [] };
  let over1000rooms = 0;

  path.forEach((char, idx) => {
    switch (char) {
      case "(":
        // open alternatives
        newCurrent = { count: 0, parent: current, alternatives: [] };
        newCurrent.parent.alternatives.push(newCurrent);
        current = newCurrent;
        break;
      case ")":
        // choose alternative with less steps
        current = current.parent;
        if (!current.alternatives.find(x => x.count === 0)) {
          // no empty alternative, we cannot skip the branches
          current.count += Math.max(...current.alternatives.map(x => x.count));
        }
        // reset the alternatives list in case another one comes up at the same level
        current.alternatives = [];
        break;
      case "|":
        // add new alternative
        newCurrent = { count: 0, parent: current.parent, alternatives: [] };
        newCurrent.parent.alternatives.push(newCurrent);
        current = newCurrent;
        break;
      default:
        // one more step on the current path
        current.count++;
        break;
    }
    if (isNaN(current.count)) {
      throw new Error();
    }
  });

  return {
    part1: current.count,
    part2: over1000rooms
  };
}

programReadLine(rl);
