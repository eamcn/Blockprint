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