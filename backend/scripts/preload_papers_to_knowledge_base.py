from __future__ import annotations

import argparse
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.database import SessionLocal
from app.models import ResearchPaper
from app.services.embedding import EmbeddingService
from app.services.papers import PaperService


DEFAULT_PDF_ROOT = Path(r"E:/BDev/biomentor-agent/hanwen-dev-temp/知识库论文2026.5.27")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--pdf-root",
        default=str(DEFAULT_PDF_ROOT),
        help="Directory containing PDF files to import.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    pdf_root = Path(args.pdf_root).resolve()
    if not pdf_root.exists() or not pdf_root.is_dir():
        raise SystemExit(f"pdf root not found: {pdf_root}")

    db = SessionLocal()
    service = PaperService(db)
    vector = EmbeddingService()

    imported = 0
    skipped = 0
    indexed = 0

    try:
        existing_filenames = {
            (paper.pdf_filename or "").strip()
            for paper in db.query(ResearchPaper).all()
            if (paper.pdf_filename or "").strip()
        }

        for pdf_path in sorted(pdf_root.glob("*.pdf")):
            if pdf_path.name in existing_filenames:
                skipped += 1
                print(f"skip existing pdf: {pdf_path.name}")
                continue

            print(f"import pdf: {pdf_path.name}")
            paper = service.import_pdf(pdf_path.name, pdf_path.read_bytes())
            imported += 1
            print(f"  -> imported paper_id={paper.id} title={paper.title}")

        papers = db.query(ResearchPaper).order_by(ResearchPaper.id).all()
        for paper in papers:
            chunk_count = service.index_paper_to_knowledge_base(paper.id)
            indexed += chunk_count
            print(f"index paper_id={paper.id} chunks={chunk_count} title={paper.title}")

        print("done")
        print(f"imported={imported}")
        print(f"skipped={skipped}")
        print(f"paper_count={len(papers)}")
        print(f"papers_collection_count={vector.collection_stats('papers').get('count', 0)}")
        print(f"indexed_chunks={indexed}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
