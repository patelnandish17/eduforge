import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { pollJobStatus } from "../api";

const AGENTS = [
  { label: "Reader Agent",        desc: "Extracting concepts from chapter..." },
  { label: "Taxonomist",          desc: "Classifying by Bloom's Taxonomy..."  },
  { label: "Question Writer",     desc: "Generating exam questions..."         },
  { label: "Calibrator",          desc: "Quality checking & removing dupes..." },
  { label: "Answer Key Agent",    desc: "Writing model answers..."             },
];

export default function ProcessingPage() {
  const { jobId }    = useParams<{ jobId: string }>();
  const navigate     = useNavigate();
  const [step, setStep]   = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!jobId) return;
    const interval = setInterval(async () => {
      try {
        const data = await pollJobStatus(jobId);
        setStep(data.step);
        if (data.status === "done" && data.result) {
          clearInterval(interval);
          sessionStorage.setItem("examResult", JSON.stringify(data.result));
          navigate("/results");
        }
        if (data.status === "error") {
          clearInterval(interval);
          setError(data.error || "Something went wrong");
        }
      } catch (err: any) {
        clearInterval(interval);
        setError(err.message || "Failed to poll job status.");
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [jobId, navigate]);

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-xl bg-red-900/30 backdrop-blur-xl border border-red-500/50 p-10 rounded-3xl shadow-[0_0_40px_rgba(239,68,68,0.3)] text-center animate-pulse">
        <svg className="w-16 h-16 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <h2 className="text-red-400 text-3xl font-extrabold mb-4 drop-shadow-md">Generation Interrupted</h2>
        <p className="text-red-200 mb-8 text-lg">{error}</p>
        <button onClick={() => navigate("/")} className="px-6 py-3 bg-red-600/20 border border-red-500/50 text-red-300 rounded-full font-bold hover:bg-red-600/40 transition-colors">
          Return to Initialization
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white flex flex-col items-center py-16 px-4">
      <div className="w-full max-w-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-10 rounded-3xl shadow-[0_0_50px_rgba(139,92,246,0.2)]">
        <div className="text-center mb-10 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-pink-500/30 rounded-full blur-[40px] -z-10"></div>
          <h1 className="text-4xl font-extrabold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
            Agents Actively Working
          </h1>
          <p className="text-gray-300 text-lg">
            Constructing your enterprise-grade assessment artifact...
          </p>
        </div>

        <div className="space-y-5">
          {AGENTS.map((agent, i) => {
            const done    = i + 1 <  step;
            const active  = i + 1 === step;
            return (
              <div key={i} className={`p-5 rounded-2xl border transition-all duration-500 flex items-center gap-5 relative overflow-hidden
                ${active ? "border-pink-500 bg-pink-500/10 shadow-[0_0_20px_rgba(236,72,153,0.3)] scale-[1.02]" : done ? "border-green-400/50 bg-green-900/20" : "border-white/10 bg-white/5 opacity-60"}
              `}>
                
                {active && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>}
                
                <div className={`w-12 h-12 flex items-center justify-center rounded-full font-bold text-lg flex-shrink-0 shadow-lg z-10 transition-colors duration-500
                  ${done ? "bg-gradient-to-br from-green-400 to-emerald-600 text-white shadow-green-500/50" : active ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-pink-500/50 animate-pulse" : "bg-white/10 text-gray-500"}`}>
                  {done ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  ) : i + 1}
                </div>
                
                <div className="z-10">
                  <h3 className={`text-xl font-bold ${active ? "text-pink-300 drop-shadow-sm" : done ? "text-green-300" : "text-gray-400"}`}>
                    {agent.label}
                  </h3>
                  <p className={`text-sm mt-1 ${active ? "text-purple-200" : done ? "text-green-200" : "text-gray-500"}`}>
                    {active ? (
                       <span className="flex items-center gap-2">
                         <span className="w-2 h-2 bg-pink-400 rounded-full animate-ping"></span>
                         {agent.desc}
                       </span>
                    ) : done ? "Execution Complete" : "Awaiting Pipeline Input..."}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
