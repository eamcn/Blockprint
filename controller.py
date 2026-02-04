from flask import Flask, request, jsonify, render_template
import math
from mathFunction import circle_grid, dome_layers

app = Flask(__name__)

@app.get("/")
def home():
    return render_template("home.html")

@app.get("/circles")
def circles_page():
    return render_template("index.html")

@app.get("/dome")
def dome_page():
    return render_template("dome.html")

@app.get("/api/dome")
def api_dome():
    radius = int(request.args.get("radius", 12))
    filled = request.args.get("filled", "0") == "1"
    thickness = int(request.args.get("thickness", 1))

    radius = max(2, min(radius, 80))
    thickness = max(1, min(thickness, 10))

    return jsonify(dome_layers(radius, filled=filled, thickness=thickness))

@app.get("/api/circle")
def api_circle():
    radius = int(request.args.get("radius", 10))
    filled = request.args.get("filled", "0") == "1"
    thickness = int(request.args.get("thickness", 1))

    radius = max(1, min(radius, 200))
    thickness = max(1, min(thickness, 20))

    data = circle_grid(radius, filled=filled, thickness=thickness)
    return jsonify(data)

if __name__ == "__main__":
    app.run(debug=True)