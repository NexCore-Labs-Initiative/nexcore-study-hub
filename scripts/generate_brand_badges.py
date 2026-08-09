from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
BRAND_DIR = ROOT / "assets" / "imgs" / "brand"
SOURCE = BRAND_DIR / "source" / "nexcore-studyhub-selected.png"
PARENT_MARK = ROOT / "assets" / "imgs" / "nexcore-icon.png"

INDIGO = "#5b5fef"
INK = "#0e0f13"
WHITE = "#ffffff"


def render_badge(
    size: int,
    background: str | None,
    glyph: str,
    *,
    keyline: str | None = None,
    compact: bool = False,
) -> Image.Image:
    scale = 4
    canvas_size = size * scale
    image = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)

    if background:
        radius = round(canvas_size * 0.255)
        draw.rounded_rectangle(
            (0, 0, canvas_size - 1, canvas_size - 1),
            radius=radius,
            fill=background,
            outline=keyline,
            width=max(1, round(canvas_size * 0.006)) if keyline else 1,
        )

    center = canvas_size / 2
    orbit = canvas_size * (0.19 if compact else 0.205)
    tile = canvas_size * (0.176 if compact else 0.151)
    tile_radius = tile * 0.19
    centers = (
        (center, center - orbit),
        (center - orbit * 0.866, center - orbit * 0.5),
        (center + orbit * 0.866, center - orbit * 0.5),
        (center - orbit * 0.866, center + orbit * 0.5),
        (center + orbit * 0.866, center + orbit * 0.5),
        (center, center + orbit),
    )
    half = tile / 2
    for x, y in centers:
        draw.rounded_rectangle(
            (round(x - half), round(y - half), round(x + half), round(y + half)),
            radius=round(tile_radius),
            fill=glyph,
        )

    return image.resize((size, size), Image.Resampling.LANCZOS)


def render_parent_mark(size: int) -> Image.Image:
    return Image.open(PARENT_MARK).convert("RGBA").resize((size, size), Image.Resampling.LANCZOS)


def save(image: Image.Image, name: str) -> None:
    image.save(BRAND_DIR / name, optimize=True)


def main() -> None:
    for required in (SOURCE, PARENT_MARK):
        if not required.exists():
            raise FileNotFoundError(f"Required brand source is missing: {required}")

    BRAND_DIR.mkdir(parents=True, exist_ok=True)

    primary = render_badge(512, INDIGO, WHITE)
    save(primary, "nexcore-studyhub-badge-primary.png")
    save(render_badge(512, WHITE, INDIGO, keyline="#e4e5ec"), "nexcore-studyhub-badge-light.png")
    save(render_badge(512, INK, WHITE), "nexcore-studyhub-badge-dark.png")
    save(render_badge(512, None, INK), "nexcore-studyhub-mark-monochrome.png")

    favicon = render_badge(512, INDIGO, WHITE, compact=True)
    save(favicon.resize((32, 32), Image.Resampling.LANCZOS), "favicon-32.png")
    save(favicon.resize((180, 180), Image.Resampling.LANCZOS), "apple-touch-icon.png")
    save(favicon.resize((192, 192), Image.Resampling.LANCZOS), "icon-192.png")
    save(favicon, "icon-512.png")
    favicon.save(BRAND_DIR / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])

    family = Image.new("RGBA", (1024, 512), (0, 0, 0, 0))
    family.alpha_composite(primary.resize((400, 400), Image.Resampling.LANCZOS), (56, 56))
    family.alpha_composite(render_parent_mark(320), (624, 96))
    save(family, "nexcore-brand-family-lockup.png")


if __name__ == "__main__":
    main()
