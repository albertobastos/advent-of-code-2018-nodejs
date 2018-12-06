console.time("d06");
const rl = require("./utils").getInputRL("d06");

function programReadLine(rl) {
  let points = []; // {x, y}
  let regexPoint = /([0-9]+), ([0-9]+)/;

  rl.on("line", line => {
    let match = regexPoint.exec(line);
    points.push({ x: Number(match[1]), y: Number(match[2]) });
  });

  rl.on("close", () => {
    // find surface width and height
    let width = 0,
      height = 0;
    points.forEach(p => {
      width = Math.max(width, p.x + 1);
      height = Math.max(height, p.y + 1);
    });

    let surface = new Array(width * height); // use 2dto1d for accesing it!

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        let tmp = { distance: null, areaId: ".", totalDistanceToAll: 0 };
        points.forEach((p, areaId) => {
          let distance = manhattanDistance(p.x, p.y, x, y);
          if (tmp.distance === null || tmp.distance > distance) {
            // new closest point, label it
            tmp.distance = distance;
            tmp.areaId = areaId;
          } else if (tmp.distance === distance) {
            // more than one closest point, unclear area
            tmp.areaId = ".";
          }

          tmp.totalDistanceToAll += distance;
        });
        surface[_2dto1d(width, x, y)] = tmp;
      }
    }

    // get area sizes
    let areaSizes = new Array(points.length);
    surface
      .filter(spot => spot.areaId !== ".")
      .forEach(spot => {
        areaSizes[spot.areaId] = (areaSizes[spot.areaId] || 0) + 1;
      });

    // flag infinite areas (go further beyond the surface edges)
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
          // we are at an edge, the area at this point goes beyond as is infinite
          let spot = surface[_2dto1d(width, x, y)];
          areaSizes[spot.areaId] = -1;
        }
      }
    }

    // get highest area size
    let maxAreaSize = areaSizes.reduce(
      (prev, curr) => Math.max(prev, curr),
      -1
    );

    // check how many spots are within 10000 sum distance to all points
    let spotsWithin10000totalDistance = surface.filter(
      spot => spot.totalDistanceToAll < 10000
    );

    console.log("Answer (part I):", maxAreaSize);
    console.log("Answer (part II):", spotsWithin10000totalDistance.length);

    console.timeEnd("d06");
  });
}

function manhattanDistance(x1, y1, x2, y2) {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

function _2dto1d(width, x, y) {
  // converts matrix coordinates (2d) into array coordinates (1d)
  return width * y + x;
}

programReadLine(rl);
