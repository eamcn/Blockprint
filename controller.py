from flask import Flask, request, jsonify, render_template
import math
from mathFunction import circle_grid

app = Flask(__name__)

# TODO: Include circle_grid function here

@app.get("/")
def index():
    return render_template("index.html")

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