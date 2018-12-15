console.time("d15");
const rl = require("./utils").getInputRL("d15");

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
    console.log(
      "Answer (part I):",
      run(JSON.parse(JSON.stringify(MAP))).outcome
    );
    let part2result = null;
    let elfAttack = DEFAULT_ATTACK;
    do {
      elfAttack++;
      part2result = run(JSON.parse(JSON.stringify(MAP)), elfAttack, true);
    } while (!part2result); // keep trying until combat hasn't been aborted
    console.log("Answer (part II):", part2result.outcome, "(finally!)");
    console.timeEnd("d15");
  });
}

function run(map, elfAttack = DEFAULT_ATTACK, abortIfElfDies = false) {
  let players = initPlayers(map, elfAttack);
  let data = {
    map: map,
    players: players,
    round: 0,
    outcome: null,
    elfAttack: elfAttack
  };

  round: while (true) {
    players = players.sort((p1, p2) =>
      p1.pos.y === p2.pos.y ? p1.pos.x - p2.pos.x : p1.pos.y - p2.pos.y
    );
    for (let i = 0; i < players.length; i++) {
      player = players[i];
      if (player.alive) {
        // if there are no enemies left, game ends
        if (players.filter(p => p.alive && p.type !== player.type).length < 1) {
          break round;
        }

        let enemy = findEnemyToAttack(player, players);
        let next = enemy ? null : findNextMovement(player, players, map);
        if (!enemy && next) {
          map[player.pos.y][player.pos.x] = FREE;
          player.pos.x = next.x;
          player.pos.y = next.y;
          map[player.pos.y][player.pos.x] = player.type;

          // once we moved, check again if an enemy is at range
          enemy = findEnemyToAttack(player, players);
        }
        if (enemy) {
          // attack
          enemy.hp -= player.attack;
          if (enemy.hp < 1) {
            // we killed him! mark him as dead
            enemy.alive = false;
            map[enemy.pos.y][enemy.pos.x] = FREE;
            if (enemy.type === ELF && abortIfElfDies) return null;
          }
        }
      }
    }

    data.round++;
    //printStatus(data);
  }

  // outcome = completed rounds * remaining hit points
  data.outcome =
    data.round *
    players
      .filter(p => p.alive)
      .map(p => p.hp)
      .reduce((acc, curr) => acc + curr, 0);

  return data;
}

function initPlayers(map, elfAttack = DEFAULT_ATTACK) {
  let players = [];
  map.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell === ELF || cell === GOBLIN) {
        players.push({
          type: cell,
          hp: DEFAULT_HP,
          attack: cell === ELF ? elfAttack : DEFAULT_ATTACK,
          alive: true,
          pos: { x, y }
        });
      }
    });
  });
  return players;
}

function findEnemyToAttack(player, allPlayers) {
  return (
    allPlayers
      // discard allies and dead players (that will already discard himself)
      .filter(p => p.type !== player.type && p.alive)
      // get only those within range
      .filter(
        p =>
          (Math.abs(p.pos.x - player.pos.x) === 1 &&
            p.pos.y === player.pos.y) ||
          (Math.abs(p.pos.y - player.pos.y) === 1 && p.pos.x === player.pos.x)
      )
      // find the weakest one (in tie, the first found in order prevails)
      .reduce(
        (weakest, curr) =>
          weakest === null || weakest.hp > curr.hp ? curr : weakest,
        null
      )
  );
}

function findNextMovement(player, allPlayers, map) {
  let targetKeys = {};
  allPlayers
    .filter(p => p.alive && p.type !== player.type)
    .map(p => getAdjacents(p.pos).filter(pos => map[pos.y][pos.x] === FREE))
    .reduce((acc, list) => acc.concat(...list), [])
    .forEach(pos => (targetKeys[`${pos.x},${pos.y}`] = pos));

  let visited = {};
  visited[`${player.pos.x},${player.pos.y}`] = true;

  let paths = [[player.pos]];
  while (true) {
    let newPaths = [];
    let targetPaths = [];
    paths.forEach(path => {
      let adjacents = getAdjacents(path[path.length - 1]);
      adjacents.forEach(adj => {
        let xy = `${adj.x},${adj.y}`;
        if (targetKeys[xy]) {
          // found a path to a target!
          // add it so at the end of the iteration we chose the right one based on first step order
          targetPaths.push([...path, adj, targetKeys[xy]]);
        } else if (!visited[xy] && map[adj.y][adj.x] === FREE) {
          // we push the extended path for the next iteration
          newPaths.push([...path, adj]);
        }
        visited[xy] = true; // mark as visited so other paths ignore it
      });
    });

    if (targetPaths.length > 0) {
      // if we found multiple shortest paths, take the step to reach the first target according top-to-bottom/left-to-right order
      targetPaths = targetPaths.sort((p1, p2) =>
        p1[p1.length - 1].y === p2[p2.length - 1].y
          ? p1[p1.length - 1].x - p2[p2.length - 1].x
          : p1[p1.length - 1].y - p2[p2.length - 1].y
      );

      // we return the first step to take for the shortest path ([0] is the player current position)
      return targetPaths[0][1];
    }

    paths = newPaths;
    if (paths.length < 1) return null; // no reachables targets!
  }

  // explode paths until one or more targets are reached
  // once that happens, use the path for the top-to-bottom/left-to-right first target reached
}

function getAdjacents(pos) {
  return [
    { x: pos.x, y: pos.y - 1 },
    { x: pos.x - 1, y: pos.y },
    { x: pos.x + 1, y: pos.y },
    { x: pos.x, y: pos.y + 1 }
  ];
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
    .forEach(p => console.log(p.type, p.pos.x, p.pos.y, p.hp));
}

programReadLine(rl);
