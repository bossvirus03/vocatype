import React from 'react';

interface KeyboardProps {
  activeKeys: Set<string>;
  nextChar: string;
}

// Định nghĩa cấu trúc thông tin của một phím
interface KeyInfo {
  key: string;       // Nhãn hiển thị trên phím
  code: string;      // Mã định danh phím (sử dụng để so khớp với event.key)
  fingerClass: string; // Lớp CSS chỉ định ngón tay phụ trách
  widthClass?: string; // Lớp CSS chỉ định độ rộng phím (ví dụ: tab, enter, space)
}

export const Keyboard: React.FC<KeyboardProps> = ({ activeKeys, nextChar }) => {

  // Hàm loại bỏ dấu tiếng Việt để lấy ký tự gốc nhằm gợi ý phím ảo
  const getBaseLatinChar = (char: string): string => {
    if (!char) return '';
    const lower = char.toLowerCase();
    
    // Bản đồ ánh xạ nguyên âm tiếng Việt có dấu sang ký tự gốc QWERTY
    if ('áàảãạâấầẩẫậăắằẳẵặ'.includes(lower)) return 'a';
    if ('éèẻẽẹêếềểễệ'.includes(lower)) return 'e';
    if ('íìỉĩị'.includes(lower)) return 'i';
    if ('óòỏõọôốồổỗộơớờởỡợ'.includes(lower)) return 'o';
    if ('úùủũụưứừửữự'.includes(lower)) return 'u';
    if ('ýỳỷỹỵ'.includes(lower)) return 'y';
    if (lower === 'đ') return 'd';
    
    return lower;
  };

  // Xác định các phím cần highlight dựa trên nextChar
  const getHighlightKeys = (): string[] => {
    if (!nextChar) return [];
    
    if (nextChar === ' ') return ['space'];
    
    const baseChar = getBaseLatinChar(nextChar);
    const keysToHighlight = [baseChar];

    // Nếu là chữ in hoa, highlight thêm phím Shift
    if (nextChar !== ' ' && nextChar === nextChar.toUpperCase() && nextChar.toLowerCase() !== nextChar.toUpperCase()) {
      keysToHighlight.push('shift');
    }

    return keysToHighlight;
  };

  const highlightKeys = getHighlightKeys();

  // Bố cục bàn phím chuẩn ANSI QWERTY chia làm 5 hàng
  const keyboardRows: KeyInfo[][] = [
    // Hàng 1
    [
      { key: '~', code: '`', fingerClass: 'f-pinky-l' },
      { key: '1', code: '1', fingerClass: 'f-pinky-l' },
      { key: '2', code: '2', fingerClass: 'f-ring-l' },
      { key: '3', code: '3', fingerClass: 'f-middle-l' },
      { key: '4', code: '4', fingerClass: 'f-index-l' },
      { key: '5', code: '5', fingerClass: 'f-index-l' },
      { key: '6', code: '6', fingerClass: 'f-index-r' },
      { key: '7', code: '7', fingerClass: 'f-index-r' },
      { key: '8', code: '8', fingerClass: 'f-middle-r' },
      { key: '9', code: '9', fingerClass: 'f-ring-r' },
      { key: '0', code: '0', fingerClass: 'f-pinky-r' },
      { key: '-', code: '-', fingerClass: 'f-pinky-r' },
      { key: '+', code: '=', fingerClass: 'f-pinky-r' },
      { key: 'Backspace', code: 'backspace', fingerClass: 'f-pinky-r', widthClass: 'w-backspace' }
    ],
    // Hàng 2
    [
      { key: 'Tab', code: 'tab', fingerClass: 'f-pinky-l', widthClass: 'w-tab' },
      { key: 'Q', code: 'q', fingerClass: 'f-pinky-l' },
      { key: 'W', code: 'w', fingerClass: 'f-ring-l' },
      { key: 'E', code: 'e', fingerClass: 'f-middle-l' },
      { key: 'R', code: 'r', fingerClass: 'f-index-l' },
      { key: 'T', code: 't', fingerClass: 'f-index-l' },
      { key: 'Y', code: 'y', fingerClass: 'f-index-r' },
      { key: 'U', code: 'u', fingerClass: 'f-index-r' },
      { key: 'I', code: 'i', fingerClass: 'f-middle-r' },
      { key: 'O', code: 'o', fingerClass: 'f-ring-r' },
      { key: 'P', code: 'p', fingerClass: 'f-pinky-r' },
      { key: '[', code: '[', fingerClass: 'f-pinky-r' },
      { key: ']', code: ']', fingerClass: 'f-pinky-r' },
      { key: '\\', code: '\\', fingerClass: 'f-pinky-r', widthClass: 'w-backslash' }
    ],
    // Hàng 3
    [
      { key: 'Caps Lock', code: 'capslock', fingerClass: 'f-pinky-l', widthClass: 'w-caps' },
      { key: 'A', code: 'a', fingerClass: 'f-pinky-l' },
      { key: 'S', code: 's', fingerClass: 'f-ring-l' },
      { key: 'D', code: 'd', fingerClass: 'f-middle-l' },
      { key: 'F', code: 'f', fingerClass: 'f-index-l' },
      { key: 'G', code: 'g', fingerClass: 'f-index-l' },
      { key: 'H', code: 'h', fingerClass: 'f-index-r' },
      { key: 'J', code: 'j', fingerClass: 'f-index-r' },
      { key: 'K', code: 'k', fingerClass: 'f-middle-r' },
      { key: 'L', code: 'l', fingerClass: 'f-ring-r' },
      { key: ';', code: ';', fingerClass: 'f-pinky-r' },
      { key: "'", code: "'", fingerClass: 'f-pinky-r' },
      { key: 'Enter', code: 'enter', fingerClass: 'f-pinky-r', widthClass: 'w-enter' }
    ],
    // Hàng 4
    [
      { key: 'Shift', code: 'shift', fingerClass: 'f-pinky-l', widthClass: 'w-lshift' },
      { key: 'Z', code: 'z', fingerClass: 'f-pinky-l' },
      { key: 'X', code: 'x', fingerClass: 'f-ring-l' },
      { key: 'C', code: 'c', fingerClass: 'f-middle-l' },
      { key: 'V', code: 'v', fingerClass: 'f-index-l' },
      { key: 'B', code: 'b', fingerClass: 'f-index-l' },
      { key: 'N', code: 'n', fingerClass: 'f-index-r' },
      { key: 'M', code: 'm', fingerClass: 'f-index-r' },
      { key: ',', code: ',', fingerClass: 'f-middle-r' },
      { key: '.', code: '.', fingerClass: 'f-ring-r' },
      { key: '/', code: '/', fingerClass: 'f-pinky-r' },
      { key: 'Shift', code: 'shift', fingerClass: 'f-pinky-r', widthClass: 'w-rshift' }
    ],
    // Hàng 5
    [
      { key: 'Ctrl', code: 'control', fingerClass: 'f-pinky-l', widthClass: 'w-ctrl' },
      { key: 'Alt', code: 'alt', fingerClass: 'f-thumb', widthClass: 'w-alt' },
      { key: 'Space', code: 'space', fingerClass: 'f-thumb', widthClass: 'w-space' },
      { key: 'Alt', code: 'alt', fingerClass: 'f-thumb', widthClass: 'w-alt' },
      { key: 'Ctrl', code: 'control', fingerClass: 'f-pinky-r', widthClass: 'w-ctrl' }
    ]
  ];

  return (
    <div className="keyboard-container glass-card">
      {keyboardRows.map((row, rowIndex) => (
        <div key={rowIndex} className="keyboard-row">
          {row.map((keyInfo, keyIndex) => {
            const isPressed = activeKeys.has(keyInfo.code.toLowerCase()) || activeKeys.has(keyInfo.key.toLowerCase());
            const isTarget = highlightKeys.includes(keyInfo.code.toLowerCase()) || highlightKeys.includes(keyInfo.key.toLowerCase());
            
            let keyClass = `key-cap ${keyInfo.fingerClass}`;
            if (keyInfo.widthClass) keyClass += ` ${keyInfo.widthClass}`;
            if (isPressed) keyClass += ' pressed';
            if (isTarget) keyClass += ' target pulsing-glow';

            // Đặt điểm định vị (homing bar) trên phím F và J cho gõ 10 ngón chuẩn
            const hasHomingBar = keyInfo.key === 'F' || keyInfo.key === 'J';

            return (
              <div key={keyIndex} className={keyClass}>
                <span className="key-label">{keyInfo.key}</span>
                {hasHomingBar && <span className="homing-bar"></span>}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Keyboard;
