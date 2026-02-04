import math

def circle_grid(radius: int, filled: bool = False, thickness: int = 1):
    r = radius
    size = 2 * r + 1
    grid = [[0] * size for _ in range(size)]
    count = 0

    for z in range(-r, r+1):
        for x in range(-r, r+1):
            d = math.sqrt(x*x + z*z)

            if filled:
                place = d<= r + 0.5
            else:
                half = max(1, thickness) / 2.0
                place = abs(d - r) <= half

            if place:
                grid[z + r][x + r] = 1
                count += 1

    return {"radius": r, "size": size, "grid": grid, "count": count}

def dome_layers(radius: int, filled: bool = False, thickness: int = 1):
    r = int(radius)
    t = max(1, int(thickness))

    size = 2 * r + 1
    layers = []
    voxels = []

    # Prepare empty layers y=0..r
    layer_grids = [[[0] * size for _ in range(size)] for _ in range(r + 1)]
    layer_counts = [0] * (r + 1)

    outer = r + 0.5
    inner = (r - t) + 0.5  # shell inner boundary (only used if not filled)

    for y in range(0, r + 1):
        for z in range(-r, r + 1):
            for x in range(-r, r + 1):
                d = math.sqrt(x*x + y*y + z*z)

                if filled:
                    place = d <= outer
                else:
                    place = (d <= outer) and (d >= inner)

                if place:
                    layer_grids[y][z + r][x + r] = 1
                    layer_counts[y] += 1
                    voxels.append([x, y, z])

    # Build layer metadata (including "slice_radius" estimate for UI)
    for y in range(0, r + 1):
        # purely informational; doesn't affect placement
        slice_r = math.sqrt(max(0, r*r - y*y))
        layers.append({
            "y": y,
            "size": size,
            "grid": layer_grids[y],
            "block_count": layer_counts[y],
            "slice_radius": round(slice_r, 3),
        })

    total_blocks = sum(layer_counts)
    return {
        "radius": r,
        "filled": filled,
        "thickness": t,
        "layers": layers,
        "voxels": voxels,
        "total_blocks": total_blocks
    }