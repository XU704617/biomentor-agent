---
name: pdf
description: Create, read, and review PDF files programmatically with proper rendering and layout. Invoke when tasks involve PDF generation, text extraction, or visual PDF review.
---

# PDF Skill

## When to Use

- Read or review PDF content where layout and visuals matter
- Create PDFs programmatically with reliable formatting
- Validate final rendering before delivery
- Extract text or data from PDF documents

## Workflow

1. Prefer visual review: render PDF pages to PNGs and inspect them.
   - Use `pdftoppm` if available (part of Poppler)
   - If unavailable, install Poppler or ask the user to review locally
2. Use `reportlab` to generate PDFs when creating new documents (Python)
3. Use `pdfplumber` for text extraction with layout awareness, or `pypdf` for simpler extraction
4. After each meaningful update, re-render pages and verify alignment, spacing, and legibility

## Temp and Output Conventions

- Use `tmp/pdfs/` for intermediate files; delete when done
- Write final artifacts under `output/pdf/`
- Keep filenames stable and descriptive

## Dependencies

Python packages (install if missing):

```bash
pip install reportlab pdfplumber pypdf
# or with uv:
uv pip install reportlab pdfplumber pypdf
```

System tools (for rendering):

- **macOS (Homebrew):** `brew install poppler`
- **Ubuntu/Debian:** `sudo apt-get install -y poppler-utils`
- **Windows:** Download Poppler binaries from http://blog.alivate.com.au/poppler-windows/

## Rendering Command

```bash
pdftoppm -png input.pdf output_prefix
```

This produces `output_prefix-1.png`, `output_prefix-2.png`, etc.

## Quality Expectations

- Maintain polished visual design: consistent typography, spacing, margins, and section hierarchy
- Avoid rendering issues: clipped text, overlapping elements, broken tables, black squares, or unreadable glyphs
- Charts, tables, and images must be sharp, aligned, and clearly labeled
- Use ASCII hyphens only; avoid U+2011 (non-breaking hyphen) and other Unicode dashes that cause rendering issues
- Citations and references must be human-readable

## PDF Generation Quick Start (reportlab)

```python
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer

doc = SimpleDocTemplate("output.pdf", pagesize=A4)
styles = getSampleStyleSheet()
story = []

title = Paragraph("Document Title", styles["Title"])
story.append(title)
story.append(Spacer(1, 12))

body = Paragraph("Your content here.", styles["Normal"])
story.append(body)

doc.build(story)
```

## PDF Text Extraction Quick Start (pdfplumber)

```python
import pdfplumber

with pdfplumber.open("document.pdf") as pdf:
    for page in pdf.pages:
        text = page.extract_text()
        print(text)
        # Extract tables
        tables = page.extract_tables()
```

## Final Checks

- Render pages to PNG and visually inspect for defects
- Confirm headers/footers, page numbering, and section transitions look polished
- Check for any clipped or overlapping content
- Verify all text is readable and properly aligned
