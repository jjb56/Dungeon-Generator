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
