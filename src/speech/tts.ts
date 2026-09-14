/**
 * Web Speech API wrapper for Brazilian Portuguese narration.
 */

export function getPtBRVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  const list = window.speechSynthesis.getVoices();
  return list.filter((v) => (v.lang || '').toLowerCase().startsWith('pt'));
}

export function speakText(
  text: string,
  options: {
    enabled?: boolean;
    voiceName?: string;
    rate?: number;
    volume?: number;
    pitch?: number;
  } = {}
) {
  if (options.enabled === false) return;
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'pt-BR';
  utterance.rate = options.rate ?? 0.95;
  utterance.volume = options.volume ?? 1;
  utterance.pitch = options.pitch ?? 1;

  const voices = getPtBRVoices();
  if (options.voiceName) {
    const matched = voices.find((v) => v.name === options.voiceName);
    if (matched) utterance.voice = matched;
  } else if (voices.length > 0) {
    // Prefer pt-BR natural voice
    const brVoice = voices.find((v) => v.lang.toLowerCase().includes('br')) || voices[0];
    utterance.voice = brVoice;
  }

  window.speechSynthesis.speak(utterance);
}
