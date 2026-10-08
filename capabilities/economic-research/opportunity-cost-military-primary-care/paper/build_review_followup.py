"""Build the October 8 follow-up from the 25-page PR16 PDF.
Usage: python build_review_followup.py base.pdf output.pdf --font-dir C:/Windows/Fonts
Requires reportlab and pypdf. Base: commit 713966a, analysis/research-paper.pdf.
"""
import argparse, json, io
from pathlib import Path
from pypdf import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
p=argparse.ArgumentParser(); p.add_argument('base'); p.add_argument('output'); p.add_argument('--font-dir',required=True); a=p.parse_args()
r=PdfReader(a.base); assert len(r.pages)==25, 'Use the 25-page citation-corrected base PDF'
d=json.loads(Path(__file__).with_name('review-followup-2026-10-08.json').read_text())
for name,file in [('TNR','times.ttf'),('TNRB','timesbd.ttf')]: pdfmetrics.registerFont(TTFont(name,str(Path(a.font_dir)/file)))
style=ParagraphStyle('body',fontName='TNR',fontSize=12,leading=24)
buf=io.BytesIO(); c=canvas.Canvas(buf,pagesize=(612,792))
titles=['Recommendation and decision rule','Appendix F Benchmark and feasibility gate','Appendix F Trial planning assumptions','Appendix F Illustrative budget and limits']
for title,paras,num in zip(titles,[d['recommendation']]+d['appendix_pages'],[4,25,26,27]):
 c.setFont('TNRB',12); c.drawString(72,720,title); y=696
 for text in paras:
  para=Paragraph(text,style); _,h=para.wrap(468,650); para.drawOn(c,72,y-h); y-=h+8
 assert y>=62, 'Page overflow'
 c.setFont('TNR',12); c.drawCentredString(306,40,str(num)); c.showPage()
c.save(); replacement=PdfReader(buf); w=PdfWriter()
for i,page in enumerate(r.pages): w.add_page(replacement.pages[0] if i==4 else page)
for page in replacement.pages[1:]: w.add_page(page)
w.add_metadata({'/Author':'','/Title':'Navy physician retention and financial opportunity cost','/Subject':'October 8 review follow-up','/Creator':'anonymous'})
with open(a.output,'wb') as f:w.write(f)
