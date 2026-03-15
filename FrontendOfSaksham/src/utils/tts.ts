/**
 * src/utils/tts.ts
 */

const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

let currentAudio: HTMLAudioElement | null = null;
let currentObjectUrl: string | null = null;
let currentController: AbortController | null = null; // ← NEW: tracks in-flight fetch

export function stopSpeaking(): void {
  // Cancel any in-flight fetch first — this is the key fix
  if (currentController) {
    currentController.abort();
    currentController = null;
  }
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
  stopSpeaking(); // kills previous fetch + audio before starting new one

  const controller = new AbortController();
  currentController = controller;

  try {
    const res = await fetch(`${API_BASE}/speech/speak`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text }),
      signal: controller.signal, // ← NEW: fetch is now cancellable
    });

    if (!res.ok) return;

    // If stopSpeaking() was called while fetch was in-flight, don't play
    if (controller.signal.aborted) return;

    const blob = await res.blob();

    // Check again after blob download (large audio files take time)
    if (controller.signal.aborted) return;

    const url = URL.createObjectURL(blob);
    currentObjectUrl = url;
    currentController = null; // fetch done, clear controller

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

  } catch (err: any) {
    if (err.name === 'AbortError') return; // expected — step changed or navigated away
    // silent fallback for other errors
  } finally {
    if (currentController === controller) {
      currentController = null;
    }
  }
}