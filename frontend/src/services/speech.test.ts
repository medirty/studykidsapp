// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import SpeakButton from '../components/ui/SpeakButton.svelte';
import { pickVoice, recognitionSupported, speak } from './speech';

const voice = (lang: string) => ({ lang, name: lang }) as SpeechSynthesisVoice;
const spoken: SpeechSynthesisUtterance[] = [];

function mockSynth(voices: SpeechSynthesisVoice[]) {
  vi.stubGlobal(
    'SpeechSynthesisUtterance',
    class {
      lang = '';
      voice: unknown = null;
      constructor(public text: string) {}
    },
  );
  Object.defineProperty(window, 'speechSynthesis', {
    configurable: true,
    value: {
      getVoices: () => voices,
      cancel: vi.fn(),
      speak: (u: SpeechSynthesisUtterance) => spoken.push(u),
    },
  });
}

beforeEach(() => {
  spoken.length = 0;
  vi.spyOn(globalThis, 'fetch');
});
afterEach(() => {
  expect(fetch).not.toHaveBeenCalled(); // tanpa request jaringan (FR-8)
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  Reflect.deleteProperty(window, 'speechSynthesis');
});

describe('pickVoice', () => {
  it('id → id-ID; en → en-US dulu, lalu en-GB', () => {
    const all = [voice('en-GB'), voice('id-ID'), voice('en-US')];
    expect(pickVoice(all, 'id')?.lang).toBe('id-ID');
    expect(pickVoice(all, 'en')?.lang).toBe('en-US');
    expect(pickVoice([voice('en_GB')], 'en')?.lang).toBe('en_GB');
    expect(pickVoice([voice('fr-FR')], 'id')).toBeUndefined();
  });
});

describe('speak', () => {
  it('memakai suara yang cocok', () => {
    mockSynth([voice('id-ID')]);
    expect(speak('halo', 'id')).toBe('ok');
    expect(spoken[0]?.lang).toBe('id-ID');
  });
  it('suara bahasa tak ada → fallback, tetap bicara dengan suara default', () => {
    mockSynth([voice('en-US')]);
    expect(speak('halo', 'id')).toBe('fallback');
    expect(spoken[0]?.lang).toBe('id-ID');
  });
  it('daftar suara belum dimuat → ok', () => {
    mockSynth([]);
    expect(speak('halo', 'id')).toBe('ok');
  });
  it('API tidak ada → unsupported tanpa error', () => {
    expect(speak('halo', 'id')).toBe('unsupported');
    expect(recognitionSupported()).toBe(false);
  });
});

describe('SpeakButton', () => {
  it('tersembunyi bila API tidak ada', () => {
    render(SpeakButton, { text: 'halo' });
    expect(screen.queryByRole('button')).toBeNull();
  });
  it('klik membacakan; fallback menampilkan pesan ramah', async () => {
    mockSynth([voice('en-US')]);
    render(SpeakButton, { text: 'halo' });
    await fireEvent.click(screen.getByRole('button', { name: 'Dengarkan' }));
    expect(spoken).toHaveLength(1);
    expect(screen.getByRole('status').textContent).toContain('Kiko');
  });
});
