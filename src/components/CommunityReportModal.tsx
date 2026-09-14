import { useState } from 'react';
import { ShieldAlert, X, Camera } from 'lucide-react';
import { cn } from '../utils/cn';

export function CommunityReportModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [condition, setCondition] = useState('');
  const [intensity, setIntensity] = useState('');
  
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate POST /api/community/report
    setTimeout(() => {
      onClose();
      // Show success toast here in real app
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="glass-panel text-white w-full max-w-md shadow-2xl rounded-3xl border border-white/20 animate-in fade-in zoom-in-95 overflow-hidden">
        <div className="flex flex-row items-center justify-between p-5 border-b border-white/10">
          <div className="text-base sm:text-lg font-extrabold flex items-center gap-2 text-white">
            <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <span>Report Local Weather</span>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/10 text-white/70 hover:text-white rounded-full transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/80 mb-2">Weather Condition</label>
              <div className="grid grid-cols-2 gap-2">
                {['Heavy Rain', 'Light Rain', 'Sunny', 'Flooding', 'Thunderstorm', 'High Wind'].map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCondition(c)}
                    className={cn(
                      "px-3 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all border",
                      condition === c 
                        ? "bg-white text-[#1D4ED8] border-white shadow-md scale-[1.02]" 
                        : "glass-pill text-white/90 hover:bg-white/15"
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/80 mb-2">Intensity</label>
              <div className="flex gap-2">
                {['Low', 'Moderate', 'High'].map(i => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIntensity(i)}
                    className={cn(
                      "flex-1 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all border",
                      intensity === i 
                        ? i === 'High' 
                          ? 'bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-500/30 scale-[1.02]' 
                          : 'bg-white text-[#1D4ED8] border-white shadow-md scale-[1.02]'
                        : "glass-pill text-white/90 hover:bg-white/15"
                    )}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>

            <div className="border border-dashed border-white/25 rounded-2xl p-4 text-center hover:bg-white/10 hover:border-white/40 transition-all cursor-pointer group">
              <Camera className="w-6 h-6 mx-auto mb-1.5 text-white/60 group-hover:text-white transition-colors" />
              <span className="text-xs text-white/70 font-semibold group-hover:text-white transition-colors">Upload Photo (Optional)</span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/80 mb-2">Ground Observation Notes</label>
              <textarea 
                className="w-full glass-input rounded-2xl p-3.5 text-xs sm:text-sm min-h-[85px] text-white placeholder-white/40"
                placeholder="Describe road conditions, waterlogging, or visibility in your sector..."
              />
            </div>

            <button 
              type="submit" 
              disabled={!condition || !intensity}
              className="w-full py-3.5 px-4 rounded-xl font-extrabold text-xs sm:text-sm bg-white text-[#1D4ED8] hover:bg-white/95 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg cursor-pointer"
            >
              Submit Report to Live Feed
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
