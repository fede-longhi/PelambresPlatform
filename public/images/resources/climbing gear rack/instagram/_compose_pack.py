"""
Compose Instagram pack: upscale graded photos, text overlays, gather designed slides.
"""
from __future__ import annotations

import shutil
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(__file__).resolve().parent
ASSETS = Path(r"C:\Users\feder\.cursor\projects\c-Users-feder-Proyectos-PelambresPlatform\assets")

SAGE = (168, 184, 152)
WHITE = (255, 255, 255)
NEAR_BLACK = (18, 18, 18)


def font(size: int, bold: bool = True) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        r"C:\Windows\Fonts\segoeuib.ttf" if bold else r"C:\Windows\Fonts\segoeui.ttf",
        r"C:\Windows\Fonts\arialbd.ttf" if bold else r"C:\Windows\Fonts\arial.ttf",
        r"C:\Windows\Fonts\calibrib.ttf" if bold else r"C:\Windows\Fonts\calibri.ttf",
    ]
    for path in candidates:
        if Path(path).exists():
            return ImageFont.truetype(path, size=size)
    return ImageFont.load_default()


def enhance(img: Image.Image) -> Image.Image:
    img = ImageOps.exif_transpose(img).convert("RGB")
    img = ImageOps.autocontrast(img, cutoff=0.5)
    r, g, b = img.split()
    r = r.point(lambda p: min(255, int(p * 1.03)))
    b = b.point(lambda p: int(p * 0.97))
    img = Image.merge("RGB", (r, g, b))
    img = ImageEnhance.Color(img).enhance(1.1)
    img = ImageEnhance.Contrast(img).enhance(1.07)
    img = img.filter(ImageFilter.UnsharpMask(radius=1.4, percent=80, threshold=3))
    return img


def upscale(img: Image.Image, factor: float = 2.0) -> Image.Image:
    w, h = img.size
    return img.resize((int(w * factor), int(h * factor)), Image.Resampling.LANCZOS)


def crop_ratio(img: Image.Image, rw: int, rh: int, fx: float = 0.5, fy: float = 0.42) -> Image.Image:
    w, h = img.size
    target = rw / rh
    if w / h > target:
        nw = int(h * target)
        left = max(0, min(int(w * fx) - nw // 2, w - nw))
        return img.crop((left, 0, left + nw, h))
    nh = int(w / target)
    top = max(0, min(int(h * fy) - nh // 2, h - nh))
    return img.crop((0, top, w, top + nh))


def gradient_bottom(img: Image.Image, height_ratio: float = 0.42, opacity: float = 0.72) -> Image.Image:
    w, h = img.size
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    band = int(h * height_ratio)
    for y in range(band):
        alpha = int(255 * opacity * (y / band) ** 1.35)
        draw.line([(0, h - band + y), (w, h - band + y)], fill=(0, 0, 0, alpha))
    base = img.convert("RGBA")
    return Image.alpha_composite(base, overlay).convert("RGB")


def draw_centered_text(
    img: Image.Image,
    lines: list[tuple[str, ImageFont.ImageFont, tuple[int, int, int]]],
    y_start_ratio: float = 0.62,
    line_gap: int = 18,
) -> Image.Image:
    draw = ImageDraw.Draw(img)
    w, h = img.size
    y = int(h * y_start_ratio)
    for text, fnt, color in lines:
        bbox = draw.textbbox((0, 0), text, font=fnt)
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
        x = (w - tw) // 2
        # soft shadow
        draw.text((x + 2, y + 2), text, font=fnt, fill=(0, 0, 0, 180))
        draw.text((x, y), text, font=fnt, fill=color)
        y += th + line_gap
    return img


def save_jpg(img: Image.Image, name: str) -> None:
    path = OUT / name
    img.save(path, "JPEG", quality=93, optimize=True, progressive=True)
    print(f"saved {name} {img.size}")


def main() -> None:
    hang = enhance(Image.open(ROOT / "WhatsApp Image 2026-10-26 at 17.35.36.jpeg"))
    hang = upscale(hang, 2.25)

    # Feed 01 — hero photo + hook text
    feed01 = crop_ratio(hang, 4, 5, 0.5, 0.4)
    feed01 = gradient_bottom(feed01, 0.48, 0.78)
    f_big = font(int(feed01.width * 0.065))
    f_small = font(int(feed01.width * 0.038), bold=False)
    f_brand = font(int(feed01.width * 0.042))
    feed01 = draw_centered_text(
        feed01,
        [
            ("¿Querés que tu equipo", f_big, WHITE),
            ("se vea así?", f_big, WHITE),
            ("", font(8), WHITE),
            ("pelambres.climb", f_brand, SAGE),
            ("porta equipo · custom", f_small, (220, 220, 220)),
        ],
        y_start_ratio=0.58,
        line_gap=10,
    )
    save_jpg(feed01, "pelambres-climb-feed-01-hero-gear.jpg")

    # Story hook — photo + text
    story01 = crop_ratio(hang, 9, 16, 0.5, 0.38)
    story01 = gradient_bottom(story01, 0.45, 0.75)
    sf = font(int(story01.width * 0.078))
    sb = font(int(story01.width * 0.048))
    story01 = draw_centered_text(
        story01,
        [
            ("¿Querés que tu equipo", sf, WHITE),
            ("se vea así?", sf, WHITE),
            ("pelambres.climb", sb, SAGE),
        ],
        y_start_ratio=0.62,
        line_gap=14,
    )
    save_jpg(story01, "pelambres-climb-story-01-hero.jpg")

    # Colors flat
    colors = enhance(Image.open(ROOT / "WhatsApp Image 2026-10-26 at 17.35.28.jpeg"))
    colors = upscale(colors, 2.25)
    feed02 = crop_ratio(colors, 1, 1, 0.5, 0.5)
    feed02 = gradient_bottom(feed02, 0.4, 0.7)
    c_big = font(int(feed02.width * 0.07))
    c_sm = font(int(feed02.width * 0.04), bold=False)
    feed02 = draw_centered_text(
        feed02,
        [
            ("Elegí color y agujeros", c_big, WHITE),
            ("lo armamos a tu medida", c_sm, SAGE),
        ],
        y_start_ratio=0.72,
        line_gap=14,
    )
    save_jpg(feed02, "pelambres-climb-feed-02-colores.jpg")

    story02 = crop_ratio(colors, 9, 16, 0.5, 0.5)
    story02 = gradient_bottom(story02, 0.4, 0.72)
    story02 = draw_centered_text(
        story02,
        [
            ("Custom a tu medida", font(int(story02.width * 0.07)), WHITE),
            ("color · agujeros · tamaño", font(int(story02.width * 0.045), bold=False), SAGE),
        ],
        y_start_ratio=0.7,
        line_gap=16,
    )
    save_jpg(story02, "pelambres-climb-story-02-colores.jpg")

    # Detail with gear
    detail = enhance(Image.open(ROOT / "WhatsApp Image 2026-10-26 at 17.35.28 (1).jpeg"))
    detail = upscale(detail, 2.25)
    feed03 = crop_ratio(detail, 4, 5, 0.5, 0.5)
    save_jpg(feed03, "pelambres-climb-feed-03-detalle.jpg")

    # Duo hanging clean photo
    duo = enhance(Image.open(ROOT / "WhatsApp Image 2026-10-26 at 17.35.35 (1).jpeg"))
    duo = upscale(duo, 2.25)
    feed01b = crop_ratio(duo, 4, 5, 0.5, 0.45)
    save_jpg(feed01b, "pelambres-climb-feed-01b-hook.jpg")

    # Flatlay
    trio = enhance(Image.open(ROOT / "WhatsApp Image 2026-10-26 at 17.35.29.jpeg"))
    trio = upscale(trio, 2.25)
    feed04 = crop_ratio(trio, 1, 1, 0.5, 0.5)
    save_jpg(feed04, "pelambres-climb-feed-04-flatlay.jpg")

    # Reel cover from colors
    reel = crop_ratio(colors, 9, 16, 0.5, 0.48)
    reel = gradient_bottom(reel, 0.42, 0.78)
    reel = draw_centered_text(
        reel,
        [
            ("ORGANIZÁ", font(int(reel.width * 0.1)), WHITE),
            ("TU EQUIPO", font(int(reel.width * 0.1)), WHITE),
            ("pelambres.climb", font(int(reel.width * 0.05)), SAGE),
        ],
        y_start_ratio=0.66,
        line_gap=8,
    )
    save_jpg(reel, "pelambres-climb-reel-cover.jpg")

    # Copy designed AI slides into pack folder
    designed = {
        "pelambres-climb-feed-hook-text.jpg": "pelambres-climb-feed-05-hook-text.jpg",
        "pelambres-climb-feed-custom.jpg": "pelambres-climb-feed-06-custom.jpg",
        "pelambres-climb-story-cta.jpg": "pelambres-climb-story-03-cta.jpg",
        "pelambres-climb-story-hook.jpg": "pelambres-climb-story-01b-ai-hook.jpg",
        "pelambres-climb-reel-cover-designed.jpg": "pelambres-climb-reel-cover-alt.jpg",
        "pelambres-climb-feed-01-hero-enhanced.jpg": "pelambres-climb-feed-01-hero-ai-enhanced.jpg",
    }
    for src_name, dest_name in designed.items():
        src = ASSETS / src_name
        if src.exists():
            shutil.copy2(src, OUT / dest_name)
            print(f"copied {dest_name}")
        else:
            print(f"missing asset {src_name}")

    print("pack ready")


if __name__ == "__main__":
    main()
