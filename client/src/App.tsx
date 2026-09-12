import { useState, useEffect, useCallback } from "react";
import { useTypingEngine } from "./hooks/useTypingEngine";
import { lessons, englishVietnameseDict } from "./utils/wordList";
import Header from "./components/Header";
import TypingArea from "./components/TypingArea";
import type { FontSize, LineCount } from "./components/TypingArea";
import Keyboard from "./components/Keyboard";
import Hands from "./components/Hands";
import Stats from "./components/Stats";
import StudyArea from "./components/StudyArea";
import Sidebar from "./components/Sidebar";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import { Onboarding } from "./components/Onboarding";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Info, HelpCircle, Lock, Trophy } from "lucide-react";
import { audio } from "./utils/audio";
import type { SwitchType } from "./utils/audio";
import { WordDetailModal } from "./components/WordDetailModal";
import { apiUrl } from "./utils/api";

// Đọc Google Client ID từ biến môi trường của Vite (.env)
const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "103859385938-exampleid.apps.googleusercontent.com";

function AppContent() {
  const [activeTab, setActiveTab] = useState<"study" | "type">("study");
  const [currentLessonId, setCurrentLessonId] =
    useState<string>("home-row-basic");

  // Cài đặt hiển thị giao diện gõ (số dòng và cỡ chữ)
  const [fontSize, setFontSize] = useState<FontSize>(() => {
    return (localStorage.getItem("vocatype_font_size") as FontSize) || "sm";
  });
  const [lineCount, setLineCount] = useState<LineCount>(() => {
    const saved = localStorage.getItem("vocatype_line_count");
    return saved ? (parseInt(saved, 10) as LineCount) : 3;
  });

  const handleFontSizeChange = (sz: FontSize) => {
    setFontSize(sz);
    localStorage.setItem("vocatype_font_size", sz);
  };

  const handleLineCountChange = (lines: LineCount) => {
    setLineCount(lines);
    localStorage.setItem("vocatype_line_count", lines.toString());
  };

  // Cài đặt hiển thị nghĩa từ vựng
  const [showMeaning, setShowMeaning] = useState<boolean>(() => {
    const saved = localStorage.getItem("vocatype_show_meaning");
    return saved !== null ? saved === "true" : true;
  });

  const handleShowMeaningToggle = (enabled: boolean) => {
    setShowMeaning(enabled);
    localStorage.setItem("vocatype_show_meaning", String(enabled));
  };
  const [lessonLength, setLessonLength] = useState<number>(20);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [switchType, setSwitchType] = useState<SwitchType>("blue");
  const [volume, setVolume] = useState<number>(0.5);
  const [ttsEnabled, setTtsEnabled] = useState<boolean>(() =>
    audio.getTtsEnabled(),
  );

  const [practiceMode, setPracticeMode] = useState<"rows" | "words">("words");
  const [selectedLevel, setSelectedLevel] = useState<string>("A1");
  const [levels, setLevels] = useState<any[]>([]);

  const [practiceWords, setPracticeWords] = useState<string[]>([
    "hello",
    "world",
  ]);
  const [practiceWordsMetadata, setPracticeWordsMetadata] = useState<any[]>([]);
  const [isLoadingWords, setIsLoadingWords] = useState<boolean>(false);

  // States tra cứu chi tiết từ vựng
  const [selectedWordData, setSelectedWordData] = useState<any | null>(null);
  const [isWordDetailOpen, setIsWordDetailOpen] = useState<boolean>(false);

  const handleWordClick = useCallback(
    (clickedWord: string, index: number) => {
      if (!clickedWord) return;

      // Tìm kiếm trong metadata trước
      let found = practiceWordsMetadata.find(
        (m) =>
          m && m.word && m.word.toLowerCase() === clickedWord.toLowerCase(),
      );

      if (!found) {
        // Tìm trong từ điển local fallback
        const cleanWord = clickedWord.toLowerCase().replace(/[^a-z]/g, "");
        const dictMeanings = englishVietnameseDict[cleanWord];
        found = {
          word: clickedWord,
          definition: dictMeanings || "Hàng phím hoặc ký tự luyện tập.",
          ipa: "",
          example: "",
          exampleTranslation: "",
        };
      }

      setSelectedWordData(found);
      setIsWordDetailOpen(true);
    },
    [practiceWordsMetadata],
  );

  // States từ AuthContext
  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
    refreshProfile,
  } = useAuth();
  const [onboardingCompleted, setOnboardingCompleted] =
    useState<boolean>(false);

  const activeLesson =
    lessons.find((l) => l.id === currentLessonId) || lessons[0];

  useEffect(() => {
    fetch(apiUrl("/words/levels"))
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => (Array.isArray(data) ? setLevels(data) : setLevels([])))
      .catch(() => setLevels([]));
  }, []);

  // Đồng bộ cài đặt âm thanh với AudioManager
  useEffect(() => {
    audio.setEnabled(soundEnabled);
    audio.setSwitchType(switchType);
    audio.setVolume(volume);
    audio.setTtsEnabled(ttsEnabled);
  }, [soundEnabled, switchType, volume, ttsEnabled]);

  const fetchWordsFromAPI = useCallback(
    (level?: string, count: number = 20) => {
      setIsLoadingWords(true);
      const params = new URLSearchParams();
      if (level && level !== "ALL") params.append("level", level);
      params.append("count", count.toString());

      fetch(`${apiUrl("/words/random")}?${params.toString()}`)
        .then((res) => {
          if (!res.ok) throw new Error("Thất bại");
          return res.json();
        })
        .then((data: any[]) => {
          const wordsArray = data.map((item) => item.word);
          const metadataArray = data.map((item) => ({
            word: item.word,
            definition: item.definition,
            ipa: item.ipa,
            example: item.example,
            exampleTranslation: item.exampleTranslation,
            audioUrl: item.audioUrl,
          }));
          if (wordsArray.length > 0) {
            setPracticeWords(wordsArray);
            setPracticeWordsMetadata(metadataArray);
          } else {
            setPracticeWords(["no_words_found"]);
            setPracticeWordsMetadata([]);
          }
          setIsLoadingWords(false);
        })
        .catch(() => {
          setPracticeWords(activeLesson.words);
          setPracticeWordsMetadata([]);
          setIsLoadingWords(false);
        });
    },
    [activeLesson.words],
  );

  const handleLoadMoreWords = useCallback(async (): Promise<string[]> => {
    try {
      const params = new URLSearchParams();
      if (selectedLevel && selectedLevel !== "ALL") params.append("level", selectedLevel);
      params.append("count", "30");

      const res = await fetch(`${apiUrl("/words/random")}?${params.toString()}`);
      if (!res.ok) throw new Error("Lỗi tải từ mới");
      const data: any[] = await res.json();
      const newWords = data.map((item) => item.word);
      const newMetadata = data.map((item) => ({
        word: item.word,
        definition: item.definition,
        ipa: item.ipa,
        example: item.example,
        exampleTranslation: item.exampleTranslation,
        audioUrl: item.audioUrl,
      }));
      setPracticeWordsMetadata((prev) => [...prev, ...newMetadata]);
      return newWords;
    } catch (err) {
      return [];
    }
  }, [selectedLevel]);

  useEffect(() => {
    if (practiceMode === "rows") {
      setPracticeWords(activeLesson.words);
      setPracticeWordsMetadata([]);
    } else {
      fetchWordsFromAPI(selectedLevel, 30);
    }
  }, [
    practiceMode,
    selectedLevel,
    activeLesson.words,
    fetchWordsFromAPI,
  ]);

  const {
    text,
    typedText,
    isFinished,
    inputRef,
    nextChar,
    activeKeys,
    reset,
    handleInputChange,
    stats,
    forceFinish,
  } = useTypingEngine({
    wordsList: practiceWords,
    lessonLength: practiceMode === "rows" ? practiceWords.length : 30,
    infinite: activeTab === "type",
    onLoadMoreWords: handleLoadMoreWords,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activeTab === "type") reset();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [reset, activeTab]);

  const handleSwitchTypeChange = useCallback((type: SwitchType) => {
    setSwitchType(type);
    audio.setSwitchType(type);
    // Phát âm thanh click nghe thử ngay lập tức sau khi cập nhật cấu hình
    setTimeout(() => {
      audio.playClick();
    }, 30);
  }, []);

  const handleLessonChange = (lessonId: string) => {
    setCurrentLessonId(lessonId);
    reset();
  };
  const handleLengthChange = (length: number) => {
    setLessonLength(length);
    reset();
  };
  const handlePracticeModeChange = useCallback(
    (mode: "rows" | "words") => {
      setPracticeMode(mode);
      if (mode === "rows" && activeTab === "study") setActiveTab("type");
      setTimeout(() => reset(), 50);
    },
    [activeTab, reset],
  );

  // Kiểm tra xem User có cần làm Onboarding (chọn domains & test trình độ) không
  const needsOnboarding =
    isAuthenticated &&
    user &&
    user.favoriteDomains.length === 0 &&
    !onboardingCompleted;

  // Kiểm tra xem Tab Luyện gõ tự do (Học tập tự do) đã được mở khóa chưa
  // Mở khóa khi người dùng đạt trình độ C1 hoặc C2 (đã hoàn thành đủ level A1, A2, B1, B2)
  const isFreePracticeUnlocked =
    isAuthenticated && user && ["C1", "C2"].includes(user.currentLevel);

  // Quản lý Drawer Cài đặt & Toggle Bàn phím ảo
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [showKeyboard, setShowKeyboard] = useState<boolean>(true);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-[#0c0d14] text-slate-600 dark:text-slate-300">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
          <span className="text-sm font-medium">Đang nạp VocaType...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden bg-slate-50 dark:bg-[#0c0d14]">
      {/* Hiệu ứng Ambient Glow hậu cảnh */}
      <div className="ambient-glow-bg" />

      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isSettingsOpen={isSettingsOpen}
      />

      {/* Hiển thị Onboarding cho tài khoản mới */}
      {needsOnboarding && (
        <Onboarding
          onComplete={() => {
            setOnboardingCompleted(true);
            refreshProfile();
          }}
        />
      )}

      {/* ── Khung nội dung chính căn giữa thanh lịch ── */}
      <main className="flex-1 max-w-[1020px] mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex flex-col justify-center relative z-10">
        {activeTab === "study" ? (
          <StudyArea
            selectedLevel={selectedLevel}
            levels={levels}
          />
        ) : !isFreePracticeUnlocked ? (
          /* MÀN HÌNH KHÓA CHỨC NĂNG HỌC TẬP TỰ DO */
          <div className="glass rounded-3xl p-10 text-center animate-fade-in max-w-lg mx-auto shadow-2xl">
            <Lock
              size={48}
              className="text-slate-400 dark:text-slate-500 mx-auto mb-4"
            />
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center justify-center gap-2">
              <Trophy className="text-yellow-500" size={20} />
              Học tập tự do đang khóa
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              Bạn cần hoàn thành toàn bộ 20 bài học của mỗi cấp độ{" "}
              <strong className="text-violet-500 font-semibold">A1, A2, B1 và B2</strong> (tổng cộng 80 bài tập) trong
              phần **Học tập** để mở khóa chế độ luyện gõ tự do này.
            </p>
            <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-left">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Cách mở khóa:
              </p>
              <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5 list-disc pl-4 font-sans">
                <li>Đăng nhập tài khoản Google.</li>
                <li>Làm bài test trình độ để xuất phát ở cấp độ phù hợp.</li>
                <li>
                  Vào tab <strong>Học tập</strong> và hoàn thành lộ trình
                  cho tới khi mở khóa được cấp độ <strong>C1</strong>.
                </li>
              </ul>
            </div>
          </div>
        ) : isFinished ? (
          <div className="animate-fade-in">
            <Stats
              stats={stats}
              isFinished={isFinished}
              onRestart={reset}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-5 animate-fade-in">
            {/* Stats bar & Stop Action */}
            <div className="flex items-center justify-between gap-4">
              <Stats
                stats={stats}
                isFinished={isFinished}
                onRestart={reset}
              />
              {activeTab === "type" &&
                !isFinished &&
                typedText.length > 0 && (
                  <button
                    onClick={forceFinish}
                    className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-violet-500/25 active:scale-95 hover:brightness-110 transition-all shrink-0"
                  >
                    🛑 Dừng gõ & Xem điểm
                  </button>
                )}
            </div>

            {/* Typing area trung tâm */}
            {isLoadingWords ? (
              <div className="glass rounded-3xl p-12 flex items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
                <div className="w-5 h-5 border-2 border-violet-500/40 border-t-violet-500 rounded-full animate-spin" />
                <span className="text-sm font-medium">Đang nạp từ vựng...</span>
              </div>
            ) : (
              <TypingArea
                text={text}
                typedText={typedText}
                isFinished={isFinished}
                inputRef={inputRef}
                handleInputChange={handleInputChange}
                wordsMetadata={practiceWordsMetadata}
                onWordClick={handleWordClick}
                fontSize={fontSize}
                lineCount={lineCount}
                showMeaning={showMeaning}
                onFontSizeChange={handleFontSizeChange}
                onLineCountChange={handleLineCountChange}
              />
            )}

            {/* Bàn phím & Bàn tay có Toggle thu gọn */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-end px-1">
                <button
                  onClick={() => setShowKeyboard(!showKeyboard)}
                  className="text-[11px] font-medium text-slate-400 hover:text-violet-500 dark:text-slate-500 dark:hover:text-violet-400 transition-colors flex items-center gap-1.5"
                >
                  <span>{showKeyboard ? 'Ẩn bàn phím ảo' : 'Hiện bàn phím ảo'}</span>
                </button>
              </div>

              {showKeyboard && (
                <div className="glass rounded-3xl p-5 flex flex-col gap-3 transition-all duration-300 animate-fade-in border border-slate-200/80 dark:border-white/10 shadow-xl">
                  <Keyboard activeKeys={activeKeys} nextChar={nextChar} />
                  <Hands nextChar={nextChar} />
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ── Slide-over Drawer Cài đặt ── */}
      <Sidebar
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        activeTab={activeTab}
        soundEnabled={soundEnabled}
        onSoundToggle={setSoundEnabled}
        selectedLevel={selectedLevel}
        onLevelChange={setSelectedLevel}
        levels={levels}
        onReset={reset}
        switchType={switchType}
        onSwitchTypeChange={handleSwitchTypeChange}
        volume={volume}
        onVolumeChange={setVolume}
        ttsEnabled={ttsEnabled}
        onTtsToggle={setTtsEnabled}
        fontSize={fontSize}
        onFontSizeChange={handleFontSizeChange}
        lineCount={lineCount}
        onLineCountChange={handleLineCountChange}
        showMeaning={showMeaning}
        onShowMeaningToggle={handleShowMeaningToggle}
      />

      {/* Footer */}
      <footer className="glass border-t border-slate-200 dark:border-white/10 mt-auto">
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Info size={13} className="text-blue-400" />
              <span>
                Nhấn <strong className="text-violet-400">ESC</strong> để bắt đầu
                lại bài luyện nhanh.
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <HelpCircle size={13} className="text-yellow-400" />
              <span>
                Đặt ngón trỏ trái lên phím <strong>F</strong> và ngón trỏ phải
                lên phím <strong>J</strong>.
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            © 2026 VocaType
          </p>
        </div>
      </footer>

      {/* Modal Tra cứu chi tiết từ vựng khi click */}
      <WordDetailModal
        isOpen={isWordDetailOpen}
        onClose={() => setIsWordDetailOpen(false)}
        wordData={selectedWordData}
      />
    </div>
  );
}

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
