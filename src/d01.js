console.time("d01");
let rl = require("./utils").getInputRL("d01");

let part1answered = false;
let part2answered = false;

let freq = 0;
let freqHistory = {};

function programReadLine(rl) {
  rl.on("line", line => {
    freq += Number(line);
    freqHistory[freq] = (freqHistory[freq] || 0) + 1;
    if (!part2answered && freqHistory[freq] > 1) {
      console.log("Answer (part II)", freq);
      part2answered = true;
    }
  });

  rl.on("close", () => {
    if (!part1answered) {
      console.log("Answer (part I):", freq);
      part1answered = true;
    }
    if (!part2answered) {
      let newRl = require("./utils").getInputRL("d01");
      programReadLine(newRl);
    }
    if (part1answered && part2answered) {
      console.timeEnd("d01");
    }
  });
}

programReadLine(rl);
