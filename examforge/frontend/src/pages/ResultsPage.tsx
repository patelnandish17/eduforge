import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { ExamResult, Question } from "../api";

const BLOOM_COLOR: Record<string, string> = {
  L1: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  L2: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  L3: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  L4: "bg-red-500/20 text-red-300 border-red-500/30",
};

function QuestionCard({ q, index, showAnswers }: { q: Question; index: number; showAnswers: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white/5 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-lg border border-white/10 mb-6 transition-all hover:bg-white/10 hover:border-white/20 group">
      <div className="flex flex-wrap justify-between items-start mb-5 gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-extrabold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            Q{index + 1}
          </span>
          <span className="px-3 py-1 bg-white/10 border border-white/10 text-gray-300 text-xs rounded-full font-bold uppercase tracking-wider">
            {q.type}
          </span>
          <span className={`px-3 py-1 text-xs rounded-full font-bold border uppercase tracking-wider ${BLOOM_COLOR[q.blooms_level] || "bg-gray-800 text-gray-300 border-gray-600"}`}>
            {q.blooms_level}
          </span>
          <span className="px-3 py-1 bg-pink-500/10 border border-pink-500/20 text-pink-300 text-xs rounded-full font-bold uppercase tracking-wider">
            {q.marks} mark{q.marks > 1 ? "s" : ""}
          </span>
          {q.unit_id && (
            <span className="px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs rounded-full font-bold uppercase tracking-wider">
              {q.unit_id}
            </span>
          )}
        </div>
        <div className="flex gap-1" title={`Difficulty: ${q.difficulty}/5`}>
          {[...Array(5)].map((_, i) => (
            <svg key={i} className={`w-5 h-5 ${i < q.difficulty ? "text-yellow-400" : "text-gray-600"}`} fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
      </div>
      
      <p className="text-gray-100 mb-6 font-medium text-lg leading-relaxed">{q.question}</p>
      
      {q.type === "MCQ" && q.options && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {Object.entries(q.options).map(([k, v]) => (
            <div key={k} className="p-4 bg-black/30 rounded-xl border border-white/5 flex items-start gap-3 transition-colors group-hover:border-white/10">
              <span className="font-bold text-pink-400 bg-pink-400/10 px-2 py-0.5 rounded text-sm">{k}</span>
              <span className="text-gray-300">{v}</span>
            </div>
          ))}
        </div>
      )}
      
      {showAnswers && (
        <button 
          onClick={() => setOpen(!open)} 
          className="flex items-center gap-2 text-sm text-green-400 font-bold hover:text-green-300 transition-colors bg-green-400/10 px-4 py-2 rounded-lg"
        >
          {open ? (
            <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Hide Answer Key</>
          ) : (
            <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Reveal Answer Key</>
          )}
        </button>
      )}
      
      {open && showAnswers && (
        <div className="mt-5 p-5 bg-gradient-to-br from-green-900/40 to-emerald-900/40 border border-green-500/30 rounded-2xl">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p className="font-bold text-green-400 uppercase tracking-wider text-sm">Model Answer</p>
          </div>
          <p className="text-gray-200 mb-4 leading-relaxed">{q.model_answer}</p>
          
          {q.key_points && q.key_points.length > 0 && (
            <div className="bg-black/30 p-4 rounded-xl">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Key Evaluation Points</p>
              <ul className="space-y-2">
                {q.key_points.map((pt, i) => (
                  <li key={i} className="text-gray-300 flex items-start gap-3 text-sm">
                    <span className="text-green-400 mt-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    </span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ResultsPage() {
  const navigate = useNavigate();
  const [showAns, setShowAns] = useState(false);
  const [filter, setFilter] = useState("All");

  const raw = sessionStorage.getItem("examResult");
  const result: ExamResult | null = raw ? JSON.parse(raw) : null;

  const groupedQuestions = useMemo(() => {
    if (!result) return {};
    const filtered = filter === "All" ? result.questions : result.questions.filter(q => q.type === filter);
    
    // Group by unit_id if it exists
    const groups: Record<string, Question[]> = {};
    filtered.forEach(q => {
      const unit = (q as any).unit_id || "General";
      if (!groups[unit]) groups[unit] = [];
      groups[unit].push(q);
    });
    return groups;
  }, [result, filter]);

  if (!result) return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-xl border border-white/20 p-10 rounded-3xl shadow-2xl text-center">
        <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <h2 className="text-2xl font-bold mb-6 text-white">No active session found.</h2>
        <button onClick={() => navigate("/")} className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-pink-500/30 transition-all">
          Initialize New Pipeline
        </button>
      </div>
    </div>
  );

  const types = ["All", "MCQ", "Short Answer", "Long Answer"];

  const handleExport = () => {
    const lines = result.questions.map((q, i) =>
      `Q${i+1} [${q.type}] (${q.marks}m) [Unit: ${(q as any).unit_id || 'N/A'}]\n${q.question}\n${
        q.type === "MCQ" && q.options
          ? Object.entries(q.options).map(([k,v]) => `  ${k}. ${v}`).join("\n")
          : ""
      }\nAnswer: ${q.model_answer}\n`
    );
    const blob = new Blob(
      [`EXAMFORGE ASSESSMENT ARTIFACT\nChapter: ${result.chapter_title}\nTotal: ${result.total_marks} marks\n\n`, ...lines.join("\n\n")],
      { type: "text/plain" }
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `examforge-${result.chapter_title.replace(/\s+/g, '-').slice(0,20)}.txt`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white py-10 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate("/")} className="text-sm text-purple-300 mb-8 hover:text-pink-300 flex items-center gap-2 font-bold uppercase tracking-wider group transition-colors">
          <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Configure New Pipeline
        </button>
        
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl mb-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/20 rounded-full blur-[80px] -z-10"></div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
            {result.chapter_title}
          </h1>
          <p className="text-gray-300 text-lg leading-relaxed max-w-3xl">{result.chapter_summary}</p>
        </div>

        {/* Intelligence Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-10">
          {[
            { label: "Questions Generated", val: result.total_questions, icon: "M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
            { label: "Total Points", val: result.total_marks, icon: "M13 10V3L4 14h7v7l9-11h-7z" },
            { label: "AI Quality Score", val: `${result.quality_score}/10`, icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" },
            { label: "Concepts Mapped", val: result.metadata.concepts_found, icon: "M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" },
          ].map(s => (
            <div key={s.label} className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 flex flex-col items-center text-center shadow-lg hover:bg-white/10 transition-colors">
              <svg className="w-8 h-8 text-purple-400 mb-3 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={s.icon} />
              </svg>
              <span className="text-4xl font-extrabold text-white mb-2">{s.val}</span>
              <span className="text-xs text-purple-300 font-bold uppercase tracking-wider">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Command Center */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-black/40 p-6 rounded-2xl border border-white/10 mb-10 sticky top-4 z-20 backdrop-blur-xl shadow-2xl">
          <div className="flex flex-wrap gap-3">
            {types.map(t => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`text-sm px-5 py-2.5 rounded-full font-bold transition-all ${
                  filter === t 
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-pink-500/25" 
                    : "bg-white/5 text-gray-300 hover:bg-white/10 border border-white/5 hover:border-white/20"
                }`}>
                {t}
              </button>
            ))}
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
            <button
              onClick={() => setShowAns(!showAns)}
              className="flex-1 md:flex-none flex justify-center items-center gap-2 text-sm px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-full transition-all border border-white/10 hover:border-white/30">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showAns ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.293M3 3l18 18" : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} />
              </svg>
              {showAns ? "Hide All Keys" : "Reveal Keys"}
            </button>
            <button
              onClick={handleExport}
              className="flex-1 md:flex-none flex justify-center items-center gap-2 text-sm px-6 py-2.5 bg-white text-black hover:bg-gray-200 font-extrabold rounded-full transition-all shadow-lg hover:shadow-white/25">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export TXT
            </button>
          </div>
        </div>

        {/* Assessment Items */}
        <div className="space-y-12">
          {Object.keys(groupedQuestions).length === 0 && (
            <div className="text-center bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-12">
              <p className="text-xl text-gray-400">No assessment items match the current filter.</p>
            </div>
          )}
          
          {Object.entries(groupedQuestions).map(([unit, questions]) => (
            <div key={unit} className="relative">
              {unit !== "General" && (
                <h3 className="text-2xl font-extrabold mb-6 flex items-center gap-3">
                  <span className="w-8 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></span>
                  {unit}
                </h3>
              )}
              <div className="space-y-2">
                {questions.map((q, idx) => (
                  <QuestionCard key={q.id || idx} q={q} index={result.questions.indexOf(q)} showAnswers={showAns} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
