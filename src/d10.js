console.time("d10");
const rl = require("./utils").getInputRL("d10");

function programReadLine(rl) {
  let points = [];
  rl.on("line", line => {
    points.push(parsePoint(line));
  });

  rl.on("close", () => {
    // Strategy: keep iterating until we found a step where boundaries start increasing again
    let data = {
      found: false,
      minWidth: null,
      minHeight: null,
      points: points,
      box: getBoundariesData(points),
      seconds: 0
    };
    data.minWidth = data.box.width;
    data.minHeight = data.box.height;

    while (!data.found) {
      let newPoints = advancePoints(data.points);
      let newBox = getBoundariesData(newPoints);
      let decreased = false;
      if (data.minWidth === null || newBox.width < data.minWidth) {
        data.minWidth = newBox.width;
        decreased = true;
      }
      if (data.minHeight === null || newBox.height < data.minHeight) {
        data.minHeight = newBox.height;
        decreased = true;
      }

      if (decreased) {
        data.points = newPoints;
        data.box = newBox;
        data.seconds++;
      } else {
        data.found = true;
      }
    }

    console.log("Answer (part I):");
    printMessage(data);
    console.log("Answer (part II):", data.seconds);

    console.timeEnd("d10");
  });
}

let regexPoint = /position=<(.+), (.+)> velocity=<(.+), (.+)>/;
function parsePoint(str) {
  let n = regexPoint
    .exec(str)
    .slice(1)
    .map(Number);

  return {
    x: n[0],
    y: n[1],
    vx: n[2],
    vy: n[3]
  };
}

function advancePoints(points) {
  // create a copy
  points = points.map(p => {
    return {
      x: p.x + p.vx,
      y: p.y + p.vy,
      vx: p.vx,
      vy: p.vy
    };
  });
  return points;
}

function getBoundariesData(points) {
  let data = points.reduce(
    (data, p) => {
      if (data.minX === null || p.x < data.minX) data.minX = p.x;
      if (data.maxX === null || p.x > data.maxX) data.maxX = p.x;
      if (data.minY === null || p.y < data.minY) data.minY = p.y;
      if (data.maxY === null || p.y > data.maxY) data.maxY = p.y;
      return data;
    },
    {
      minX: null,
      maxX: null,
      minY: null,
      maxY: null,
      width: null,
      height: null
    }
  );

  data.width = data.maxX - data.minX + 1;
  data.height = data.maxY - data.minY + 1;

  return data;
}

function printMessage(data) {
  // normalize the points
  let points = data.points.map(p => {
    return { x: p.x - data.box.minX, y: p.y - data.box.minY };
  });

  // create a width*height grid filled with dots
  let grid = new Array(data.box.height);
  for (let i = 0; i < data.box.height; i++) {
    grid[i] = new Array(data.box.width).fill(".");
  }

  // for each point, put a # in the grid
  points.forEach(p => {
    grid[p.y][p.x] = "#";
  });

  // paint the grid
  grid.forEach(row => {
    console.log(row.join(" "));
  });
}

programReadLine(rl);
