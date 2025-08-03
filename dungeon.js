
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

function rollDice(count, sides) {
  return Array.from({ length: count }).reduce(r => r + Math.ceil(Math.random() * sides), 0);
}

// ===== Room and Door Rolls =====
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

// ===== Dungeon Generation =====
function generateDungeon() {
  dungeon = {};
  const center = [Math.floor(GRID_SIZE / 2), Math.floor(GRID_SIZE / 2)];
  let toPlace = [center];
  let roomCount = 1;

  addRoom(...center, true); // mark starting room

  while (roomCount < MAX_ROOMS && toPlace.length > 0) {
    const [x, y] = toPlace.shift();
    const room = dungeon[`${x},${y}`];

    const doorCount = Math.min(rollDice(1, 6), 2); // Limit to 2 connections
    shuffleArray(directions);

    let connections = 0;
    for (const [dx, dy] of directions) {
      if (connections >= doorCount) break;

      const nx = x + dx, ny = y + dy;
      const key = `${nx},${ny}`;
      if (nx < 0 || ny < 0 || nx >= GRID_SIZE || ny >= GRID_SIZE) continue;

      if (!dungeon[key] && countExistingNeighbors(nx, ny) < 2) {
        addRoom(nx, ny);
        const doorType = rollDoorType();
        room.doors[key] = doorType;
        dungeon[key].doors[`${x},${y}`] = doorType;
        toPlace.push([nx, ny]);
        roomCount++;
        connections++;
      } else if (dungeon[key] && !room.doors[key]) {
        const doorType = rollDoorType();
        room.doors[key] = doorType;
        dungeon[key].doors[`${x},${y}`] = doorType;
      }
    }
  }

  drawDungeon();
}

function countExistingNeighbors(x, y) {
  return directions.reduce((count, [dx, dy]) => {
    return dungeon[`${x + dx},${y + dy}`] ? count + 1 : count;
  }, 0);
}

function addRoom(x, y, isStart = false) {
  const key = `${x},${y}`;
  const type = rollRoomType();
  const extra = type.startsWith("Combat +") ? type.slice(9) : null;
  const baseType = type.startsWith("Combat +") ? "Combat +" : type;

  dungeon[key] = {
    x, y,
    type: baseType,
    extra,
    isStart,
    doors: {}
  };
}

// ===== Drawing =====
function drawDungeon() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // === Draw connections first ===
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

      ctx.strokeStyle = "#999";
      ctx.beginPath();
      ctx.moveTo(px + ROOM_SIZE / 2, py + ROOM_SIZE / 2);
      ctx.lineTo(npx + ROOM_SIZE / 2, npy + ROOM_SIZE / 2);
      ctx.stroke();

      // Door label
      ctx.fillStyle = "blue";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(room.doors[neighborKey], mx, my);
    }
  }

  // === Draw rooms on top ===
  for (const key in dungeon) {
    const room = dungeon[key];
    const px = START_X + room.x * (ROOM_SIZE + ROOM_MARGIN);
    const py = START_Y + room.y * (ROOM_SIZE + ROOM_MARGIN);

    ctx.fillStyle = room.isStart ? "#ffb347" : "#ccc";
    drawOctagon(px + ROOM_SIZE / 2, py + ROOM_SIZE / 2, ROOM_SIZE);
    ctx.stroke();

    // Centered room labels
    ctx.fillStyle = "black";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    const centerX = px + ROOM_SIZE / 2;
    const centerY = py + ROOM_SIZE / 2;
    ctx.fillText(room.type, centerX, centerY - (room.extra ? 6 : 0));
    if (room.extra) ctx.fillText(`+ ${room.extra}`, centerX, centerY + 8);
  }
}


// Draw an octagon centered at (cx, cy) with approximate width `size`
function drawOctagon(cx, cy, size) {
  const angleStep = Math.PI / 4; // 45 degrees
  const radius = size / Math.sqrt(2.2); // tweak for better sizing

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

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// ===== Init =====
generateDungeon();

