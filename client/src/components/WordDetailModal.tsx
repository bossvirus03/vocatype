import React from 'react';
import { X, Volume2 } from 'lucide-react';
import { audio } from '../utils/audio';

interface WordMetadata {
  word: string;
  definition: string;
  ipa?: string;
  example?: string;
  exampleTranslation?: string;
}

interface WordDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  wordData: WordMetadata | null;
}

// Bộ từ điển nhỏ chứa loại từ (Part of Speech) và từ đồng nghĩa (Synonyms) cho các từ Oxford phổ biến
const DICTIONARY_MAPPING: Record<string, { pos: string; synonyms: string[] }> = {
  'apple': { pos: 'Danh từ (Noun)', synonyms: ['pome fruit', 'malus'] },
  'happy': { pos: 'Tính từ (Adjective)', synonyms: ['joyful', 'cheerful', 'glad', 'delighted'] },
  'beautiful': { pos: 'Tính từ (Adjective)', synonyms: ['gorgeous', 'pretty', 'lovely', 'attractive'] },
  'dog': { pos: 'Danh từ (Noun)', synonyms: ['canine', 'pup', 'pooch'] },
  'journey': { pos: 'Danh từ (Noun)', synonyms: ['trip', 'travel', 'voyage', 'tour'] },
  'prepare': { pos: 'Động từ (Verb)', synonyms: ['ready', 'arrange', 'plan', 'organize'] },
  'courage': { pos: 'Danh từ (Noun)', synonyms: ['bravery', 'valor', 'fearlessness', 'grit'] },
  'resilience': { pos: 'Danh từ (Noun)', synonyms: ['toughness', 'flexibility', 'elasticity'] },
  'meticulous': { pos: 'Tính từ (Adjective)', synonyms: ['precise', 'scrupulous', 'detailed', 'careful'] },
  'foster': { pos: 'Động từ (Verb)', synonyms: ['promote', 'nurture', 'encourage', 'cultivate'] },
  'esoteric': { pos: 'Tính từ (Adjective)', synonyms: ['abstruse', 'obscure', 'arcane', 'mysterious'] },
  'plethora': { pos: 'Danh từ (Noun)', synonyms: ['excess', 'abundance', 'surplus', 'superfluity'] }
};

// Hàm phân tích tự động dựa trên nghĩa tiếng Việt
const getWordDetail = (word: string, definition: string) => {
  const lower = word.toLowerCase();
  if (DICTIONARY_MAPPING[lower]) {
    return DICTIONARY_MAPPING[lower];
  }

  // Dự đoán Loại từ dựa trên tiền tố/đặc điểm định nghĩa tiếng Việt
  let pos = 'Danh từ (Noun)'; // Mặc định
  if (definition.startsWith('sự ') || definition.startsWith('cái ') || definition.startsWith('người ') || definition.startsWith('sự việc ') || definition.startsWith('việc ')) {
    pos = 'Danh từ (Noun)';
  } else if (definition.startsWith('được ') || definition.startsWith('bị ') || definition.startsWith('làm ') || definition.startsWith('chạy ') || definition.startsWith('đi ') || definition.includes('động từ')) {
    pos = 'Động từ (Verb)';
  } else if (definition.startsWith('rất ') || definition.includes('tính từ') || definition.endsWith('đầy') || definition.startsWith('có tính')) {
    pos = 'Tính từ (Adjective)';
  } else if (definition.includes('trạng từ') || definition.endsWith('một cách')) {
    pos = 'Trạng từ (Adverb)';
  }

  // Sinh từ đồng nghĩa mặc định dựa trên lĩnh vực
  const mockSynonyms: Record<string, string[]> = {
    'technology': ['tech', 'applied science', 'automation'],
    'science': ['knowledge', 'discipline', 'study'],
    'business': ['commerce', 'trade', 'enterprise'],
    'communication': ['contact', 'transmission', 'talk'],
    'medicine': ['drug', 'medication', 'therapy'],
    'travel': ['tour', 'trip', 'journey'],
    'food': ['meals', 'cuisine', 'fare'],
    'sports': ['games', 'athletics', 'recreation'],
    'art': ['craft', 'design', 'fine arts'],
    'music': ['melody', 'tune', 'song']
  };

  return {
    pos,
    synonyms: mockSynonyms[lower] || ['similar term', 'related word']
  };
};

export const WordDetailModal: React.FC<WordDetailModalProps> = ({
  isOpen,
  onClose,
  wordData
}) => {
  // Lắng nghe phím ESC để đóng Modal
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !wordData) return null;

  const { word, definition, ipa = '', example = '', exampleTranslation = '' } = wordData;
  const { pos, synonyms } = getWordDetail(word, definition);

  const handleSpeak = () => {
    audio.speakWord(word);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-slate-200 dark:border-white/10 flex flex-col animate-fade-in text-slate-800 dark:text-slate-200">
        
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
        >
          <X size={16} />
        </button>

        {/* Header - Từ vựng & Loa phát âm */}
        <div className="flex items-center gap-3 mb-3 mt-2 pr-6">
          <h2 className="text-3xl font-black text-violet-500 tracking-tight select-all">
            {word}
          </h2>
          <button
            onClick={handleSpeak}
            className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-500/10 text-violet-500 flex items-center justify-center hover:bg-violet-200 dark:hover:bg-violet-500/20 active:scale-90 transition-all"
            title="Nghe phát âm chuẩn"
          >
            <Volume2 size={16} />
          </button>
        </div>

        {/* Phiên âm IPA & Loại từ */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {ipa && (
            <span className="text-sm font-mono text-slate-500 dark:text-slate-400 font-medium">
              {ipa}
            </span>
          )}
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-violet-100 dark:bg-violet-500/10 text-violet-500 border border-violet-500/10">
            {pos}
          </span>
        </div>

        {/* Định nghĩa */}
        <div className="mb-4">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
            Định nghĩa
          </h4>
          <p className="text-sm font-medium leading-relaxed">
            {definition}
          </p>
        </div>

        {/* Từ đồng nghĩa */}
        {synonyms.length > 0 && (
          <div className="mb-4">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
              Từ đồng nghĩa (Synonyms)
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {synonyms.map((syn, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10"
                >
                  {syn}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Ví dụ & dịch nghĩa */}
        {example && (
          <div className="mb-6 p-3 rounded-2xl bg-slate-100/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
              Ví dụ sử dụng
            </h4>
            <p className="text-xs font-medium italic leading-relaxed text-slate-700 dark:text-slate-300">
              "{example}"
            </p>
            {exampleTranslation && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {exampleTranslation}
              </p>
            )}
          </div>
        )}

        {/* Footer */}
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-violet-500/20 active:scale-95 transition-all text-center"
        >
          Đóng
        </button>

      </div>
    </div>
  );
};
