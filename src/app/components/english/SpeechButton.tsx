'use client';

import { useEffect, useState } from 'react';
import { LEARNING_SETTINGS } from '@/app/lib/english/learningPath';

export default function SpeechButton({ text, onPlayed }: { text: string; onPlayed?: () => void }) {
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) return;
    const synth = window.speechSynthesis;
    const updateVoices = () => setVoice(synth.getVoices().find((item) => /^en[-_]/i.test(item.lang) || item.lang === 'en') ?? null);
    updateVoices();
    synth.addEventListener('voiceschanged', updateVoices);
    return () => {
      synth.removeEventListener('voiceschanged', updateVoices);
      synth.cancel();
    };
  }, []);

  const speak = () => {
    if (!voice) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;
    utterance.lang = voice.lang;
    utterance.rate = LEARNING_SETTINGS.speechRate;
    utterance.onend = () => { setSpeaking(false); onPlayed?.(); };
    utterance.onerror = (event) => {
      setSpeaking(false);
      if (event.error !== 'canceled' && event.error !== 'interrupted') setError('음성을 재생하지 못했어요. 다시 듣거나 글로 연습해 주세요.');
    };
    setError('');
    setSpeaking(true);
    try {
      synth.speak(utterance);
    } catch {
      setSpeaking(false);
      setError('음성을 재생하지 못했어요. 글로 대신 연습해 주세요.');
    }
  };

  return (
    <div>
      <button type="button" className="btn-primary" onClick={speak} disabled={!voice || speaking} aria-label="영어 음성 듣기">
        {speaking ? '듣는 중...' : '영어로 듣기'}
      </button>
      {!voice && <p className="text-sm mt-2" role="status">이 기기에서 영어 음성을 준비하지 못했어요. 글로도 연습할 수 있어요.</p>}
      {error && <p className="text-sm mt-2" role="alert">{error}</p>}
    </div>
  );
}
