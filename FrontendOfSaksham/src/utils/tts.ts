/**
 * src/utils/tts.ts
 */

const API_BASE = 'http://localhost:5000/api';

let currentAudio: HTMLAudioElement | null = null;
let currentObjectUrl: string | null = null;

export function stopSpeaking(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = '';
    currentAudio = null;
  }
  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = null;
  }
}

export async function speakText(text: string, token: string): Promise<void> {
  stopSpeaking();
  try {
    const res = await fetch(`${API_BASE}/speech/speak`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    currentObjectUrl = url;
    const audio = new Audio(url);
    currentAudio = audio;
    return new Promise<void>(resolve => {
      audio.onended = () => {
        URL.revokeObjectURL(url);
        currentAudio = null;
        currentObjectUrl = null;
        resolve();
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        currentAudio = null;
        currentObjectUrl = null;
        resolve();
      };
      audio.play().catch(() => { stopSpeaking(); resolve(); });
    });
  } catch {
    // silent fallback
  }
}