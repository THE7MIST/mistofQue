from __future__ import annotations

import re
import sys
from html import escape
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


NAVY = colors.HexColor("#0f172a")
SLATE = colors.HexColor("#475569")
MUTED = colors.HexColor("#64748b")
TEAL = colors.HexColor("#0f766e")
TEAL_LIGHT = colors.HexColor("#ccfbf1")
BORDER = colors.HexColor("#cbd5e1")
ROW = colors.HexColor("#f8fafc")
WARNING = colors.HexColor("#fef3c7")


def clean(text: str) -> str:
    replacements = {
        "\ufeff": "",
        "â€™": "'",
        "â€œ": '"',
        "â€": '"',
        "â€“": "-",
        "â€”": "-",
        "â†’": "->",
        "âœ…": "",
        "’": "'",
        "‘": "'",
        "“": '"',
        "”": '"',
        "–": "-",
        "—": "-",
        "‑": "-",
        "→": "->",
        "×": "x",
        "⭐": "",
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    text = re.sub(r"\*\*(.*?)\*\*", r"\1", text)
    text = text.replace("\\<", "<").replace("\\>", ">")
    return text.strip()


def para(text: str, style: ParagraphStyle) -> Paragraph:
    return Paragraph(escape(clean(text)).replace("\n", "<br/>"), style)


def split_table_row(line: str) -> list[str]:
    return [clean(cell) for cell in line.strip().strip("|").split("|")]


def parse_markdown(markdown: str):
    title = "PKI Acronyms"
    sections = []
    current = None
    in_code = False
    code_lines: list[str] = []
    lines = markdown.splitlines()
    index = 0

    def ensure_section(name: str):
        nonlocal current
        current = {"title": clean(name), "rows": [], "notes": []}
        sections.append(current)

    while index < len(lines):
        raw = lines[index].rstrip()
        line = clean(raw)

        if line.startswith("```"):
            if in_code:
                if code_lines:
                    if current is None:
                        ensure_section("Revision Notes")
                    current["notes"].append({"type": "code", "text": "\n".join(code_lines)})
                code_lines = []
                in_code = False
            else:
                in_code = True
            index += 1
            continue

        if in_code:
            code_lines.append(raw)
            index += 1
            continue

        if line.startswith("# "):
            if title == "PKI Acronyms":
                title = clean(line[2:])
            else:
                ensure_section(line[2:])
            index += 1
            continue

        if line.startswith("## "):
            ensure_section(line[3:])
            index += 1
            continue

        if line.startswith("### "):
            if current is None:
                ensure_section("Revision Notes")
            current["notes"].append({"type": "heading", "text": line[4:]})
            index += 1
            continue

        if line.startswith("|") and "|" in line[1:]:
            if index + 1 < len(lines) and re.match(r"^\s*\|?\s*:?-{3,}", lines[index + 1]):
                headers = split_table_row(line)
                index += 2
                while index < len(lines) and lines[index].strip().startswith("|"):
                    row = split_table_row(lines[index])
                    if len(row) >= len(headers):
                        if current is None:
                            ensure_section("Reference")
                        current["rows"].append(row[: len(headers)])
                    index += 1
                continue

        if line and not line.startswith("---"):
            if current is None:
                ensure_section("Overview")
            current["notes"].append({"type": "paragraph", "text": line})

        index += 1

    return title, sections


def build_pdf(source: Path, output: Path) -> None:
    markdown = source.read_text(encoding="utf-8")
    title, sections = parse_markdown(markdown)
    term_count = sum(len(section["rows"]) for section in sections)

    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle("CoverTitle", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=28, leading=32, textColor=NAVY, alignment=TA_CENTER, spaceAfter=12))
    styles.add(ParagraphStyle("CoverSub", parent=styles["BodyText"], fontName="Helvetica", fontSize=11, leading=16, textColor=SLATE, alignment=TA_CENTER, spaceAfter=18))
    styles.add(ParagraphStyle("Section", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=16, leading=20, textColor=NAVY, spaceBefore=12, spaceAfter=8))
    styles.add(ParagraphStyle("Small", parent=styles["BodyText"], fontName="Helvetica", fontSize=8.2, leading=10.5, textColor=SLATE))
    styles.add(ParagraphStyle("Cell", parent=styles["BodyText"], fontName="Helvetica", fontSize=7.4, leading=9.2, textColor=NAVY))
    styles.add(ParagraphStyle("CellBold", parent=styles["BodyText"], fontName="Helvetica-Bold", fontSize=7.8, leading=9.5, textColor=NAVY))
    styles.add(ParagraphStyle("NoteTitle", parent=styles["BodyText"], fontName="Helvetica-Bold", fontSize=9, leading=11, textColor=TEAL))
    styles.add(ParagraphStyle("MonoBlock", parent=styles["Code"], fontName="Courier", fontSize=8, leading=10, textColor=NAVY))

    doc = SimpleDocTemplate(str(output), pagesize=A4, leftMargin=0.42 * inch, rightMargin=0.42 * inch, topMargin=0.6 * inch, bottomMargin=0.58 * inch)
    story = []

    story.extend(
        [
            Spacer(1, 0.55 * inch),
            para("MCQ Arena", styles["CoverSub"]),
            para(title, styles["CoverTitle"]),
            para("Full forms, definitions, MCQ traps, memory lines, and certificate-security distinctions for fast PKI revision.", styles["CoverSub"]),
            Table(
                [[para(f"{term_count}", styles["CoverTitle"]), para(f"{len(sections)}", styles["CoverTitle"])], [para("acronyms and key terms", styles["Small"]), para("revision sections", styles["Small"])]],
                colWidths=[2.35 * inch, 2.35 * inch],
                style=TableStyle([
                    ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f0fdfa")),
                    ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#99f6e4")),
                    ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#99f6e4")),
                    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                    ("TOPPADDING", (0, 0), (-1, -1), 12),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
                ]),
            ),
            Spacer(1, 0.45 * inch),
            Table(
                [[para("How to use this PDF", styles["NoteTitle"])], [para("Start with the Most Important 20, then revise sections by function: certificates, hashing, algorithms, revocation, TLS, authentication, directories, hardware, standards, India PKI, and blockchain terms.", styles["Small"])]],
                colWidths=[7.0 * inch],
                style=TableStyle([
                    ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
                    ("BOX", (0, 0), (-1, -1), 0.7, BORDER),
                    ("TOPPADDING", (0, 0), (-1, -1), 10),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
                    ("LEFTPADDING", (0, 0), (-1, -1), 12),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 12),
                ]),
            ),
            PageBreak(),
        ]
    )

    for section in sections:
        story.append(para(section["title"], styles["Section"]))

        if section["rows"]:
            table_data = [[para("Acronym", styles["CellBold"]), para("Full form", styles["CellBold"]), para("Definition", styles["CellBold"])]]
            for row in section["rows"]:
                acronym = row[0] if len(row) > 0 else ""
                full = row[1] if len(row) > 1 else ""
                definition = row[2] if len(row) > 2 else " ".join(row[2:])
                table_data.append([para(acronym, styles["CellBold"]), para(full, styles["Cell"]), para(definition, styles["Cell"])])
            table = Table(table_data, colWidths=[0.72 * inch, 1.82 * inch, 4.65 * inch], repeatRows=1)
            table.setStyle(
                TableStyle(
                    [
                        ("BACKGROUND", (0, 0), (-1, 0), TEAL),
                        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                        ("LINEBELOW", (0, 0), (-1, 0), 0.8, TEAL),
                        ("GRID", (0, 0), (-1, -1), 0.35, BORDER),
                        ("VALIGN", (0, 0), (-1, -1), "TOP"),
                        ("TOPPADDING", (0, 0), (-1, -1), 5),
                        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                        ("LEFTPADDING", (0, 0), (-1, -1), 5),
                        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
                    ]
                )
            )
            for row_index in range(1, len(table_data)):
                if row_index % 2 == 0:
                    table.setStyle(TableStyle([("BACKGROUND", (0, row_index), (-1, row_index), ROW)]))
            story.extend([table, Spacer(1, 8)])

        for note in section["notes"]:
            if note["type"] == "heading":
                story.append(para(note["text"], styles["NoteTitle"]))
            elif note["type"] == "code":
                lines = [clean(line) for line in note["text"].splitlines() if clean(line)]
                block = "<br/>".join(escape(line) for line in lines)
                story.append(
                    Table(
                        [[Paragraph(block, styles["MonoBlock"])]],
                        colWidths=[7.18 * inch],
                        style=TableStyle([
                            ("BACKGROUND", (0, 0), (-1, -1), WARNING),
                            ("BOX", (0, 0), (-1, -1), 0.6, colors.HexColor("#f59e0b")),
                            ("LEFTPADDING", (0, 0), (-1, -1), 8),
                            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                            ("TOPPADDING", (0, 0), (-1, -1), 7),
                            ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
                        ]),
                    )
                )
            else:
                story.append(para(note["text"], styles["Small"]))
            story.append(Spacer(1, 6))

        story.append(Spacer(1, 8))

    def decorate(canvas, doc):
        canvas.saveState()
        width, height = A4
        canvas.setFillColor(NAVY)
        canvas.setFont("Helvetica-Bold", 8)
        canvas.drawString(doc.leftMargin, height - 0.35 * inch, "MCQ Arena - PKI Acronyms Reference")
        canvas.setFillColor(MUTED)
        canvas.setFont("Helvetica", 8)
        canvas.drawRightString(width - doc.rightMargin, height - 0.35 * inch, f"Page {doc.page}")
        canvas.setStrokeColor(colors.HexColor("#e2e8f0"))
        canvas.line(doc.leftMargin, height - 0.43 * inch, width - doc.rightMargin, height - 0.43 * inch)
        canvas.restoreState()

    doc.build(story, onFirstPage=decorate, onLaterPages=decorate)


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("Usage: generate_pki_acronyms_pdf.py <source.md> <output.pdf>")
    build_pdf(Path(sys.argv[1]), Path(sys.argv[2]))
