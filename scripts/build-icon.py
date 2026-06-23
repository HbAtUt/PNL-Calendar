"""Build solid black app icon."""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "icon.ico"


def draw_icon(size: int) -> Image.Image:
    return Image.new("RGB", (size, size), (0, 0, 0))


def main() -> None:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    sizes = [16, 32, 48, 64, 128, 256]
    images = [draw_icon(s) for s in sizes]
    images[0].save(
        OUT,
        format="ICO",
        sizes=[(s, s) for s in sizes],
        append_images=images[1:],
    )
    png = ROOT / "assets" / "icon.png"
    draw_icon(256).save(png, format="PNG")
    print(f"Wrote {OUT} and {png}")


if __name__ == "__main__":
    main()
