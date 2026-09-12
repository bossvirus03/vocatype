import React, { useState, useEffect, useMemo } from 'react';
import { HelpCircle, CheckCircle, RotateCcw, Lock, Award, BookOpen, ArrowLeft, Brain } from 'lucide-react';
import { useTypingEngine } from '../hooks/useTypingEngine';
import { useAuth } from '../contexts/AuthContext';
import { apiUrl } from '../utils/api';
import TypingArea from './TypingArea';
import Keyboard from './Keyboard';
import Hands from './Hands';
import Stats from './Stats';

interface WordItem {
  id: number; word: string; level: string; ipa: string;
  definition: string; example: string; exampleTranslation: string;
  audioUrl?: string;
}

interface ProgressItem {
  level: string;
  lessonNo: number;
  completed: boolean;
  wpm: number;
  accuracy: number;
}

interface StudyAreaProps {
  selectedLevel: string;
  levels: any[];
}

export const StudyArea: React.FC<StudyAreaProps> = ({
  selectedLevel: initialLevel,
  levels,
}) => {
  const { user, token, saveLessonProgress, isAuthenticated } = useAuth();
  
  // State quản lý tab level đang xem trong StudyArea
  const [activeViewLevel, setActiveViewLevel] = useState<string>('A1');
  const [selectedLessonNo, setSelectedLessonNo] = useState<number | null>(null);
  const [words, setWords] = useState<WordItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [progressList, setProgressList] = useState<ProgressItem[]>([]);
  
  // Chế độ gõ: Standard (gõ thường) hoặc Fill in the Blank (điền từ khuyết)
  const [studyMode, setStudyMode] = useState<'standard' | 'fillBlank'>('standard');

  // Đọc tiến độ học tập từ API
  const fetchProgress = async () => {
    if (!token) return;
    try {
      const res = await fetch(apiUrl('/users/progress'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProgressList(data);
      }
    } catch (err) {
      console.error('Lỗi tải tiến độ học tập:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProgress();
    }
  }, [isAuthenticated, token]);

  // Đồng bộ cấp độ hiển thị ban đầu với cấp độ hiện tại của user
  useEffect(() => {
    if (user?.currentLevel) {
      setActiveViewLevel(user.currentLevel);
    }
  }, [user]);

  // Tải từ vựng của bài học khi người dùng click vào một bài học cụ thể
  useEffect(() => {
    if (selectedLessonNo === null) return;
    setLoading(true);
    
    const headers: any = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    fetch(`${apiUrl('/words/lesson')}?level=${activeViewLevel}&lessonNo=${selectedLessonNo}`, {
      headers
    })
      .then(res => res.json())
      .then((data: WordItem[]) => {
        setWords(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Lỗi tải từ vựng bài học:', err);
        setLoading(false);
      });
  }, [selectedLessonNo, activeViewLevel, token]);

  const wordStrings = useMemo(() => words.length > 0 ? words.map(w => w.word) : ['vocabulary'], [words]);
  const wordsMetadata = useMemo(() => words.map(w => ({
    word: w.word,
    definition: w.definition,
    ipa: w.ipa,
    example: w.example,
    exampleTranslation: w.exampleTranslation,
    audioUrl: w.audioUrl
  })), [words]);

  // Khởi động Typing Engine cho bài học
  const { text, typedText, isFinished, inputRef, nextChar, activeKeys, reset, handleInputChange, stats } =
    useTypingEngine({ wordsList: wordStrings, lessonLength: wordStrings.length });

  // Lưu tiến trình lên server khi hoàn thành bài gõ
  useEffect(() => {
    if (isFinished && selectedLessonNo !== null && isAuthenticated) {
      saveLessonProgress(activeViewLevel, selectedLessonNo, stats.wpm, stats.accuracy).then(() => {
        fetchProgress(); // Tải lại tiến độ để cập nhật dấu tích xanh
      });
    }
  }, [isFinished, selectedLessonNo, activeViewLevel, stats.wpm, stats.accuracy, isAuthenticated]);

  // Kiểm tra khóa level
  const levelsOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const userMaxLevelIdx = user ? levelsOrder.indexOf(user.currentLevel) : 0;

  const isLevelLocked = (levelId: string) => {
    if (!isAuthenticated) return levelId !== 'A1'; // Bắt buộc đăng nhập để xem các level khác
    const levelIdx = levelsOrder.indexOf(levelId);
    return levelIdx > userMaxLevelIdx;
  };

  // Trở lại danh sách bài học
  const handleBackToRoadmap = () => {
    setSelectedLessonNo(null);
    setWords([]);
    reset();
  };

  // Tìm thông tin tiến độ của một bài cụ thể
  const getLessonProgress = (lessonNo: number) => {
    return progressList.find(p => p.level === activeViewLevel && p.lessonNo === lessonNo);
  };

  // Giao diện khi chưa đăng nhập
  if (!isAuthenticated) {
    return (
      <div className="glass rounded-3xl p-10 text-center animate-fade-in max-w-md mx-auto">
        <Lock size={48} className="text-slate-400 dark:text-slate-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Đăng nhập để bắt đầu lộ trình</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Vui lòng đăng nhập bằng Google ở góc trên màn hình để mở khóa toàn bộ lộ trình học tập, làm bài test xếp lớp và lưu tiến độ của bạn.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {selectedLessonNo === null ? (
        /* ── MÀN HÌNH LỘ TRÌNH 20 BÀI HỌC ── */
        <div className="flex flex-col gap-6">
          {/* Tab chọn Cấp độ học */}
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Lộ trình học tập bài bản 🚀</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Hoàn thành đủ 20 bài tập mỗi cấp độ để mở khóa cấp tiếp theo.</p>
            </div>
            
            {/* Chuyển chế độ gõ */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 rounded-xl p-1 border border-slate-200 dark:border-white/15">
              <button
                onClick={() => setStudyMode('standard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                  ${studyMode === 'standard' ? 'bg-white dark:bg-white/10 text-violet-500 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <BookOpen size={13} /> Gõ chép từ
              </button>
              <button
                onClick={() => setStudyMode('fillBlank')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                  ${studyMode === 'fillBlank' ? 'bg-white dark:bg-white/10 text-violet-500 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Brain size={13} /> Điền từ khuyết
              </button>
            </div>
          </div>

          {/* Grid hiển thị các Levels */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {levelsOrder.map(lvlId => {
              const locked = isLevelLocked(lvlId);
              const isActive = activeViewLevel === lvlId;
              
              // Đếm số bài đã hoàn thành
              const completedCount = progressList.filter(p => p.level === lvlId && p.completed).length;

              return (
                <button
                  key={lvlId}
                  disabled={locked}
                  onClick={() => setActiveViewLevel(lvlId)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-200 relative
                    ${isActive
                      ? 'bg-gradient-to-r from-violet-600/10 to-indigo-500/10 border-violet-500 text-violet-500 dark:text-violet-400'
                      : locked
                      ? 'opacity-40 bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 cursor-not-allowed'
                      : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20'
                    }`}
                >
                  <span className="text-lg font-black">{lvlId}</span>
                  <span className="text-[9px] opacity-75 mt-0.5">{completedCount}/20 bài</span>
                  {locked && (
                    <div className="absolute top-1 right-1 w-4 h-4 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500">
                      <Lock size={9} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Lưới 20 bài học */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
              Danh sách bài học - Cấp độ {activeViewLevel}
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 animate-fade-in">
              {Array.from({ length: 20 }, (_, i) => {
                const lessonNo = i + 1;
                const progress = getLessonProgress(lessonNo);
                const isCompleted = !!progress?.completed;

                return (
                  <button
                    key={lessonNo}
                    onClick={() => setSelectedLessonNo(lessonNo)}
                    className={`flex flex-col items-start p-4 rounded-2xl border text-left transition-all duration-200 relative group
                      ${isCompleted
                        ? 'bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/50'
                        : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/5'
                      }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-xs font-bold text-slate-400 group-hover:text-violet-500 transition-colors">Bài {lessonNo}</span>
                      {isCompleted && (
                        <CheckCircle size={14} className="text-emerald-500" />
                      )}
                    </div>
                    
                    {isCompleted ? (
                      <div className="mt-1 flex flex-col gap-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                        <span>WPM: {progress.wpm}</span>
                        <span>Acc: {progress.accuracy}%</span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Chưa hoàn thành</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* ── MÀN HÌNH LUYỆN GÕ BÀI HỌC ── */
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <button
              onClick={handleBackToRoadmap}
              className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-violet-500 transition-colors"
            >
              <ArrowLeft size={14} /> Quay lại Lộ trình
            </button>
            <span className="text-xs font-semibold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-3 py-1 rounded-full">
              Level {activeViewLevel} · Bài {selectedLessonNo} · {studyMode === 'standard' ? 'Gõ thường' : 'Điền từ khuyết'}
            </span>
          </div>

          {loading ? (
            <div className="glass rounded-2xl p-8 flex flex-col items-center gap-3 text-slate-500 dark:text-slate-400">
              <div className="w-6 h-6 border-2 border-violet-500/40 border-t-violet-500 rounded-full animate-spin" />
              <p className="text-sm">Đang tải từ vựng bài học...</p>
            </div>
          ) : isFinished ? (
            /* Kết quả bài học */
            <div className="flex flex-col gap-6">
              <Stats stats={stats} isFinished={isFinished} onRestart={reset} />
              
              <div className="glass rounded-2xl p-6 text-center animate-fade-in flex flex-col items-center gap-4">
                <CheckCircle size={48} className="text-emerald-500" />
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Lưu kết quả thành công!</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Tiến độ bài học đã được đồng bộ hóa với tài khoản của bạn.</p>
                </div>
                <button
                  onClick={handleBackToRoadmap}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-violet-500/30 hover:opacity-90 active:scale-95 transition-all"
                >
                  Trở lại Lộ trình học
                </button>
              </div>
            </div>
          ) : (
            /* Khung gõ bài học */
            <div className="flex flex-col gap-4 animate-fade-in">
              <Stats stats={stats} isFinished={isFinished} onRestart={reset} />

              <TypingArea
                text={text}
                typedText={typedText}
                isFinished={isFinished}
                inputRef={inputRef}
                handleInputChange={handleInputChange}
                wordsMetadata={wordsMetadata}
                fillInBlank={studyMode === 'fillBlank'}
              />

              <div className="glass rounded-2xl p-4 flex flex-col gap-3">
                <Keyboard activeKeys={activeKeys} nextChar={nextChar} />
                <Hands nextChar={nextChar} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudyArea;
