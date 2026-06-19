#!/usr/bin/env python3
"""Generate favicon and icon files from a source PNG."""

from PIL import Image
import os

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCE = os.path.join(BASE, "temp/electerm-logo-2048-1.png")
OUT_DIR = os.path.join(BASE, "src/static")

ICONS = [
    ("favicon-16x16.png", 16),
    ("favicon-32x32.png", 32),
    ("android-chrome-192x192.png", 192),
    ("android-chrome-512x512.png", 512),
    ("apple-touch-icon.png", 180),
]

def main():
    img = Image.open(SOURCE).convert("RGBA")

    for name, size in ICONS:
        resized = img.resize((size, size), Image.LANCZOS)
        out = os.path.join(OUT_DIR, name)
        resized.save(out, "PNG")
        print(f"Saved {out} ({size}x{size})")

    # favicon.ico: single 16x16 ICO (matching original format)
    ico_path = os.path.join(OUT_DIR, "favicon.ico")
    ico_img = img.resize((16, 16), Image.LANCZOS)
    ico_img.save(ico_path, format="ICO", sizes=[(16, 16)])
    print(f"Saved {ico_path} (16x16 ICO)")

if __name__ == "__main__":
    main()
