"""
Enhance climbing gear rack photos for Instagram — pro look, keep realism.
No AI reshape: color grade, clarity, crop, subtle vignette.
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter, ImageDraw, ImageOps, ImageStat

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(__file__).resolve().parent
PREVIEWS = OUT / "_previews"
PREVIEWS.mkdir(exist_ok=True)

# Source files (WhatsApp names)
SRC = {
    "colors_flat": ROOT / "WhatsApp Image 2026-10-26 at 17.35.28.jpeg",
    "flat_gear": ROOT / "WhatsApp Image 2026-10-26 at 17.35.28 (1).jpeg",
    "flat_trio": ROOT / "WhatsApp Image 2026-10-26 at 17.35.29.jpeg",
    "flat_close": ROOT / "WhatsApp Image 2026-10-26 at 17.35.30.jpeg",
    "hang_duo": ROOT / "WhatsApp Image 2026-10-26 at 17.35.35.jpeg",
    "hang_duo_close": ROOT / "WhatsApp Image 2026-10-26 at 17.35.35 (1).jpeg",
    "hang_full": ROOT / "WhatsApp Image 2026-10-26 at 17.35.36.jpeg",
    "hang_alt": ROOT / "WhatsApp Image 2026-10-26 at 17.35.37.jpeg",
}


def load(path: Path) -> Image.Image:
    img = Image.open(path)
    img = ImageOps.exif_transpose(img)
    return img.convert("RGB")


def crop_center(img: Image.Image, ratio_w: int, ratio_h: int) -> Image.Image:
    w, h = img.size
    target = ratio_w / ratio_h
    current = w / h
    if current > target:
        new_w = int(h * target)
        left = (w - new_w) // 2
        return img.crop((left, 0, left + new_w, h))
    new_h = int(w / target)
    top = (h - new_h) // 2
    return img.crop((0, top, w, top + new_h))


def crop_focus(
    img: Image.Image,
    ratio_w: int,
    ratio_h: int,
    focus_x: float = 0.5,
    focus_y: float = 0.45,
) -> Image.Image:
    """Crop to aspect ratio keeping focus point inside frame."""
    w, h = img.size
    target = ratio_w / ratio_h
    current = w / h
    if current > target:
        new_w = int(h * target)
        cx = int(w * focus_x)
        left = max(0, min(cx - new_w // 2, w - new_w))
        return img.crop((left, 0, left + new_w, h))
    new_h = int(w / target)
    cy = int(h * focus_y)
    top = max(0, min(cy - new_h // 2, h - new_h))
    return img.crop((0, top, w, top + new_h))


def soft_vignette(img: Image.Image, strength: float = 0.18) -> Image.Image:
    w, h = img.size
    overlay = Image.new("RGB", (w, h), (0, 0, 0))
    mask = Image.new("L", (w, h), 0)
    draw = ImageDraw.Draw(mask)
    # ellipse inset
    inset_x, inset_y = int(w * 0.08), int(h * 0.08)
    draw.ellipse((-inset_x, -inset_y, w + inset_x, h + inset_y), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(radius=min(w, h) // 6))
    # invert so edges are dark
    mask = ImageOps.invert(mask)
    # scale strength
    mask = mask.point(lambda p: int(p * strength))
    return Image.composite(overlay, img, mask)


def enhance_pro(img: Image.Image) -> Image.Image:
    """Subtle pro grade: keep texture, avoid plastic look."""
    # Autocontrast mild
    img = ImageOps.autocontrast(img, cutoff=0.6)

    # Warmth via slight color balance (climb/wood vibe)
    r, g, b = img.split()
    r = r.point(lambda p: min(255, int(p * 1.03)))
    b = b.point(lambda p: int(p * 0.97))
    img = Image.merge("RGB", (r, g, b))

    img = ImageEnhance.Color(img).enhance(1.12)
    img = ImageEnhance.Contrast(img).enhance(1.08)
    img = ImageEnhance.Brightness(img).enhance(1.02)

    # Clarity: unsharp mask light
    img = img.filter(ImageFilter.UnsharpMask(radius=1.6, percent=85, threshold=3))

    # Soft vignette for product focus
    img = soft_vignette(img, strength=0.14)
    return img


def resize_max(img: Image.Image, max_side: int = 2160) -> Image.Image:
    w, h = img.size
    scale = max_side / max(w, h)
    if scale >= 1:
        return img
    return img.resize((int(w * scale), int(h * scale)), Image.Resampling.LANCZOS)


def save(img: Image.Image, name: str, quality: int = 92) -> Path:
    path = OUT / name
    img.save(path, "JPEG", quality=quality, optimize=True, progressive=True)
    # also preview copy
    prev = PREVIEWS / f"{name.replace('pelambres-climb-', '').replace('.jpg', '')}.jpg"
    img.save(prev, "JPEG", quality=88, optimize=True)
    print(f"saved {path.name} ({img.size[0]}x{img.size[1]})")
    return path


def main() -> None:
    missing = [k for k, p in SRC.items() if not p.exists()]
    if missing:
        print("Missing:", missing)
        for k in list(SRC):
            if k in missing:
                del SRC[k]

    # --- Feed 01 hero: hung gear — "¿Querés que tu equipo se vea así?" ---
    hang = enhance_pro(load(SRC["hang_full"]))
    hero = crop_focus(hang, 4, 5, focus_x=0.5, focus_y=0.42)
    hero = resize_max(hero, 2160)
    save(hero, "pelambres-climb-feed-01-hero-gear.jpg")

    # Story/reel vertical of hung gear
    hang_story = crop_focus(hang, 9, 16, focus_x=0.5, focus_y=0.4)
    hang_story = resize_max(hang_story, 1920)
    save(hang_story, "pelambres-climb-story-01-hero.jpg")

    # Close hung duo
    if "hang_duo_close" in SRC:
        duo = enhance_pro(load(SRC["hang_duo_close"]))
        duo_feed = crop_focus(duo, 4, 5, focus_x=0.5, focus_y=0.45)
        duo_feed = resize_max(duo_feed, 2160)
        save(duo_feed, "pelambres-climb-feed-01b-hook.jpg")

    # --- Feed 02 colors / customizable ---
    colors = enhance_pro(load(SRC["colors_flat"]))
    col_sq = crop_center(colors, 1, 1)
    col_sq = resize_max(col_sq, 2160)
    save(col_sq, "pelambres-climb-feed-02-colores.jpg")

    # --- Feed 03 flat with gear context ---
    flat = enhance_pro(load(SRC["flat_gear"]))
    flat_feed = crop_focus(flat, 4, 5, focus_x=0.5, focus_y=0.5)
    flat_feed = resize_max(flat_feed, 2160)
    save(flat_feed, "pelambres-climb-feed-03-detalle.jpg")

    # Story colors
    col_story = crop_focus(colors, 9, 16, focus_x=0.5, focus_y=0.5)
    col_story = resize_max(col_story, 1920)
    save(col_story, "pelambres-climb-story-02-colores.jpg")

    # Reel cover / mid frames from flat close
    if "flat_close" in SRC:
        close = enhance_pro(load(SRC["flat_close"]))
        reel = crop_focus(close, 9, 16, focus_x=0.5, focus_y=0.45)
        reel = resize_max(reel, 1920)
        save(reel, "pelambres-climb-reel-cover.jpg")

    # Square product only for carousel / highlight
    trio = enhance_pro(load(SRC["flat_trio"]))
    trio_sq = crop_center(trio, 1, 1)
    trio_sq = resize_max(trio_sq, 2160)
    save(trio_sq, "pelambres-climb-feed-04-flatlay.jpg")

    print("done")


if __name__ == "__main__":
    main()
