console.time("d13");
const rl = require("./utils").getInputRL("d13");

const TRACK_EMPTY = " "; // ' '
const TRACK_HORIZONTAL = "-"; // '-'
const TRACK_VERTICAL = "|"; // '|'
const TRACK_TURN_CLOCKWISERIGHT = "\\"; // '\';
const TRACK_TURN_CLOCKWISELEFT = "/"; // '/';
const TRACK_INTERSECTION = "+"; // '+';

const UP = "^"; // ^
const DOWN = "v"; // v
const LEFT = "<"; // <
const RIGHT = ">"; // >
const STRAIGHT = "-";

const TRACKTURNS = {};
TRACKTURNS[">\\"] = "v";
TRACKTURNS["<\\"] = "^";
TRACKTURNS["^\\"] = "<";
TRACKTURNS["v\\"] = ">";
TRACKTURNS[">/"] = "^";
TRACKTURNS["</"] = "v";
TRACKTURNS["^/"] = ">";
TRACKTURNS["v/"] = "<";

const CARTTURNS = {};
CARTTURNS["^0"] = "<";
CARTTURNS["^2"] = ">";
CARTTURNS["^1"] = "^";
CARTTURNS[">0"] = "^";
CARTTURNS[">2"] = "v";
CARTTURNS[">1"] = ">";
CARTTURNS["v0"] = ">";
CARTTURNS["v2"] = "<";
CARTTURNS["v1"] = "v";
CARTTURNS["<0"] = "v";
CARTTURNS["<2"] = "^";
CARTTURNS["<1"] = "<";

const TURNSLOOP = [LEFT, STRAIGHT, RIGHT];

function programReadLine(rl) {
  const MAP = new Array(); // two-dimensional array [y][x]
  const CARTS = []; // { x, y, direction, nextTurn }
  rl.on("line", line => {
    let row = line.split("").map(parseInputCell);
    line.split("").forEach((c, index) => {
      if (isCart(c)) {
        CARTS.push({
          id: CARTS.length + 1,
          x: index,
          y: MAP.length,
          direction: parseCartDirection(c),
          nextTurn: 0,
          crashed: false
        });
      }
    });
    MAP.push(row);
  });

  rl.on("close", () => {
    let result = run(JSON.parse(JSON.stringify(MAP)), JSON.parse(JSON.stringify(CARTS)));
    console.log("Answer (part I):", result.firstCrash);
    console.log("Answer (part II):", result.lastPosition);

    console.timeEnd("d13");
  });
}

function run(map, carts) {
  let i = 0;
  let result = {
    firstCrash: null,
    lastPosition: null
  };
  while (carts.filter(c => !c.crashed).length > 1) {
    carts = rearrangeCarts(carts);
    for (let i = 0; i < carts.length; i++) {
      let cart = carts[i];
      if (!cart.crashed) {
        updateCart(map, cart);
        let crash = detectCrash(carts, cart);
        if (crash) {
          cart.crashed = true;
          crash.otherCart.crashed = true;
          result.firstCrash = result.firstCrash || crash.position;
        }
      }
    }

    //printMap(map, carts);
  }

  let lastCartStanding = carts.find(c => !c.crashed);
  result.lastPosition = { x: lastCartStanding.x, y: lastCartStanding.y };
  return result;
}

function rearrangeCarts(carts) {
  return carts.sort((c1, c2) => (c1.x === c2.x ? c1.y - c2.y : c1.x - c2.x));
}

function updateCart(map, cart) {
  let nextCell;
  // check movement
  switch (cart.direction) {
    case UP:
      nextCell = { x: cart.x, y: cart.y - 1 };
      break;
    case DOWN:
      nextCell = { x: cart.x, y: cart.y + 1 };
      break;
    case LEFT:
      nextCell = { x: cart.x - 1, y: cart.y };
      break;
    case RIGHT:
      nextCell = { x: cart.x + 1, y: cart.y };
      break;
    default:
      throw new Error("updateCarts > cart > direction > " + cart.direction);
  }

  // check direction changes
  let nextTrack = map[nextCell.y][nextCell.x];
  switch (nextTrack) {
    case TRACK_VERTICAL:
    case TRACK_HORIZONTAL:
      break; // just keep the track
    case TRACK_INTERSECTION:
      cart.direction = CARTTURNS[cart.direction + cart.nextTurn];
      cart.nextTurn = (cart.nextTurn + 1) % TURNSLOOP.length;
      break;
    case TRACK_TURN_CLOCKWISELEFT:
    case TRACK_TURN_CLOCKWISERIGHT:
      cart.direction = TRACKTURNS[cart.direction + nextTrack];
      break;
    default:
      throw new Error("updateCart > next cell > " + nextTrack);
  }

  //console.log(cart.x, cart.y, prevDirection, "###", nextTrack, "###", nextCell.x, nextCell.y, cart.direction);

  cart.x = nextCell.x;
  cart.y = nextCell.y;
}

function detectCrash(carts, cart) {
  for (let i = 0; i < carts.length; i++) {
    let otherCart = carts[i];
    if (!otherCart.crashed && otherCart.id !== cart.id) {
      if (otherCart.x === cart.x && otherCart.y === cart.y) {
        return {
          otherCart: otherCart,
          position: { x: cart.x, y: cart.y }
        };
      }
    }
  }
  return null;
}

function parseInputCell(cell) {
  switch (cell) {
    case UP:
    case DOWN:
      return TRACK_VERTICAL;
    case LEFT:
    case RIGHT:
      return TRACK_HORIZONTAL;
    default:
      return cell;
  }
}

function isCart(cell) {
  switch (cell) {
    case "^":
    case "v":
    case ">":
    case "<":
      return true;
    default:
      return false;
  }
}

function parseCartDirection(cell) {
  return cell;
}

function printMap(map, carts) {
  let mapStr = map.map(row =>
    row.map(cell => {
      switch (cell) {
        case TRACK_EMPTY:
          return " ";
        case TRACK_HORIZONTAL:
          return "-";
        case TRACK_VERTICAL:
          return "|";
        case TRACK_TURN_CLOCKWISELEFT:
          return "/";
        case TRACK_TURN_CLOCKWISERIGHT:
          return "\\";
        case TRACK_INTERSECTION:
          return "+";
        default:
          throw new Error("printMap > cell > " + cell);
      }
    })
  );

  carts.forEach(cart => {
    let char;
    switch (cart.direction) {
      case UP:
        char = "^";
        break;
      case DOWN:
        char = "v";
        break;
      case LEFT:
        char = "<";
        break;
      case RIGHT:
        char = ">";
        break;
      default:
        throw new Error("printMap > cart direction > " + cart.direction);
    }
    mapStr[cart.y][cart.x] = char;
  });

  console.log(mapStr.map(row => row.join("")).join("\n") + "\n\n");
}

programReadLine(rl);
