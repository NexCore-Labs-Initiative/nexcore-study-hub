from pathlib import Path
from xml.etree import ElementTree as ET

from PIL import Image, ImageColor, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
BRAND_DIR = ROOT / "assets" / "imgs" / "brand"
SVG_MASTER = BRAND_DIR / "nexcore-studyhub-badge-primary.svg"
SVG_NS = "{http://www.w3.org/2000/svg}"


def svg_fill(element: ET.Element) -> tuple[int, int, int, int]:
    fill = element.get("fill")
    for declaration in element.get("style", "").split(";"):
        key, separator, value = declaration.partition(":")
        if separator and key.strip() == "fill":
            fill = value.strip()
    if not fill or fill == "none":
        return (0, 0, 0, 0)
    return ImageColor.getcolor(fill, "RGBA")


def read_svg_geometry() -> tuple[tuple[float, float, float, float], list[dict[str, float | tuple[int, int, int, int]]]]:
    root = ET.parse(SVG_MASTER).getroot()
    view_box = tuple(float(value) for value in root.attrib["viewBox"].split())
    if len(view_box) != 4:
        raise ValueError("The SVG master must have a four-value viewBox")

    rectangles = []
    for element in root.iter(f"{SVG_NS}rect"):
        rectangles.append(
            {
                "x": float(element.get("x", 0)),
                "y": float(element.get("y", 0)),
                "width": float(element.attrib["width"]),
                "height": float(element.attrib["height"]),
                "rx": float(element.get("rx", 0)),
                "fill": svg_fill(element),
            }
        )

    if len(rectangles) != 7:
        raise ValueError(f"Expected one badge and six resource tiles, found {len(rectangles)} rectangles")
    return view_box, rectangles


def render_svg(size: int) -> Image.Image:
    view_box, rectangles = read_svg_geometry()
    min_x, min_y, width, height = view_box
    working_size = max(2048, size * 4)
    scale_x = working_size / width
    scale_y = working_size / height
    image = Image.new("RGBA", (working_size, working_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)

    for rectangle in rectangles:
        left = (float(rectangle["x"]) - min_x) * scale_x
        top = (float(rectangle["y"]) - min_y) * scale_y
        right = left + float(rectangle["width"]) * scale_x
        bottom = top + float(rectangle["height"]) * scale_y
        radius = float(rectangle["rx"]) * min(scale_x, scale_y)
        draw.rounded_rectangle((left, top, right, bottom), radius=radius, fill=rectangle["fill"])

    return image.resize((size, size), Image.Resampling.LANCZOS)


def save_png(name: str, size: int) -> None:
    render_svg(size).save(BRAND_DIR / name, optimize=True)


def save_webp(name: str, size: int) -> None:
    render_svg(size).save(BRAND_DIR / name, format="WEBP", lossless=True, quality=100, method=6, exact=True)


def main() -> None:
    if not SVG_MASTER.exists():
        raise FileNotFoundError(f"SVG master is missing: {SVG_MASTER}")

    BRAND_DIR.mkdir(parents=True, exist_ok=True)

    # General-use exports kept in sync with the SVG master.
    save_webp("nexcore-studyhub-badge-primary.webp", 512)
    save_webp("icon.webp", 512)

    # Requested WebP icon collection.
    save_webp("apple-touch-icon.webp", 180)
    save_webp("favicon.webp", 48)
    save_webp("favicon-32.webp", 32)
    save_webp("icon-192.webp", 192)

    # Compatibility exports for user agents that still expect PNG or ICO.
    save_png("apple-touch-icon.png", 180)
    save_png("favicon-32.png", 32)
    save_png("icon-192.png", 192)
    favicon = render_svg(512)
    favicon.save(BRAND_DIR / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])


if __name__ == "__main__":
    main()
