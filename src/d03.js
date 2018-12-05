console.time("d03");
const rl = require("./utils").getInputRL("d03");

let count = {}; // "X,Y" ==> [claim ids]
let pristineClaimIds = {}; // "claimId" ==> true
function programReadLine(rl) {
  rl.on("line", line => {
    let claim = parseClaim(line);
    for (let i = claim.top + 1; i <= claim.top + claim.width; i++) {
      for (let j = claim.left + 1; j <= claim.left + claim.height; j++) {
        let xy = `${i},${j}`;
        count[xy] = count[xy] || [];
        count[xy].push(claim.id);
        pristineClaimIds[claim.id] = true;
      }
    }
  });

  rl.on("close", () => {
    let xys = Object.keys(count);
    let overlapped = xys.filter(xy => count[xy].length > 1).length;

    // mark as false any claimId overlapped
    xys.forEach(xy => {
      if (count[xy].length > 1) {
        count[xy].forEach(claimId => (pristineClaimIds[claimId] = false));
      }
    });

    let answer2 = Object.keys(pristineClaimIds).filter(
      claimId => pristineClaimIds[claimId]
    );

    console.log("Answer (part I):", overlapped);
    console.log("Answer (part II):", answer2);
    console.timeEnd("d03");
  });
}

var claimRegex = /#([0-9]+) @ ([0-9]+),([0-9]+): ([0-9]+)x([0-9]+)/;
function parseClaim(line) {
  let match = claimRegex.exec(line);
  return {
    id: Number(match[1]),
    top: Number(match[2]),
    left: Number(match[3]),
    width: Number(match[4]),
    height: Number(match[5])
  };
}

programReadLine(rl);
