from agents.reader_agent     import run_reader_agent
from agents.taxonomist_agent import run_taxonomist_agent
from agents.question_writer  import run_question_writer
from agents.calibrator_agent import run_calibrator_agent
from agents.answer_key_agent import run_answer_key_agent

def run_examforge_pipeline(chapter_text: str, settings: dict) -> dict:
    """
    Runs all 5 agents in sequence.
    Each agent's output feeds into the next.
    Returns the complete exam object.
    """
    print("\n=== ExamForge Pipeline Starting ===")

    # Agent 1 — Extract concepts
    print("\n[Step 1/5] Reader Agent")
    reader_output = run_reader_agent(chapter_text, settings)

    # Agent 2 — Classify by Bloom's
    print("\n[Step 2/5] Taxonomist Agent")
    taxonomy_output = run_taxonomist_agent(reader_output, settings)

    # Agent 3 — Write questions
    print("\n[Step 3/5] Question Writer Agent")
    raw_questions = run_question_writer(reader_output, taxonomy_output, settings)

    # Agent 4 — Quality check
    print("\n[Step 4/5] Calibrator Agent")
    calibrated = run_calibrator_agent(raw_questions)
    clean_questions = calibrated["questions"]

    # Agent 5 — Answer key
    print("\n[Step 5/5] Answer Key Agent")
    answer_key = run_answer_key_agent(clean_questions)

    # Merge questions with answers
    answer_map = {a["question_id"]: a for a in answer_key}
    for q in clean_questions:
        qid = q["id"]
        if qid in answer_map:
            q["model_answer"]     = answer_map[qid]["model_answer"]
            q["key_points"]       = answer_map[qid]["key_points"]
            q["common_mistakes"]  = answer_map[qid]["common_mistakes"]
            q["marks_breakdown"]  = answer_map[qid]["marks_breakdown"]

    total_marks = sum(q.get("marks", 1) for q in clean_questions)

    print("\n=== Pipeline Complete ===")
    return {
        "chapter_title":   reader_output["chapter_title"],
        "chapter_summary": reader_output["summary"],
        "total_questions": len(clean_questions),
        "total_marks":     total_marks,
        "quality_score":   calibrated["quality_score"],
        "questions":       clean_questions,
        "metadata": {
            "concepts_found":    reader_output["total_concepts"],
            "questions_removed": calibrated["removed_count"],
            "questions_fixed":   calibrated["fixed_count"],
            "warnings":          calibrated.get("warnings", [])
        }
    }
