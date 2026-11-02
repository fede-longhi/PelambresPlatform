"""
Rebuild climb IG pack:
  - sin-logo/  copies without logo
  - main files with pelambres climbing logo (v6)
"""
from __future__ import annotations

import shutil
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(__file__).resolve().parent
SIN = OUT / "sin-logo"
ASSETS = Path(r"C:\Users\feder\.cursor\projects\c-Users-feder-Proyectos-PelambresPlatform\assets")
CLIMB_LOGO_SRC = OUT / "pelambres-logo-climbing-concept-v6.jpg"

SAGE = (168, 184, 152)
WHITE = (255, 255, 255)

RATIO_FEED = 0.14
RATIO_STORY = 0.16
MARGIN_RATIO = 0.04


def font(size: int, bold: bool = True):
    paths = (
        [r"C:\Windows\Fonts\segoeuib.ttf", r"C:\Windows\Fonts\arialbd.ttf"]
        if bold
        else [r"C:\Windows\Fonts\segoeui.ttf", r"C:\Windows\Fonts\arial.ttf"]
    )
    for path in paths:
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
    return img.filter(ImageFilter.UnsharpMask(radius=1.4, percent=80, threshold=3))


def upscale(img: Image.Image, factor: float = 2.25) -> Image.Image:
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


def gradient_bottom(img: Image.Image, height_ratio: float = 0.48, opacity: float = 0.78) -> Image.Image:
    w, h = img.size
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    band = int(h * height_ratio)
    for y in range(band):
        alpha = int(255 * opacity * (y / band) ** 1.35)
        draw.line([(0, h - band + y), (w, h - band + y)], fill=(0, 0, 0, alpha))
    return Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")


def draw_centered_text(img: Image.Image, lines, y_start_ratio: float = 0.58, line_gap: int = 10) -> Image.Image:
    draw = ImageDraw.Draw(img)
    w, h = img.size
    y = int(h * y_start_ratio)
    for text, fnt, color in lines:
        bbox = draw.textbbox((0, 0), text, font=fnt)
        tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
        x = (w - tw) // 2
        draw.text((x + 2, y + 2), text, font=fnt, fill=(0, 0, 0))
        draw.text((x, y), text, font=fnt, fill=color)
        y += th + line_gap
    return img


def extract_circular_logo(src: Path) -> Image.Image:
    """Crop yellow circle from v6 concept and return RGBA with transparent outside."""
    img = Image.open(src).convert("RGB")
    w, h = img.size
    # content is centered circle — trim cream margins by finding yellow circle bounds
    # Sample: circle fills most of frame; crop square then mask
    side = min(w, h)
    left = (w - side) // 2
    top = (h - side) // 2
    sq = img.crop((left, top, left + side, top + side))

    # Shrink inset to remove cream ring around yellow circle
    # Detect non-cream pixels roughly
    pixels = sq.load()
    ys, xs = [], []
    for y in range(side):
        for x in range(side):
            r, g, b = pixels[x, y]
            # cream background ~ high RGB similar; yellow circle and content darker or yellow
            if not (r > 230 and g > 225 and b > 210 and abs(r - g) < 25):
                xs.append(x)
                ys.append(y)
    if xs and ys:
        pad = 4
        x0, x1 = max(0, min(xs) - pad), min(side - 1, max(xs) + pad)
        y0, y1 = max(0, min(ys) - pad), min(side - 1, max(ys) + pad)
        # make square crop around content
        cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
        rad = max(x1 - x0, y1 - y0) / 2
        x0 = int(max(0, cx - rad))
        y0 = int(max(0, cy - rad))
        x1 = int(min(side, cx + rad))
        y1 = int(min(side, cy + rad))
        # force square
        s = min(x1 - x0, y1 - y0)
        sq = sq.crop((x0, y0, x0 + s, y0 + s))

    size = sq.size[0]
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).ellipse((1, 1, size - 2, size - 2), fill=255)
    # slight edge feather
    mask = mask.filter(ImageFilter.GaussianBlur(0.6))
    out = sq.convert("RGBA")
    out.putalpha(mask)
    return out


def stamp_logo(base_rgb: Image.Image, logo_rgba: Image.Image, ratio: float) -> Image.Image:
    base = base_rgb.convert("RGBA")
    short = min(base.size)
    logo_size = max(72, int(short * ratio))
    logo = logo_rgba.resize((logo_size, logo_size), Image.Resampling.LANCZOS)

    # soft shadow
    shadow = Image.new("RGBA", (logo_size + 10, logo_size + 10), (0, 0, 0, 0))
    disc = Image.new("L", (logo_size, logo_size), 0)
    ImageDraw.Draw(disc).ellipse((0, 0, logo_size - 1, logo_size - 1), fill=160)
    disc = disc.filter(ImageFilter.GaussianBlur(3))
    sh = Image.new("RGBA", (logo_size, logo_size), (0, 0, 0, 0))
    sh.putalpha(disc)
    shadow.paste(sh, (5, 6), sh)
    canvas = Image.new("RGBA", (logo_size + 10, logo_size + 10), (0, 0, 0, 0))
    canvas = Image.alpha_composite(canvas, shadow)
    canvas.paste(logo, (0, 0), logo)

    margin = int(short * MARGIN_RATIO)
    x = base.width - canvas.width - margin
    y = margin
    out = base.copy()
    out.paste(canvas, (x, y), canvas)
    return out.convert("RGB")


def save_pair(img: Image.Image, name: str, logo: Image.Image, ratio: float) -> None:
    SIN.mkdir(exist_ok=True)
    clean = img.convert("RGB")
    clean.save(SIN / name, "JPEG", quality=93, optimize=True, progressive=True)
    stamped = stamp_logo(clean, logo, ratio)
    stamped.save(OUT / name, "JPEG", quality=93, optimize=True, progressive=True)
    print(f"ok {name}")


def load_asset_or_none(*names: str) -> Image.Image | None:
    for name in names:
        path = ASSETS / name
        if path.exists():
            return Image.open(path).convert("RGB")
    return None


def main() -> None:
    logo = extract_circular_logo(CLIMB_LOGO_SRC)
    logo.save(OUT / "pelambres-logo-climb.png")
    print(f"logo extracted {logo.size}")

    # --- Photo compositions (rebuild clean) ---
    hang = upscale(enhance(Image.open(ROOT / "WhatsApp Image 2026-10-26 at 17.35.36.jpeg")))
    colors = upscale(enhance(Image.open(ROOT / "WhatsApp Image 2026-10-26 at 17.35.28.jpeg")))
    detail = upscale(enhance(Image.open(ROOT / "WhatsApp Image 2026-10-26 at 17.35.28 (1).jpeg")))
    duo = upscale(enhance(Image.open(ROOT / "WhatsApp Image 2026-10-26 at 17.35.35 (1).jpeg")))
    trio = upscale(enhance(Image.open(ROOT / "WhatsApp Image 2026-10-26 at 17.35.29.jpeg")))

    feed01 = gradient_bottom(crop_ratio(hang, 4, 5, 0.5, 0.4))
    f_big = font(int(feed01.width * 0.065))
    f_small = font(int(feed01.width * 0.038), bold=False)
    f_brand = font(int(feed01.width * 0.042))
    feed01 = draw_centered_text(
        feed01,
        [
            ("¿Querés que tu equipo", f_big, WHITE),
            ("se vea así?", f_big, WHITE),
            ("pelambres.climb", f_brand, SAGE),
            ("porta equipo · custom", f_small, (220, 220, 220)),
        ],
        y_start_ratio=0.58,
        line_gap=10,
    )
    save_pair(feed01, "pelambres-climb-feed-01-hero-gear.jpg", logo, RATIO_FEED)

    story01 = gradient_bottom(crop_ratio(hang, 9, 16, 0.5, 0.38), 0.45, 0.75)
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
    save_pair(story01, "pelambres-climb-story-01-hero.jpg", logo, RATIO_STORY)

    feed02 = gradient_bottom(crop_ratio(colors, 1, 1, 0.5, 0.5), 0.4, 0.7)
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
    save_pair(feed02, "pelambres-climb-feed-02-colores.jpg", logo, RATIO_FEED)

    story02 = gradient_bottom(crop_ratio(colors, 9, 16, 0.5, 0.5), 0.4, 0.72)
    story02 = draw_centered_text(
        story02,
        [
            ("Custom a tu medida", font(int(story02.width * 0.07)), WHITE),
            ("color · agujeros · tamaño", font(int(story02.width * 0.045), bold=False), SAGE),
        ],
        y_start_ratio=0.7,
        line_gap=16,
    )
    save_pair(story02, "pelambres-climb-story-02-colores.jpg", logo, RATIO_STORY)

    save_pair(crop_ratio(detail, 4, 5, 0.5, 0.5), "pelambres-climb-feed-03-detalle.jpg", logo, RATIO_FEED)
    save_pair(crop_ratio(duo, 4, 5, 0.5, 0.45), "pelambres-climb-feed-01b-hook.jpg", logo, RATIO_FEED)
    save_pair(crop_ratio(trio, 1, 1, 0.5, 0.5), "pelambres-climb-feed-04-flatlay.jpg", logo, RATIO_FEED)

    reel = gradient_bottom(crop_ratio(colors, 9, 16, 0.5, 0.48), 0.42, 0.78)
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
    save_pair(reel, "pelambres-climb-reel-cover.jpg", logo, RATIO_STORY)

    # --- Designed slides from clean assets ---
    designed = [
        ("pelambres-climb-feed-00-brand.jpg", ["pelambres-climb-feed-00-brand.jpg"], RATIO_FEED),
        ("pelambres-climb-feed-05-hook-text.jpg", ["pelambres-climb-feed-hook-text.jpg"], RATIO_FEED),
        ("pelambres-climb-feed-06-custom.jpg", ["pelambres-climb-feed-custom.jpg"], RATIO_FEED),
        ("pelambres-climb-feed-07-cta.jpg", ["pelambres-climb-feed-cta.jpg"], RATIO_FEED),
        ("pelambres-climb-story-03-cta.jpg", ["pelambres-climb-story-cta.jpg"], RATIO_STORY),
        ("pelambres-climb-story-01b-ai-hook.jpg", ["pelambres-climb-story-hook.jpg"], RATIO_STORY),
        ("pelambres-climb-reel-cover-alt.jpg", ["pelambres-climb-reel-cover-designed.jpg"], RATIO_STORY),
        ("pelambres-climb-feed-01-hero-ai-enhanced.jpg", ["pelambres-climb-feed-01-hero-enhanced.jpg"], RATIO_FEED),
    ]
    for dest_name, sources, ratio in designed:
        img = load_asset_or_none(*sources)
        if img is None:
            # fallback: if already in OUT without ability to clean, skip
            existing = OUT / dest_name
            if existing.exists():
                print(f"WARN no clean asset for {dest_name}, keeping existing")
            else:
                print(f"MISSING {dest_name}")
            continue
        save_pair(img, dest_name, logo, ratio)

    print("done — with logo in instagram/, without in sin-logo/")


if __name__ == "__main__":
    main()
