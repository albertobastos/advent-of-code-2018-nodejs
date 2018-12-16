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
  let INSTR_STACK = [];
  let COUNT_PART1 = 0;
  let before = (after = null); // before and after = [reg0, reg1, reg2, reg3]
  let instr = null; // instr = { opcode, A, B, C }

  let regexBefore = /Before: \[(\d), (\d), (\d), (\d)\]/;
  let regexAfter = /After:  \[(\d), (\d), (\d), (\d)\]/;
  let regexInstr = /(\d) (\d) (\d) (\d)/;

  rl.on("line", line => {
    if ((match = regexBefore.exec(line))) {
      before = [match[1], match[2], match[3], match[4]].map(Number);
      return;
    }

    if ((match = regexAfter.exec(line))) {
      after = [match[1], match[2], match[3], match[4]].map(Number);
      if (getPossibleOperations(before, after, instr, 3).length >= 3) {
        COUNT_PART1++;
      }
      before = after = instr = null; // reset current parser
      return;
    }

    if ((match = regexInstr.exec(line))) {
      let newInstr = {
        opcode: match[1],
        A: Number(match[2]),
        B: Number(match[3]),
        C: Number(match[4])
      };
      if (before) {
        // if we have a "before-after" in course, the instr is part of a sample
        instr = newInstr;
      } else {
        // otherwise, the instr is part of the stack
        INSTR_STACK.push(newInstr);
      }
    }
  });

  rl.on("close", () => {
    console.log("Answer (part I):", COUNT_PART1);
    console.timeEnd("d16");
  });
}

function getPossibleOperations(before, after, { opcode, A, B, C }) {
  return OPERATIONS.filter(op => {
    let opAfter = callOperation(before, op, A, B, C);
    return JSON.stringify(opAfter) == JSON.stringify(after);
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

programReadLine(rl);
