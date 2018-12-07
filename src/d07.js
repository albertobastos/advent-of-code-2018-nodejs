console.time("d07");
const rl = require("./utils").getInputRL("d07");

let TASK_DURATION_OFFSET = 60;
let WORKERS_AMOUNT = 5;

function programReadLine(rl) {
  let requisites = {}; // letter = [pre-requisite letters]
  let regexRule = /Step (.) must be finished before step (.) can begin./;
  rl.on("line", line => {
    let match = regexRule.exec(line);
    requisites[match[1]] = requisites[match[1]] || [];
    requisites[match[2]] = requisites[match[2]] || [];
    requisites[match[2]].push(match[1]);
  });

  rl.on("close", () => {
    let processOrder = [];
    let nodes = JSON.parse(JSON.stringify(requisites));
    let pending = Object.keys(nodes).sort((a, b) =>
      a < b ? -1 : a > b ? 1 : 0
    );

    while (pending.length > 0) {
      // get first pending letter with no pre-requisites left
      let next = pending.find(letter => nodes[letter].length === 0);

      if (!next) {
        console.log(
          "ERROR: Iteration without any candidate that can be processed."
        );
        return;
      }

      // move it from pending to processed
      processOrder.push(next);
      pending = pending.filter(letter => letter !== next);

      // remove the processed node from pre-requisite lists
      pending.forEach(
        letter =>
          (nodes[letter] = nodes[letter].filter(
            requisite => requisite !== next
          ))
      );
    }

    pending = processOrder.slice();
    processing = [];
    processed = [];
    workers = new Array(WORKERS_AMOUNT);
    for (let i = 0; i < workers.length; i++) {
      workers[i] = { task: null, timeLeft: 0 };
    }

    let time = 0;

    //printStatusHeader(workers);
    while (pending.length > 0 || processing.length > 0) {
      for (let i = 0; i < workers.length; i++) {
        updateWorkerTask(workers[i], pending, processed);
      }
      for (let i = 0; i < workers.length; i++) {
        assignWorkerTask(
          workers[i],
          pending,
          processing,
          processed,
          requisites
        );
      }

      //printStatus(workers, time, processed);

      time++;
    }
    time--; // actually all task were finished the last increment

    console.log("Answer (part I):", processOrder.join(""));
    console.log("Answer (part II):", time);

    console.timeEnd("d07");
  });
}

function taskDuration(letter) {
  // 60 seconds + (A=1, B=2...)
  return (
    TASK_DURATION_OFFSET + "ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(letter) + 1
  );
}

function updateWorkerTask(worker, pending, processed) {
  if (worker.task) {
    worker.timeLeft--;
    if (worker.timeLeft === 0) {
      // task finished! update queues and mark worker as idle
      processing.splice(processing.indexOf(worker.task), 1);
      processed.push(worker.task);
      worker.task = null;
    }
  } else {
    // the worker was idle, nothing to update
  }
}

function assignWorkerTask(worker, pending, processing, processed, requisites) {
  if (worker.task) {
    // already working on something, nothing to update
  } else {
    // find pending task with all requisites processed
    let nextTask = pending.find(
      task =>
        requisites[task].filter(requisite => processed.indexOf(requisite) < 0)
          .length === 0
    );
    if (nextTask) {
      // there is a pending task with all requisites fulfilled, we can start it
      pending.splice(pending.indexOf(nextTask), 1);
      processing.push(nextTask);
      worker.task = nextTask;
      worker.timeLeft = taskDuration(nextTask);
    } else {
      // there are no pending tasks that can be started, the worker remains idle
    }
  }
}

function printStatusHeader(workers) {
  let str = "";

  // header
  str += "SEC\t";
  workers.forEach((_, index) => (str += "W" + index + "\t"));
  str += "DONE";

  console.log(str);
}

function printStatus(workers, second, processed) {
  let str = "";

  str += second + "\t";
  workers.forEach(worker => {
    str += (worker.task ? worker.task : ".") + "\t";
  });
  str += processed.join("");

  console.log(str);
}

programReadLine(rl);
