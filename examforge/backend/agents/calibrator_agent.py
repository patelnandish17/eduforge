import json
from llm import call_llm

CALIBRATOR_SYSTEM = """You are an exam quality control specialist.
Review a list of exam questions and return a cleaned, improved version.

Check for and fix:
1. Duplicate or very similar questions — remove duplicates, keep better one
2. Unclear or ambiguous question wording — rewrite for clarity
3. MCQ options that are obviously wrong or give away the answer — improve distractors
4. Difficulty imbalance — flag if too many easy or hard questions
5. Grammar and formatting issues

Return a JSON object:
{
  "questions": [ ...cleaned question array same format as input... ],
  "removed_count": number,
  "fixed_count": number,
  "quality_score": 1-10,
  "warnings": ["warning1", "warning2"]
}
Return only valid JSON."""

def run_calibrator_agent(questions: list) -> dict:
    """Agent 4: QA pass — remove duplicates, fix clarity, balance difficulty."""
    print(f"  [Calibrator] Reviewing {len(questions)} questions for quality...")

    result = call_llm(
        CALIBRATOR_SYSTEM,
        f"Review and calibrate these exam questions:\n\n{json.dumps(questions, indent=2)}",
        temperature=0.2,
        response_format={"type": "json_object"}
    )
    
    print(f"  [Calibrator] Quality score: {result.get('quality_score')}/10. "
          f"Removed: {result.get('removed_count')}. Fixed: {result.get('fixed_count')}.")
    return result
