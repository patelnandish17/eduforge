import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { startGeneration, ExamSettings } from "../api";

const DEFAULT_SETTINGS: ExamSettings = {
  total_questions: 30,
  mcq_percent: 60,
  short_percent: 25,
  long_percent: 15,
  syllabus: "",
  question_structure: "Standard mix of difficulty levels.",
  blooms_levels: "L1: 20%, L2: 30%, L3: 30%, L4: 20%",
  unit_wise: false,
  mcq_marks: 1,
  short_marks: 2,
  long_marks: 5,
};

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [settings, setSettings] = useState<ExamSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const navigate = useNavigate();

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === "application/pdf") setFile(dropped);
  }, []);

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const jobId = await startGeneration(file, settings);
      navigate(`/processing/${jobId}`);
    } catch (err: any) {
      alert("Error: " + err.message);
      setLoading(false);
    }
  };

  const setSetting = (key: keyof ExamSettings, val: any) =>
    setSettings(prev => ({ ...prev, [key]: val }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white py-10 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-white/10 backdrop-blur-xl border border-white/20 p-8 sm:p-12 rounded-3xl shadow-[0_0_40px_rgba(139,92,246,0.3)]">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-extrabold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 drop-shadow-sm">
            ExamForge
          </h1>
          <p className="text-gray-300 text-lg">AI-Powered Enterprise Assessment Generation Pipeline</p>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => document.getElementById("file-input")?.click()}
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 mb-8 flex flex-col items-center justify-center min-h-[200px]
            ${dragOver ? "border-pink-500 bg-pink-500/10 scale-105" : "border-white/30 hover:border-purple-400 hover:bg-white/5"}`}
        >
          <input
            id="file-input"
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          {file ? (
            <div className="animate-pulse">
              <svg className="w-16 h-16 mx-auto mb-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <p className="font-semibold text-2xl text-white">{file.name}</p>
              <p className="text-md text-gray-300 mt-2">{(file.size / 1024).toFixed(0)} KB loaded</p>
            </div>
          ) : (
            <div>
              <svg className="w-16 h-16 mx-auto mb-4 text-purple-400 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
              <p className="font-semibold text-xl text-white">Drop your textbook or notes PDF here</p>
              <p className="text-md text-gray-400 mt-2">or click to browse local files</p>
            </div>
          )}
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-6 bg-black/20 p-6 rounded-2xl border border-white/10">
            <h3 className="text-xl font-bold text-purple-300 border-b border-white/10 pb-2">Basic Blueprint</h3>
            
            <div>
              <div className="flex justify-between">
                <label className="block text-sm font-medium mb-1 text-gray-200">Total Questions</label>
                <span className="text-pink-400 font-bold">{settings.total_questions}</span>
              </div>
              <input
                type="range" min="5" max="100"
                value={settings.total_questions}
                onChange={(e) => setSetting("total_questions", +e.target.value)}
                className="w-full mt-2 accent-pink-500" />
            </div>

            {[
              { key: "mcq_percent", label: "MCQ Ratio" },
              { key: "short_percent", label: "Short Answer Ratio" },
              { key: "long_percent", label: "Long Answer Ratio" },
            ].map(({ key, label }) => (
              <div key={key}>
                <div className="flex justify-between">
                  <label className="block text-sm font-medium mb-1 text-gray-200">{label}</label>
                  <span className="text-purple-400 font-bold">{settings[key as keyof ExamSettings]}%</span>
                </div>
                <input
                  type="range" min="0" max="100"
                  value={settings[key as keyof ExamSettings] as number}
                  onChange={(e) => setSetting(key as keyof ExamSettings, +e.target.value)}
                  className="w-full mt-2 accent-purple-500" />
              </div>
            ))}
            
            <div className="flex items-center space-x-3 pt-4 border-t border-white/10">
              <input 
                type="checkbox" 
                id="unit_wise"
                checked={settings.unit_wise}
                onChange={(e) => setSetting("unit_wise", e.target.checked)}
                className="w-5 h-5 rounded accent-pink-500"
              />
              <label htmlFor="unit_wise" className="text-md font-medium text-gray-200 cursor-pointer">
                Organize Output Unit-Wise
              </label>
            </div>
          </div>

          <div className="space-y-6 bg-black/20 p-6 rounded-2xl border border-white/10 flex flex-col">
            <h3 className="text-xl font-bold text-pink-300 border-b border-white/10 pb-2">Marks Distribution</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">MCQ (Marks)</label>
                <input type="number" min="1" value={settings.mcq_marks} onChange={(e) => setSetting("mcq_marks", +e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-lg p-2 text-white focus:outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Short (Marks)</label>
                <input type="number" min="1" value={settings.short_marks} onChange={(e) => setSetting("short_marks", +e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-lg p-2 text-white focus:outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Long (Marks)</label>
                <input type="number" min="1" value={settings.long_marks} onChange={(e) => setSetting("long_marks", +e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-lg p-2 text-white focus:outline-none focus:border-purple-500" />
              </div>
            </div>

            <h3 className="text-xl font-bold text-blue-300 border-b border-white/10 pb-2 mt-4">Bloom's Taxonomy</h3>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Target Distribution (e.g. L1: 20%, etc.)</label>
              <textarea 
                rows={2}
                value={settings.blooms_levels}
                onChange={(e) => setSetting("blooms_levels", e.target.value)}
                className="w-full bg-white/5 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 resize-none" 
              />
            </div>
          </div>
        </div>

        <div className="mb-8">
          <button 
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center text-purple-300 hover:text-pink-400 transition-colors font-medium text-sm"
          >
            {showAdvanced ? "Hide Context Configuration" : "Show Context Configuration (Syllabus & Structure)"}
            <svg className={`w-4 h-4 ml-1 transform transition-transform ${showAdvanced ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          
          {showAdvanced && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-200">Syllabus / Notes Reference</label>
                <textarea 
                  rows={4}
                  placeholder="Paste syllabus text or specific focus areas here..."
                  value={settings.syllabus}
                  onChange={(e) => setSetting("syllabus", e.target.value)}
                  className="w-full bg-black/30 border border-white/20 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none placeholder-gray-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-200">Custom Question Structure</label>
                <textarea 
                  rows={4}
                  placeholder="Describe specific rules for questions (e.g. Include real-world scenarios, code snippets...)"
                  value={settings.question_structure}
                  onChange={(e) => setSetting("question_structure", e.target.value)}
                  className="w-full bg-black/30 border border-white/20 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none placeholder-gray-500" 
                />
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!file || loading}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-xl transition-all shadow-[0_0_20px_rgba(219,39,119,0.5)] hover:shadow-[0_0_30px_rgba(219,39,119,0.8)] transform hover:-translate-y-1"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Engaging AI Agents...
            </span>
          ) : "Initialize Exam Pipeline →"}
        </button>
      </div>
      
      {/* Custom styles for animations */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
