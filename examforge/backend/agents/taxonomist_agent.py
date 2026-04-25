import json
from llm import call_llm

TAXONOMIST_SYSTEM = """You are a Bloom's Taxonomy expert for educational assessment.
Given a list of concepts from a chapter, classify each concept
by its Bloom's Taxonomy level and assign a difficulty score.

Bloom's levels:
- L1: Remember  (recall facts, definitions)
- L2: Understand (explain, describe, summarize)
- L3: Apply     (use in new situation, solve problems)
- L4: Analyze   (break down, compare, differentiate)

Return a JSON array matching the input concept IDs:
[
  {
    "id": "C001",
    "blooms_level": "L1|L2|L3|L4",
    "blooms_label": "Remember|Understand|Apply|Analyze",
    "difficulty": 1-5,
    "question_types_suitable": ["MCQ", "Short Answer", "Long Answer"],
    "testable": true|false
  }
]
Return only valid JSON array."""

def run_taxonomist_agent(reader_output: dict, settings: dict = None) -> list:
    """Agent 2: Classify concepts by Bloom's Taxonomy level."""
    if settings is None: settings = {}
    print("  [Taxonomist] Classifying concepts by Bloom's level...")

    concepts_summary = json.dumps(reader_output.get("concepts", []), indent=2)

    result = call_llm(
        TAXONOMIST_SYSTEM,
        f"Classify these concepts by Bloom's Taxonomy:\n\n{concepts_summary}",
    )

    testable = [c for c in result if c.get("testable")]
    print(f"  [Taxonomist] {len(testable)}/{len(result)} concepts are testable.")
    return result
