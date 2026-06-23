"""Convert assets/icon-source.png (your image) to assets/icon.ico."""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "icon-source.png"
OUT = ROOT / "assets" / "icon.ico"


def main() -> None:
    if not SRC.exists():
        raise SystemExit(f"Save your image as:\n  {SRC}")
    base = Image.open(SRC).convert("RGBA")
    base = base.resize((256, 256), Image.Resampling.LANCZOS)
    sizes = [16, 32, 48, 64, 128, 256]
    images = [base.resize((s, s), Image.Resampling.LANCZOS) for s in sizes]
    images[0].save(
        OUT,
        format="ICO",
        sizes=[(s, s) for s in sizes],
        append_images=images[1:],
    )
    base.convert("RGB").save(ROOT / "assets" / "icon.png")
    print(f"Updated {OUT}. Re-run Create Desktop Shortcut.ps1")


if __name__ == "__main__":
    main()
