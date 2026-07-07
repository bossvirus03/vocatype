import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { DOMAIN_ICONS } from '../utils/domainIcons';

interface DomainInfo {
  id: string;
  name: string;
  desc: string;
  wordCount: number;
}

interface EditDomainsModalProps {
  isOpen: boolean;
  onClose: () => void;
  domains: DomainInfo[];
  favoriteDomains: string[];
  onSave: (selected: string[]) => Promise<void>;
}



export const EditDomainsModal: React.FC<EditDomainsModalProps> = ({
  isOpen,
  onClose,
  domains,
  favoriteDomains,
  onSave
}) => {
  const { showToast } = useToast();
  const [tempSelected, setTempSelected] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Đồng bộ tempSelected khi mở Modal
  useEffect(() => {
    if (isOpen) {
      setTempSelected([...favoriteDomains]);
    }
  }, [isOpen, favoriteDomains]);

  if (!isOpen) return null;

  const handleToggleDomain = (id: string) => {
    setTempSelected(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        if (prev.length >= 5) {
          showToast('Bạn chỉ được chọn tối đa 5 lĩnh vực yêu thích!', 'error');
          return prev;
        }
        return [...prev, id];
      }
    });
  };

  const handleSave = async () => {
    if (tempSelected.length === 0) {
      showToast('Vui lòng chọn ít nhất 1 lĩnh vực yêu thích!', 'error');
      return;
    }
    setIsSaving(true);
    try {
      await onSave(tempSelected);
      showToast('Đã cập nhật lĩnh vực yêu thích thành công!', 'success');
      onClose();
    } catch (err) {
      showToast('Đã xảy ra lỗi khi lưu lĩnh vực!', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative border border-slate-200 dark:border-white/10 flex flex-col max-h-[90vh] animate-fade-in">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10 mb-4 shrink-0">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Chỉnh sửa lĩnh vực yêu thích
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Lọc từ vựng luyện tập. Được chọn tối đa 5 lĩnh vực.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="text-right text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">
            Đã chọn: <span className="text-violet-500 font-bold">{tempSelected.length} / 5</span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {domains.map(domain => {
              const isSelected = tempSelected.includes(domain.id);
              return (
                <button
                  key={domain.id}
                  onClick={() => handleToggleDomain(domain.id)}
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all duration-200
                    ${isSelected
                      ? 'bg-violet-600/10 border-violet-500 text-violet-500 dark:text-violet-400'
                      : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20'
                    }`}
                >
                  {(() => {
                    const Icon = DOMAIN_ICONS[domain.id];
                    return Icon ? <Icon size={16} className="shrink-0 mt-0.5 text-violet-500 dark:text-violet-400" /> : null;
                  })()}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-semibold leading-tight truncate">{domain.name}</span>
                      {isSelected && (
                        <span className="w-4.5 h-4.5 rounded-full bg-violet-500 flex items-center justify-center text-white shrink-0">
                          <Check size={10} strokeWidth={3} />
                        </span>
                      )}
                    </div>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5 leading-tight truncate">{domain.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-white/10 mt-4 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-violet-500/20 hover:opacity-90 active:scale-95 transition-all"
          >
            {isSaving && <div className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />}
            Lưu thay đổi
          </button>
        </div>

      </div>
    </div>
  );
};
