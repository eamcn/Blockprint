# Blockprint

Blockprint is a clean, fast web tool for generating Minecraft building blueprints.

Everything runs entirely in the browser — no downloads, no mods, no accounts.

---

## Features

### Circle Generator
- Blueprint‑style circle maps  
- Outline or filled circles  
- Adjustable thickness  
- Grid and axis helpers  
- Click blocks to mark them as done  

### Dome Generator
- True voxel domes  
- Real hemisphere math (no slice gaps or missing roof)  
- Interactive 3D preview with rotation and zoom  
- Layer slider for survival‑friendly building  
- Per‑layer completion tracking  

### Clean UX
- Dark theme with orange accents  
- Responsive layout  
- Lightweight and fast  
- Works on desktop and mobile browsers  

---

## Tech Stack

### Backend
- Python  
- Flask  

### Frontend
- Vanilla JavaScript  
- HTML5 Canvas (2D rendering)  
- Three.js (3D dome preview)  
- CSS (custom dark UI)  

_No frameworks. No build step. Just run and go._

---

## Getting Started

Follow these steps to clone, set up, and run the app locally.

- **Prerequisites:** Git, Python 3.8+.
- **Clone the repo:**

```powershell
git clone https://github.com/<your-username>/minecraft-shapes.git
cd minecraft-shapes
```

- **Create & activate a virtual environment (PowerShell):**

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

- **Install dependencies:**

If the repository contains a `requirements.txt` file:

```powershell
pip install -r requirements.txt
```

Otherwise install Flask directly:

```powershell
pip install Flask
```

- **Run the app:**

```powershell
python controller.py
```

- **Open in your browser:** http://127.0.0.1:5000 — pages: `/circles` and `/dome`.

Notes: On CMD use `.venv\Scripts\activate.bat`; on Git Bash or WSL use `source .venv/bin/activate`.


## Project Structure

```
.
├── controller.py
├── mathFunction.py
├── README.md
├── static/
│   ├── dome.js
│   ├── home.js
│   ├── script.js
│   └── style.css
└── templates/
	├── dome.html
	├── home.html
	└── index.html
```

## Roadmap

### Planned Generators
- Sphere generator  
- Cylinder generator  
- Pixel art to block planner  

### Long‑Term Ideas
- Exportable layer lists  
- Material palettes  
- Structure schematics  

---

## Contributing
Pull requests are welcome.

- Fork the repository  
- Create a feature branch  
- Open a pull request with a clear description  

Please keep the project lightweight and dependency‑free.

---

## License
MIT License — free to use, modify, and share.

---

## Author
Created by **eamcn**

- GitHub: https://github.com/eamcn  
- X: https://x.com/eamcndev  
- YouTube: https://www.youtube.com/@eamcn
