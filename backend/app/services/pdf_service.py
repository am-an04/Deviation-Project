import pymupdf as fitz
import logging
from fastapi import HTTPException, UploadFile, status

logger = logging.getLogger("qms.pdf_service")

class PDFService:
    @staticmethod
    async def extract_text_from_upload(file: UploadFile, max_size_mb: int = 10) -> str:
        # Validate filename and extension
        filename = file.filename or ""
        if not filename.lower().endswith(".pdf"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file format. Only PDF documents (.pdf) are accepted."
            )

        # Read contents
        contents = await file.read()
        if not contents or len(contents) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The uploaded PDF file is empty (0 bytes)."
            )

        # Check file size
        max_bytes = max_size_mb * 1024 * 1024
        if len(contents) > max_bytes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File exceeds maximum allowed size of {max_size_mb} MB."
            )

        # Open with PyMuPDF
        try:
            doc = fitz.open(stream=contents, filetype="pdf")
        except Exception as e:
            logger.error(f"PyMuPDF failed to open PDF {filename}: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The uploaded file appears to be corrupted or is not a valid PDF document."
            )

        if doc.page_count == 0:
            doc.close()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The uploaded PDF document contains no pages."
            )

        extracted_chunks = []
        for page_idx in range(doc.page_count):
            try:
                page = doc.load_page(page_idx)
                text = page.get_text("text")
                if text and text.strip():
                    extracted_chunks.append(text.strip())
            except Exception as e:
                logger.warning(f"Error reading page {page_idx} from {filename}: {e}")

        doc.close()

        full_text = "\n\n".join(extracted_chunks).strip()

        if not full_text:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="This PDF does not contain readable text. OCR support is not enabled in the current MVP."
            )

        return full_text
