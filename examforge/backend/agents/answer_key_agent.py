import json
from llm import call_llm

ANSWER_KEY_SYSTEM = """You are an expert educator writing a detailed answer key.
For each question provided, write a complete model answer.

Return a JSON array:
[
  {
    "question_id": "Q001",
    "model_answer": "Complete model answer text here",
    "key_points": ["point1", "point2", "point3"],
    "common_mistakes": "What students typically get wrong",
    "marks_breakdown": "How to award partial marks if applicable",
    "difficulty": 1-5
  }
]
For MCQ: model_answer is just the correct option letter + one sentence explanation.
For Short/Long: write full paragraph model answers.
Return only valid JSON array."""

def run_answer_key_agent(questions: list) -> list:
    """Agent 5: Write complete answer key with model answers."""
    print(f"  [Answer Key Agent] Writing answers for {len(questions)} questions...")

    answers = call_llm(
        ANSWER_KEY_SYSTEM,
        f"Write complete model answers for:\n\n{json.dumps(questions, indent=2)}",
        temperature=0.3
    )
    
    print(f"  [Answer Key Agent] Done. {len(answers)} answers written.")
    return answers
