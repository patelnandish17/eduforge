const BASE = window.location.origin.includes("localhost") 
  ? "http://localhost:5000/api" 
  : "/api";

export interface ExamSettings {
  total_questions: number;
  mcq_percent: number;
  short_percent: number;
  long_percent: number;
  syllabus: string;
  question_structure: string;
  blooms_levels: string;
  unit_wise: boolean;
  mcq_marks: number;
  short_marks: number;
  long_marks: number;
}

export interface Question {
  id: string;
  type: "MCQ" | "Short Answer" | "Long Answer";
  blooms_level: string;
  difficulty: number;
  marks: number;
  question: string;
  options?: { A: string; B: string; C: string; D: string };
  correct_option?: string;
  model_answer: string;
  key_points: string[];
  common_mistakes: string;
}

export interface ExamResult {
  chapter_title: string;
  chapter_summary: string;
  total_questions: number;
  total_marks: number;
  quality_score: number;
  questions: Question[];
  metadata: {
    concepts_found: number;
    questions_removed: number;
    questions_fixed: number;
    warnings: string[];
  };
}

// Step 1: Upload PDF and start job
export async function startGeneration(
  file: File,
  settings: ExamSettings
): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  Object.entries(settings).forEach(([k, v]) =>
    form.append(k, String(v))
  );
  const res = await fetch(`${BASE}/generate`, { method: "POST", body: form });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.job_id;
}

// Step 2: Poll for status every 2 seconds
export async function pollJobStatus(jobId: string): Promise<{
  status: string;
  step: number;
  result?: ExamResult;
  error?: string;
}> {
  const res = await fetch(`${BASE}/status/${jobId}`);
  return res.json();
}
