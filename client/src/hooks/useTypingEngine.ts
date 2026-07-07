import { useState, useEffect, useRef, useCallback } from 'react';
import { audio } from '../utils/audio';

interface UseTypingEngineProps {
  wordsList: string[];
  lessonLength: number;
}

// Hàm hỗ trợ loại bỏ dấu tiếng Việt để tránh xung đột với bộ gõ Telex/VNI khi gõ tiếng Anh
const removeVietnameseTones = (str: string): string => {
  return str
    .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a')
    .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e')
    .replace(/ì|í|ị|ỉ|ĩ/g, 'i')
    .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o')
    .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u')
    .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y')
    .replace(/đ/g, 'd')
    .replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A')
    .replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'E')
    .replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I')
    .replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O')
    .replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'U')
    .replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'Y')
    .replace(/Đ/g, 'D');
};

export const useTypingEngine = ({ wordsList, lessonLength, infinite = false }: UseTypingEngineProps) => {
  const [currentWords, setCurrentWords] = useState<string[]>([]);
  const [text, setText] = useState<string>(''); // Chuỗi văn bản đích đầy đủ
  const [typedText, setTypedText] = useState<string>(''); // Chuỗi người dùng đã gõ
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [errors, setErrors] = useState<number>(0);
  const [totalTyped, setTotalTyped] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  
  // State phục vụ cho bàn phím ảo
  const [lastKey, setLastKey] = useState<string>('');
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());

  // Lưu trữ độ dài trước đó để phát hiện gõ thêm hay xoá đi (Backspace)
  const prevTypedLength = useRef<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Tạo một bài luyện tập mới
  const initLesson = useCallback(() => {
    // Lấy ngẫu nhiên từ danh sách
    const selected: string[] = [];
    const shuffled = [...wordsList].sort(() => 0.5 - Math.random());
    
    const countToLoad = infinite ? 30 : lessonLength; // Load 30 từ ban đầu nếu gõ vô tận

    while (selected.length < countToLoad) {
      selected.push(...shuffled);
    }
    const finalWords = selected.slice(0, countToLoad);
    
    setCurrentWords(finalWords);
    const joinedText = finalWords.join(' ');
    setText(joinedText);
    
    // Reset states
    setTypedText('');
    setStartTime(null);
    setEndTime(null);
    setErrors(0);
    setTotalTyped(0);
    setIsFinished(false);
    prevTypedLength.current = 0;
    
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.focus();
    }
  }, [wordsList, lessonLength, infinite]);

  // Khởi tạo bài tập khi thay đổi danh sách từ hoặc độ dài
  useEffect(() => {
    initLesson();
  }, [initLesson]);

  // Xử lý sự kiện thay đổi dữ liệu trong input ẩn
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 1. Chuẩn hóa các ký tự tiếng Việt có dấu thành không dấu tiếng Anh tương ứng
    let normalizedValue = removeVietnameseTones(e.target.value);

    // 2. Chuẩn hóa khoảng trắng không ngắt (\u00a0) từ bộ gõ tiếng Việt thành khoảng trắng thường
    normalizedValue = normalizedValue.replace(/\u00a0/g, ' ');

    // 3. Ngăn chặn lỗi nhân đôi dấu cách (double space) của bộ gõ tiếng Việt (Telex) trên macOS/Windows
    const len = normalizedValue.length;
    if (len > 1 && normalizedValue[len - 1] === ' ' && normalizedValue[len - 2] === ' ') {
      const targetIdx = len - 1;
      // Nếu ký tự đích tại vị trí dấu cách thứ hai không phải là dấu cách, loại bỏ dấu cách thừa này
      if (text[targetIdx] !== ' ') {
        normalizedValue = normalizedValue.slice(0, len - 1);
      }
    }
    
    // Đừng xử lý nếu đã hoàn thành
    if (isFinished) return;

    // Đánh dấu mốc bắt đầu khi bắt đầu gõ ký tự đầu tiên
    if (startTime === null && normalizedValue.length > 0) {
      setStartTime(Date.now());
    }

    const currentLen = normalizedValue.length;
    const prevLen = prevTypedLength.current;

    // Phát hiện người dùng gõ thêm (không phải xóa Backspace)
    if (currentLen > prevLen) {
      const addedChar = normalizedValue.slice(prevLen); // Các ký tự vừa được thêm
      setTotalTyped(prev => prev + addedChar.length);

      // So sánh ký tự vừa gõ với ký tự đích tương ứng
      let hasError = false;
      for (let i = 0; i < addedChar.length; i++) {
        const idx = prevLen + i;
        const targetChar = text[idx];
        const typedChar = addedChar[i];

        if (targetChar !== typedChar) {
          hasError = true;
        }
      }

      if (hasError) {
        setErrors(prev => prev + 1);
        audio.playError();
      } else {
        audio.playClick();
      }
    }

    setTypedText(normalizedValue);
    prevTypedLength.current = currentLen;

    // Phát hiện nhấn phím cách chuyển từ để phát âm từ vừa hoàn thành
    const typedWords = normalizedValue.split(' ');
    const prevTypedWords = typedText.split(' ');
    if (typedWords.length > prevTypedWords.length) {
      const completedWordIdx = prevTypedWords.length - 1;
      const completedWord = currentWords[completedWordIdx];
      const completedTyped = typedWords[completedWordIdx];
      if (completedWord && completedTyped === completedWord) {
        audio.speakWord(completedWord);
      }
    }

    // Đồng bộ ngược lại giá trị đã chuẩn hóa vào input element
    if (e.target.value !== normalizedValue && inputRef.current) {
      inputRef.current.value = normalizedValue;
    }

    // Tự động nối thêm từ vựng nếu đang ở chế độ gõ vô tận và gõ gần hết từ
    if (infinite) {
      const currentWordIndex = normalizedValue ? normalizedValue.split(' ').length - 1 : 0;
      if (currentWordIndex >= currentWords.length - 8) {
        // Lấy thêm 20 từ ngẫu nhiên nối vào đuôi
        const newWords: string[] = [];
        const shuffled = [...wordsList].sort(() => 0.5 - Math.random());
        while (newWords.length < 20) {
          newWords.push(...shuffled);
        }
        const appended = newWords.slice(0, 20);
        setCurrentWords(prev => [...prev, ...appended]);
        setText(prev => prev + ' ' + appended.join(' '));
      }
    } else {
      // Kiểm tra xem đã hoàn thành toàn bộ văn bản chưa
      if (currentLen >= text.length) {
        setEndTime(Date.now());
        setIsFinished(true);
        // Phát âm từ cuối cùng của bài học
        const lastWord = currentWords[currentWords.length - 1];
        if (lastWord) {
          audio.speakWord(lastWord);
        }
      }
    }
  };

  // Tính toán các chỉ số
  const getStats = () => {
    const timeElapsed = startTime 
      ? ((endTime || Date.now()) - startTime) / 1000 / 60 // Tính bằng phút
      : 0;

    // Đếm số ký tự gõ đúng tính đến thời điểm hiện tại
    let correctChars = 0;
    const checkLength = Math.min(typedText.length, text.length);
    for (let i = 0; i < checkLength; i++) {
      if (typedText[i] === text[i]) {
        correctChars++;
      }
    }

    // WPM = (số ký tự đúng / 5) / thời gian trôi qua (phút)
    const wpm = timeElapsed > 0 
      ? Math.round((correctChars / 5) / timeElapsed) 
      : 0;

    // Raw WPM = (tổng số ký tự đã gõ / 5) / thời gian trôi qua (phút)
    const rawWpm = timeElapsed > 0 
      ? Math.round((totalTyped / 5) / timeElapsed) 
      : 0;

    // Accuracy = (số ký tự đúng / tổng số ký tự đã gõ) * 100
    const accuracy = totalTyped > 0 
      ? Math.round((correctChars / totalTyped) * 100) 
      : 100;

    return {
      wpm,
      rawWpm,
      accuracy,
      errors,
      time: timeElapsed * 60, // Tính bằng giây
      correctChars,
      totalTyped
    };
  };

  // Lắng nghe phím nhấn xuống để cập nhật bàn phím ảo
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    let key = e.key;

    // Đổi tên một số phím đặc biệt để đồng bộ với bàn phím ảo
    if (key === ' ') key = 'Space';
    
    setLastKey(key);
    setActiveKeys(prev => {
      const next = new Set(prev);
      next.add(key.toLowerCase());
      next.add(key); // lưu cả chữ hoa chữ thường
      return next;
    });

    // Tự động focus vào input ẩn khi người dùng gõ bất kỳ phím nào (trừ các phím tắt trình duyệt)
    if (
      !e.ctrlKey && 
      !e.metaKey && 
      !e.altKey && 
      e.key !== 'Tab' && 
      inputRef.current && 
      document.activeElement !== inputRef.current
    ) {
      inputRef.current.focus();
    }
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    let key = e.key;
    if (key === ' ') key = 'Space';

    setActiveKeys(prev => {
      const next = new Set(prev);
      next.delete(key.toLowerCase());
      next.delete(key);
      return next;
    });
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // Xác định ký tự hiện tại cần gõ
  const nextChar = text[typedText.length] || '';

  const forceFinish = useCallback(() => {
    setEndTime(Date.now());
    setIsFinished(true);
  }, []);

  return {
    currentWords,
    text,
    typedText,
    isFinished,
    inputRef,
    nextChar,
    lastKey,
    activeKeys,
    handleInputChange,
    reset: initLesson,
    forceFinish,
    stats: getStats()
  };
};
