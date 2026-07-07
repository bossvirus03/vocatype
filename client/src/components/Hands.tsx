import React from 'react';

interface HandsProps {
  nextChar: string;
}

export const Hands: React.FC<HandsProps> = ({ nextChar }) => {

  // Loại bỏ dấu tiếng Việt để ánh xạ sang phím Latinh gốc
  const getBaseLatinChar = (char: string): string => {
    if (!char) return '';
    const lower = char.toLowerCase();
    
    if ('áàảãạâấầẩẫậăắằẳẵặ'.includes(lower)) return 'a';
    if ('éèẻẽẹêếềểễệ'.includes(lower)) return 'e';
    if ('íìỉĩị'.includes(lower)) return 'i';
    if ('óòỏõọôốồổỗộơớờởỡợ'.includes(lower)) return 'o';
    if ('úùủũụưứừửữự'.includes(lower)) return 'u';
    if ('ýỳỷỹỵ'.includes(lower)) return 'y';
    if (lower === 'đ') return 'd';
    
    return lower;
  };

  // Xác định ngón tay nào phụ trách ký tự hiện tại
  const getFingerClass = (char: string): string => {
    if (!char) return '';
    if (char === ' ') return 'f-thumb';

    const base = getBaseLatinChar(char);

    // Bảng ngón tay trái
    if ('`1qaz'.includes(base)) return 'f-pinky-l';
    if ('2wsx'.includes(base)) return 'f-ring-l';
    if ('3edc'.includes(base)) return 'f-middle-l';
    if ('45rtfgvb'.includes(base)) return 'f-index-l';

    // Bảng ngón tay phải
    if ('67yuhjnm'.includes(base)) return 'f-index-r';
    if ('8ik,'.includes(base)) return 'f-middle-r';
    if ('9ol.'.includes(base)) return 'f-ring-r';
    if ('0-p[];\'/\\'.includes(base) || base === '=' || base === 'enter' || base === 'backspace') return 'f-pinky-r';

    return '';
  };

  const targetFinger = getFingerClass(nextChar);

  // SVG Helper vẽ ngón tay với hiệu ứng làm sáng
  const renderFinger = (
    id: string,
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    transform: string,
    fingerType: string,
    label: string
  ) => {
    const isActive = targetFinger === fingerType;
    return (
      <g id={id} className={`hand-finger-group ${fingerType} ${isActive ? 'active' : ''}`}>
        {/* Glow ring */}
        {isActive && (
          <ellipse
            cx={cx}
            cy={cy}
            rx={rx + 4}
            ry={ry + 4}
            transform={transform}
            className="finger-glow"
          />
        )}
        {/* Ngón tay thực tế */}
        <ellipse
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
          transform={transform}
          className="finger-shape"
        />
        {/* Chữ hiển thị tên ngón viết tắt */}
        {isActive && (
          <text
            x={cx}
            y={cy + (label === 'Cái' ? 15 : -15)}
            textAnchor="middle"
            className="finger-label"
            transform={transform}
          >
            {label}
          </text>
        )}
      </g>
    );
  };

  return (
    <div className="hands-container glass-card">
      <div className="hands-wrapper">
        
        {/* BÀN TAY TRÁI (LEFT HAND) */}
        <div className="hand-box">
          <span className="hand-title">Tay trái</span>
          <svg viewBox="0 0 200 200" className="hand-svg">
            {/* Lòng bàn tay (Palm) */}
            <path
              d="M 40,160 C 40,130 50,110 70,105 C 80,105 100,110 110,120 C 120,130 125,150 120,170 C 115,185 90,195 70,195 C 50,195 40,180 40,160 Z"
              className="hand-palm"
            />
            {/* Cổ tay */}
            <path d="M 50,190 L 95,190 L 90,210 L 55,210 Z" className="hand-wrist" />
            
            {/* Ngón út trái (Pinky L) */}
            {renderFinger('pinky-l', 25, 100, 7, 25, 'rotate(-20 25 100)', 'f-pinky-l', 'Út')}
            {/* Ngón áp út trái (Ring L) */}
            {renderFinger('ring-l', 48, 80, 8, 32, 'rotate(-10 48 80)', 'f-ring-l', 'Áp Út')}
            {/* Ngón giữa trái (Middle L) */}
            {renderFinger('middle-l', 75, 70, 8.5, 36, 'rotate(0 75 70)', 'f-middle-l', 'Giữa')}
            {/* Ngón trỏ trái (Index L) */}
            {renderFinger('index-l', 103, 78, 8, 32, 'rotate(10 103 78)', 'f-index-l', 'Trỏ')}
            {/* Ngón cái trái (Thumb L) */}
            {renderFinger('thumb-l', 135, 130, 9, 22, 'rotate(35 135 130)', 'f-thumb', 'Cái')}
          </svg>
        </div>

        {/* BÀN TAY PHẢI (RIGHT HAND) */}
        <div className="hand-box">
          <span className="hand-title">Tay phải</span>
          <svg viewBox="0 0 200 200" className="hand-svg">
            {/* Lòng bàn tay (Palm) */}
            <path
              d="M 160,160 C 160,130 150,110 130,105 C 120,105 100,110 90,120 C 80,130 75,150 80,170 C 85,185 110,195 130,195 C 150,195 160,180 160,160 Z"
              className="hand-palm"
            />
            {/* Cổ tay */}
            <path d="M 150,190 L 105,190 L 110,210 L 145,210 Z" className="hand-wrist" />

            {/* Ngón cái phải (Thumb R) */}
            {renderFinger('thumb-r', 65, 130, 9, 22, 'rotate(-35 65 130)', 'f-thumb', 'Cái')}
            {/* Ngón trỏ phải (Index R) */}
            {renderFinger('index-r', 97, 78, 8, 32, 'rotate(-10 97 78)', 'f-index-r', 'Trỏ')}
            {/* Ngón giữa phải (Middle R) */}
            {renderFinger('middle-r', 125, 70, 8.5, 36, 'rotate(0 125 70)', 'f-middle-r', 'Giữa')}
            {/* Ngón áp út phải (Ring R) */}
            {renderFinger('ring-r', 152, 80, 8, 32, 'rotate(10 152 80)', 'f-ring-r', 'Áp Út')}
            {/* Ngón út phải (Pinky R) */}
            {renderFinger('pinky-r', 175, 100, 7, 25, 'rotate(20 175 100)', 'f-pinky-r', 'Út')}
          </svg>
        </div>

      </div>
    </div>
  );
};

export default Hands;
