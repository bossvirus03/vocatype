import React, { useEffect } from 'react';
import { Volume2, VolumeX, RefreshCw, Settings, Info, Type, Rows, Languages, X } from 'lucide-react';
import type { SwitchType } from '../utils/audio';
import type { FontSize, LineCount } from './TypingArea';

interface LevelInfo { id: string; name: string; desc: string; wordCount: number; }

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  activeTab: 'study' | 'type';
  soundEnabled: boolean;
  onSoundToggle: (enabled: boolean) => void;
  selectedLevel: string;
  onLevelChange: (level: string) => void;
  levels: LevelInfo[];
  onReset: () => void;
  
  // Cài đặt âm thanh cơ học
  switchType: SwitchType;
  onSwitchTypeChange: (type: SwitchType) => void;
  volume: number;
  onVolumeChange: (vol: number) => void;

  // Cấu hình phát âm (TTS)
  ttsEnabled: boolean;
  onTtsToggle: (enabled: boolean) => void;

  // Cài đặt hiển thị số dòng, cỡ chữ & nghĩa từ vựng
  fontSize?: FontSize;
  onFontSizeChange?: (size: FontSize) => void;
  lineCount?: LineCount;
  onLineCountChange?: (count: LineCount) => void;
  showMeaning?: boolean;
  onShowMeaningToggle?: (enabled: boolean) => void;
}

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-2.5 flex items-center gap-1.5">
    {children}
  </h4>
);

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen = false,
  onClose,
  activeTab, soundEnabled, onSoundToggle,
  selectedLevel, onLevelChange,
  levels, onReset,
  switchType, onSwitchTypeChange, volume, onVolumeChange,
  ttsEnabled, onTtsToggle,
  fontSize = 'sm', onFontSizeChange,
  lineCount = 3, onLineCountChange,
  showMeaning = true, onShowMeaningToggle
}) => {

  // Đóng bằng phím ESC khi drawer đang mở
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      {/* ── Lớp nền mờ Backdrop ── */}
      <div
        className={`drawer-backdrop ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* ── Slide-over Drawer Panel ── */}
      <aside
        className={`drawer-panel ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header Drawer */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/80 dark:border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-600/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <Settings size={17} className="animate-spin-slow" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">
                Cài đặt trải nghiệm
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                Giao diện, âm thanh, cấp độ & từ điển
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
            title="Đóng cài đặt (ESC)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nội dung các tuỳ chỉnh */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">

      {/* ── Cài đặt Hiển thị (Số dòng, Cỡ chữ & Nghĩa) ── */}
      <div>
        <SectionTitle>Giao diện gõ</SectionTitle>
        <div className="flex flex-col gap-3">
          {/* Toggle Hiển thị nghĩa từ vựng */}
          <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-100/80 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 transition-all">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-violet-500/10 dark:bg-violet-400/20 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                <Languages size={13} />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block leading-tight">
                  Nghĩa từ vựng
                </span>
                <span className="text-[9px] text-slate-400 dark:text-slate-500">
                  Hiển thị nghĩa tiếng Việt dưới từ
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onShowMeaningToggle?.(!showMeaning)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                showMeaning ? 'bg-violet-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
              title={showMeaning ? 'Đang bật nghĩa từ' : 'Đang tắt nghĩa từ'}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  showMeaning ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Số dòng */}
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 mb-1">
              <Rows size={11} className="text-violet-500" /> Số dòng hiển thị
            </span>
            <div className="grid grid-cols-3 gap-1">
              {([1, 2, 3] as LineCount[]).map((count) => (
                <button
                  key={count}
                  onClick={() => onLineCountChange?.(count)}
                  className={`py-1 rounded-lg text-xs font-semibold transition-all ${
                    lineCount === count
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-violet-100 dark:hover:bg-violet-500/10'
                  }`}
                >
                  {count} dòng
                </button>
              ))}
            </div>
          </div>

          {/* Cỡ chữ */}
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 mb-1">
              <Type size={11} className="text-violet-500" /> Cỡ chữ
            </span>
            <div className="grid grid-cols-4 gap-1">
              {(['xs', 'sm', 'lg', 'xl'] as FontSize[]).map((sz) => (
                <button
                  key={sz}
                  onClick={() => onFontSizeChange?.(sz)}
                  className={`py-1 rounded-lg text-xs font-semibold uppercase transition-all ${
                    fontSize === sz
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-violet-100 dark:hover:bg-violet-500/10'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Switch bàn phím ── */}
      <div>
        <SectionTitle>Loại Switch phím</SectionTitle>
        <div className="grid grid-cols-3 gap-1.5">
          {(['blue', 'brown', 'red'] as SwitchType[]).map(type => (
            <button
              key={type}
              onClick={() => onSwitchTypeChange(type)}
              className={`py-1.5 rounded-lg text-xs font-semibold uppercase transition-all
                ${switchType === type
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-violet-100 dark:hover:bg-violet-500/10'
                }`}
            >
              {type === 'blue' && 'Blue'}
              {type === 'brown' && 'Brown'}
              {type === 'red' && 'Red'}
            </button>
          ))}
        </div>
        <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 leading-normal">
          {switchType === 'blue' && '🔊 Clicky: Âm thanh giòn dã, sắc sảo.'}
          {switchType === 'brown' && '🔉 Tactile: Âm khấc cơ học vừa phải, đầm.'}
          {switchType === 'red' && '🔇 Linear: Âm thanh chạm đáy êm ái, mượt.'}
        </p>
      </div>

      {/* ── Âm lượng ── */}
      <div>
        <SectionTitle>Mức âm lượng: {Math.round(volume * 100)}%</SectionTitle>
        <div className="flex items-center gap-3">
          {soundEnabled && volume > 0 ? <Volume2 size={15} className="text-violet-500" /> : <VolumeX size={15} className="text-slate-400" />}
          <input
            type="range" min="0" max="1" step="0.05"
            value={volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="flex-1 h-1.5 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-violet-500"
          />
        </div>
      </div>

      {/* ── Phân cấp Level ── */}
      <div>
        <SectionTitle>Cấp độ (CEFR)</SectionTitle>
        <div className="grid grid-cols-4 gap-1">
          <button
            onClick={() => onLevelChange('ALL')}
            className={`col-span-1 flex flex-col items-center justify-center py-1.5 rounded-lg text-[11px] font-medium transition-all
              ${selectedLevel === 'ALL'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-violet-100 dark:hover:bg-violet-500/10'
              }`}
          >
            <span className="font-bold">ALL</span>
            <span className="text-[9px] opacity-75">Tất cả</span>
          </button>
          {Array.isArray(levels) && levels.map(level => (
            <button
              key={level.id}
              onClick={() => onLevelChange(level.id)}
              className={`flex flex-col items-center gap-0.5 px-1 py-1.5 rounded-lg text-[11px] font-medium transition-all
                ${selectedLevel === level.id
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-violet-100 dark:hover:bg-violet-500/10'
                }`}
            >
              <span className="font-bold">{level.id}</span>
              <span className="text-[9px] opacity-75">{level.wordCount}</span>
            </button>
          ))}
        </div>
      </div>



      {/* ── Cài đặt khác ── */}
      <div>
        <SectionTitle>Thao tác</SectionTitle>
        <div className="flex flex-col gap-1.5">
          <div className="flex gap-1.5">
            <button
              onClick={() => onSoundToggle(!soundEnabled)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all
                ${soundEnabled
                  ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-500 border border-transparent hover:bg-slate-200 dark:hover:bg-white/10'
                }`}
            >
              {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
              Âm thanh
            </button>
            <button
              onClick={onReset}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium
                bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400
                hover:bg-red-500/10 hover:text-red-500 border border-transparent transition-all"
            >
              <RefreshCw size={14} /> Làm lại
            </button>
          </div>
          <button
            onClick={() => onTtsToggle(!ttsEnabled)}
            className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all
              ${ttsEnabled
                ? 'bg-violet-600/20 text-violet-500 dark:text-violet-400 border border-violet-500/30'
                : 'bg-slate-100 dark:bg-white/5 text-slate-500 border border-transparent hover:bg-slate-200 dark:hover:bg-white/10'
              }`}
          >
            <Volume2 size={14} />
            {ttsEnabled ? '🔊 Đọc từ: BẬT' : '🔇 Đọc từ: TẮT'}
          </button>
        </div>
      </div>

        {/* ── Mẹo ── */}
        <div className="flex items-start gap-2 p-3 rounded-2xl bg-violet-500/10 border border-violet-500/20 mt-auto">
          <Info size={14} className="text-violet-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Chế độ luyện gõ là <strong>Vô tận (Infinite)</strong>. Nhấn <strong className="text-violet-400">Dừng gõ</strong> trên màn hình để xem kết quả WPM chi tiết.
          </p>
        </div>
      </div>
    </aside>
  </>
);
};

export default Sidebar;
