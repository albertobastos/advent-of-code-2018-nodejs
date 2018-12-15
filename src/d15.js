console.time("d15");
const rl = require("./utils").getInputRL("d15ex");

const WALL = "#";
const FREE = ".";
const ELF = "E";
const GOBLIN = "G";

const DEFAULT_ATTACK = 3;
const DEFAULT_HP = 200;

function programReadLine(rl) {
  let MAP = [];

  rl.on("line", line => {
    MAP.push(line.split("")); // MAP[y][x] = contents of [x,y] spot
  });

  rl.on("close", () => {
    let result = run(JSON.parse(JSON.stringify(MAP)));
    console.log("Answer (part I):", result.part1);
    console.log("Answer (part II):", result.part2);

    console.timeEnd("d15");
  });
}

function run(map) {
  let players = initPlayers(map);
  let data = {
    map: map,
    players: players,
    round: 0,
    part1: null,
    part2: null
  };

  round: while (true) {
    players = players.sort((p1, p2) =>
      p1.y === p2.y ? p1.x - p2.x : p1.y - p2.y
    );
    for (let i = 0; i < players.length; i++) {
      player = players[i];
      if (player.alive) {
        // if there are no enemies left, game ends
        if (players.filter(p => p.alive && p.type !== player.type).length < 1) {
          break round;
        }

        let enemy = findEnemyToAttack(player, players);
        let next = findNextStepToClosestEnemy(player, players, map);
        if (!enemy && next) {
          map[player.y][player.x] = FREE;
          player.x = next.x;
          player.y = next.y;
          map[player.y][player.x] = player.type;

          // once we moved, check again if an enemy is at range
          enemy = findEnemyToAttack(player, players);
        }
        if (enemy) {
          // attack
          enemy.hp -= player.attack;
          if (enemy.hp < 1) {
            // we killed him! mark him as dead
            enemy.alive = false;
            map[enemy.y][enemy.x] = FREE;
          }
        }
      }
    }

    data.round++;
    //printStatus(data);
  }

  // outcome = completed rounds * remaining hit points
  data.part1 =
    data.round *
    players
      .filter(p => p.alive)
      .map(p => p.hp)
      .reduce((acc, curr) => acc + curr, 0);

  return data;
}

function initPlayers(map) {
  let players = [];
  map.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell === ELF || cell === GOBLIN) {
        players.push({
          type: cell,
          hp: DEFAULT_HP,
          attack: DEFAULT_ATTACK,
          alive: true,
          x: x,
          y: y
        });
      }
    });
  });
  return players;
}

function findEnemyToAttack(player, allPlayers) {
  return (
    allPlayers
      // discard allieds and dead players (that will already discard himself)
      .filter(p => p.type !== player.type && p.alive)
      // get only those within range
      .filter(
        p =>
          (Math.abs(p.x - player.x) === 1 && p.y === player.y) ||
          (Math.abs(p.y - player.y) === 1 && p.x === player.x)
      )
      // in case of many candidates, find the weakest (in case of many weakest, keep the first one left-to-right top-to-bottom)
      .reduce(
        (weakest, curr) =>
          weakest === null || weakest.hp > curr.hp ? curr : weakest,
        null
      )
  );
}

function findNextStepToClosestEnemy(player, allPlayers, map) {
  // for each alive enemy, get the real distance to the free path
  let aliveEnemies = allPlayers.filter(p => p.alive && p.type !== player.type);

  let closestEnemy = (closestPath = null);
  aliveEnemies.forEach(p => {
    let path = getAvailablePath(
      { x: player.x, y: player.y },
      { x: p.x, y: p.y },
      map
    );
    if (path && (closestEnemy === null || closestPath.length > path.length)) {
      [closestEnemy, closestPath] = [p, path];
    }
  });

  return closestPath && closestPath[1]; // [0] is the current position
}

function getAvailablePath(from, to, map, visited = {}) {
  // if they are within range, there is no path!
  if (
    (Math.abs(from.x - to.x) <= 1 && from.y === to.y) ||
    (Math.abs(from.y - to.y) <= 1 && from.x === to.x)
  ) {
    return [from];
  }

  // filter where can we move without revisiting a spot
  // order matters!
  let nextCells = [
    { x: from.x, y: from.y - 1 },
    { x: from.x - 1, y: from.y },
    { x: from.x + 1, y: from.y },
    { x: from.x, y: from.y + 1 }
  ]
    // discard already visited spots
    .filter(({ x, y }) => !visited[`${x},${y}`])
    // discard non-free spots
    .filter(({ x, y }) => map[y] && map[y][x] && map[y][x] === FREE);

  // mark current as visited so recursive calls do not come back
  visited[`${from.x},${from.y}`] = true;

  let bestPath = nextCells
    .map(cell => getAvailablePath(cell, to, map, { ...visited }))
    .filter(r => r !== null)
    .reduce(
      (best, curr) =>
        best === null || best.length > curr.length ? curr : best,
      null
    );

  // add the current cell to the best path for recursion
  if (bestPath) {
    bestPath.splice(0, 0, { x: from.x, y: from.y });
  }

  return bestPath;
}

function printStatus(data) {
  console.log("After round", data.round);
  printMap(data.map);
  printPlayers(data.players, true);
  console.log();
}

function printMap(map) {
  console.log(map.map(row => row.join("")).join("\n"));
}

function printPlayers(players, onlyAlive) {
  players
    .filter(p => !onlyAlive || p.alive)
    .forEach(p => console.log(p.type, p.x, p.y, p.hp));
}

programReadLine(rl);
