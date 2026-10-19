import os
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm

def build_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        topMargin=16 * mm,
        bottomMargin=14 * mm
    )

    styles = getSampleStyleSheet()

    # Custom styles
    proj_title_style = ParagraphStyle(
        'ProjTitle',
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#0F172A')
    )

    doc_subtitle_style = ParagraphStyle(
        'DocSubtitle',
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#EA580C'),
        spaceAfter=10
    )

    category_heading_style = ParagraphStyle(
        'CategoryHeading',
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=colors.HexColor('#1E293B')
    )

    item_style = ParagraphStyle(
        'TechItem',
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#334155')
    )

    footer_style = ParagraphStyle(
        'FooterText',
        fontName='Helvetica',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor('#94A3B8')
    )

    elements = []

    # Header
    elements.append(Paragraph("METAL WEIGHT CALCULATOR &amp; QUOTATION SUITE", proj_title_style))
    elements.append(Paragraph("TECHNOLOGY STACK", doc_subtitle_style))
    elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#E2E8F0'), spaceAfter=14))

    # Tech stack data categorized
    categories = [
        ("Frontend", [
            "HTML5",
            "CSS3",
            "JavaScript (ES6+)",
            "Tailwind CSS",
            "Lucide Icons"
        ]),
        ("Backend", [
            "Node.js",
            "Express.js",
            "Multer",
            "Dotenv",
            "CORS"
        ]),
        ("Database &amp; Storage", [
            "MongoDB",
            "Mongoose (ODM)"
        ]),
        ("Authentication &amp; Security", [
            "Google OAuth 2.0 (Google Identity Services)",
            "Google Auth Library",
            "bcryptjs"
        ]),
        ("Artificial Intelligence", [
            "Google Gemini AI (Gemini 3.5 Flash)"
        ]),
        ("Document &amp; PDF Processing", [
            "jsPDF &amp; jsPDF-AutoTable",
            "SheetJS (XLSX)",
            "QRCode.js"
        ]),
        ("Email Services", [
            "Resend API",
            "Nodemailer"
        ]),
        ("UI &amp; Canvas Graphics", [
            "Finisher Header (Canvas Particles)"
        ])
    ]

    # Build 2-column cards
    # Available width = 210mm - 36mm = 174mm
    col_width = 84 * mm
    gap_width = 6 * mm

    cards = []
    for cat_title, items in categories:
        card_content = []
        # Header inside card
        card_content.append(Paragraph(f"&bull; <b>{cat_title.upper()}</b>", category_heading_style))
        card_content.append(Spacer(1, 4))
        for item in items:
            card_content.append(Paragraph(f"&nbsp;&nbsp;&ndash;&nbsp; {item}", item_style))
        cards.append(card_content)

    # Pair cards into 2 columns: (0, 1), (2, 3), (4, 5), (6, 7)
    table_data = []
    for i in range(0, len(cards), 2):
        left_cell = cards[i]
        right_cell = cards[i+1] if (i+1) < len(cards) else []
        table_data.append([left_cell, "", right_cell])

    card_table = Table(
        table_data,
        colWidths=[col_width, gap_width, col_width]
    )

    t_style = [
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('LEFTPADDING', (0, 0), (0, -1), 10),
        ('RIGHTPADDING', (0, 0), (0, -1), 10),
        ('LEFTPADDING', (2, 0), (2, -1), 10),
        ('RIGHTPADDING', (2, 0), (2, -1), 10),
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#F8FAFC')),
        ('BACKGROUND', (2, 0), (2, -1), colors.HexColor('#F8FAFC')),
        ('BOX', (0, 0), (0, -1), 0.8, colors.HexColor('#E2E8F0')),
        ('BOX', (2, 0), (2, -1), 0.8, colors.HexColor('#E2E8F0')),
    ]

    card_table.setStyle(TableStyle(t_style))
    elements.append(card_table)

    elements.append(Spacer(1, 14))
    elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#E2E8F0'), spaceAfter=8))

    footer_data = [
        [
            Paragraph("Argus Technologies &bull; Metal Weight Calculator &amp; Quotation Suite", footer_style),
            Paragraph("Official Technology Stack", ParagraphStyle('RightFooter', parent=footer_style, alignment=2))
        ]
    ]
    footer_table = Table(footer_data, colWidths=[100 * mm, 74 * mm])
    footer_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
    ]))
    elements.append(footer_table)

    doc.build(elements)
    print(f"Successfully generated: {filename}")

if __name__ == '__main__':
    out_path = os.path.join(os.path.dirname(__file__), 'Technology_Stack.pdf')
    build_pdf(out_path)
