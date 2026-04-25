import fitz  # PyMuPDF
import os

def extract_text_from_pdf(file_path: str) -> str:
    """Extract all text from a PDF file using PyMuPDF."""
    doc = fitz.open(file_path)
    full_text = []

    for page_num, page in enumerate(doc, 1):
        text = page.get_text("text")
        if text.strip():
            full_text.append(f"--- Page {page_num} ---\n{text}")

    doc.close()
    return "\n\n".join(full_text)

def extract_text_from_bytes(pdf_bytes: bytes) -> str:
    """Extract text directly from uploaded PDF bytes (no temp file needed)."""
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    full_text = []

    for page_num, page in enumerate(doc, 1):
        text = page.get_text("text")
        if text.strip():
            full_text.append(f"--- Page {page_num} ---\n{text}")

    doc.close()
    combined = "\n\n".join(full_text)

    # Groq Llama 3.3 70B has a TPM limit of 12000 on the free tier.
    # Cap at 15k chars to leave enough tokens for prompt + completion.
    if len(combined) > 15000:
        combined = combined[:15000] + "\n\n[Chapter truncated for processing]"

    return combined
