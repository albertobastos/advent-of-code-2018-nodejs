console.time("d04");
const rl = require("./utils").getInputRL("d04");

function programReadLine(rl) {
  let allEvents = []; // rawEvent = { datetime, type: (starts, sleeps, awakes), id }

  rl.on("line", line => {
    allEvents.push(parseRawEvent(line));
  });

  rl.on("close", () => {
    // ordenamos todos los eventos
    allEvents = allEvents.sort((e1, e2) => e1.datetime - e2.datetime);

    // añadimos ID a los eventos sleeps y awakes en base al guardia que estaba en ese momento
    let currentID = null;
    allEvents.forEach(event => {
      if (event.type === "starts") {
        currentID = event.id;
      } else {
        event.id = currentID;
      }
    });

    // eliminamos los eventos starts
    allEvents = allEvents.filter(event => event.type !== "starts");

    // agrupamos por guardia
    let eventsById = allEvents.reduce((acc, event) => {
      acc[event.id] = acc[event.id] || [];
      acc[event.id].push(event);
      return acc;
    }, {});

    // contamos cuantas veces está dormido cada guardia en cada minuto
    let sleepByMinuteById = {};
    Object.keys(eventsById).forEach(id => {
      let sleepByMinute = [...Array(60).keys()].reduce((acc, minute) => {
        acc[minute] = 0;
        return acc;
      }, {});

      let sleepStart,
        sleepEnd = null;
      eventsById[id].forEach(event => {
        if (event.type === "sleeps") {
          sleepStart = event.datetime.getMinutes();
        } else if (event.type === "awakes") {
          sleepEnd = event.datetime.getMinutes();
          for (let i = sleepStart; i < sleepEnd; i++) {
            sleepByMinute[i]++;
          }
        }
      });

      sleepByMinuteById[id] = sleepByMinute;
    });

    // identificamos el guardia que más duerme en total
    let topId = null,
      topIdMinutes = null;
    Object.keys(sleepByMinuteById).forEach(id => {
      let totalMinutes = Object.keys(sleepByMinuteById[id]).reduce(
        (sum, minute) => {
          return sum + sleepByMinuteById[id][minute];
        },
        0
      );
      if (!topId || topIdMinutes < totalMinutes) {
        topId = id;
        topIdMinutes = totalMinutes;
      }
    });

    // Part I: buscamos el minuto de más sueño del guardia que más duerme
    let topMinute = null;
    let topMinuteSleep = null;
    Object.keys(sleepByMinuteById[topId]).forEach(minute => {
      let sleep = sleepByMinuteById[topId][minute];
      if (topMinute === null || topMinuteSleep < sleep) {
        topMinute = minute;
        topMinuteSleep = sleep;
      }
    });

    console.log(
      "id",
      topId,
      "minute",
      topMinute,
      "answer (part I)",
      topId * topMinute
    );

    // Part II: buscamos el guardia y minuto que más veces está dormido
    topMinute = null;
    topMinuteSleep = null;
    topId = null;
    Object.keys(sleepByMinuteById).forEach(id => {
      Object.keys(sleepByMinuteById[id]).forEach(minute => {
        let sleep = sleepByMinuteById[id][minute];
        if (topId === null || topMinuteSleep < sleep) {
          topId = id;
          topMinute = minute;
          topMinuteSleep = sleep;
        }
      });
    });

    console.log(
      "id",
      topId,
      "minute",
      topMinute,
      "answer (part II)",
      topId * topMinute
    );
    console.timeEnd("d04");
  });
}

let regexRawEvent = /\[(.*)\] (.*)/;
let regexStarts = /Guard #([0-9]+) begins shift/;
let regexAwakes = /wakes up/;
let regexSleeps = /falls asleep/;

function parseRawEvent(line) {
  let match = regexRawEvent.exec(line);
  if (!match) {
    console.log("No match:", line);
    return;
  }

  let datetime = parseDateTime(match[1]);
  if (regexAwakes.exec(match[2])) {
    return {
      datetime: datetime,
      type: "awakes"
    };
  } else if (regexSleeps.exec(match[2])) {
    return {
      datetime: datetime,
      type: "sleeps"
    };
  } else if ((match = regexStarts.exec(match[2]))) {
    return {
      datetime: datetime,
      type: "starts",
      id: match[1]
    };
  } else {
    console.log("No description match:", line);
    return;
  }
}

function parseDateTime(str) {
  // YYYY-MM-DD HH:MI
  // new Date(year, month, day, hours, minutes)
  return new Date(
    Number(str.substring(0, 4)),
    Number(str.substring(5, 7)) - 1,
    Number(str.substring(8, 10)),
    Number(str.substring(11, 13)),
    Number(str.substring(14, 16))
  );
}

programReadLine(rl);
