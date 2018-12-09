console.time("d09");
const rl = require("./utils").getInputRL("d09");

function programReadLine(rl) {
  let config = {
    players: null,
    lastMarble: null
  };

  rl.on("line", line => {
    let regex = /([0-9]+) players; last marble is worth ([0-9]+) points/;
    let match = regex.exec(line);

    config.players = Number(match[1]);
    config.lastMarble = Number(match[2]);
  });

  rl.on("close", () => {
    console.log("Answer (part I):", Math.max(...runGame(config).scores));

    config.lastMarble = config.lastMarble * 100;
    console.log("Answer (part II):", Math.max(...runGame(config).scores));

    console.timeEnd("d09");
  });
}

function runGame(config) {
  let initialMarble = {
    value: 0,
    prev: null,
    next: null
  };
  initialMarble.prev = initialMarble;
  initialMarble.next = initialMarble;

  let game = {
    scores: new Array(config.players).fill(0),
    round: 1,
    current: initialMarble,
    initial: initialMarble,
    player: 0
  };

  // sample config
  //config.players = 9;
  //config.lastMarble = 27;

  while (game.round <= config.lastMarble) {
    if (game.round % 23 === 0) {
      // score round!
      game.scores[game.player] += game.round;
      let toRemove = game.current.prev.prev.prev.prev.prev.prev.prev;
      game.scores[game.player] += toRemove.value;
      toRemove.prev.next = toRemove.next;
      toRemove.next.prev = toRemove.prev;
      game.current = toRemove.next;
    } else {
      // regular round
      let newMarblePrev = game.current.next;

      let newMarble = {
        value: game.round,
        next: newMarblePrev.next,
        prev: newMarblePrev
      };

      newMarblePrev.next = newMarble;
      newMarble.next.prev = newMarble;

      game.current = newMarble;
    }

    //printRound(game);

    game.round++;
    game.player = (game.player + 1) % config.players;
  }

  return game;
}

function printRound(game) {
  let board = [];
  let marble = game.initial;
  do {
    if (marble.value === game.current.value) {
      board.push(`(${marble.value})`);
    } else {
      board.push(` ${marble.value} `);
    }
    marble = marble.next;
  } while (marble !== game.initial);

  console.log(`[${game.player + 1}]`, board.join(" "));
}

programReadLine(rl);
