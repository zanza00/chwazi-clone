import "./styles.css";

const ongoingTouches: ClonedTouch[] = [];

function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

const colorTable: string[] = [];

const circleDiameter = 40;

let timer: NodeJS.Timeout;

function log(msg: string) {
  const container = document.getElementById("log");
  container.textContent = `${msg} \n${container.textContent}`;
}

function colorForTouch(touch: Touch) {
  return colorTable[touch.identifier];
}

type ClonedTouch = {
  identifier: Touch["identifier"];
  pageX: Touch["pageX"];
  pageY: Touch["pageY"];
};
function copyTouch({ identifier, pageX, pageY }: Touch): ClonedTouch {
  return { identifier, pageX, pageY };
}

function ongoingTouchIndexById(idToFind) {
  for (let i = 0; i < ongoingTouches.length; i++) {
    const id = ongoingTouches[i].identifier;

    if (id === idToFind) {
      return i;
    }
  }
  return -1; // not found
}

function drawShape(ctx, touches, i, color) {
  ctx.beginPath();
  ctx.arc(
    touches[i].pageX,
    touches[i].pageY,
    circleDiameter,
    0,
    2 * Math.PI,
    false
  ); // a circle at the start

  ctx.arc(
    touches[i].pageX,
    touches[i].pageY,
    circleDiameter + circleDiameter * 1,
    0,
    2 * Math.PI,
    false
  ); // outer (filled)
  ctx.arc(
    touches[i].pageX,
    touches[i].pageY,
    circleDiameter + circleDiameter * 0.5,
    0,
    2 * Math.PI,
    true
  ); // outer (unfills it)
  ctx.fillStyle = color;
  ctx.fill();
}

function handleStart(evt: TouchEvent) {
  evt.preventDefault();
  log("touchstart.");
  const el = document.getElementsByTagName("canvas")[0];
  const ctx = el.getContext("2d");
  const touches = evt.changedTouches;
  clearTimeout(timer);
  timer = setTimeout(() => {
    const rnd = getRandomInt(ongoingTouches.length);
    const color = colorForTouch({ identifier: rnd } as Touch);
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, el.width, el.height);
    log(`Winner of the raffle is id ${rnd} with color ${color}`);
  }, 2000);

  for (let i = 0; i < touches.length; i++) {
    log(`touchstart: ${i}.`);
    ongoingTouches.push(copyTouch(touches[i]));
    const color = getRandomColor();
    colorTable.push(color);
    log(`color of touch with id ${touches[i].identifier} = ${color}`);
    drawShape(ctx, touches, i, color);
  }
}

function handleMove(evt: TouchEvent) {
  evt.preventDefault();
  const el = document.getElementsByTagName("canvas")[0];
  const ctx = el.getContext("2d");
  const touches = evt.changedTouches;

  for (let i = 0; i < touches.length; i++) {
    const idx = ongoingTouchIndexById(touches[i].identifier);

    if (idx >= 0) {
      ongoingTouches.splice(idx, 1, copyTouch(touches[i])); // swap in the new touch record
    } else {
      log("can't figure out which touch to continue");
    }
  }

  ctx.clearRect(0, 0, el.width, el.height);
  for (let idx = 0; idx < ongoingTouches.length; idx++) {
    const color = colorTable[idx];
    drawShape(ctx, touches, idx, color);
  }
}

function handleEnd(evt: TouchEvent) {
  evt.preventDefault();
  log("touchend");
  const el = document.getElementsByTagName("canvas")[0];
  const ctx = el.getContext("2d");
  const touches = evt.changedTouches;

  for (let i = 0; i < touches.length; i++) {
    let idx = ongoingTouchIndexById(touches[i].identifier);

    if (idx >= 0) {
      ctx.clearRect(0, 0, el.width, el.height);
      ongoingTouches.splice(idx, 1); // remove it; we're done
      colorTable.splice(idx, 1); // remove it; we're done
    } else {
      log("can't figure out which touch to end");
    }
  }
}

function handleCancel(evt: TouchEvent) {
  evt.preventDefault();
  log("touchcancel.");
  const touches = evt.changedTouches;

  for (let i = 0; i < touches.length; i++) {
    let idx = ongoingTouchIndexById(touches[i].identifier);
    ongoingTouches.splice(idx, 1); // remove it; we're done
    colorTable.splice(idx, 1); // remove it; we're done
  }
  if (ongoingTouches.length === 0) {
    clearTimeout(timer);
  }
}

function startup() {
  const el = document.getElementsByTagName("canvas")[0];

  el.width = window.innerWidth;
  el.height = window.innerHeight - 200;

  log(`H:${window.innerHeight} W: ${window.innerWidth}`);

  el.addEventListener("touchstart", handleStart);
  el.addEventListener("touchend", handleEnd);
  el.addEventListener("touchcancel", handleCancel);
  el.addEventListener("touchmove", handleMove);

  log("Initialized.");
}

function resizeCanvas() {
  const el = document.getElementsByTagName("canvas")[0];

  el.width = window.innerWidth;
  el.height = window.innerHeight - 200;

  log(`H:${window.innerHeight} W: ${window.innerWidth}`);
}

window.addEventListener("resize", resizeCanvas);

startup();
