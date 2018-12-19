console.time("d19");
const rl = require("./utils").getInputRL("d19");

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
    console.log("Answer (part I):", run(PROGRAM).state[0]);
    console.log("Answer (part II):", "Check r5 stabilized value, find its divisors and sum them.");
    console.timeEnd("d19");
  });
}

function run(program, initialState = [0, 0, 0, 0, 0, 0], initialIp = 0, debug = false) {
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
    OPERATIONS[instr.opname](data.state, instr.op1, instr.op2, instr.op3); // exec instruction
    // get new instruction pointer
    data.ip = data.state[IP_REG];
    // increment instruction pointer
    data.ip++;
    data.count++;

    if (debug) console.log("ip=" + ipBefore, stateBefore, instr.opname, instr.op1, instr.op2, instr.op3, data.state, data.count);
  }

  return data;
}

programReadLine(rl);
