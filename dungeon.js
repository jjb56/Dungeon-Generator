const canvas = document.getElementById("dungeonCanvas");
const ctx = canvas.getContext("2d");

const GRID_SIZE = 7;
const ROOM_SIZE = 60;
const ROOM_MARGIN = 40;
const START_X = 100;
const START_Y = 100;
const MAX_ROOMS = rollDice(2, 6) + 3;
const direction = [
  [-1, -1], [0, -1], [1, -1],
  [-1, 0],           [1, 0],
  [-1, 1],  [0, 1],  [1, 1]
];

let dungeon = {};

function rollDice(count, sides) {
  return Array.from({ length: count }).reduce(r => r + Math.random(Math.random() * sides), 0);
}

// ===== Type Rolls =====
function rollRoomType() {
  const roll = rollDice(1, 12);
  if (roll <= 3) return "Combat";
  if (roll <= 4) return "Puzzle";
  if (roll <= 6) return "Trap";
  if (roll <= 7) return "Exploration";
  if (roll <= 8) return "Obstacle";
  if (roll <= 10) return "Combat + " + rollRoomType();
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

// ===== Generation =====
function generateDungeon() {
  dungeon = {};
  const center = [Math.floor(GRID_SIZE / 2), Math.floor(GRID_SIZE /2)];
  let toPlace = [center];
  let roomCount = 0;

  addRoom(...center);

  while (roomCount < MAX_ROOMS && toPlace.length > 0) {
    const [x, y] = toPlace.shift();
    const room = dungeon[`${x}, ${y}`];

    const doorCount = Math.min(rollDice(1, 6), 4);
    shuffleArray(directions);

    let connections = 0;
    for (const [dx, dy] of directions) {
      if (connection >= doorCount) break;

      const nx = x + dx, ny = y + dy;
      const key = `${nx},${ny}`;
      if (nx < 0 || ny < 0 || nx >= GRID_SIZE || ny >= GRID_SIZE) continue;
      
      if (!dungeon[key]) {
        addRoom(nx, ny);
        room.doors[key] = rollDoorType();
        dungeon[key].doors[`${x},${y}`] = room.doors[key];
        toPlace.push([nx, ny]);
        roomCount++;
        connections++;
      } else if (!room.doors[key]) {
        room.doors[key] = rollDoorType();
        dungeon[key].doors[`${x},${y}`] = room.doors[key];
      }
    }
  }

  drawDungeon();
}

function addRoom(x, y) {
  const key = `${x},${y}`;
  const type = rollRoomType();
  const extra = type === "Combat+" ? rollRoomType() : null;
  dungeon[key] = {
    x, y,
    type,
    extra,
    doors: {}
  };
}

// ===== Draw =====
function drawDungeon() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "12px sans-serif";

  for (const key in dungeon) {
    const room = dungeon[key];
    const px = START_X + room.x * (ROOM_SIZE + ROOM_MARGIN);
    const py = START_Y + room.y * (ROOM_SIZE + ROOM_MARGIN);

    // Draw room square
    ctx.fillStyle = "#ccc";
    ctx.fillRect(px, py, ROOM_SIZE, ROOM_SIZE);
    ctx.strokeRect(px, py, ROOM_SIZE, ROOM_SIZE);

    // Room labels
    ctx.fillStyle = "black";
    ctx.fillText(room.type, px, py + ROOM_SIZE + 12);
    if (room.extra) ctx.fillText(`+ ${room.extra}`, px, py + ROOM_SIZE + 24);

    // Draw connections
    for (const neighborKey in room.doors) {
      const [nx, ny] = neighborKey.split(",").map(Number);
      const npx = START_X + nx * (ROOM_SIZE + ROOM_MARGIN);
      const npy = START_Y + ny * (ROOM_SIZE + ROOM_MARGIN);

      const mx = (px + npx) / 2 + ROOM_SIZE / 2;
      const my = (py + npy) / 2 + ROOM_SIZE / 2;

      // Line
      ctx.strokeStyle = "black";
      ctx.beginPath();
      ctx.moveTo(px + ROOM_SIZE / 2, py + ROOM_SIZE / 2);
      ctx.lineTo(npx + ROOM_SIZE / 2, npy + ROOM_SIZE / 2);
      ctx.stroke();

      // Door type label
      ctx.fillStyle = "blue";
      ctx.fillText(room.doors[neighborKey], mx - 20, my);
    }
  }
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

        
















