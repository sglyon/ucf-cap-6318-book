import base64
import json
import tempfile
import unittest
from pathlib import Path

from sync_diagram_attachments import sync_notebook


class DiagramAttachmentsTest(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.root = Path(self.directory.name)
        (self.root / "img").mkdir()
        self.svg = self.root / "img/example.svg"
        self.svg.write_text('<svg xmlns="http://www.w3.org/2000/svg"/>')
        self.path = self.root / "lecture.ipynb"
        self.notebook = {
            "cells": [
                {
                    "cell_type": "markdown",
                    "id": "example",
                    "metadata": {
                        "diagram_source": "img/example.svg",
                        "caption": "Current caption.",
                    },
                    "source": ["![Example](attachment:example.svg)"],
                },
                {
                    "cell_type": "markdown",
                    "id": "example-caption",
                    "metadata": {"tags": ["remove-cell"]},
                    "source": ["Old caption."],
                },
                {
                    "cell_type": "code",
                    "metadata": {},
                    "source": ["1 + 1"],
                    "execution_count": 1,
                    "outputs": [{"output_type": "stream", "text": "2"}],
                },
            ]
        }
        self.path.write_text(json.dumps(self.notebook))

    def test_refreshes_changed_svg_and_caption_without_changing_code(self):
        self.assertEqual(sync_notebook(self.path), (1, True))
        notebook = json.loads(self.path.read_text())
        self.assertEqual(notebook["cells"][1]["source"], ["Current caption."])
        self.assertEqual(notebook["cells"][2], self.notebook["cells"][2])
        self.svg.write_text('<svg xmlns="http://www.w3.org/2000/svg"><circle/></svg>')
        self.assertEqual(sync_notebook(self.path), (1, True))
        notebook = json.loads(self.path.read_text())
        payload = notebook["cells"][0]["attachments"]["example.svg"]["image/svg+xml"]
        self.assertEqual(base64.b64decode(payload), self.svg.read_bytes())

    def test_second_sync_does_not_rewrite_the_notebook(self):
        sync_notebook(self.path)
        before = self.path.read_bytes()
        self.assertEqual(sync_notebook(self.path), (1, False))
        self.assertEqual(self.path.read_bytes(), before)

    def test_missing_svg_stops_build_instead_of_shipping_stale_attachment(self):
        sync_notebook(self.path)
        self.svg.unlink()
        with self.assertRaises(FileNotFoundError):
            sync_notebook(self.path)

    def test_native_png_image_preserves_surrounding_prose(self):
        png = self.root / "img/graph.png"
        png.write_bytes(b"\x89PNG\r\n\x1a\n")
        cell = {
            "cell_type": "markdown",
            "metadata": {"attachment_sources": {"graph.png": "img/graph.png"}},
            "source": ["Before.\n\n![Graph](attachment:graph.png)\n\nAfter."],
        }
        self.path.write_text(json.dumps({"cells": [cell]}))
        self.assertEqual(sync_notebook(self.path), (1, True))
        synced = json.loads(self.path.read_text())["cells"][0]
        self.assertEqual(synced["source"], cell["source"])
        self.assertEqual(
            base64.b64decode(synced["attachments"]["graph.png"]["image/png"]),
            png.read_bytes(),
        )


if __name__ == "__main__":
    unittest.main()
