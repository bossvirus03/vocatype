import React, { useState, useEffect, useRef } from 'react';
import { englishVietnameseDict } from '../utils/wordList';

interface TypingAreaProps {
  text: string;
  typedText: string;
  isFinished: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  wordsMetadata?: { word: string; definition: string }[];
  fillInBlank?: boolean;
  onWordClick?: (word: string, index: number) => void;
}

export const TypingArea: React.FC<TypingAreaProps> = ({
  text, typedText, isFinished, inputRef, handleInputChange, wordsMetadata, fillInBlank = false, onWordClick
}) => {
  const [isFocused, setIsFocused] = useState<boolean>(true);
  const [translateY, setTranslateY] = useState<number>(0);
  const [caretPos, setCaretPos] = useState<{ left: number; top: number; height: number }>({ left: 0, top: 0, height: 28 });

  const wordsContainerRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<(HTMLDivElement | null)[]>([]);

  const wordsArray = text.split(' ');
  const typedWordsCount = typedText ? typedText.split(' ').length - 1 : 0;

  /* ── Focus / Blur ─────────────────────────────────── */
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    const onFocus = () => setIsFocused(true);
    const onBlur  = () => setIsFocused(false);
    input.addEventListener('focus', onFocus);
    input.addEventListener('blur',  onBlur);
    return () => { input.removeEventListener('focus', onFocus); input.removeEventListener('blur', onBlur); };
  }, [inputRef]);

  /* ── Line scroll (MonkeyType style) ───────────────── */
  useEffect(() => {
    const currentEl = wordRefs.current[typedWordsCount];
    const firstEl   = wordRefs.current[0];
    if (!currentEl || !firstEl) return;

    const offsetTop  = currentEl.offsetTop;
    const lineHeight = firstEl.offsetHeight + 12; // word height + gap-y (adjusted)

    // Keep exactly one completed line visible above current word
    if (offsetTop < lineHeight) {
      setTranslateY(0);
    } else {
      setTranslateY(-(offsetTop - lineHeight));
    }
  }, [typedWordsCount]);

  useEffect(() => {
    if (isFinished) return;

    // Đợi layout DOM được vẽ xong và tính toán xong
    const timer = setTimeout(() => {
      const activeChar = wordsContainerRef.current?.querySelector('.active-char-target') as HTMLElement;
      if (activeChar) {
        let left = activeChar.offsetLeft;
        let top = activeChar.offsetTop;
        let parent = activeChar.offsetParent as HTMLElement;

        // Cộng dồn toạ độ cho tới khi chạm tới container chính
        while (parent && parent !== wordsContainerRef.current) {
          left += parent.offsetLeft;
          top += parent.offsetTop;
          parent = parent.offsetParent as HTMLElement;
        }

        setCaretPos({
          left,
          top,
          height: activeChar.offsetHeight || 28
        });
      } else {
        // Fallback: Khi gõ hết từ cuối cùng nhưng chưa sang trạng thái finished
        const allChars = wordsContainerRef.current?.querySelectorAll('.typing-char') as NodeListOf<HTMLElement>;
        if (allChars && allChars.length > 0) {
          const lastChar = allChars[allChars.length - 1];
          let left = lastChar.offsetLeft + lastChar.offsetWidth;
          let top = lastChar.offsetTop;
          let parent = lastChar.offsetParent as HTMLElement;

          while (parent && parent !== wordsContainerRef.current) {
            left += parent.offsetLeft;
            top += parent.offsetTop;
            parent = parent.offsetParent as HTMLElement;
          }

          setCaretPos({
            left,
            top,
            height: lastChar.offsetHeight || 28
          });
        }
      }
    }, 30);

    return () => clearTimeout(timer);
  }, [typedText, isFocused, text, isFinished]);

  const handleAreaClick = () => inputRef.current?.focus();

  /* ── Current word definition ──────────────────────── */
  const currentDef = (() => {
    const word = wordsArray[typedWordsCount];
    if (!word) return '';
    const clean = word.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '');
    if (wordsMetadata) {
      const found = wordsMetadata.find(m => m.word.toLowerCase() === clean);
      if (found?.definition) return found.definition;
    }
    return englishVietnameseDict[clean] || '';
  })();

  /* ── Render chars ─────────────────────────────────── */
  let charIdx = 0;

  const renderWord = (word: string, wordIndex: number) => {
    const isCurrentWord = wordIndex === typedWordsCount;
    const isLastWord    = wordIndex === wordsArray.length - 1;
    const wordChars     = word.split('');

    const chars = wordChars.map((char, ci) => {
      const idx     = charIdx++;
      const isTyped   = idx < typedText.length;
      const isCursor  = idx === typedText.length;

      let cls = 'typing-char relative ';
      if (isTyped)        cls += typedText[idx] === char ? 'char-correct' : 'char-incorrect';
      else                cls += 'char-untyped';

      if (isCursor)       cls += ' active-char-target';

      const isCharHidden = fillInBlank && ci % 2 === 1 && !isTyped;
      const displayChar = isCharHidden ? '_' : char;

      return (
        <span key={ci} className={cls}>
          {displayChar}
        </span>
      );
    });

    // Space after word
    let space: React.ReactNode = null;
    if (!isLastWord) {
      const idx    = charIdx++;
      const isTyped  = idx < typedText.length;
      const isCursor = idx === typedText.length;

      let cls = 'typing-char relative ';
      if (isTyped)        cls += typedText[idx] === ' ' ? 'char-correct' : 'char-incorrect-space';
      else                cls += 'char-untyped';

      if (isCursor)       cls += ' active-char-target';

      space = (
        <span key="sp" className={cls}>
          {'\u00A0'}
        </span>
      );
    }

    return (
      <div
        key={wordIndex}
        ref={el => { wordRefs.current[wordIndex] = el; }}
        className={`typing-word cursor-pointer hover:bg-slate-200/25 dark:hover:bg-white/5 rounded px-0.5 transition-all duration-200 ${isCurrentWord ? 'typing-word-current' : ''}`}
        onMouseDown={(e) => {
          e.stopPropagation();
          onWordClick?.(word, wordIndex);
        }}
      >
        <span className="typing-word-chars">
          {chars}
          {space}
        </span>
      </div>
    );
  };

  /* ── JSX ──────────────────────────────────────────── */
  return (
    <div
      className="typing-area-root glass rounded-2xl px-10 py-8 cursor-text select-none relative"
      onClick={handleAreaClick}
    >
      {/* Hidden input */}
      <input
        ref={inputRef} type="text"
        className="hidden-input" value={typedText}
        onChange={handleInputChange} disabled={isFinished}
        autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false}
      />

      {/* ── 3-line viewport ── */}
      <div className={`typing-viewport ${!isFocused && !isFinished ? 'opacity-20 blur-sm' : ''}`}>
        <div
          ref={wordsContainerRef}
          className="typing-words-inner relative"
          style={{ transform: `translateY(${translateY}px)`, transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)' }}
        >
          {wordsArray.map((word, wi) => renderWord(word, wi))}

          {/* Smooth custom caret element */}
          <div
            className="typing-caret-smooth"
            style={{
              left: `${caretPos.left}px`,
              top: `${caretPos.top + 4}px`, // Slight offset to align nicely vertically
              height: `${caretPos.height * 0.8}px`,
              opacity: isFocused && !isFinished ? 1 : 0,
            }}
          />
        </div>

        {/* Fade top & bottom */}
        <div className="typing-fade-top" />
        <div className="typing-fade-bottom" />
      </div>

      {/* ── Current word definition ── */}
      <div className="typing-definition-bar">
        {currentDef
          ? <span className="typing-definition-text">{currentDef}</span>
          : <span className="typing-definition-placeholder">—</span>
        }
      </div>

      {/* ── Blur overlay ── */}
      {!isFocused && !isFinished && (
        <div className="typing-blur-overlay">
          <div className="glass rounded-xl px-5 py-3 text-sm text-slate-600 dark:text-slate-300">
            👆 Nhấp vào đây hoặc nhấn phím bất kỳ để tiếp tục...
          </div>
        </div>
      )}
    </div>
  );
};

export default TypingArea;
