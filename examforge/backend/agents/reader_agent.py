import json
from llm import call_llm

READER_SYSTEM = """You are an expert educational content analyst.
Your job is to read a textbook chapter and extract every concept,
term, fact, formula, and key idea from it.

Return a JSON object with this exact structure:
{
  "chapter_title": "string",
  "total_concepts": number,
  "concepts": [
    {
      "id": "C001",
      "unit_id": "Unit X", 
      "text": "the concept or fact in one clear sentence",
      "type": "definition|fact|formula|process|example",
      "keywords": ["keyword1", "keyword2"],
      "importance": "high|medium|low"
    }
  ],
  "key_formulas": ["formula1", "formula2"],
  "summary": "2-3 sentence chapter summary"
}

Extract EVERYTHING. Do not skip minor facts. Return only valid JSON."""

def run_reader_agent(chapter_text: str, settings: dict = None) -> dict:
    """Agent 1: Extract all concepts from chapter text."""
    if settings is None: settings = {}
    print("  [Reader Agent] Extracting concepts...")
    
    syllabus = settings.get("syllabus", "")
    unit_wise = settings.get("unit_wise", False)

    prompt = f"Extract all concepts from this chapter:\n\n{chapter_text}"
    if syllabus:
        prompt += f"\n\nHere is the syllabus or focus area for context. Please prioritize concepts that align with this:\n{syllabus}"
    if unit_wise:
        prompt += "\n\nPlease organize concepts by unit. Assign a relevant 'unit_id' (e.g., 'Unit 1', 'Unit 2', or topic name) to each concept based on the text structure."
    else:
        prompt += "\n\nYou may use 'Unit 1' as the unit_id for all concepts if no units are specified."

    result = call_llm(
        READER_SYSTEM,
        prompt,
        response_format={"type": "json_object"}
    )
    
    print(f"  [Reader Agent] Found {result.get('total_concepts', 0)} concepts.")
    return result
