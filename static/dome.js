import * as THREE from "three";
import { OrbitControls } from "https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js";

/* ---------- DOM ---------- */
document.getElementById("year").textContent = new Date().getFullYear();

const radiusRange = document.getElementById("radiusRange");
const radiusNumber = document.getElementById("radiusNumber");
const thicknessWrap = document.getElementById("thicknessWrap");
const thicknessRange = document.getElementById("thicknessRange");
const thicknessNumber = document.getElementById("thicknessNumber");

const chipOutline = document.getElementById("chipOutline");
const chipFilled = document.getElementById("chipFilled");

const btn = document.getElementById("generateBtn");
const metaTextEl = document.getElementById("metaText");
const totalBlocksEl = document.getElementById("totalBlocks");

const layerRange = document.getElementById("layerRange");
const layerLabel = document.getElementById("layerLabel");
const layerMeta = document.getElementById("layerMeta");
const prevLayer = document.getElementById("prevLayer");
const nextLayer = document.getElementById("nextLayer");

const layerCanvas = document.getElementById("layer2d");
const layerCtx = layerCanvas.getContext("2d");

const previewCanvas = document.getElementById("preview3d");

/* ---------- State ---------- */
let modeFilled = false;
let domeData = null;

let scene, camera, renderer, controls, instanced, animId;

/* ---------- Helpers ---------- */
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

function syncPair(rangeEl, numberEl, from){
  const min = +rangeEl.min, max = +rangeEl.max;
  let v = from === "range" ? +rangeEl.value : +numberEl.value;
  if (!Number.isFinite(v)) v = min;
  v = clamp(Math.round(v), min, max);
  rangeEl.value = numberEl.value = v;
  return v;
}

function setMode(filled){
  modeFilled = filled;
  chipFilled.classList.toggle("isActive", filled);
  chipOutline.classList.toggle("isActive", !filled);
  thicknessWrap.style.display = filled ? "none" : "block";
}

/* ---------- 2D Layer ---------- */
function resize2D(){
  const dpr = devicePixelRatio || 1;
  const rect = layerCanvas.getBoundingClientRect();
  layerCanvas.width = rect.width * dpr;
  layerCanvas.height = rect.height * dpr;
  layerCtx.setTransform(dpr,0,0,dpr,0,0);
}

function drawLayer(layer){
  resize2D();
  const rect = layerCanvas.getBoundingClientRect();

  layerCtx.fillStyle = "#0f1217";
  layerCtx.fillRect(0,0,rect.width,rect.height);

  const size = layer.size;
  const cell = Math.floor(Math.min(rect.width/size, rect.height/size));
  const ox = Math.floor((rect.width - cell*size)/2);
  const oy = Math.floor((rect.height - cell*size)/2);

  for(let z=0; z<size; z++){
    for(let x=0; x<size; x++){
      if(!layer.grid[z][x]) continue;

      const px = ox + x*cell;
      const py = oy + z*cell;

      layerCtx.fillStyle = "#ff7a18";
      layerCtx.fillRect(px, py, cell, cell);

      if(cell >= 3){
        layerCtx.strokeStyle = "rgba(0,0,0,0.35)";
        layerCtx.strokeRect(px+0.5, py+0.5, cell-1, cell-1);
      }
    }
  }

  layerLabel.textContent = layer.y;
  layerMeta.textContent = `${layer.block_count} blocks`;
}

function setLayer(y){
  if(!domeData) return;
  y = clamp(y, 0, domeData.layers.length-1);
  layerRange.value = y;
  drawLayer(domeData.layers[y]);
}

/* ---------- 3D ---------- */
function dispose3D(){
  if(animId) cancelAnimationFrame(animId);
  renderer?.dispose();
}

function build3D(voxels){
  dispose3D();

  const rect = previewCanvas.getBoundingClientRect();
  if(rect.width < 10) return;

  renderer = new THREE.WebGLRenderer({ canvas: previewCanvas, antialias:true });
  renderer.setSize(rect.width, rect.height, false);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(45, rect.width/rect.height, 0.1, 2000);
  camera.position.set(60,45,60);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  scene.add(new THREE.AmbientLight(0xffffff, 0.4));

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(2,3,2);
  scene.add(light);

  const geo = new THREE.BoxGeometry(1,1,1);
  const mat = new THREE.MeshStandardMaterial({ color:0xff7a18 });

  instanced = new THREE.InstancedMesh(geo, mat, voxels.length);
  const m = new THREE.Matrix4();

  voxels.forEach(([x,y,z], i)=>{
    m.makeTranslation(x,y,z);
    instanced.setMatrixAt(i, m);
  });

  scene.add(instanced);

  controls.target.set(0, domeData.radius/2, 0);

  function animate(){
    controls.update();
    renderer.render(scene, camera);
    animId = requestAnimationFrame(animate);
  }
  animate();
}

/* ---------- Load ---------- */
async function loadDome(){
  btn.disabled = true;
  btn.textContent = "Generating…";

  try{
    const radius = syncPair(radiusRange, radiusNumber, "number");
    const thickness = syncPair(thicknessRange, thicknessNumber, "number");
    const filled = modeFilled ? 1 : 0;

    const res = await fetch(`/api/dome?radius=${radius}&filled=${filled}&thickness=${thickness}`);
    domeData = await res.json();

    metaTextEl.textContent = `Radius ${domeData.radius}`;
    totalBlocksEl.textContent = `${domeData.total_blocks} blocks`;

    layerRange.max = domeData.layers.length - 1;
    setLayer(0);

    build3D(domeData.voxels);
  }
  finally{
    btn.disabled = false;
    btn.textContent = "Generate";
  }
}

/* ---------- Events ---------- */
chipOutline.onclick = ()=>{ setMode(false); loadDome(); };
chipFilled.onclick = ()=>{ setMode(true); loadDome(); };

radiusRange.oninput = ()=>syncPair(radiusRange, radiusNumber, "range");
radiusNumber.onchange = loadDome;

thicknessRange.oninput = ()=>syncPair(thicknessRange, thicknessNumber, "range");
thicknessNumber.onchange = loadDome;

layerRange.oninput = ()=>setLayer(+layerRange.value);
prevLayer.onclick = ()=>setLayer(+layerRange.value - 1);
nextLayer.onclick = ()=>setLayer(+layerRange.value + 1);

btn.onclick = loadDome;

window.onresize = ()=>{
  if(domeData) drawLayer(domeData.layers[+layerRange.value || 0]);
};

/* ---------- Init ---------- */
setMode(false);
syncPair(radiusRange, radiusNumber, "range");
syncPair(thicknessRange, thicknessNumber, "range");
loadDome();
