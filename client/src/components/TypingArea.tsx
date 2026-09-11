import React, { useState, useEffect, useRef } from 'react';
import { englishVietnameseDict } from '../utils/wordList';

export type FontSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type LineCount = 1 | 2 | 3;

interface TypingAreaProps {
  text: string;
  typedText: string;
  isFinished: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  wordsMetadata?: { word: string; definition: string }[];
  fillInBlank?: boolean;
  onWordClick?: (word: string, index: number) => void;
  fontSize?: FontSize;
  lineCount?: LineCount;
  showMeaning?: boolean;
  onFontSizeChange?: (size: FontSize) => void;
  onLineCountChange?: (lines: LineCount) => void;
}

// Bảng chiều cao chuẩn cho mỗi hàng theo từng cỡ chữ khi có nghĩa
const LINE_HEIGHT_WITH_MEANING: Record<FontSize, number> = {
  xs: 46,
  sm: 54,
  md: 64,
  lg: 78,
  xl: 94,
};

// Bảng chiều cao chuẩn cho mỗi hàng khi tắt hiển thị nghĩa
const LINE_HEIGHT_WITHOUT_MEANING: Record<FontSize, number> = {
  xs: 32,
  sm: 40,
  md: 48,
  lg: 60,
  xl: 74,
};

// Hàm rút gọn nghĩa tiếng Việt để không làm xô lệch layout
const getShortMeaning = (rawMeaning: string): string => {
  if (!rawMeaning) return '';
  // Tách lấy cụm nghĩa đầu tiên trước dấu phẩy, chấm phẩy hoặc dấu ngoặc
  let clean = rawMeaning.split(/[,;(/]/)[0].trim();
  // Giới hạn độ dài tối đa 14 ký tự
  if (clean.length > 14) {
    clean = clean.slice(0, 13) + '…';
  }
  return clean;
};

export const TypingArea: React.FC<TypingAreaProps> = ({
  text,
  typedText,
  isFinished,
  inputRef,
  handleInputChange,
  wordsMetadata,
  fillInBlank = false,
  onWordClick,
  fontSize,
  lineCount,
  showMeaning = true,
}) => {
  const [isFocused, setIsFocused] = useState<boolean>(true);
  const [translateY, setTranslateY] = useState<number>(0);
  const [caretPos, setCaretPos] = useState<{ left: number; top: number; height: number }>({ left: 0, top: 0, height: 28 });

  // Đọc cài đặt font size, line count và show meaning (từ prop hoặc fallback localStorage)
  const activeFontSize: FontSize = fontSize || (localStorage.getItem('vocatype_font_size') as FontSize) || 'sm';
  const activeLineCount: LineCount = lineCount || (parseInt(localStorage.getItem('vocatype_line_count') || '3', 10) as LineCount) || 3;
  const activeShowMeaning: boolean = showMeaning !== undefined ? showMeaning : (localStorage.getItem('vocatype_show_meaning') !== 'false');

  const wordsContainerRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<(HTMLDivElement | null)[]>([]);

  const wordsArray = text.split(' ');
  const typedWordsCount = typedText ? typedText.split(' ').length - 1 : 0;
  const currentLineHeight = (activeShowMeaning ? LINE_HEIGHT_WITH_MEANING : LINE_HEIGHT_WITHOUT_MEANING)[activeFontSize] || (activeShowMeaning ? 54 : 40);

  /* ── Focus / Blur ─────────────────────────────────── */
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    const onFocus = () => setIsFocused(true);
    const onBlur  = () => setIsFocused(false);
    input.addEventListener('focus', onFocus);
    input.addEventListener('blur',  onBlur);
    return () => {
      input.removeEventListener('focus', onFocus);
      input.removeEventListener('blur', onBlur);
    };
  }, [inputRef]);

  /* ── Cuộn dòng mượt mà theo số dòng cài đặt ──────── */
  useEffect(() => {
    const currentEl = wordRefs.current[typedWordsCount];
    if (!currentEl) return;

    const offsetTop = currentEl.offsetTop;
    const lh = currentLineHeight;

    if (activeLineCount === 1) {
      // 1 dòng: neo dòng đang gõ lên đỉnh
      setTranslateY(-offsetTop);
    } else if (activeLineCount === 2) {
      // 2 dòng: nếu qua dòng đầu thì cuộn lên 1 dòng
      if (offsetTop < lh) {
        setTranslateY(0);
      } else {
        setTranslateY(-(offsetTop - lh));
      }
    } else {
      // 3 dòng (mặc định): giữ 1 dòng trên, 1 dòng đang gõ ở giữa
      if (offsetTop < lh) {
        setTranslateY(0);
      } else {
        setTranslateY(-(offsetTop - lh));
      }
    }
  }, [typedWordsCount, activeLineCount, currentLineHeight]);

  /* ── Định vị con trỏ Caret mượt mà chuẩn xác ──────── */
  useEffect(() => {
    if (isFinished) return;

    const timer = setTimeout(() => {
      const containerEl = wordsContainerRef.current;
      if (!containerEl) return;
      const containerRect = containerEl.getBoundingClientRect();

      const activeChar = containerEl.querySelector('.active-char-target') as HTMLElement;
      if (activeChar) {
        const charRect = activeChar.getBoundingClientRect();
        setCaretPos({
          left: charRect.left - containerRect.left,
          top: charRect.top - containerRect.top,
          height: charRect.height || 26,
        });
      } else {
        const allChars = containerEl.querySelectorAll('.typing-char') as NodeListOf<HTMLElement>;
        if (allChars && allChars.length > 0) {
          const lastChar = allChars[allChars.length - 1];
          const charRect = lastChar.getBoundingClientRect();
          setCaretPos({
            left: charRect.right - containerRect.left,
            top: charRect.top - containerRect.top,
            height: charRect.height || 26,
          });
        }
      }
    }, 15);

    return () => clearTimeout(timer);
  }, [typedText, isFocused, text, isFinished, activeFontSize]);

  const handleAreaClick = () => inputRef.current?.focus();

  const getWordDefinition = (rawWord: string) => {
    const clean = rawWord.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '');
    if (wordsMetadata) {
      const found = wordsMetadata.find(m => m.word.toLowerCase() === clean);
      if (found?.definition) return found.definition;
    }
    return englishVietnameseDict[clean] || '';
  };

  /* ── Render từng từ và dấu cách độc lập ────────────── */
  let charIdx = 0;

  const renderWord = (word: string, wordIndex: number) => {
    const isCurrentWord = wordIndex === typedWordsCount;
    const isPastWord    = wordIndex < typedWordsCount;
    const isLastWord    = wordIndex === wordsArray.length - 1;
    const wordChars     = word.split('');
    const fullDef       = getWordDefinition(word);
    const shortDef      = getShortMeaning(fullDef);

    // Render các ký tự của từ
    const chars = wordChars.map((char, ci) => {
      const idx      = charIdx++;
      const isTyped  = idx < typedText.length;
      const isCursor = idx === typedText.length;

      let cls = 'typing-char ';
      if (isTyped) {
        cls += typedText[idx] === char ? 'char-correct' : 'char-incorrect';
      } else {
        cls += 'char-untyped';
      }

      if (isCursor) cls += ' active-char-target';

      const isCharHidden = fillInBlank && ci % 2 === 1 && !isTyped;
      const displayChar  = isCharHidden ? '_' : char;

      return (
        <span key={ci} className={cls}>
          {displayChar}
        </span>
      );
    });

    // Render dấu cách độc lập sau từ
    let spaceElement: React.ReactNode = null;
    if (!isLastWord) {
      const sIdx     = charIdx++;
      const isTyped  = sIdx < typedText.length;
      const isCursor = sIdx === typedText.length;

      let sCls = 'typing-space-char typing-char ';
      if (isTyped) {
        sCls += typedText[sIdx] === ' ' ? 'char-correct' : 'char-incorrect-space';
      } else {
        sCls += 'char-untyped';
      }

      if (isCursor) sCls += ' active-char-target';

      spaceElement = (
        <span key={`sp-${wordIndex}`} className={sCls}>
          {'\u00A0'}
        </span>
      );
    }

    return (
      <React.Fragment key={wordIndex}>
        {/* Khối từ: Chữ tiếng Anh ở trên, nghĩa tiếng Việt ở dưới */}
        <div
          ref={el => { wordRefs.current[wordIndex] = el; }}
          className={`typing-word-item cursor-pointer hover:opacity-90 transition-all ${
            isCurrentWord ? 'is-current-word' : ''
          }`}
          onMouseDown={(e) => {
            e.stopPropagation();
            onWordClick?.(word, wordIndex);
          }}
        >
          <div className="typing-word-letters">
            {chars}
          </div>

          {activeShowMeaning && (
            <div
              className={`typing-word-meaning ${
                isCurrentWord
                  ? 'text-violet-600 dark:text-violet-400 font-semibold opacity-100'
                  : isPastWord
                  ? 'text-slate-400 dark:text-slate-500 opacity-60'
                  : 'text-slate-400/60 dark:text-slate-600 opacity-40'
              }`}
              title={fullDef}
            >
              {shortDef || '\u00A0'}
            </div>
          )}
        </div>

        {/* Dấu cách giữa các từ */}
        {spaceElement}
      </React.Fragment>
    );
  };

  /* ── JSX ──────────────────────────────────────────── */
  return (
    <div
      className="typing-area-root glass-card-elevated rounded-3xl px-8 sm:px-12 py-8 sm:py-10 cursor-text select-none relative"
      onClick={handleAreaClick}
    >
      {/* Hidden input */}
      <input
        ref={inputRef}
        type="text"
        className="hidden-input"
        value={typedText}
        onChange={handleInputChange}
        disabled={isFinished}
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
      />

      {/* ── Viewport thích ứng theo số dòng ── */}
      <div
        className={`typing-viewport ${!isFocused && !isFinished ? 'opacity-20 blur-sm' : ''}`}
        style={{ height: `${currentLineHeight * activeLineCount}px` }}
      >
        <div
          ref={wordsContainerRef}
          className={`typing-words-inner typing-size-${activeFontSize} ${!activeShowMeaning ? 'no-meaning' : ''} relative`}
          style={{
            transform: `translateY(${translateY}px)`,
            transition: 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {wordsArray.map((word, wi) => renderWord(word, wi))}

          {/* Smooth custom caret element */}
          <div
            className="typing-caret-smooth"
            style={{
              left: `${caretPos.left}px`,
              top: `${caretPos.top}px`,
              height: `${Math.max(18, caretPos.height - 2)}px`,
              opacity: isFocused && !isFinished ? 1 : 0,
            }}
          />
        </div>

        {/* Fade top & bottom */}
        <div className="typing-fade-top" />
        <div className="typing-fade-bottom" />
      </div>

      {/* ── Blur overlay khi mất focus ── */}
      {!isFocused && !isFinished && (
        <div className="typing-blur-overlay">
          <div className="glass rounded-2xl px-6 py-3.5 text-sm font-medium text-slate-700 dark:text-slate-200 shadow-xl border border-slate-200/80 dark:border-white/10">
            👆 Nhấp vào đây hoặc nhấn phím bất kỳ để tiếp tục gõ...
          </div>
        </div>
      )}
    </div>
  );
};

export default TypingArea;
