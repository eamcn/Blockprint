const canvas = document.getElementById("map");
const ctx = canvas.getContext("2d");

/* ---------- Radius & Thickness inputs (slider + number) ---------- */
const radiusRange = document.getElementById("radiusRange");
const radiusNumber = document.getElementById("radiusNumber");

const thicknessWrap = document.getElementById("thicknessWrap");
const thicknessRange = document.getElementById("thicknessRange");
const thicknessNumber = document.getElementById("thicknessNumber");

/* ---------- Other controls ---------- */
const showGridEl = document.getElementById("showGrid");
const showAxesEl = document.getElementById("showAxes");

const chipOutline = document.getElementById("chipOutline");
const chipFilled = document.getElementById("chipFilled");

const btn = document.getElementById("generateBtn");
const metaTextEl = document.getElementById("metaText");
const blockCountEl = document.getElementById("blockCount");
const hintEl = document.getElementById("hint");

document.getElementById("year").textContent = new Date().getFullYear();

/* ---------- State ---------- */
let modeFilled = false;
let lastData = null;
let cellPx = 8;
let offsetX = 0;
let offsetY = 0;

/* ---------- Helpers ---------- */
function clamp(n, min, max){
  return Math.max(min, Math.min(max, n));
}

/* ---------- Sync slider <-> number ---------- */
function syncRadius(from){
  const min = Number(radiusRange.min);
  const max = Number(radiusRange.max);

  let v = from === "range"
    ? Number(radiusRange.value)
    : Number(radiusNumber.value);

  if (!Number.isFinite(v)) v = min;
  v = clamp(Math.round(v), min, max);

  radiusRange.value = v;
  radiusNumber.value = v;
}

function syncThickness(from){
  const min = Number(thicknessRange.min);
  const max = Number(thicknessRange.max);

  let v = from === "range"
    ? Number(thicknessRange.value)
    : Number(thicknessNumber.value);

  if (!Number.isFinite(v)) v = min;
  v = clamp(Math.round(v), min, max);

  thicknessRange.value = v;
  thicknessNumber.value = v;
}

/* ---------- Mode switching ---------- */
function setMode(filled){
  modeFilled = filled;

  chipFilled.classList.toggle("isActive", filled);
  chipOutline.classList.toggle("isActive", !filled);

  thicknessWrap.style.display = filled ? "none" : "block";
}

/* ---------- Canvas resize ---------- */
function resizeCanvasToCSS(){
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  canvas.width = Math.max(1, Math.floor(rect.width * dpr));
  canvas.height = Math.max(1, Math.floor(rect.height * dpr));

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

/* ---------- Load circle from Flask ---------- */
async function loadCircle(){
  btn.disabled = true;
  btn.textContent = "Generating…";

  const radius = Number(radiusNumber.value);
  const filled = modeFilled ? 1 : 0;
  const thickness = Number(thicknessNumber.value);

  const res = await fetch(`/api/circle?radius=${radius}&filled=${filled}&thickness=${thickness}`);
  const data = await res.json();
  lastData = data;

  metaTextEl.textContent = `Radius ${data.radius} • Map ${data.size}×${data.size}`;
  blockCountEl.textContent = `${data.block_count} blocks`;

  resizeCanvasToCSS();
  draw(data);

  btn.disabled = false;
  btn.textContent = "Generate";
}

/* ---------- Fit grid inside canvas ---------- */
function computeFit(size){
  const rect = canvas.getBoundingClientRect();

  const pad = 14;
  const availW = Math.max(20, rect.width - pad * 2);
  const availH = Math.max(20, rect.height - pad * 2);

  const px = Math.floor(Math.min(availW / size, availH / size));
  cellPx = Math.max(1, Math.min(px, 24));

  const mapW = cellPx * size;
  const mapH = cellPx * size;

  offsetX = Math.floor((rect.width - mapW) / 2);
  offsetY = Math.floor((rect.height - mapH) / 2);
}

/* ---------- Draw circle ---------- */
function draw(data){
  const { grid, size } = data;
  const rect = canvas.getBoundingClientRect();

  computeFit(size);

  ctx.clearRect(0, 0, rect.width, rect.height);

  /* Background */
  ctx.fillStyle = "#0f1217";
  ctx.fillRect(0, 0, rect.width, rect.height);

  /* Filled blocks */
  for(let z = 0; z < size; z++){
    for(let x = 0; x < size; x++){
      if(grid[z][x] !== 1) continue;

      const px = offsetX + x * cellPx;
      const py = offsetY + z * cellPx;

      ctx.fillStyle = "rgba(255,122,24,0.95)";
      ctx.fillRect(px, py, cellPx, cellPx);

      if(cellPx >= 6){
        ctx.fillStyle = "rgba(255,154,61,0.25)";
        ctx.fillRect(px, py, cellPx, Math.max(1, Math.floor(cellPx * 0.35)));
      }
    }
  }

  /* Grid lines */
  if(showGridEl.checked && cellPx >= 5){
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1;

    const left = offsetX;
    const top = offsetY;
    const w = cellPx * size;
    const h = cellPx * size;

    for(let i = 0; i <= size; i++){
      const x = left + i * cellPx + 0.5;
      ctx.beginPath();
      ctx.moveTo(x, top);
      ctx.lineTo(x, top + h);
      ctx.stroke();
    }

    for(let i = 0; i <= size; i++){
      const y = top + i * cellPx + 0.5;
      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(left + w, y);
      ctx.stroke();
    }
  }

  /* Axes */
  if(showAxesEl.checked){
    const mid = Math.floor(size / 2);

    const left = offsetX;
    const top = offsetY;
    const w = cellPx * size;
    const h = cellPx * size;

    ctx.strokeStyle = "rgba(255,122,24,0.28)";
    ctx.lineWidth = Math.max(1, Math.floor(cellPx / 10));

    const ax = left + (mid + 0.5) * cellPx;
    ctx.beginPath();
    ctx.moveTo(ax, top);
    ctx.lineTo(ax, top + h);
    ctx.stroke();

    const ay = top + (mid + 0.5) * cellPx;
    ctx.beginPath();
    ctx.moveTo(left, ay);
    ctx.lineTo(left + w, ay);
    ctx.stroke();
  }
}

/* ---------- Hover coordinates ---------- */
function getCellFromMouse(evt){
  if(!lastData) return null;

  const rect = canvas.getBoundingClientRect();
  const mx = evt.clientX - rect.left;
  const my = evt.clientY - rect.top;

  const x = Math.floor((mx - offsetX) / cellPx);
  const z = Math.floor((my - offsetY) / cellPx);

  if(x < 0 || z < 0 || x >= lastData.size || z >= lastData.size) return null;

  const mid = Math.floor(lastData.size / 2);
  return { x: x - mid, z: z - mid, filled: lastData.grid[z][x] === 1 };
}

canvas.addEventListener("mousemove", (e) => {
  const cell = getCellFromMouse(e);

  if(!cell){
    hintEl.textContent = "Hover to see coordinates";
    return;
  }

  hintEl.textContent = `x=${cell.x}, z=${cell.z} • ${cell.filled ? "Block" : "Empty"}`;
});

/* ---------- Event wiring ---------- */
chipOutline.addEventListener("click", () => { setMode(false); loadCircle(); });
chipFilled.addEventListener("click", () => { setMode(true); loadCircle(); });

radiusRange.addEventListener("input", () => syncRadius("range"));
radiusNumber.addEventListener("input", () => syncRadius("number"));
radiusNumber.addEventListener("change", () => { syncRadius("number"); loadCircle(); });

thicknessRange.addEventListener("input", () => syncThickness("range"));
thicknessNumber.addEventListener("input", () => syncThickness("number"));
thicknessNumber.addEventListener("change", () => { syncThickness("number"); loadCircle(); });

btn.addEventListener("click", loadCircle);

showGridEl.addEventListener("change", () => { if (lastData) draw(lastData); });
showAxesEl.addEventListener("change", () => { if (lastData) draw(lastData); });

window.addEventListener("resize", () => {
  if(!lastData) return;
  resizeCanvasToCSS();
  draw(lastData);
});

/* ---------- Init ---------- */
setMode(false);
syncRadius("range");
syncThickness("range");
resizeCanvasToCSS();
loadCircle();
