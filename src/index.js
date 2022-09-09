import "./styles.css";

const ongoingTouches = [];

function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

const colorTable = [];

const circleDiameter = 40;

let timer = 0;

function log(msg) {
  const container = document.getElementById("log");
  container.textContent = `${msg} \n${container.textContent}`;
}

function colorForTouch(touch) {
  return colorTable[touch.identifier];
}

function copyTouch({ identifier, pageX, pageY }) {
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

function handleStart(evt) {
  evt.preventDefault();
  log("touchstart.");
  const el = document.getElementById("canvas");
  const ctx = el.getContext("2d");
  const touches = evt.changedTouches;
  // clearTimeout(timer);
  // timer = setTimeout(() => {
  //   const rnd = getRandomInt(ongoingTouches.length);
  //   ctx.fillStyle = colorForTouch({ identifier: rnd });
  //   ctx.fillRect(0, 0, el.width, el.height);
  // }, 2000);

  for (let i = 0; i < touches.length; i++) {
    log(`touchstart: ${i}.`);
    ongoingTouches.push(copyTouch(touches[i]));
    const color = getRandomColor();
    colorTable.push(color);
    log(`color of touch with id ${touches[i].identifier} = ${color}`);
    drawShape(ctx, touches, i, color);
  }
}

function handleMove(evt) {
  evt.preventDefault();
  const el = document.getElementById("canvas");
  const ctx = el.getContext("2d");
  const touches = evt.changedTouches;

  ctx.clearRect(0, 0, el.width, el.height);
  for (let i = 0; i < touches.length; i++) {
    const color = colorForTouch(touches[i]);
    const idx = ongoingTouchIndexById(touches[i].identifier);

    if (idx >= 0) {
      log(`continuing touch ${idx}`);
      ctx.beginPath();
      log(
        `ctx.moveTo( ${ongoingTouches[idx].pageX}, ${ongoingTouches[idx].pageY} );`
      );

      ongoingTouches.splice(idx, 1, copyTouch(touches[i])); // swap in the new touch record
    } else {
      log("can't figure out which touch to continue");
    }

    drawShape(ctx, touches, i, color);
  }
}

function handleEnd(evt) {
  evt.preventDefault();
  log("touchend");
  const el = document.getElementById("canvas");
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

function handleCancel(evt) {
  evt.preventDefault();
  log("touchcancel.");
  const touches = evt.changedTouches;

  for (let i = 0; i < touches.length; i++) {
    let idx = ongoingTouchIndexById(touches[i].identifier);
    ongoingTouches.splice(idx, 1); // remove it; we're done
  }
}

function startup() {
  const el = document.getElementById("canvas");

  el.width = window.innerWidth;
  el.height = window.innerHeight - 200;

  el.addEventListener("touchstart", handleStart);
  el.addEventListener("touchend", handleEnd);
  el.addEventListener("touchcancel", handleCancel);
  el.addEventListener("touchmove", handleMove);

  log("Initialized.");
}

// document.addEventListener("DOMContentLoaded", startup);

startup();
