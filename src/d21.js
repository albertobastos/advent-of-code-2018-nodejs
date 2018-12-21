console.time("d21");
const rl = require("./utils").getInputRL("d21");

const TARGET_IP = 28; // check in your input where R0 gets involved in a jump condition!

const OPERATIONS = {
  addr: (state, op1, op2, op3) => (state[op3] = state[op1] + state[op2]),
  addi: (state, op1, op2, op3) => (state[op3] = state[op1] + op2),
  mulr: (state, op1, op2, op3) => (state[op3] = state[op1] * state[op2]),
  muli: (state, op1, op2, op3) => (state[op3] = state[op1] * op2),
  banr: (state, op1, op2, op3) => (state[op3] = state[op1] & state[op2]),
  bani: (state, op1, op2, op3) => (state[op3] = state[op1] & op2),
  borr: (state, op1, op2, op3) => (state[op3] = state[op1] | state[op2]),
  bori: (state, op1, op2, op3) => (state[op3] = state[op1] | op2),
  setr: (state, op1, op2, op3) => (state[op3] = state[op1]),
  seti: (state, op1, op2, op3) => (state[op3] = op1),
  gtir: (state, op1, op2, op3) => (state[op3] = op1 > state[op2] ? 1 : 0),
  gtri: (state, op1, op2, op3) => (state[op3] = state[op1] > op2 ? 1 : 0),
  gtrr: (state, op1, op2, op3) => (state[op3] = state[op1] > state[op2] ? 1 : 0),
  eqir: (state, op1, op2, op3) => (state[op3] = op1 === state[op2] ? 1 : 0),
  eqri: (state, op1, op2, op3) => (state[op3] = state[op1] === op2 ? 1 : 0),
  eqrr: (state, op1, op2, op3) => (state[op3] = state[op1] === state[op2] ? 1 : 0)
};

let IP_REG;
const PROGRAM = [];

function programReadLine(rl) {
  let regexIp = /#ip (\d+)/;
  let regexInstr = /([a-z]+) (\d+) (\d+) (\d+)/;
  rl.on("line", line => {
    let match = regexInstr.exec(line);
    if (match) {
      let [opname, op1, op2, op3] = match.slice(1).map((t, idx) => (idx > 0 ? Number(t) : t));
      PROGRAM.push({ opname, op1, op2, op3 });
      return;
    }
    match = regexIp.exec(line);
    if (match) {
      IP_REG = Number(match[1]);
      return;
    }
  });

  rl.on("close", () => {
    let data = run(PROGRAM);
    console.log("Answer (Part 1):", data.part1);
    console.log("Answer (Part 2):", data.part2);
    console.timeEnd("d19");
  });
}

function run(program, initialState = [0, 0, 0, 0, 0, 0], initialIp = 0) {
  let targetRegisterHistory = [];

  let data = {
    state: [...initialState],
    ip: initialIp,
    count: 0,
    part1: null,
    part2: null
  };

  runLoop: while (data.ip < program.length) {
    data.state[IP_REG] = data.ip;

    // execute instruction
    let instr = program[data.ip];

    // The only instruction that uses R0 is #28 (eqrr 4 0 2)
    // if R0 and R4 are equals, executes a "goto" that goes out of the program stack
    // For Part 1, we need to know the value at R4 the first time the condition is evaluated.
    // That is the value we will put initially at R0 to halt as soon as possible
    // For Part 2, we look for a repetition pattern at R4 and check the last original value
    // before it starts repeating.
    if (data.ip === PART1_TARGET_IP) {
      targetInstructionIterations++;
      let targetRegisterValue = data.state[instr.op1];

      if (targetRegisterHistory.indexOf(targetRegisterValue) > -1) {
        // first repetition! we want the value before that iteration
        break runLoop;
      }

      targetRegisterHistory.push(targetRegisterValue);
    }

    OPERATIONS[instr.opname](data.state, instr.op1, instr.op2, instr.op3); // exec instruction

    // get new instruction pointer
    data.ip = data.state[IP_REG];
    // increment instruction pointer
    data.ip++;
    data.count++;
  }

  // the first value at the target register is the answer for Part 1
  // the last non-repeated value at the target register is the answer for Part 2
  data.part1 = targetRegisterHistory[0];
  data.part2 = targetRegisterHistory[targetRegisterHistory.length - 1];

  return data;
}

programReadLine(rl);
