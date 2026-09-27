from sqlalchemy import Column, Integer, String, Date, Text, DateTime
from sqlalchemy.sql import func
from app.database import Base

class Deviation(Base):
    __tablename__ = "deviations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    deviation_id = Column(String(30), unique=True, nullable=False, index=True)
    source_document_reference = Column(String(150), nullable=True)
    date_of_occurrence = Column(Date, nullable=True)
    site = Column(String(255), nullable=True)
    department = Column(String(255), nullable=True)
    title = Column(String(500), nullable=True)
    detection_source = Column(String(255), nullable=True)
    source = Column(String(255), nullable=True)  # Kept for compatibility
    related_product = Column(String(255), nullable=True)
    batch_number = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    immediate_action = Column(Text, nullable=True)

    ai_potential_impact = Column(Text, nullable=True)
    ai_suggested_severity = Column(String(50), nullable=True)
    ai_severity_reason = Column(Text, nullable=True)
    rule_candidate = Column(String(50), nullable=True)
    assessment_status = Column(String(50), nullable=True)

    final_severity = Column(String(50), nullable=True)
    status = Column(String(50), default="Draft")
    source_filename = Column(String(255), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
