"""Keep portable notebook image attachments in sync with their source files."""

import base64
import json
from pathlib import Path

IMAGE_TYPES = {
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
}


def sync_notebook(path: Path) -> tuple[int, bool]:
    notebook = json.loads(path.read_text())
    diagrams = 0
    changed = False
    cells_by_id = {cell.get("id"): cell for cell in notebook["cells"]}
    for cell in notebook["cells"]:
        metadata = cell.get("metadata", {})
        source = metadata.get("diagram_source")
        sources = dict(metadata.get("attachment_sources", {}))
        if source:
            sources[Path(source).name] = source
        if not sources:
            continue
        if cell["cell_type"] != "markdown":
            raise ValueError(f"{path}: image attachments require a markdown cell")
        for name, image_source in sources.items():
            image_path = path.parent / image_source
            mime = IMAGE_TYPES.get(image_path.suffix.lower())
            if mime is None:
                raise ValueError(f"{path}: unsupported image type for {image_source}")
            if f"(attachment:{name})" not in "".join(cell["source"]):
                raise ValueError(f"{path}: missing attachment image for {image_source}")
            payload = {mime: base64.b64encode(image_path.read_bytes()).decode("ascii")}
            attachments = cell.setdefault("attachments", {})
            if attachments.get(name) != payload:
                attachments[name] = payload
                changed = True
            diagrams += 1

        if not source:
            continue

        # Jupyter displays this caption cell; MyST uses the figure metadata instead.
        caption_cell = cells_by_id.get(f"{cell.get('id')}-caption")
        if caption_cell is None or "remove-cell" not in caption_cell.get(
            "metadata", {}
        ).get("tags", []):
            raise ValueError(f"{path}: missing notebook-only caption cell for {source}")
        caption = cell["metadata"]["caption"]
        if "".join(caption_cell["source"]) != caption:
            caption_cell["source"] = [caption]
            changed = True

    if changed:
        path.write_text(json.dumps(notebook, indent=1, ensure_ascii=False) + "\n")
    return diagrams, changed


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    diagrams = updated = 0
    for path in sorted(root.glob("week*/*.ipynb")):
        count, changed = sync_notebook(path)
        diagrams += count
        updated += changed
    print(f"Synced {diagrams} diagram attachments; updated {updated} notebooks.")


if __name__ == "__main__":
    main()
