import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Check, ArrowRight, Play, GraduationCap, ChevronRight } from 'lucide-react';
import { useTypingEngine } from '../hooks/useTypingEngine';
import TypingArea from './TypingArea';
import { useToast } from '../contexts/ToastContext';
import { DOMAIN_ICONS } from '../utils/domainIcons';

interface OnboardingProps {
  onComplete: () => void;
}

const AVAILABLE_DOMAINS = [
  { id: 'LIFE', name: 'Đời sống (Daily Life)', desc: 'Từ vựng thông dụng hàng ngày' },
  { id: 'COMMUNICATION', name: 'Giao tiếp (Communication)', desc: 'Từ đàm thoại, thuyết trình' },
  { id: 'BUSINESS', name: 'Kinh doanh (Business)', desc: 'Thương mại, tài chính, công sở' },
  { id: 'MEDICINE', name: 'Y học & Sức khỏe (Medicine)', desc: 'Y tế, cơ thể và điều trị' },
  { id: 'TECHNOLOGY', name: 'Công nghệ (Technology)', desc: 'Phần cứng, phần mềm, Internet' },
  { id: 'SCIENCE', name: 'Khoa học (Science)', desc: 'Vật lý, hóa học, sinh học' },
  { id: 'TRAVEL', name: 'Du lịch (Travel)', desc: 'Khách sạn, địa lý, dịch chuyển' },
  { id: 'FOOD', name: 'Ẩm thực (Food & Dining)', desc: 'Món ăn, nấu nướng, ăn uống' },
  { id: 'SPORTS', name: 'Thể thao (Sports)', desc: 'Bộ môn thể thao, thi đấu' },
  { id: 'ART', name: 'Nghệ thuật (Art & Design)', desc: 'Hội họa, điêu khắc, mỹ thuật' },
  { id: 'MUSIC', name: 'Âm nhạc (Music)', desc: 'Nhạc cụ, thể loại, ca hát' },
  { id: 'EDUCATION', name: 'Giáo dục (Education)', desc: 'Trường học, giảng dạy, học tập' },
  { id: 'ENVIRONMENT', name: 'Môi trường (Environment)', desc: 'Sinh thái, biến đổi, bảo tồn' },
  { id: 'POLITICS', name: 'Chính trị (Politics)', desc: 'Chính phủ, bang giao, pháp chế' },
  { id: 'FASHION', name: 'Thời trang (Fashion)', desc: 'Trang phục, xu hướng, may mặc' },
  { id: 'FINANCE', name: 'Tài chính (Finance)', desc: 'Ngân hàng, chứng khoán, đầu tư' },
  { id: 'HISTORY', name: 'Lịch sử (History)', desc: 'Khảo cổ, sự kiện cổ đại' },
  { id: 'LITERATURE', name: 'Văn học (Literature)', desc: 'Tác phẩm, tác giả, nghiên cứu' },
  { id: 'LAW', name: 'Pháp luật (Law)', desc: 'Tòa án, hiến pháp, pháp lý' },
  { id: 'ENTERTAINMENT', name: 'Giải trí (Entertainment)', desc: 'Điện ảnh, phim ảnh, hoạt náo' }
];

const TEST_WORDS = [
  'dog', 'happy',          // A1
  'airport', 'beautiful',  // A2
  'journey', 'prepare',    // B1
  'courage', 'resilience', // B2
  'meticulous', 'foster',  // C1
  'esoteric', 'plethora'   // C2
];

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const { updateFavoriteDomains, savePlacementTest, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [testStarted, setTestStarted] = useState<boolean>(false);
  const [testScore, setTestScore] = useState<{ correct: number; level: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Khởi tạo engine gõ thử cho bài test
  const { text, typedText, isFinished, inputRef, handleInputChange, stats, reset } = useTypingEngine({
    wordsList: TEST_WORDS,
    lessonLength: TEST_WORDS.length
  });

  const toggleDomain = (id: string) => {
    setSelectedDomains(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const handleNextStep1 = async () => {
    if (selectedDomains.length === 0) return;
    setIsSubmitting(true);
    try {
      await updateFavoriteDomains(selectedDomains);
      setStep(2);
    } catch (err) {
      showToast('Đã xảy ra lỗi, vui lòng thử lại.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipTest = async () => {
    setIsSubmitting(true);
    try {
      // Mặc định cho bắt đầu từ A1 nếu bỏ qua test
      await savePlacementTest(0);
      onComplete();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tính toán kết quả bài test xếp lớp
  const handleFinishTest = async () => {
    const targetWords = TEST_WORDS;
    const typedWords = typedText.trim().split(' ');
    let correctCount = 0;
    
    targetWords.forEach((word, idx) => {
      if (typedWords[idx] === word) {
        correctCount++;
      }
    });

    const ratio = correctCount / targetWords.length;
    let computedLevel = 'A1';
    if (ratio >= 0.8) {
      computedLevel = 'B2';
    } else if (ratio >= 0.6) {
      computedLevel = 'B1';
    } else if (ratio >= 0.4) {
      computedLevel = 'A2';
    }

    setTestScore({ correct: correctCount, level: computedLevel });
    setStep(3);

    try {
      await savePlacementTest(ratio);
    } catch (err) {
      console.error(err);
    }
  };

  // Lắng nghe khi hoàn thành bài test gõ
  React.useEffect(() => {
    if (isFinished && testStarted && step === 2) {
      handleFinishTest();
    }
  }, [isFinished, testStarted, step]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 dark:bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass rounded-3xl max-w-3xl w-full p-8 shadow-2xl relative overflow-hidden animate-fade-in">
        
        {/* Step Indicators */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step === s
                  ? 'w-8 bg-violet-500'
                  : step > s
                  ? 'w-4 bg-emerald-500'
                  : 'w-4 bg-slate-300 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* ── BƯỚC 1: CHỌN LĨNH VỰC ƯA THÍCH ── */}
        {step === 1 && (
          <div className="animate-fade-in">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Chào mừng bạn đến với VocaType! 👋</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Hãy chọn các lĩnh vực bạn yêu thích để chúng tôi cá nhân hóa bài tập.</p>
            </div>

            {/* Grid 20 Domains nhỏ gọn có scrollbar */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 mb-6 max-h-[300px] overflow-y-auto pr-1">
              {AVAILABLE_DOMAINS.map(domain => {
                const isSelected = selectedDomains.includes(domain.id);
                return (
                  <button
                    key={domain.id}
                    onClick={() => toggleDomain(domain.id)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all duration-200
                      ${isSelected
                        ? 'bg-violet-600/10 border-violet-500 text-violet-500 dark:text-violet-400'
                        : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20'
                      }`}
                  >
                    {(() => {
                      const Icon = DOMAIN_ICONS[domain.id];
                      return Icon ? <Icon size={18} className="shrink-0 mt-0.5 text-violet-500 dark:text-violet-400" /> : null;
                    })()}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-semibold leading-tight truncate">{domain.name}</span>
                        {isSelected && (
                          <span className="w-4 h-4 rounded-full bg-violet-500 flex items-center justify-center text-white shrink-0">
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

            <button
              onClick={handleNextStep1}
              disabled={selectedDomains.length === 0 || isSubmitting}
              className={`w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200
                ${selectedDomains.length > 0
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-500 text-white shadow-lg shadow-violet-500/25 hover:opacity-90 active:scale-[0.98]'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                }`}
            >
              Tiếp tục <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* ── BƯỚC 2: PLACEMENT TEST (TEST TRÌNH ĐỘ) ── */}
        {step === 2 && (
          <div className="animate-fade-in">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center justify-center gap-2">
                <GraduationCap className="text-violet-500" />
                Kiểm tra trình độ xếp lớp
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Hãy hoàn thành bài test gõ nhanh này để chúng tôi biết bạn đang ở trình độ tiếng Anh nào (từ A1 đến C2).
              </p>
            </div>

            {!testStarted ? (
              <div className="text-center p-8 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 mb-6">
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-4 space-y-2">
                  <p>• Bài test gồm <strong>12 từ vựng</strong> sắp xếp từ dễ đến khó.</p>
                  <p>• Bạn sẽ gõ tuần tự các từ hiển thị trên màn hình.</p>
                  <p>• Độ chính xác sẽ quyết định cấp độ bắt đầu của bạn.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => setTestStarted(true)}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-500 text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-lg shadow-violet-500/20 active:scale-95 transition-all"
                  >
                    <Play size={15} /> Bắt đầu Test
                  </button>
                  <button
                    onClick={handleSkipTest}
                    disabled={isSubmitting}
                    className="text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-semibold text-xs px-4 py-3 rounded-xl hover:bg-slate-200 dark:hover:bg-white/5 transition-all"
                  >
                    Bỏ qua (Bắt đầu từ A1)
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4 mb-6">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Tiến trình test: {typedText.split(' ').length - 1} / 12 từ</span>
                  <span className="font-semibold text-violet-400">Cố gắng gõ chính xác nhất có thể</span>
                </div>
                
                <TypingArea
                  text={text}
                  typedText={typedText}
                  isFinished={isFinished}
                  inputRef={inputRef}
                  handleInputChange={handleInputChange}
                />
              </div>
            )}
          </div>
        )}

        {/* ── BƯỚC 3: HIỂN THỊ KẾT QUẢ XẾP LỚP ── */}
        {step === 3 && testScore && (
          <div className="text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-500 mx-auto mb-4">
              <GraduationCap size={32} />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Đã hoàn thành xếp lớp! 🎉</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Bạn đã gõ chính xác <strong>{testScore.correct} / 12 từ vựng</strong> trong bài test.
            </p>

            <div className="inline-flex flex-col items-center p-6 rounded-2xl bg-violet-500/10 border border-violet-500/25 mb-8">
              <span className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-1">Cấp độ của bạn</span>
              <span className="text-5xl font-black text-violet-500 dark:text-violet-400 leading-none mb-2">{testScore.level}</span>
              <span className="text-xs text-slate-600 dark:text-slate-300">
                {testScore.level === 'B2' && 'Trung cấp cấp cao - Đã có nền tảng từ vựng khá.'}
                {testScore.level === 'B1' && 'Trung cấp - Có thể gõ và hiểu từ vựng cơ bản.'}
                {testScore.level === 'A2' && 'Sơ cấp - Thích hợp để củng cố các cấu trúc từ thông dụng.'}
                {testScore.level === 'A1' && 'Cơ bản - Bắt đầu xây dựng nền tảng từ những từ vựng đơn giản nhất.'}
              </span>
            </div>

            <button
              onClick={() => {
                refreshProfile().then(() => onComplete());
              }}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-violet-500/30 hover:opacity-90 active:scale-95 transition-all"
            >
              Bắt đầu Học tập ngay <ChevronRight size={16} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
