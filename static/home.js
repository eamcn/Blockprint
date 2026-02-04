document.getElementById("year").textContent = new Date().getFullYear();

/* ---------------- Canvas helpers ---------------- */
function prepCanvas(id){
  const c = document.getElementById(id);
  const ctx = c.getContext("2d");

  function resize(){
    const dpr = window.devicePixelRatio || 1;
    const rect = c.getBoundingClientRect();
    c.width = Math.max(1, Math.floor(rect.width * dpr));
    c.height = Math.max(1, Math.floor(rect.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resize();
  window.addEventListener("resize", resize);
  return { c, ctx };
}

function drawBg(ctx, w, h){
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#0f1217";
  ctx.fillRect(0, 0, w, h);
}

function drawBlock(ctx, x, y, s){
  ctx.fillStyle = "rgba(255,122,24,0.95)";
  ctx.fillRect(x, y, s, s);

  if(s >= 4){
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, s - 1, s - 1);

    ctx.fillStyle = "rgba(255,154,61,0.18)";
    ctx.fillRect(x, y, s, Math.max(1, Math.floor(s * 0.32)));
  }
}

function animateCircleBlueprint(){
  const { c, ctx } = prepCanvas("previewCircle");

  function frame(t){
    const rect = c.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    drawBg(ctx, w, h);

    const grid = 32;
    const pad = 14;
    const s = Math.max(2, Math.floor(Math.min((w - pad*2) / grid, (h - pad*2) / grid)));
    const mapW = s * grid;
    const mapH = s * grid;
    const ox = Math.floor((w - mapW) / 2);
    const oy = Math.floor((h - mapH) / 2);

    if(s >= 6){
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1;
      for(let i=0; i<=grid; i++){
        const gx = ox + i*s + 0.5;
        ctx.beginPath(); ctx.moveTo(gx, oy); ctx.lineTo(gx, oy+mapH); ctx.stroke();
        const gy = oy + i*s + 0.5;
        ctx.beginPath(); ctx.moveTo(ox, gy); ctx.lineTo(ox+mapW, gy); ctx.stroke();
      }
    }

    const mid = (grid - 1) / 2;
    const pulse = 0.9 + 0.1 * Math.sin(t / 900);
    const r = (grid * 0.33) * pulse;

    const ringTh = 0.55;

    for(let z=0; z<grid; z++){
      for(let x=0; x<grid; x++){
        const dx = x - mid;
        const dz = z - mid;
        const d = Math.sqrt(dx*dx + dz*dz);

        const on = Math.abs(d - r) <= ringTh;
        if(!on) continue;

        drawBlock(ctx, ox + x*s, oy + z*s, s-1);
      }
    }

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

function buildHemisphereVoxels(r, filled=false, thickness=1){
  const vox = [];
  const outer = r + 0.5;
  const inner = (r - thickness) + 0.5;

  for(let y=0; y<=r; y++){
    for(let z=-r; z<=r; z++){
      for(let x=-r; x<=r; x++){
        const d = Math.sqrt(x*x + y*y + z*z);
        const place = filled ? (d <= outer) : (d <= outer && d >= inner);
        if(place) vox.push({x,y,z});
      }
    }
  }
  return vox;
}

function rotY(p, a){
  const ca = Math.cos(a), sa = Math.sin(a);
  return {
    x: p.x * ca + p.z * sa,
    y: p.y,
    z: -p.x * sa + p.z * ca
  };
}

function isoProject(p, scale, cx, cy){
  const sx = (p.x - p.z) * scale * 0.95;
  const sy = (p.x + p.z) * scale * 0.48 - p.y * scale * 1.02;
  return { X: cx + sx, Y: cy + sy };
}

function animateDomeIso(){
  const { c, ctx } = prepCanvas("previewDome");

  const R = 11;
  const TH = 1;
  const baseVox = buildHemisphereVoxels(R, false, TH);

  function frame(t){
    const rect = c.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    drawBg(ctx, w, h);

    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.beginPath();
    ctx.ellipse(w*0.55, h*0.78, w*0.18, h*0.06, 0, 0, Math.PI*2);
    ctx.fill();

    const scale = Math.max(4, Math.min(w, h) / 42);
    const cx = w * 0.5;
    const cy = h * 0.72;

    const a = (t / 2200) % (Math.PI * 2);

    const drawList = [];
    for(const v of baseVox){
      const p = rotY(v, a);

      const depth = (p.x + p.z) + p.y * 0.35;

      const proj = isoProject(p, scale, cx, cy);

      drawList.push({
        depth,
        x: proj.X,
        y: proj.Y,
        shade: 0.75 + 0.25 * (Math.cos(a) * (p.x / (R+0.01)) + Math.sin(a) * (p.z / (R+0.01)))
      });
    }

    drawList.sort((a,b) => a.depth - b.depth);

    const s = Math.max(2, Math.floor(scale * 0.9));
    for(const d of drawList){
      ctx.globalAlpha = 0.78 + 0.22 * d.shade;
      drawBlock(ctx, Math.floor(d.x), Math.floor(d.y), s);
    }
    ctx.globalAlpha = 1;

    ctx.fillStyle = "rgba(255,154,61,0.14)";
    ctx.beginPath();
    ctx.ellipse(cx, cy - (R * scale * 1.05), s*2.3, s*1.2, 0, 0, Math.PI*2);
    ctx.fill();

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

animateCircleBlueprint();
animateDomeIso();
