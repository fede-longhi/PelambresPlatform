"""Stamp Pelambres logo (top-right) on climb Instagram assets — same placement as existing IG posts."""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageFilter

OUT = Path(__file__).resolve().parent
LOGO_PATH = Path(r"c:\Users\feder\Proyectos\PelambresPlatform\public\pelambres_logo.png")

# Relative logo diameter vs short side of image (matches ~existing social posts)
RATIO_FEED = 0.14
RATIO_STORY = 0.16
MARGIN_RATIO = 0.04

TARGETS = [
    # feed carousel
    ("pelambres-climb-feed-00-brand.jpg", RATIO_FEED),
    ("pelambres-climb-feed-01-hero-gear.jpg", RATIO_FEED),
    ("pelambres-climb-feed-01b-hook.jpg", RATIO_FEED),
    ("pelambres-climb-feed-02-colores.jpg", RATIO_FEED),
    ("pelambres-climb-feed-03-detalle.jpg", RATIO_FEED),
    ("pelambres-climb-feed-04-flatlay.jpg", RATIO_FEED),
    ("pelambres-climb-feed-05-hook-text.jpg", RATIO_FEED),
    ("pelambres-climb-feed-06-custom.jpg", RATIO_FEED),
    ("pelambres-climb-feed-07-cta.jpg", RATIO_FEED),
    # stories + reel
    ("pelambres-climb-story-01-hero.jpg", RATIO_STORY),
    ("pelambres-climb-story-02-colores.jpg", RATIO_STORY),
    ("pelambres-climb-story-03-cta.jpg", RATIO_STORY),
    ("pelambres-climb-reel-cover.jpg", RATIO_STORY),
]


def prepare_logo(size: int) -> Image.Image:
    logo = Image.open(LOGO_PATH).convert("RGBA")
    # soft shadow under circular mark
    shadow = Image.new("RGBA", (size + 8, size + 8), (0, 0, 0, 0))
    disc = Image.new("L", (size, size), 0)
    from PIL import ImageDraw

    ImageDraw.Draw(disc).ellipse((0, 0, size - 1, size - 1), fill=180)
    disc = disc.filter(ImageFilter.GaussianBlur(3))
    shadow_layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    shadow_layer.putalpha(disc)
    shadow.paste(shadow_layer, (4, 5), shadow_layer)

    logo_r = logo.resize((size, size), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (size + 8, size + 8), (0, 0, 0, 0))
    canvas = Image.alpha_composite(canvas, shadow)
    canvas.paste(logo_r, (0, 0), logo_r)
    return canvas


def stamp(path: Path, ratio: float) -> None:
    base = Image.open(path).convert("RGBA")
    short = min(base.size)
    logo_size = max(64, int(short * ratio))
    logo = prepare_logo(logo_size)
    margin = int(short * MARGIN_RATIO)
    x = base.width - logo.width - margin
    y = margin
    out = base.copy()
    out.paste(logo, (x, y), logo)
    out.convert("RGB").save(path, "JPEG", quality=93, optimize=True, progressive=True)
    print(f"logo -> {path.name} ({logo_size}px @ {x},{y})")


def main() -> None:
    for name, ratio in TARGETS:
        path = OUT / name
        if not path.exists():
            print(f"skip missing {name}")
            continue
        stamp(path, ratio)
    print("done")


if __name__ == "__main__":
    main()
