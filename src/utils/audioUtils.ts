/**
 * Client-side audio recording and playback utilities for JubaLingua AI
 */

// Convert a Float32Array PCM to 16-bit WAV or base64
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // strip "data:audio/...;base64," prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Browser Text-To-Speech fallback for English, Arabic, and phonetic simulation
export function speakWithBrowser(text: string, langHint: string = 'en'): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9; // Slightly slower for clear phonetic cadence
  utterance.pitch = 1.0;

  if (langHint === 'arabic_standard') {
    utterance.lang = 'ar-SA';
  } else if (langHint === 'english') {
    utterance.lang = 'en-US';
  } else {
    // For indigenous languages where native browser voices don't exist yet,
    // we play at an articulate, deliberate pace
    utterance.lang = 'en-GB';
  }

  window.speechSynthesis.speak(utterance);
}

// Play base64 audio stream
export function playBase64Audio(base64: string, mimeType: string = 'audio/mp3'): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const audioUrl = `data:${mimeType};base64,${base64}`;
      const audio = new Audio(audioUrl);
      audio.onended = () => resolve();
      audio.onerror = (e) => reject(e);
      audio.play().catch(reject);
    } catch (err) {
      reject(err);
    }
  });
}
