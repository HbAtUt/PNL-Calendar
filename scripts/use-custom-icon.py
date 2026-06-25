"""Convert assets/icon-source.png (your image) to assets/icon.ico."""
import subprocess
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "icon-source.png"
OUT = ROOT / "assets" / "icon.ico"
PNG = ROOT / "assets" / "icon.png"


def main() -> None:
    if not SRC.exists():
        raise SystemExit(f"Save your image as:\n  {SRC}")
    base = Image.open(SRC).convert("RGBA")
    base = base.resize((256, 256), Image.Resampling.LANCZOS)
    base.save(PNG, format="PNG")
    script = (
        "import pngToIco from 'png-to-ico';"
        "import fs from 'fs';"
        f"const buf = await pngToIco('{PNG.as_posix()}');"
        f"fs.writeFileSync('{OUT.as_posix()}', buf);"
    )
    subprocess.run(
        ["node", "--input-type=module", "-e", script],
        cwd=ROOT,
        check=True,
    )
    print(f"Updated {OUT} and {PNG}. Re-run Create Desktop Shortcut.ps1")


if __name__ == "__main__":
    main()
