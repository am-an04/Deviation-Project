import uuid
import time
from typing import Dict, List, Any
from pydantic import BaseModel, Field

class RuleInput(BaseModel):
    income: float = Field(..., ge=0)
    creditScore: int = Field(..., ge=300, le=850)
    employment: str = Field(...)
    loanAmount: float = Field(..., ge=0)

class RuleOutcome(BaseModel):
    ruleId: str
    name: str
    description: str
    passed: bool
    details: str

class EngineOutput(BaseModel):
    decision: str
    matchedRules: List[RuleOutcome]
    evidenceUsed: Dict[str, Any]
    reasoning: List[str]
    auditTrail: str
    processingTimeMs: float

def run_policy_evaluation(data: RuleInput) -> EngineOutput:
    start_time = time.perf_counter()
    
    matched_rules = []
    reasoning = []
    
    # Evidence record
    evidence = {
      "income": data.income,
      "credit_score": data.creditScore,
      "employment_status": data.employment,
      "loan_amount": data.loanAmount,
      "debt_to_income_ratio": round((data.loanAmount / data.income) if data.income > 0 else 999.0, 2)
    }

    # Rule 1: Credit Score Check
    r1_passed = data.creditScore >= 650
    r1_outcome = RuleOutcome(
        ruleId="RULE_CREDIT_SCORE",
        name="Minimum Credit Requirement",
        description="FICO credit score must be 650 or higher.",
        passed=r1_passed,
        details=f"Required >= 650, actual: {data.creditScore}"
    )
    matched_rules.append(r1_outcome)
    if r1_passed:
        reasoning.append("Credit score satisfies the baseline reliability threshold (650).")
    else:
        reasoning.append("Credit score is below the minimum threshold (650). Policy requires direct decline.")

    # Rule 2: Active Employment Check
    valid_employment = ["Employed", "Self-Employed"]
    r2_passed = data.employment in valid_employment
    r2_outcome = RuleOutcome(
        ruleId="RULE_EMPLOYMENT_CHECK",
        name="Stable Source of Income Check",
        description="Applicant must be Employed or Self-Employed.",
        passed=r2_passed,
        details=f"Required one of {valid_employment}, actual: {data.employment}"
    )
    matched_rules.append(r2_outcome)
    if r2_passed:
        reasoning.append(f"Employment status ({data.employment}) verified as active.")
    else:
        reasoning.append(f"Employment status is '{data.employment}'. Unemployed cases are rejected by policy.")

    # Rule 3: Loan Value vs Income Capacity
    # If loan amount is more than 4x income -> escalated
    # If loan amount is more than 2.5x income but credit score is < 700 -> escalated
    ratio = evidence["debt_to_income_ratio"]
    r3_passed = True
    r3_msg = "Loan to income ratio is within standard underwriting limits."
    
    if ratio > 4.0:
      r3_passed = False
      r3_msg = f"Loan amount exceeds 400% of annual income (ratio: {ratio}). Red flag for debt capacity."
    elif ratio > 2.5 and data.creditScore < 700:
      r3_passed = False
      r3_msg = f"Loan amount exceeds 250% of annual income (ratio: {ratio}) and FICO score is {data.creditScore} (< 700)."

    r3_outcome = RuleOutcome(
        ruleId="RULE_CAPACITY_LIMIT",
        name="Income Exposure Multiplier",
        description="Verifies loan exposure relative to annual income. Maximum 4x income, or 2.5x if Credit < 700.",
        passed=r3_passed,
        details=f"Ratio: {ratio}x. Credit score: {data.creditScore}."
    )
    matched_rules.append(r3_outcome)
    reasoning.append(r3_msg)

    # Rule 4: Absolute High Ticket Escalation Cap
    # Any loan above 1,000,000 escalates to CRO manually sign-off
    r4_passed = data.loanAmount <= 1000000.0
    r4_outcome = RuleOutcome(
        ruleId="RULE_HIGH_TICKET_CAP",
        name="Large Exposure Flag",
        description="Any single transaction exceeding $1M triggers manual executive sign-off.",
        passed=r4_passed,
        details=f"Cap: $1,000,000, actual: ${data.loanAmount:,.2f}"
    )
    matched_rules.append(r4_outcome)
    if r4_passed:
        reasoning.append("Requested loan amount is within automated routing thresholds.")
    else:
        reasoning.append("Requested loan exceeds $1M automated approval cap. Manual validation required.")

    # Final Decision Resolution Tree
    # 1. Any direct fail on core factors (credit or employment check) -> Declined
    # 2. Passed core factors, but fail on capacity limit or big ticket cap -> Escalated (Human Review)
    # 3. Passed all rules -> Approved
    if not r1_passed or not r2_passed:
        decision = "Declined"
        reasoning.append("Application rejected due to core eligibility failure.")
    elif not r3_passed or not r4_passed:
        decision = "Escalated for Human Review"
        reasoning.append("Core criteria met, but loan structure triggers policy risk escalation. Routing to risk desk.")
    else:
        decision = "Approved"
        reasoning.append("Application approved. All automated policy assertions passed.")

    end_time = time.perf_counter()
    processing_time_ms = round((end_time - start_time) * 1000.0, 3)
    if processing_time_ms == 0:
        processing_time_ms = 0.051  # prevent absolute 0.0

    return EngineOutput(
        decision=decision,
        matchedRules=matched_rules,
        evidenceUsed=evidence,
        reasoning=reasoning,
        auditTrail=f"GS-{uuid.uuid4().hex[:8].upper()}-{uuid.uuid4().hex[:4].upper()}",
        processingTimeMs=processing_time_ms
    )
