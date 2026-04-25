from flask import Flask, request, jsonify
from flask_cors import CORS
import os, threading, uuid
from dotenv import load_dotenv
from pdf_parser import extract_text_from_bytes
from orchestrator import run_examforge_pipeline

load_dotenv()
app = Flask(__name__)
CORS(app)

# In-memory job store (use Redis for production)
jobs = {}

def run_job(job_id: str, chapter_text: str, settings: dict):
    """Background thread that runs the full pipeline."""
    try:
        jobs[job_id]["status"] = "running"
        jobs[job_id]["step"]   = 1

        # We update step as each agent completes
        # In production, use SSE or websockets for real-time updates
        result = run_examforge_pipeline(chapter_text, settings)

        jobs[job_id]["status"] = "done"
        jobs[job_id]["result"] = result
        jobs[job_id]["step"]   = 5
    except Exception as e:
        jobs[job_id]["status"] = "error"
        jobs[job_id]["error"]  = str(e)

@app.route("/api/generate", methods=["POST"])
def generate_exam():
    """
    Accepts: multipart/form-data with:
      - file: PDF file
      - total_questions: int (default 30)
      - mcq_percent: int (default 60)
      - short_percent: int (default 25)
      - long_percent: int (default 15)
    Returns: { job_id: "uuid" }
    """
    if "file" not in request.files:
        return jsonify({"error": "No PDF file uploaded"}), 400

    pdf_file  = request.files["file"]
    pdf_bytes = pdf_file.read()

    settings = {
        "total_questions": int(request.form.get("total_questions", 30)),
        "mcq_percent":     int(request.form.get("mcq_percent", 60)),
        "short_percent":   int(request.form.get("short_percent", 25)),
        "long_percent":    int(request.form.get("long_percent", 15)),
        "syllabus":        request.form.get("syllabus", ""),
        "question_structure": request.form.get("question_structure", ""),
        "blooms_levels":   request.form.get("blooms_levels", ""),
        "unit_wise":       request.form.get("unit_wise", "false").lower() == "true",
        "mcq_marks":       int(request.form.get("mcq_marks", 1)),
        "short_marks":     int(request.form.get("short_marks", 2)),
        "long_marks":      int(request.form.get("long_marks", 5)),
    }

    chapter_text = extract_text_from_bytes(pdf_bytes)
    if not chapter_text.strip():
        return jsonify({"error": "Could not extract text from PDF"}), 400

    job_id = str(uuid.uuid4())
    jobs[job_id] = {"status": "queued", "step": 0, "result": None}

    # If running on Vercel, run synchronously because threads aren't reliable
    if os.environ.get("VERCEL"):
        try:
            result = run_examforge_pipeline(chapter_text, settings)
            jobs[job_id]["status"] = "done"
            jobs[job_id]["result"] = result
            jobs[job_id]["step"]   = 5
            return jsonify({"job_id": job_id, "status": "done", "result": result})
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    thread = threading.Thread(
        target=run_job,
        args=(job_id, chapter_text, settings),
        daemon=True
    )
    thread.start()

    return jsonify({"job_id": job_id})

@app.route("/api/status/<job_id>")
def job_status(job_id: str):
    """Poll this endpoint every 2s to track agent progress."""
    if job_id not in jobs:
        return jsonify({"error": "Job not found"}), 404
    job = jobs[job_id]
    return jsonify({
        "status": job["status"],
        "step":   job["step"],
        "result": job.get("result"),
        "error":  job.get("error")
    })

@app.route("/api/health")
def health():
    return jsonify({"status": "ok", "agents": 5})

if __name__ == "__main__":
    app.run(debug=True, port=5000)
