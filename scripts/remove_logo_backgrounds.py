"""Remove only light backgrounds connected to the image border.

This preserves enclosed white details inside brand marks while making the
surrounding canvas transparent.
"""

from collections import deque
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
BRANDS = ROOT / "public" / "brands"
LOGOS = {
    "mte.jpg": "mte.png",
    "norte-energia.png": "norte-energia.png",
    "pague-menos.png": "pague-menos.png",
    "postal-saude.png": "postal-saude.png",
    "stanley.png": "stanley.png",
}


def remove_border_background(source: Path, destination: Path) -> None:
    image = Image.open(source).convert("RGBA")
    pixels = image.load()
    width, height = image.size
    corners = [
        pixels[0, 0][:3],
        pixels[width - 1, 0][:3],
        pixels[0, height - 1][:3],
        pixels[width - 1, height - 1][:3],
    ]
    key = tuple(sum(channel) // len(corners) for channel in zip(*corners))

    def is_background(x: int, y: int) -> bool:
        rgb = pixels[x, y][:3]
        distance = max(abs(rgb[index] - key[index]) for index in range(3))
        return min(rgb) >= 215 and distance <= 42

    queue: deque[tuple[int, int]] = deque()
    visited: set[tuple[int, int]] = set()
    for x in range(width):
        queue.extend(((x, 0), (x, height - 1)))
    for y in range(height):
        queue.extend(((0, y), (width - 1, y)))

    while queue:
        x, y = queue.popleft()
        if (x, y) in visited or not is_background(x, y):
            continue
        visited.add((x, y))
        pixels[x, y] = (*pixels[x, y][:3], 0)
        for nx in range(max(0, x - 1), min(width, x + 2)):
            for ny in range(max(0, y - 1), min(height, y + 2)):
                if (nx, ny) not in visited:
                    queue.append((nx, ny))

    image.save(destination, optimize=True)
    print(f"{source.name} -> {destination.name}: {len(visited)} transparent pixels")


def remove_white_matte(rgb: tuple[int, int, int]) -> tuple[tuple[int, int, int], int]:
    alpha = 255 - min(rgb)
    if alpha <= 4:
        return (255, 255, 255), 0
    restored = tuple(
        max(0, min(255, round((channel - 255 * (1 - alpha / 255)) / (alpha / 255))))
        for channel in rgb
    )
    return restored, alpha


def refine_pague_menos() -> None:
    path = BRANDS / "pague-menos.png"
    image = Image.open(path).convert("RGBA")
    pixels = image.load()
    width, height = image.size

    # Preserve the large white cross, but remove white counters and matte halos
    # around the lettering.
    white_points = {
        (x, y)
        for y in range(height)
        for x in range(width)
        if pixels[x, y][3] and min(pixels[x, y][:3]) >= 225
    }
    components: list[set[tuple[int, int]]] = []
    while white_points:
        component = {white_points.pop()}
        queue = deque(component)
        while queue:
            x, y = queue.popleft()
            for point in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                if point in white_points:
                    white_points.remove(point)
                    component.add(point)
                    queue.append(point)
        components.append(component)
    cross = max(components, key=len)
    min_x = min(x for x, _ in cross) - 2
    max_x = max(x for x, _ in cross) + 2
    min_y = min(y for _, y in cross) - 2
    max_y = max(y for _, y in cross) + 2

    for y in range(height):
        for x in range(width):
            red, green, blue, alpha = pixels[x, y]
            if alpha == 0:
                continue
            rgb = (red, green, blue)
            inside_cross = min_x <= x <= max_x and min_y <= y <= max_y
            if inside_cross and min(rgb) >= 175:
                continue
            restored, matte_alpha = remove_white_matte(rgb)
            pixels[x, y] = (*restored, min(alpha, matte_alpha))

    image.save(path, optimize=True)


def build_norte_energia_dark() -> None:
    source = Image.open(BRANDS / "norte-energia.png").convert("RGBA")
    pixels = source.load()
    for y in range(source.height):
        for x in range(source.width):
            red, green, blue, alpha = pixels[x, y]
            if alpha == 0:
                continue
            restored, matte_alpha = remove_white_matte((red, green, blue))
            spread = max(restored) - min(restored)
            if spread < 48:
                restored = (226, 232, 240)
            pixels[x, y] = (*restored, min(alpha, matte_alpha))
    source.save(BRANDS / "norte-energia-dark.png", optimize=True)


for source_name, destination_name in LOGOS.items():
    remove_border_background(BRANDS / source_name, BRANDS / destination_name)

refine_pague_menos()
build_norte_energia_dark()
