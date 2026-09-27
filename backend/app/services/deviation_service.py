import re
import logging
from datetime import datetime, date
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_
from app.models.deviation import Deviation
from app.schemas.deviation import DeviationCreate

logger = logging.getLogger("qms.deviation_service")

class DeviationService:
    @staticmethod
    def generate_deviation_id(db: Session) -> str:
        """Generates sequential deviation IDs like DEV-0001, DEV-0002."""
        last_deviation = db.query(Deviation).order_by(desc(Deviation.id)).first()
        if not last_deviation or not last_deviation.deviation_id:
            return "DEV-0001"

        match = re.search(r"DEV-(\d+)", last_deviation.deviation_id)
        if match:
            next_num = int(match.group(1)) + 1
            return f"DEV-{next_num:04d}"

        # Fallback based on total count
        count = db.query(Deviation).count() + 1
        return f"DEV-{count:04d}"

    @staticmethod
    def create_deviation(db: Session, payload: DeviationCreate) -> Deviation:
        new_id = DeviationService.generate_deviation_id(db)

        # Parse date if string
        parsed_date: Optional[date] = None
        if payload.date_of_occurrence:
            try:
                if isinstance(payload.date_of_occurrence, str):
                    clean_date = payload.date_of_occurrence.strip()
                    for fmt in ("%Y-%m-%d", "%Y/%m/%d", "%d-%m-%Y", "%d/%m/%Y"):
                        try:
                            parsed_date = datetime.strptime(clean_date, fmt).date()
                            break
                        except ValueError:
                            continue
            except Exception as e:
                logger.warning(f"Could not parse date {payload.date_of_occurrence}: {e}")

        detection_src = payload.detection_source or payload.source
        deviation = Deviation(
            deviation_id=new_id,
            source_document_reference=payload.source_document_reference,
            date_of_occurrence=parsed_date,
            site=payload.site,
            department=payload.department,
            title=payload.title,
            detection_source=detection_src,
            source=detection_src,
            related_product=payload.related_product,
            batch_number=payload.batch_number,
            description=payload.description,
            immediate_action=payload.immediate_action,
            ai_potential_impact=payload.ai_potential_impact,
            ai_suggested_severity=payload.ai_suggested_severity,
            ai_severity_reason=payload.ai_severity_reason,
            rule_candidate=payload.rule_candidate,
            assessment_status=payload.assessment_status,
            final_severity=payload.final_severity or payload.ai_suggested_severity,
            status=payload.status or "Submitted",
            source_filename=payload.source_filename,
        )

        db.add(deviation)
        db.commit()
        db.refresh(deviation)
        logger.info(f"Deviation created successfully with ID: {deviation.deviation_id}")
        return deviation

    @staticmethod
    def get_deviations(
        db: Session,
        search: Optional[str] = None,
        status: Optional[str] = None,
        severity: Optional[str] = None
    ) -> List[Deviation]:
        query = db.query(Deviation)

        if search and search.strip():
            term = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    Deviation.deviation_id.ilike(term),
                    Deviation.title.ilike(term),
                    Deviation.department.ilike(term),
                    Deviation.related_product.ilike(term),
                    Deviation.batch_number.ilike(term),
                    Deviation.site.ilike(term)
                )
            )

        if status and status.strip() and status != "All":
            query = query.filter(Deviation.status.ilike(status.strip()))

        if severity and severity.strip() and severity != "All":
            query = query.filter(
                or_(
                    Deviation.final_severity.ilike(severity.strip()),
                    Deviation.ai_suggested_severity.ilike(severity.strip())
                )
            )

        return query.order_by(desc(Deviation.created_at)).all()

    @staticmethod
    def get_deviation_by_id(db: Session, deviation_id: str) -> Optional[Deviation]:
        # Try direct match on string deviation_id
        dev = db.query(Deviation).filter(Deviation.deviation_id == deviation_id).first()
        if not dev and deviation_id.isdigit():
            dev = db.query(Deviation).filter(Deviation.id == int(deviation_id)).first()
        return dev
