console.time("d12");
const rl = require("./utils").getInputRL("d12");

let INITIAL_STATE;
let TRANSITIONS = {};
const STABILIZED_THRESHOLD = 1000; // consider diff can be stabilized after 1000 generations

function programReadLine(rl) {
  const initialStateRegex = /initial state: ([\.#]+)/;
  const transitionRegex = /([\.#]{5}) => ([\.#])/;
  rl.on("line", line => {
    let match;
    if ((match = initialStateRegex.exec(line))) {
      INITIAL_STATE = match[1];
    } else if ((match = transitionRegex.exec(line))) {
      TRANSITIONS[match[1]] = match[2];
    }
  });

  rl.on("close", () => {
    console.log("Answer (part I):", run(20));
    console.log("Answer (part II):", run(50000000000));

    console.timeEnd("d12");
  });
}

function run(GENERATIONS) {
  let state = INITIAL_STATE.split("");
  let firstIndex = 0;
  let result = null;
  let diff = null;

  for (let generation = 0; generation < GENERATIONS; generation++) {
    // ensure we are looking at enough pots
    let paddedState = state.slice();

    while (paddedState.indexOf("#") < 4) {
      paddedState.splice(0, 0, ".");
      firstIndex--;
    }

    while (paddedState.lastIndexOf("#") > paddedState.length - 5) {
      paddedState.push(".");
    }

    state = paddedState;

    let newState = new Array(state.length).fill(".");
    for (let i = 2; i < state.length - 2; i++) {
      let pattern = state.slice(i - 2, i + 3).join("");
      let transition = TRANSITIONS[pattern];
      newState[i] = transition || ".";
    }

    let newResult = getResult(newState, firstIndex);
    let newDiff = newResult - (result || 0);

    if (generation > STABILIZED_THRESHOLD && newDiff === diff) {
      // stabilized diff per generation, apply it for the generations left and quit
      newResult = result += (GENERATIONS - generation) * diff;
      generation = GENERATIONS;
    }

    result = newResult;
    state = newState;
    diff = newDiff;
  }

  return result;
}

function getResult(state, firstIndex) {
  return state.map((val, index) => (val === "#" ? index + firstIndex : 0)).reduce((acc, curr) => acc + curr, 0);
}

programReadLine(rl);
