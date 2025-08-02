const canvas = document.getElementById("dungeonCanvas");
const ctx = canvas.getContext("2d");

const GRID_SIZE = 7;
const ROOM_SIZE = 60;
const ROOM_MARGIN = 40;
const START_X = 100;
const START_Y = 100;
const MAX_ROOMS = rollDice(2, 6) + 3;

let dungeon = {};

function rollDice(count, sides) {
  return Array.from({ length: count }).reduce(r => r + Math.random(Math.random() * sides), 0);
}

// Type Rolls
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









