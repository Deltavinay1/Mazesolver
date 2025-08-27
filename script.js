// --- DOM Elements ---
const canvas = document.getElementById("mazeCanvas");
const ctx = canvas.getContext("2d");
const canvasContainer = document.getElementById("canvas-container");
const generateBtn = document.getElementById("generateBtn");
const resetBtn = document.getElementById("resetBtn");
const solveDijkstraBtn = document.getElementById("solveDijkstraBtn");
const solveAStarBtn = document.getElementById("solveAStarBtn");
const solveWallFollowerBtn = document.getElementById("solveWallFollowerBtn");
const solveButtons = document.querySelectorAll(".solve-btn");
const statusEl = document.getElementById("status");

// --- Maze Configuration ---
let width = 41; // Must be odd
let height = 21; // Must be odd
let cellSize;
let maze;
let isSolving = false;

// --- Node Class (similar to C++ struct) ---
class Node {
  constructor(y, x) {
    this.y = y;
    this.x = x;
    this.parent = null;
    this.gCost = Infinity;
    this.hCost = 0;
    this.visited = false;
  }

  fCost() {
    return this.gCost + this.hCost;
  }
}

// --- Maze Class ---
class Maze {
  constructor(h, w) {
    this.height = h;
    this.width = w;
    this.grid = Array(h)
      .fill(null)
      .map(() => Array(w).fill("#")); // '#' represents a wall
    this.nodes = Array(h)
      .fill(null)
      .map((_, y) =>
        Array(w)
          .fill(null)
          .map((_, x) => new Node(y, x))
      );
    this.startNode = this.nodes[1][1];
    this.endNode = this.nodes[h - 2][w - 2];
  }

  // Maze generation using recursive backtracking (Depth-First Search)
  generate() {
    const stack = [];
    const startY = 1,
      startX = 1;

    this.grid[startY][startX] = "S"; // Start
    stack.push([startY, startX]);

    const dy = [-2, 2, 0, 0];
    const dx = [0, 0, -2, 2];

    while (stack.length > 0) {
      const [y, x] = stack[stack.length - 1];

      const dirs = [0, 1, 2, 3];
      dirs.sort(() => Math.random() - 0.5); // Shuffle directions

      let moved = false;
      for (const dir of dirs) {
        const ny = y + dy[dir];
        const nx = x + dx[dir];

        if (
          ny > 0 &&
          ny < this.height - 1 &&
          nx > 0 &&
          nx < this.width - 1 &&
          this.grid[ny][nx] === "#"
        ) {
          this.grid[ny][nx] = " "; // Carve path
          this.grid[y + dy[dir] / 2][x + dx[dir] / 2] = " "; // Carve wall
          stack.push([ny, nx]);
          moved = true;
          break;
        }
      }

      if (!moved) {
        stack.pop();
      }
    }
    this.grid[1][1] = "S";
    this.grid[this.height - 2][this.width - 2] = "E"; // End
  }

  // --- Utility and Pathfinding Methods ---
  resetNodes() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.nodes[y][x].parent = null;
        this.nodes[y][x].gCost = Infinity;
        this.nodes[y][x].hCost = 0;
        this.nodes[y][x].visited = false;
      }
    }
  }

  getNeighbors(node) {
    const neighbors = [];
    const dy = [-1, 1, 0, 0];
    const dx = [0, 0, -1, 1];

    for (let i = 0; i < 4; i++) {
      const ny = node.y + dy[i];
      const nx = node.x + dx[i];
      if (
        ny >= 0 &&
        ny < this.height &&
        nx >= 0 &&
        nx < this.width &&
        this.grid[ny][nx] !== "#"
      ) {
        neighbors.push(this.nodes[ny][nx]);
      }
    }
    return neighbors;
  }

  reconstructPath(current) {
    const path = [];
    while (current !== null) {
      path.push(current);
      current = current.parent;
    }
    return path.reverse();
  }

  heuristic(a, b) {
    // Manhattan distance
    return Math.abs(a.y - b.y) + Math.abs(a.x - b.x);
  }
}

// --- Drawing Functions ---
function drawMaze(path = [], visited = new Set()) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const pathSet = new Set(path);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const node = maze.nodes[y][x];
      if (pathSet.has(node)) {
        ctx.fillStyle = "#4f46e5"; // Final path color (indigo)
      } else if (visited.has(node)) {
        ctx.fillStyle = "rgba(239, 68, 68, 0.4)"; // Visited color (red, transparent)
      } else {
        switch (maze.grid[y][x]) {
          case "#":
            ctx.fillStyle = "#1f2937";
            break; // Wall (darker gray)
          case "S":
            ctx.fillStyle = "#10b981";
            break; // Start (emerald)
          case "E":
            ctx.fillStyle = "#ef4444";
            break; // End (red)
          default:
            ctx.fillStyle = "#4b5563";
            break; // Path (gray)
        }
      }
      ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    }
  }
}

// --- Animation Logic ---
async function animateAlgorithm(solver) {
  isSolving = true;
  toggleButtons(false);
  statusEl.textContent = "Solving...";

  maze.resetNodes();
  const visitedInOrder = [];
  let path = [];

  path = solver(visitedInOrder);

  // Animate visited nodes
  for (let i = 0; i < visitedInOrder.length; i++) {
    const visitedSet = new Set(visitedInOrder.slice(0, i + 1));
    drawMaze([], visitedSet);
    await new Promise((r) => setTimeout(r, 0)); // Short delay for fast animation
  }

  // Animate final path
  const visitedSet = new Set(visitedInOrder);
  for (let i = 0; i < path.length; i++) {
    const currentPath = path.slice(0, i + 1);
    drawMaze(currentPath, visitedSet);
    await new Promise((r) => setTimeout(r, 15)); // Slightly longer delay for path
  }

  if (path.length > 0) {
    statusEl.textContent = `Solved! Path length: ${path.length}`;
  } else {
    statusEl.textContent = "No path found!";
  }
  isSolving = false;
  toggleButtons(true, false); // Re-enable generate/reset, but not solve
}

// --- Solver Implementations ---
function solveDijkstra(visitedInOrder) {
  const pq = [maze.startNode]; // Simple array as priority queue
  maze.startNode.gCost = 0;

  while (pq.length > 0) {
    pq.sort((a, b) => a.gCost - b.gCost);
    const current = pq.shift();

    if (current.visited) continue;
    current.visited = true;
    visitedInOrder.push(current);

    if (current === maze.endNode) return maze.reconstructPath(current);

    for (const neighbor of maze.getNeighbors(current)) {
      const newGCost = current.gCost + 1;
      if (newGCost < neighbor.gCost) {
        neighbor.parent = current;
        neighbor.gCost = newGCost;
        if (!pq.includes(neighbor)) {
          pq.push(neighbor);
        }
      }
    }
  }
  return [];
}

function solveAStar(visitedInOrder) {
  const openSet = [maze.startNode];
  maze.startNode.gCost = 0;
  maze.startNode.hCost = maze.heuristic(maze.startNode, maze.endNode);

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.fCost() - b.fCost());
    const current = openSet.shift();

    if (current === maze.endNode) return maze.reconstructPath(current);

    current.visited = true;
    visitedInOrder.push(current);

    for (const neighbor of maze.getNeighbors(current)) {
      if (neighbor.visited) continue;

      const tentativeGCost = current.gCost + 1;
      if (tentativeGCost < neighbor.gCost) {
        neighbor.parent = current;
        neighbor.gCost = tentativeGCost;
        neighbor.hCost = maze.heuristic(neighbor, maze.endNode);
        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
        }
      }
    }
  }
  return [];
}

function solveWallFollower(visitedInOrder) {
  let path = [];
  let current = maze.startNode;
  let dir = 1; // 0: up, 1: right, 2: down, 3: left

  const dx = [0, 1, 0, -1];
  const dy = [-1, 0, 1, 0];

  while (current !== maze.endNode) {
    path.push(current);
    visitedInOrder.push(current);

    const leftDir = (dir + 3) % 4;
    const forwardDir = dir;

    const leftY = current.y + dy[leftDir];
    const leftX = current.x + dx[leftDir];
    const forwardY = current.y + dy[forwardDir];
    const forwardX = current.x + dx[forwardDir];

    const isWall = (y, x) => maze.grid[y][x] === "#";

    if (!isWall(leftY, leftX)) {
      dir = leftDir;
      current = maze.nodes[leftY][leftX];
    } else if (!isWall(forwardY, forwardX)) {
      current = maze.nodes[forwardY][forwardX];
    } else {
      dir = (dir + 1) % 4;
    }

    if (path.length > maze.width * maze.height) return []; // Stuck in a loop
  }
  path.push(maze.endNode);
  return path;
}

// --- UI and Event Handlers ---
function toggleButtons(enable, enableSolve = true) {
  generateBtn.disabled = !enable;
  resetBtn.disabled = !enable;

  solveButtons.forEach((btn) => {
    btn.disabled = !(enable && enableSolve);
  });
}

function handleGenerate() {
  if (isSolving) return;
  maze = new Maze(height, width);
  maze.generate();
  drawMaze();
  statusEl.textContent = "Select an algorithm to solve.";
  toggleButtons(true, true);
}

function handleReset() {
  if (isSolving) return;
  drawMaze();
  statusEl.textContent = "Select an algorithm to solve.";
  toggleButtons(true, true);
}

function resizeCanvas() {
  const containerWidth = canvasContainer.clientWidth - 20; // Some padding
  const containerHeight = canvasContainer.clientHeight - 20;

  const cellWidth = Math.floor(containerWidth / width);
  const cellHeight = Math.floor(containerHeight / height);

  cellSize = Math.min(cellWidth, cellHeight);

  canvas.width = width * cellSize;
  canvas.height = height * cellSize;

  if (maze) {
    drawMaze();
  }
}

// --- Initial Setup ---
window.addEventListener("resize", resizeCanvas);

generateBtn.addEventListener("click", handleGenerate);
resetBtn.addEventListener("click", handleReset);
solveDijkstraBtn.addEventListener("click", () =>
  animateAlgorithm(solveDijkstra)
);
solveAStarBtn.addEventListener("click", () => animateAlgorithm(solveAStar));
solveWallFollowerBtn.addEventListener("click", () =>
  animateAlgorithm(solveWallFollower)
);

// Initial generation
resizeCanvas();
handleGenerate();
