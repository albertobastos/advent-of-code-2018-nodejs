console.time("d13");
const rl = require("./utils").getInputRL("d13");

// translations for tracks with initial cart on it
const CART_TO_TRACK = {
  ">": "-",
  "<": "-",
  "^": "|",
  v: "|"
};

// x,y translation based on current direction
const MOVEMENT_RULES = {
  ">": { dx: +1, dy: +0 },
  "<": { dx: -1, dy: +0 },
  "^": { dx: +0, dy: -1 },
  v: { dx: +0, dy: +1 }
};

// transitions based on current direction and new track or shift
const DIRECTION_RULES = {
  ">-": ">",
  "<-": "<",
  "^|": "^",
  "v|": "v",
  ">/": "^",
  "</": "v",
  "^/": ">",
  "v/": "<",
  ">\\": "v",
  "<\\": "^",
  "^\\": "<",
  "v\\": ">",
  "<<": "v",
  "<>": "^",
  "><": "^",
  ">>": "v",
  "v>": "<",
  "v<": ">",
  "^>": ">",
  "^<": "<",
  ">.": ">",
  "<.": "<",
  "^.": "^",
  "v.": "v"
};

const INTERSECTION_SEQUENCE = ["<", ".", ">"];

function programReadLine(rl) {
  const map = new Array(); // two-dimensional array [y][x]
  const carts = []; // { x, y, direction, nextTurn }
  rl.on("line", line => {
    let row = line.split("").map(track => CART_TO_TRACK[track] || track);
    line.split("").forEach((cell, index) => {
      if (CART_TO_TRACK[cell]) {
        carts.push({
          id: carts.length + 1,
          direction: cell,
          intersections: 0,
          x: index,
          y: map.length,
          crashed: false
        });
      }
    });
    map.push(row);
  });

  rl.on("close", () => {
    let result = run(map, carts);
    console.log("Answer (part I):", result.firstCrash);
    console.log("Answer (part II):", result.lastCartPosition);

    console.timeEnd("d13");
  });
}

function run(map, carts) {
  let result = {
    firstCrash: null,
    lastCartPosition: null,
    ticks: 0
  };
  while (carts.length > 1) {
    //printStatus(map, carts);
    carts = carts.sort((cart1, cart2) =>
      cart1.x === cart2.x ? cart1.y - cart2.y : cart1.x - cart2.x
    );
    carts.forEach(cart => {
      if (cart.crashed) return;
      let movement = MOVEMENT_RULES[cart.direction];
      cart.x += movement.dx;
      cart.y += movement.dy;
      let newTrack = map[cart.y][cart.x];
      if (newTrack === "+") {
        newTrack =
          INTERSECTION_SEQUENCE[
            cart.intersections % INTERSECTION_SEQUENCE.length
          ];
        cart.intersections++;
      }
      cart.direction = DIRECTION_RULES[`${cart.direction}${newTrack}`];

      let crash = carts.find(
        other =>
          other.id !== cart.id &&
          !other.crashed &&
          other.x === cart.x &&
          other.y === cart.y
      );
      if (crash) {
        result.firstCrash = result.firstCrash || { x: cart.x, y: cart.y };
        cart.crashed = crash.crashed = true;
      }
    });
    carts = carts.filter(c => !c.crashed);
    result.ticks++;
  }
  if (carts.length > 0) {
    result.lastCartPosition = { x: carts[0].x, y: carts[0].y };
  }
  return result;
}

function printStatus(map, carts) {
  let str = JSON.parse(JSON.stringify(map));
  carts.forEach(cart => {
    str[cart.y][cart.x] = cart.direction;
  });
  console.log(str.map(row => row.join("")).join("\n") + "\n\n");
}

programReadLine(rl);
