import React from 'react';
import { RefreshCw, Award, Percent, AlertCircle, Clock } from 'lucide-react';

interface StatsProps {
  stats: {
    wpm: number; rawWpm: number; accuracy: number;
    errors: number; time: number; correctChars: number; totalTyped: number;
  };
  isFinished: boolean;
  onRestart: () => void;
}

export const Stats: React.FC<StatsProps> = ({ stats, isFinished, onRestart }) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (isFinished) {
    return (
      <div className="glass rounded-2xl p-8 animate-fade-in" style={{ animation: 'pulseGlow 2s ease-in-out infinite, fadeIn 0.3s ease' }}>
        <h2 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-violet-500 to-indigo-400 bg-clip-text text-transparent">
          Kết quả Luyện tập 🏆
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { icon: <Award className="text-emerald-400" size={24} />, value: stats.wpm, label: 'Tốc độ (WPM)', color: 'text-emerald-400' },
            { icon: <Percent className="text-blue-400" size={24} />, value: `${stats.accuracy}%`, label: 'Độ chính xác', color: 'text-blue-400' },
            { icon: <AlertCircle className="text-red-400" size={24} />, value: stats.errors, label: 'Gõ sai', color: 'text-red-400' },
            { icon: <Clock className="text-violet-400" size={24} />, value: formatTime(stats.time), label: 'Thời gian', color: 'text-violet-400' },
          ].map((item, i) => (
            <div key={i} className="glass rounded-xl p-4 flex flex-col items-center gap-2 text-center">
              {item.icon}
              <div className={`text-3xl font-bold font-mono ${item.color}`}>{item.value}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{item.label}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 mb-6 p-4 rounded-xl bg-slate-100 dark:bg-white/5">
          {[
            { label: 'Tốc độ thô (Raw WPM)', value: `${stats.rawWpm} WPM` },
            { label: 'Tổng ký tự đã gõ', value: stats.totalTyped },
            { label: 'Ký tự chính xác', value: stats.correctChars },
          ].map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">{item.label}</span>
              <strong className="text-slate-700 dark:text-slate-200">{item.value}</strong>
            </div>
          ))}
        </div>

        <button
          onClick={onRestart}
          className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm
            bg-gradient-to-r from-violet-600 to-indigo-500 text-white
            hover:from-violet-500 hover:to-indigo-400 hover:shadow-lg hover:shadow-violet-500/30
            active:scale-95 transition-all duration-200"
        >
          <RefreshCw size={16} /> Luyện tập lại (ESC)
        </button>
      </div>
    );
  }

  // Real-time stats bar
  return (
    <div className="glass rounded-xl px-4 py-2.5 flex items-center gap-4 flex-wrap">
      {[
        { label: 'WPM', value: stats.wpm, className: 'text-emerald-400' },
        { label: 'Chính xác', value: `${stats.accuracy}%`, className: 'text-blue-400' },
        { label: 'Lỗi', value: stats.errors, className: 'text-red-400' },
        { label: 'Thời gian', value: formatTime(stats.time), className: 'text-violet-400' },
      ].map((item, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500 dark:text-slate-400">{item.label}:</span>
          <span className={`text-sm font-bold font-mono ${item.className}`}>{item.value}</span>
        </div>
      ))}
      <button
        onClick={onRestart}
        title="Đặt lại (ESC)"
        className="ml-auto w-8 h-8 rounded-lg flex items-center justify-center
          text-slate-400 dark:text-slate-500 hover:text-violet-500 hover:bg-violet-500/10 transition-all"
      >
        <RefreshCw size={15} />
      </button>
    </div>
  );
};

export default Stats;
