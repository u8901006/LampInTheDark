import json
import re
import xml.etree.ElementTree as ET
import zipfile
from html.parser import HTMLParser
from pathlib import Path


EPUB_PATH = Path(r"D:\Forensic\Introduction to forensic psychology _ research and.epub")
OUTPUT_DIR = Path(r"D:\Forensic\forensic-psychology-articles\_source")
OUTPUT_PATH = OUTPUT_DIR / "chapters.json"
NCX_PATH = "OEBPS/toc.ncx"
XHTML_PREFIX = "OEBPS/"
NS = {"ncx": "http://www.daisy.org/z3986/2005/ncx/"}


class ChapterHTMLParser(HTMLParser):
    BLOCK_TAGS = {
        "p",
        "div",
        "section",
        "article",
        "li",
        "ul",
        "ol",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "tr",
        "table",
        "blockquote",
    }
    SKIP_TAGS = {"script", "style"}

    def __init__(self) -> None:
        super().__init__()
        self.parts: list[str] = []
        self.skip_depth = 0

    def handle_starttag(self, tag: str, attrs) -> None:
        if tag in self.SKIP_TAGS:
            self.skip_depth += 1
            return
        if self.skip_depth == 0 and tag in self.BLOCK_TAGS:
            self.parts.append("\n")

    def handle_endtag(self, tag: str) -> None:
        if tag in self.SKIP_TAGS and self.skip_depth > 0:
            self.skip_depth -= 1
            return
        if self.skip_depth == 0 and tag in self.BLOCK_TAGS:
            self.parts.append("\n")

    def handle_data(self, data: str) -> None:
        if self.skip_depth == 0:
            self.parts.append(data)

    def get_text(self) -> str:
        raw = "".join(self.parts).replace("\xa0", " ")
        raw = re.sub(r"[ \t]+", " ", raw)
        raw = re.sub(r"\n{3,}", "\n\n", raw)
        lines = [line.strip() for line in raw.splitlines()]
        cleaned = [line for line in lines if line]
        return "\n".join(cleaned)


def slugify(title: str) -> str:
    title = re.sub(r"^Chapter\s+(One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten|Eleven|Twelve|Thirteen)\s+", "", title, flags=re.IGNORECASE)
    title = re.sub(r"[^A-Za-z0-9]+", "-", title.lower()).strip("-")
    return title


def read_chapter_text(archive: zipfile.ZipFile, chapter_path: str) -> str:
    parser = ChapterHTMLParser()
    parser.feed(archive.read(XHTML_PREFIX + chapter_path).decode("utf-8", errors="replace"))
    return parser.get_text()


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    with zipfile.ZipFile(EPUB_PATH) as archive:
        root = ET.fromstring(archive.read(NCX_PATH))
        chapters = []

        for nav_point in root.findall(".//ncx:navPoint", NS):
            label = nav_point.find("ncx:navLabel/ncx:text", NS)
            content = nav_point.find("ncx:content", NS)
            if label is None or content is None:
                continue

            title = (label.text or "").strip()
            if not title.startswith("Chapter "):
                continue

            src = content.attrib.get("src", "")
            if not src:
                continue

            xhtml_path = src.split("#", 1)[0]
            chapter_number = len(chapters) + 1
            chapters.append(
                {
                    "number": chapter_number,
                    "title": title,
                    "slug": f"{chapter_number:02d}-{slugify(title)}",
                    "source_path": xhtml_path,
                    "text": read_chapter_text(archive, xhtml_path),
                }
            )

    payload = {
        "source": str(EPUB_PATH),
        "chapter_count": len(chapters),
        "chapters": chapters,
    }
    OUTPUT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Exported {len(chapters)} chapters to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
