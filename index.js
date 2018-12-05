const fs = require("fs");
const srcFolder = "./src";

if (process.argv.length !== 3) {
  console.log("Missing arguments");
  console.log("Example: npm run day 01");
  return;
}

let dayArg = process.argv && process.argv[2];
let validDay = !!/^[0-9]+$/.exec(dayArg);

if (!validDay) {
  console.log("Invalid day argument:", dayArg);
  return;
}

let daySrcPath = `${srcFolder}/d${dayArg}.js`;
if (!fs.existsSync(daySrcPath)) {
  console.log("Day not implemented:", dayArg);
  return;
}

// it exists... just import it so it gets executed
console.log(`Running day at ${daySrcPath}...\n`);
require(daySrcPath);
