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


for source_name, destination_name in LOGOS.items():
    remove_border_background(BRANDS / source_name, BRANDS / destination_name)
