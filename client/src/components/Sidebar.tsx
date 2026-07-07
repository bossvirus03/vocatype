import React from 'react';
import { Volume2, VolumeX, RefreshCw, Settings, Info, Edit2 } from 'lucide-react';
import type { SwitchType } from '../utils/audio';
import { DOMAIN_ICONS } from '../utils/domainIcons';

interface LevelInfo { id: string; name: string; desc: string; wordCount: number; }
interface DomainInfo { id: string; name: string; desc: string; wordCount: number; }

interface SidebarProps {
  activeTab: 'study' | 'type';
  soundEnabled: boolean;
  onSoundToggle: (enabled: boolean) => void;
  selectedLevel: string;
  onLevelChange: (level: string) => void;
  selectedDomain: string;
  onDomainChange: (domain: string) => void;
  levels: LevelInfo[];
  domains: DomainInfo[];
  onReset: () => void;
  
  // Cài đặt âm thanh cơ học
  switchType: SwitchType;
  onSwitchTypeChange: (type: SwitchType) => void;
  volume: number;
  onVolumeChange: (vol: number) => void;

  // Lĩnh vực yêu thích và callback mở Modal sửa
  favoriteDomains: string[];
  onEditDomains: () => void;

  // Cấu hình phát âm (TTS)
  ttsEnabled: boolean;
  onTtsToggle: (enabled: boolean) => void;
}



const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h4 className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">
    {children}
  </h4>
);

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab, soundEnabled, onSoundToggle,
  selectedLevel, onLevelChange, selectedDomain, onDomainChange,
  levels, domains, onReset,
  switchType, onSwitchTypeChange, volume, onVolumeChange,
  favoriteDomains, onEditDomains,
  ttsEnabled, onTtsToggle
}) => {
  // Lọc chỉ hiển thị các lĩnh vực yêu thích của user
  const displayedDomains = domains.filter(d => favoriteDomains.includes(d.id));

  return (
    <aside className="w-64 shrink-0 glass rounded-2xl p-4 flex flex-col gap-4 self-start sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">

      {/* Header Sidebar */}
      <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-white/10">
        <Settings size={16} className="text-violet-500" />
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Cài đặt Luyện gõ
        </h3>
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

      {/* ── Lĩnh vực yêu thích (Lọc & Sửa) ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <SectionTitle>Lĩnh vực</SectionTitle>
          <button
            onClick={onEditDomains}
            className="text-[10px] text-violet-500 hover:text-violet-600 font-semibold flex items-center gap-0.5"
          >
            <Edit2 size={10} /> Chỉnh sửa
          </button>
        </div>
        
        <div className="flex flex-col gap-1 max-h-[160px] overflow-y-auto pr-1">
          <button
            onClick={() => onDomainChange('ALL')}
            className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-all
              ${selectedDomain === 'ALL'
                ? 'bg-violet-600/20 text-violet-500 dark:text-violet-400 border border-violet-500/30'
                : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-violet-100 dark:hover:bg-violet-500/10 border border-transparent'
              }`}
          >
            <span className="font-medium">Tất cả lĩnh vực</span>
          </button>
          {Array.isArray(displayedDomains) && displayedDomains.map(domain => (
            <button
              key={domain.id}
              onClick={() => onDomainChange(domain.id)}
              className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-all
                ${selectedDomain === domain.id
                  ? 'bg-violet-600/20 text-violet-500 dark:text-violet-400 border border-violet-500/30'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-violet-100 dark:hover:bg-violet-500/10 border border-transparent'
                }`}
            >
              <span className="font-medium truncate max-w-[130px] flex items-center gap-1.5">
                {(() => {
                  const Icon = DOMAIN_ICONS[domain.id];
                  return Icon ? <Icon size={14} className="shrink-0 text-violet-500 dark:text-violet-400" /> : null;
                })()}
                <span className="truncate">{domain.name}</span>
              </span>
              <span className="text-[10px] opacity-60 shrink-0">{domain.wordCount}</span>
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
      <div className="flex items-start gap-2 p-2.5 rounded-lg bg-violet-500/10 border border-violet-500/20 mt-auto">
        <Info size={13} className="text-violet-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
          Chế độ luyện gõ tự do là <strong>Vô tận (Infinite)</strong>. Nhấp nút <strong>Dừng gõ</strong> trên màn hình gõ để xem kết quả chi tiết.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
