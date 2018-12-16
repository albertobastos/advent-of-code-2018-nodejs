console.time("d16");
const rl = require("./utils").getInputRL("d16");

/**
 * Day 16.
 *
 * Part 1:
 * For each (before/instr/after), check how many opcodes match the behaviour. If the result is >= 3, add it to the counter.
 */

const OPERATIONS = [
  "addr",
  "addi",
  "mulr",
  "muli",
  "banr",
  "bani",
  "borr",
  "bori",
  "setr",
  "seti",
  "gtir",
  "gtri",
  "gtrr",
  "eqir",
  "eqri",
  "eqrr"
];

function programReadLine(rl) {
  // results
  let COUNT_PART1 = 0;
  let STATE = [0, 0, 0, 0];

  // sample parse and evaluation
  let before = (after = null); // before and after = [reg0, reg1, reg2, reg3]
  let instr = null; // instr = { opcode, A, B, C }

  let opcodes = {};
  let part2started = false;

  // regexes
  let regexBefore = /Before: \[(\d+), (\d+), (\d+), (\d+)\]/;
  let regexAfter = /After:  \[(\d+), (\d+), (\d+), (\d+)\]/;
  let regexInstr = /(\d+) (\d+) (\d+) (\d+)/;

  rl.on("line", line => {
    if ((match = regexBefore.exec(line))) {
      before = [match[1], match[2], match[3], match[4]].map(Number);
      return;
    }

    if ((match = regexAfter.exec(line))) {
      after = [match[1], match[2], match[3], match[4]].map(Number);
      let possibleOperations = getPossibleOperations(before, after, instr);
      if (possibleOperations.length >= 3) {
        COUNT_PART1++;
      }

      // update opcode/possible operations pairs
      opcodes[instr.opcode] = opcodes[instr.opcode] || [...OPERATIONS];
      opcodes[instr.opcode] = opcodes[instr.opcode].filter(
        op => possibleOperations.indexOf(op) > -1
      );

      before = after = instr = null; // reset current parser
      return;
    }

    if ((match = regexInstr.exec(line))) {
      instr = {
        opcode: match[1],
        A: Number(match[2]),
        B: Number(match[3]),
        C: Number(match[4])
      };
      if (!before) {
        // we are not in a before-after sample, so we must execute the instruction against the current state
        // if it is the first instruction to execute, we need some deduction first to know for sure what  operation matches each opcode
        if (!part2started) {
          opcodes = opcodesDeduction(opcodes);
          part2started = true;
        }
        let op = opcodes[instr.opcode];
        STATE = callOperation(STATE, op, instr.A, instr.B, instr.C);
      }
    }
  });

  rl.on("close", () => {
    console.log("Answer (part I):", COUNT_PART1);
    console.log("Answer (part II):", STATE[0]);
    console.timeEnd("d16");
  });
}

function getPossibleOperations(before, after, { opcode, A, B, C }) {
  return OPERATIONS.filter(op => {
    let opAfter = callOperation(before, op, A, B, C);
    let match = JSON.stringify(opAfter) == JSON.stringify(after);
    return match;
  });
}

function callOperation(state, operation, A, B, C) {
  let newState = [...state];
  switch (operation) {
    case "addr":
      if (!isReg(A) || !isReg(B)) return;
      newState[C] = state[A] + state[B];
      break;
    case "addi":
      if (!isReg(A)) return;
      newState[C] = state[A] + B;
      break;
    case "mulr":
      if (!isReg(A) || !isReg(B)) return;
      newState[C] = state[A] * state[B];
      break;
    case "muli":
      if (!isReg(A)) return;
      newState[C] = state[A] * B;
      break;
    case "banr":
      if (!isReg(A) || !isReg(B)) return;
      newState[C] = state[A] & state[B];
      break;
    case "bani":
      if (!isReg(A)) return;
      newState[C] = state[A] & B;
      break;
    case "borr":
      if (!isReg(A) || !isReg(B)) return;
      newState[C] = state[A] | state[B];
      break;
    case "bori":
      if (!isReg(A)) return;
      newState[C] = state[A] | B;
      break;
    case "setr":
      if (!isReg(A)) return;
      newState[C] = state[A];
      break;
    case "seti":
      newState[C] = A;
      break;
    case "gtir":
      if (!isReg(B)) return;
      newState[C] = A > state[B] ? 1 : 0;
      break;
    case "gtri":
      if (!isReg(A)) return;
      newState[C] = state[A] > B ? 1 : 0;
      break;
    case "gtrr":
      if (!isReg(A) || !isReg(B)) return;
      newState[C] = state[A] > state[B] ? 1 : 0;
      break;
    case "eqir":
      if (!isReg(B)) return;
      newState[C] = A === state[B] ? 1 : 0;
      break;
    case "eqri":
      if (!isReg(A)) return;
      newState[C] = state[A] === B ? 1 : 0;
      break;
    case "eqrr":
      if (!isReg(A) || !isReg(B)) return;
      newState[C] = state[A] === state[B] ? 1 : 0;
      break;
    default:
      throw new Error("Unknown operation:" + operation);
  }
  return newState;
}

function isReg(n) {
  return n >= 0 && n <= 3;
}

// Receives opcode-candidates pairs and returns a opcode-operation 1to1 match
function opcodesDeduction(opcodes) {
  while (Object.values(opcodes).find(l => l.length > 1)) {
    Object.keys(opcodes)
      .filter(opcode => opcodes[opcode].length === 1)
      .forEach(opcode => {
        let op = opcodes[opcode][0];
        Object.keys(opcodes)
          .filter(opcode2 => opcode2 !== opcode)
          .forEach(opcode2 => {
            opcodes[opcode2] = opcodes[opcode2].filter(op2 => op2 !== op);
          });
      });
  }

  Object.keys(opcodes).forEach(opcode => {
    opcodes[opcode] = opcodes[opcode][0];
  });

  return opcodes;
}

programReadLine(rl);
