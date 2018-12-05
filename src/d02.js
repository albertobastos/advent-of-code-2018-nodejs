console.time("d02");
const rl = require("./utils").getInputRL("d02");

let appears2 = 0;
let appears3 = 0;
let part2answered = false;

let lineHistory = [];

function programReadLine(rl) {
  rl.on("line", line => {
    let letterCount = line.split("").reduce((acc, char) => {
      acc[char] = acc[char] || 0;
      acc[char]++;
      return acc;
    }, {});
    if (Object.keys(letterCount).find(letter => letterCount[letter] === 2)) {
      appears2++;
    }
    if (Object.keys(letterCount).find(letter => letterCount[letter] === 3)) {
      appears3++;
    }

    if (!part2answered) {
      // find some previous line with only one character changed compared to the current one
      let matchFound = lineHistory.find(prevLine =>
        isOnlyOneCharacterAway(prevLine, line)
      );
      if (matchFound) {
        let match = extractCommonLetters(matchFound, line);
        console.log("Answer (part II):", match);
        part2answered = true;
      }
      lineHistory.push(line);
    }
  });

  rl.on("close", () => {
    console.log("Answer (part I):", appears2 * appears3);
    console.timeEnd("d02");
  });
}

function isOnlyOneCharacterAway(line1, line2) {
  if (line1.length !== line2.length) {
    return false;
  }

  let diffs = 0;
  for (let i = 0; i < line1.length && diffs < 2; i++) {
    if (line2[i] !== line1[i]) diffs++;
  }

  return diffs === 1;
}

function extractCommonLetters(line1, line2) {
  let ret = "";
  for (let i = 0; i < line1.length; i++) {
    if (line2[i] === line1[i]) {
      ret = ret += line1[i];
    }
  }
  return ret;
}

programReadLine(rl);
