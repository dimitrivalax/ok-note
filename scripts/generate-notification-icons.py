#!/usr/bin/env python3
"""
Generate Android notification small icons (status bar icons) for OK! Note.

Android requires notification small icons to be flat, monochrome (white #FFFFFF)
with transparency. The system tints them automatically in the status bar and
notification drawer (using `iconColor` or system palette).
"""

from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE_ASSET = ROOT / "assets" / "icon-only.png"
RES_DIR = ROOT / "android" / "app" / "src" / "main" / "res"

DENSITIES = {
    "drawable-mdpi": 24,
    "drawable-hdpi": 36,
    "drawable-xhdpi": 48,
    "drawable-xxhdpi": 72,
    "drawable-xxxhdpi": 96,
    "drawable": 96,
}


def build_notification_icon(alpha_channel: Image.Image, canvas_size: int) -> Image.Image:
    """Creates a canvas_size x canvas_size pure white icon using the alpha mask."""
    # Scale within 88% of canvas for standard Android optical padding
    target_dim = int(canvas_size * 0.88)
    scale = target_dim / max(alpha_channel.size)
    new_w = max(1, int(alpha_channel.width * scale))
    new_h = max(1, int(alpha_channel.height * scale))

    # Resize alpha channel directly with Lanczos interpolation
    scaled_alpha = alpha_channel.resize((new_w, new_h), Image.Resampling.LANCZOS)

    # Place centered on transparent canvas
    alpha_canvas = Image.new("L", (canvas_size, canvas_size), 0)
    x_offset = (canvas_size - new_w) // 2
    y_offset = (canvas_size - new_h) // 2
    alpha_canvas.paste(scaled_alpha, (x_offset, y_offset))

    # Merge with 100% pure white (#FFFFFF) RGB channels so no dark fringing occurs
    white_channel = Image.new("L", (canvas_size, canvas_size), 255)
    return Image.merge("RGBA", (white_channel, white_channel, white_channel, alpha_canvas))


def main():
    if not SOURCE_ASSET.exists():
        raise FileNotFoundError(f"Source asset not found: {SOURCE_ASSET}")

    im = Image.open(SOURCE_ASSET).convert("RGBA")
    bbox = im.getbbox()
    cropped = im.crop(bbox)
    _, _, _, alpha = cropped.split()

    # Save high-res source notification icons in assets/
    assets_dir = ROOT / "assets"
    android_assets_dir = assets_dir / "android"
    android_assets_dir.mkdir(parents=True, exist_ok=True)

    hi_res_icon = build_notification_icon(alpha, 512)
    hi_res_icon.save(assets_dir / "notification-icon.png", format="PNG")
    hi_res_icon.save(android_assets_dir / "notification.png", format="PNG")
    print(f"Generated {(assets_dir / 'notification-icon.png').relative_to(ROOT)}")
    print(f"Generated {(android_assets_dir / 'notification.png').relative_to(ROOT)}")

    # Generate density-specific drawables for Android
    for folder, size in DENSITIES.items():
        out_dir = RES_DIR / folder
        out_dir.mkdir(parents=True, exist_ok=True)
        out_file = out_dir / "ic_stat_notification.png"

        icon = build_notification_icon(alpha, size)
        icon.save(out_file, format="PNG")
        print(f"Generated {out_file.relative_to(ROOT)} ({size}x{size})")


if __name__ == "__main__":
    main()
