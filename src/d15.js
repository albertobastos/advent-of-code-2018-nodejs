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
    console.log(
      "Answer (part II):",
      part2result.outcome,
      "(INCORRECT, expected 54096 with elf attack 15)"
    );
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
        //let next = findNextStepToClosestEnemy(player, players, map);
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
  let rivalType = player.type === ELF ? GOBLIN : ELF;
  let paths = [[{ x: player.pos.x, y: player.pos.y }]];
  let visited = {};
  visited[`${player.pos.x},${player.pos.y}`] = true;

  while (paths.length > 0) {
    let newPaths = [];
    for (let iPath = 0; iPath < paths.length; iPath++) {
      let path = paths[iPath];
      let pos = path[path.length - 1];
      // for each position, check next movements (order matters!)
      let candidates = [
        { x: pos.x, y: pos.y - 1 },
        { x: pos.x - 1, y: pos.y },
        { x: pos.x + 1, y: pos.y },
        { x: pos.x, y: pos.y + 1 }
      ];

      for (let iCand = 0; iCand < candidates.length; iCand++) {
        let cand = candidates[iCand];
        let cell = map[cand.y][cand.x];
        if (cell === rivalType) {
          // we found the closest rival!
          // return the first step required
          return path[1];
        }

        if (!visited[`${cand.x},${cand.y}`] && cell === FREE) {
          // new step to add to the path
          newPaths.push([...path, cand]);
          visited[`${cand.x},${cand.y}`] = true; // mark it as visited so other exploring paths do not move into it
        }
      }
    }

    paths = newPaths;
  }

  return null; // no paths to any enemy available
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
