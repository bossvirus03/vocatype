// Trình tổng hợp âm thanh bằng Web Audio API để giả lập tiếng click bàn phím cơ và âm báo lỗi
// Hỗ trợ nhiều loại Mechanical Switches (Blue, Brown, Red) và tuỳ chỉnh Volume

export type SwitchType = 'blue' | 'brown' | 'red';

class AudioManager {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = true;
  private volume: number = 0.5;
  private switchType: SwitchType = 'blue';

  private isTtsEnabled: boolean = true;

  constructor() {
    // Đọc trạng thái TTS từ localStorage nếu có
    const savedTts = localStorage.getItem('vocatype-tts-enabled');
    this.isTtsEnabled = savedTts ? savedTts === 'true' : true;
  }

  public setTtsEnabled(enabled: boolean) {
    this.isTtsEnabled = enabled;
    localStorage.setItem('vocatype-tts-enabled', String(enabled));
  }

  public getTtsEnabled(): boolean {
    return this.isTtsEnabled;
  }

  // Phát âm từ vựng tiếng Anh bằng công nghệ Text-to-Speech của trình duyệt
  public speakWord(word: string) {
    if (!this.isEnabled || !this.isTtsEnabled) return;
    try {
      // Hủy bỏ các từ đang đọc dở để đọc từ mới ngay lập tức
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        
        // Loại bỏ ký tự không chuẩn trước khi đọc
        const cleanWord = word.replace(/[^a-zA-Z'-]/g, '');
        if (!cleanWord) return;

        const utterance = new SpeechSynthesisUtterance(cleanWord);
        utterance.lang = 'en-US';
        utterance.rate = 0.85; // Đọc chậm một chút cho rõ âm
        utterance.volume = this.volume;
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.warn('Không thể phát âm từ vựng:', e);
    }
  }

  private initContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  public getEnabled(): boolean {
    return this.isEnabled;
  }

  public setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  public getVolume(): number {
    return this.volume;
  }

  public setSwitchType(type: SwitchType) {
    console.log('AudioManager: setSwitchType called with', type);
    this.switchType = type;
  }

  public getSwitchType(): SwitchType {
    return this.switchType;
  }

  // Giả lập tiếng click cơ học dựa trên loại switch được chọn
  public playClick() {
    if (!this.isEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      console.log('AudioManager: playing click with switchType =', this.switchType, 'volume =', this.volume);

      const now = this.ctx.currentTime;
      
      // 1. Tạo nguồn nhiễu Noise cho tiếng động cơ học
      const noiseGain = this.ctx.createGain();
      const noiseDuration = this.switchType === 'red' ? 0.025 : this.switchType === 'brown' ? 0.035 : 0.045;
      
      noiseGain.gain.setValueAtTime(0, now);
      noiseGain.gain.linearRampToValueAtTime(this.volume * (this.switchType === 'blue' ? 0.35 : 0.25), now + 0.001);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + noiseDuration);

      const bufferSize = this.ctx.sampleRate * noiseDuration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = buffer;

      // Thiết lập Bộ lọc tần số (Filter) cho Noise
      const filterNode = this.ctx.createBiquadFilter();
      filterNode.type = 'bandpass';
      
      if (this.switchType === 'blue') {
        filterNode.frequency.setValueAtTime(1500, now);
        filterNode.Q.setValueAtTime(4, now);
      } else if (this.switchType === 'brown') {
        filterNode.frequency.setValueAtTime(750, now);
        filterNode.Q.setValueAtTime(2.5, now);
      } else {
        // Red Switch
        filterNode.frequency.setValueAtTime(350, now);
        filterNode.Q.setValueAtTime(1.5, now);
      }

      noiseSource.connect(filterNode);
      filterNode.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      noiseSource.start(now);
      noiseSource.stop(now + noiseDuration);

      // 2. Thêm Sine Wave Oscillator để giả lập tiếng click kim loại hoặc tiếng bụp
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      
      osc.type = 'sine';

      if (this.switchType === 'blue') {
        osc.frequency.setValueAtTime(1800, now);
        osc.frequency.exponentialRampToValueAtTime(900, now + 0.025);
        oscGain.gain.setValueAtTime(this.volume * 0.22, now);
        oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);
      } else if (this.switchType === 'brown') {
        osc.frequency.setValueAtTime(900, now);
        osc.frequency.exponentialRampToValueAtTime(450, now + 0.02);
        oscGain.gain.setValueAtTime(this.volume * 0.15, now);
        oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);
      } else {
        // Red Switch
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.015);
        oscGain.gain.setValueAtTime(this.volume * 0.12, now);
        oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);
      }

      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.03);
    } catch (e) {
      console.warn('Không thể phát âm thanh click:', e);
    }
  }

  // Giả lập âm thanh báo lỗi gõ sai (Error Buzz)
  public playError() {
    if (!this.isEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(130, now); // Tần số trầm
      osc.frequency.linearRampToValueAtTime(110, now + 0.12);

      gainNode.gain.setValueAtTime(this.volume * 0.35, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

      // Lọc bớt tần số quá cao để âm thanh ấm hơn, không bị chói tai
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, now);

      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {
      console.warn('Không thể phát âm thanh lỗi:', e);
    }
  }
}

export const audio = new AudioManager();
export default audio;
