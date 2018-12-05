console.time("d05");
const rl = require("./utils").getInputRL("d05");

function programReadLine(rl) {
  let polymer = null;
  rl.on("line", line => {
    // process the initial polymer
    polymer = processPolymer(line);

    //console.log("Polymer (after part I):", polymer);
    console.log("Answer (part I):", polymer.length);

    // get all different characters (no matter the polarity) in the current chain
    let chars = Object.keys(
      polymer.split("").reduce((acc, char) => {
        acc[char.toLowerCase()] = true;
        return acc;
      }, {})
    );

    // for each letter, test the resulting processed polymer after removing it
    // we do that research using the already reduced polymer, more efficient than using the original one!
    let bestRemoval = chars
      .map(char => {
        // convert [char] to { component: [char], resultLength: [polymer length removing char] }
        let modifiedPolymer = polymer.replace(new RegExp(char, "ig"), "");
        let processedModifiedPolymer = processPolymer(modifiedPolymer);
        return {
          component: char,
          resultLength: processedModifiedPolymer.length
        };
      })
      .reduce((best, current) => {
        if (!best || best.resultLength > current.resultLength) {
          best = current;
        }
        return best;
      }, null);

    console.log("Answer (part II):", bestRemoval.resultLength);
  });

  rl.on("close", () => {
    console.timeEnd("d05");
  });
}

function processPolymer(chain) {
  let i = 0;
  // paramos cuando el cursor se sitúe sobre el último componente (no quedan parejas)
  while (i < chain.length - 1) {
    let newChain = processPair(chain, i);
    if (newChain.length < chain.length) {
      // se ha destruido la pareja, retrocedemos una posición porque su desaparición
      // reabre la posibilidad de que el elemento anterior se empareje con un contrario
      chain = newChain;
      i--;
    } else {
      // la pareja actual no se destruye, avanzamos una posición
      i++;
    }
  }
  return chain;
}

function processPair(chain, i) {
  let e1 = chain.charAt(i);
  let e2 = chain.charAt(i + 1);
  let processedChain;
  if (e1 !== e2 && e1.toUpperCase() === e2.toUpperCase()) {
    // mismo sígno, distinta polaridad... destruímos
    processedChain = chain.slice(0, i) + chain.slice(i + 2);
  } else {
    // no destruímos
    processedChain = chain;
  }

  return processedChain;
}

programReadLine(rl);
