console.time("d21");
const rl = require("./utils").getInputRL("d21");

const PART1_TARGET_IP = 28;
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
    runPart1(PROGRAM);
    console.timeEnd("d19");
  });
}

function runPart1(program, initialState = [0, 0, 0, 0, 0, 0], initialIp = 0) {
  let part1resolved = false;

  let data = {
    state: [...initialState],
    ip: initialIp,
    count: 0
  };

  while (data.ip < program.length) {
    data.state[IP_REG] = data.ip;
    let ipBefore = data.ip;
    let stateBefore = [...data.state];

    // execute instruction
    let instr = program[data.ip];

    // The only instruction that uses R0 is #28 (eqrr 4 0 2)
    // if R0 and R4 are equals, executes a "goto" that goes out of the program stack
    // So we just need to know R4 value the first time we evaluate the condition and that
    // will be our desired initial value for R0.
    if (data.ip === PART1_TARGET_IP && !part1resolved) {
      console.log("Answer (Part 1):", data.state[instr.op1]);
      part1resolved = true;
    }

    OPERATIONS[instr.opname](data.state, instr.op1, instr.op2, instr.op3); // exec instruction
    // get new instruction pointer
    data.ip = data.state[IP_REG];
    // increment instruction pointer
    data.ip++;
    data.count++;
  }

  return data;
}

programReadLine(rl);
