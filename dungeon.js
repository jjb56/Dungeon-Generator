// Core dungeon constants
const canvas = document.getElementById("dungeonCanvas");
const ctx = canvas.getContext("2d");

const GRID_SIZE = 7;
const ROOM_SIZE = 64;
const ROOM_MARGIN = 64;
const START_X = 100;
const START_Y = 100;
const MAX_ROOMS = rollDice(2, 6) + 3;
const directions = [
  [-1, -1], [0, -1], [1, -1],
  [-1, 0],           [1, 0],
  [-1, 1],  [0, 1],  [1, 1]
];

let dungeon = {};
let doorLines = [];

function rollDice(count, sides) {
  return Array.from({ length: count }).reduce(r => r + Math.ceil(Math.random() * sides), 0);
}

function rollRoomType() {
  const roll = rollDice(1, 12);
  if (roll <= 3) return "Combat";
  if (roll <= 4) return "Puzzle";
  if (roll <= 6) return "Trap";
  if (roll <= 7) return "Exploration";
  if (roll <= 8) return "Obstacle";
  if (roll <= 10) return "Combat\n" + rollRoomType();
  if (roll <= 11) return "Social/NPC";
  return "Boss";
}

function rollDoorType() {
  const roll = rollDice(1, 12);
  if (roll <= 4) return "Normal";
  if (roll <= 5) return "Stuck";
  if (roll <= 7) return "Locked";
  if (roll <= 8) return "Puzzle";
  if (roll <= 9) return "Hidden";
  if (roll <= 10) return "Caved In";
  if (roll <= 11) return "Magic";
  return "Fake Door";
}

function generateDungeon() {
  dungeon = {};
  doorLines = [];
  const center = [Math.floor(GRID_SIZE / 2), Math.floor(GRID_SIZE / 2)];
  addRoom(...center, true);
  const queue = [center];
  let roomCount = 1;

  while (queue.length > 0 && roomCount < MAX_ROOMS) {
    const [x, y] = queue.shift();
    const room = dungeon[`${x},${y}`];
    const desiredConnections = Math.min(rollDice(1, 6), 8);

    shuffleArray(directions);
    let connections = 0;

    for (const [dx, dy] of directions) {
      if (connections >= desiredConnections) break;
      const nx = x + dx, ny = y + dy;
      const key = `${nx},${ny}`;

      if (nx < 0 || ny < 0 || nx >= GRID_SIZE || ny >= GRID_SIZE) continue;
      if (room.doors[key]) continue;

      const line = getRoomLine(x, y, nx, ny);
      if (doesLineIntersect(line)) continue;

      if (!dungeon[key]) {
        addRoom(nx, ny);
        queue.push([nx, ny]);
        roomCount++;
      }

      const doorType = rollDoorType();
      room.doors[key] = doorType;
      dungeon[key].doors[`${x},${y}`] = doorType;
      doorLines.push(line);
      connections++;
    }
  }

  drawDungeon();
}

function addRoom(x, y, isStart = false) {
  const key = `${x},${y}`;
  dungeon[key] = {
    x, y,
    isStart,
    type: rollRoomType(),
    doors: {}
  };
}

function getRoomLine(x1, y1, x2, y2) {
  const ax = START_X + x1 * (ROOM_SIZE + ROOM_MARGIN) + ROOM_SIZE / 2;
  const ay = START_Y + y1 * (ROOM_SIZE + ROOM_MARGIN) + ROOM_SIZE / 2;
  const bx = START_X + x2 * (ROOM_SIZE + ROOM_MARGIN) + ROOM_SIZE / 2;
  const by = START_Y + y2 * (ROOM_SIZE + ROOM_MARGIN) + ROOM_SIZE / 2;
  return { ax, ay, bx, by };
}

function doesLineIntersect({ ax, ay, bx, by }) {
  for (const { ax: ax2, ay: ay2, bx: bx2, by: by2 } of doorLines) {
    if (linesIntersect(ax, ay, bx, by, ax2, ay2, bx2, by2)) return true;
  }
  return false;
}

function linesIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
  const ccw = (ax, ay, bx, by, cx, cy) => {
    return (cy - ay) * (bx - ax) > (by - ay) * (cx - ax);
  };
  return (
    ccw(x1, y1, x3, y3, x4, y4) !== ccw(x2, y2, x3, y3, x4, y4) &&
    ccw(x1, y1, x2, y2, x3, y3) !== ccw(x1, y1, x2, y2, x4, y4)
  );
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function drawDungeon() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw door lines and labels underneath
  for (const key in dungeon) {
    const room = dungeon[key];
    const px = START_X + room.x * (ROOM_SIZE + ROOM_MARGIN);
    const py = START_Y + room.y * (ROOM_SIZE + ROOM_MARGIN);

    for (const neighborKey in room.doors) {
      const [nx, ny] = neighborKey.split(",").map(Number);
      const npx = START_X + nx * (ROOM_SIZE + ROOM_MARGIN);
      const npy = START_Y + ny * (ROOM_SIZE + ROOM_MARGIN);

      const mx = (px + npx) / 2 + ROOM_SIZE / 2;
      const my = (py + npy) / 2 + ROOM_SIZE / 2;

      // Line
      ctx.strokeStyle = "#999";
      ctx.beginPath();
      ctx.moveTo(px + ROOM_SIZE / 2, py + ROOM_SIZE / 2);
      ctx.lineTo(npx + ROOM_SIZE / 2, npy + ROOM_SIZE / 2);
      ctx.stroke();

      // Label background
      ctx.fillStyle = "white";
      ctx.fillRect(mx - 22, my - 8, 44, 16);
      ctx.strokeStyle = "#999";
      ctx.strokeRect(mx - 22, my - 8, 44, 16);

      // Label text
      ctx.fillStyle = "blue";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(room.doors[neighborKey], mx, my);
    }
  }

  // Draw rooms
  for (const key in dungeon) {
    const room = dungeon[key];
    const px = START_X + room.x * (ROOM_SIZE + ROOM_MARGIN);
    const py = START_Y + room.y * (ROOM_SIZE + ROOM_MARGIN);

    ctx.fillStyle = room.isStart ? "#ffb347" : "#ccc";
    drawOctagon(px + ROOM_SIZE / 2, py + ROOM_SIZE / 2, ROOM_SIZE);
    ctx.stroke();

    // Text
    ctx.fillStyle = "black";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const lines = room.type.split("\n");
    const centerX = px + ROOM_SIZE / 2;
    const centerY = py + ROOM_SIZE / 2;
    lines.forEach((line, i) => {
      ctx.fillText(line, centerX, centerY + (i - (lines.length - 1) / 2) * 14);
    });
  }
}

function drawOctagon(cx, cy, size) {
  const angleStep = Math.PI / 4;
  const radius = size / Math.sqrt(2.2);

  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const angle = angleStep * i + Math.PI / 8;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

generateDungeon();
