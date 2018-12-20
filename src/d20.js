console.time("d20");
const rl = require("./utils").getInputRL("d20ex");

function programReadLine(rl) {
  rl.on("line", line => {
    //
  });

  rl.on("close", () => {
    console.log("Answer (part I):");
    console.log("Answer (part II):");
    console.timeEnd("d20");
  });
}

programReadLine(rl);
