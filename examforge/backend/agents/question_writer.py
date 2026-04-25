import json
from llm import call_llm

QUESTION_WRITER_SYSTEM = """You are an expert exam question writer.
Given concepts with their Bloom's level, generate exam questions based strictly on the user's constraints.

For MCQ questions include exactly 4 options (A-D) with one correct answer.
For Short Answer: expect 2-4 sentence answers.
For Long Answer: expect paragraph-level responses.

Return a JSON array of questions:
[
  {
    "id": "Q001",
    "concept_id": "C001",
    "unit_id": "Unit X",
    "type": "MCQ|Short Answer|Long Answer",
    "blooms_level": "L1|L2|L3|L4",
    "difficulty": 1-5,
    "marks": 1,
    "question": "The question text here?",
    "options": {
      "A": "option text",
      "B": "option text",
      "C": "option text",
      "D": "option text"
    },
    "correct_option": "A|B|C|D",
    "answer_hint": "brief hint for evaluator"
  }
]
For non-MCQ, set options to null and correct_option to null.
Return only valid JSON array."""

def run_question_writer(
    reader_output: dict,
    taxonomy_output: list,
    settings: dict
) -> list:
    """Agent 3: Generate questions at specified constraints."""
    print("  [Question Writer] Generating questions...")

    n_total    = settings.get("total_questions", 30)
    mcq_pct    = settings.get("mcq_percent",    60)
    short_pct  = settings.get("short_percent",  25)
    long_pct   = settings.get("long_percent",   15)

    n_mcq   = round(n_total * mcq_pct   / 100)
    n_short = round(n_total * short_pct / 100)
    n_long  = n_total - n_mcq - n_short

    mcq_marks = settings.get("mcq_marks", 1)
    short_marks = settings.get("short_marks", 2)
    long_marks = settings.get("long_marks", 5)
    
    question_structure = settings.get("question_structure", "Standard mix of difficulty levels.")
    blooms_levels = settings.get("blooms_levels", "Mix of all levels.")

    # Merge concept text with taxonomy data
    tax_map = {t["id"]: t for t in taxonomy_output}
    enriched = []
    for concept in reader_output.get("concepts", []):
        cid = concept.get("id")
        if cid in tax_map and tax_map[cid].get("testable"):
            copy_dict = concept.copy()
            copy_dict.update(tax_map[cid])
            enriched.append(copy_dict)

    prompt = f"""Generate exactly {n_total} exam questions from these concepts. Include the concept's 'unit_id' in your output if available:
- {n_mcq} MCQ questions ({mcq_marks} marks each)
- {n_short} Short Answer questions ({short_marks} marks each)
- {n_long} Long Answer questions ({long_marks} marks each)

Target Bloom's Distribution:
{blooms_levels}

Question Structure / Custom Instructions:
{question_structure}

Subject: {reader_output.get('chapter_title', 'General')}

Concepts to use:
{json.dumps(enriched[:40], indent=2)}"""

    questions = call_llm(
        QUESTION_WRITER_SYSTEM,
        prompt,
        temperature=0.7
    )
    
    print(f"  [Question Writer] Generated {len(questions)} questions.")
    return questions
