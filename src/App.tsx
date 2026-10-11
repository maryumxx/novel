import { forwardRef, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { sections } from './data/book';
import type { Memory } from './data/book';
import { paginate } from './pagination';
import type { Leaf } from './pagination';
import { playPageTurn } from './pageSound';

function readStorage(key: string) { try { return localStorage.getItem(key); } catch { return null; } }
function writeStorage(key: string, value: string) { try { localStorage.setItem(key, value); } catch { /* Private browsing may disable storage. */ } }
function audioPreferences(): { pagesMuted?: boolean; musicMuted?: boolean } {
  try { return JSON.parse(readStorage('night-audio-preferences') || '{}') || {}; } catch { return {}; }
}
function dimensions() {
  const mobile = window.innerWidth < 800;
  return { width: mobile ? Math.min(window.innerWidth - 32, 470) : Math.min(450, Math.floor((window.innerWidth - 100) / 2)), height: Math.max(550, Math.min(690, window.innerHeight - 200)), mobile };
}
function Flourish({ className = '' }: { className?: string }) {
  return <svg className={`flourish ${className}`} viewBox="0 0 220 100" fill="none" aria-hidden="true"><g stroke="currentColor" strokeWidth=".8"><path d="M110 93C101 68 91 34 64 16M110 93C119 68 129 34 156 16M110 90V26M108 75C77 78 63 66 53 47C78 44 96 56 108 75ZM112 75C143 78 157 66 167 47C142 44 124 56 112 75ZM97 53C70 55 54 38 52 17C77 19 91 32 97 53ZM123 53C150 55 166 38 168 17C143 19 129 32 123 53Z"/><path d="M110 43C90 30 98 15 110 7C122 15 130 30 110 43ZM72 66C46 76 32 62 26 50C49 45 66 53 72 66ZM148 66C174 76 188 62 194 50C171 45 154 53 148 66ZM52 79C28 86 18 74 12 65M168 79C192 86 202 74 208 65"/><circle cx="110" cy="56" r="3"/></g></svg>;
}
function Cover() { return <div className="hardcover"><div className="cover-border"><div className="cover-edition">A FIRST ANNIVERSARY EDITION</div><Flourish/><h1>THE NIGHT<br/><span>BEFORE YOU</span></h1><div className="cover-rule">✦</div><p className="cover-subtitle">Perhaps some prayers are answered<br/>before we even recognise the answer</p><p className="cover-date">OCTOBER 11, 2025 — OCTOBER 11, 2026</p><Flourish className="bottom-flower"/><p className="inscription">Written with love, for you</p></div></div>; }

const Paper = forwardRef<HTMLDivElement, { leaf: Leaf; index: number; onMemory: (m: Memory) => void; onRestart: () => void }>(function Paper({ leaf, index, onMemory, onRestart }, ref) {
  return <div className={`paper paper-${leaf.kind}`} ref={ref} data-density="soft"><article className="page-content" aria-label={leaf.title || leaf.kind}>
    {leaf.kind === 'title' && <div className="ceremonial"><span className="eyebrow">OUR FIRST YEAR</span><Flourish/><h2>The Night<br/>Before You</h2><p className="italic">Perhaps some prayers are answered before we even recognise the answer.</p><div className="tiny-rule">✦</div><p className="small-caps">October 11, 2025<br/>October 11, 2026</p><p className="signature">Written with love, for you</p></div>}
    {leaf.kind === 'dedication' && <div className="ceremonial dedication"><span className="eyebrow">FOR YOU, ALWAYS</span><div className="tiny-rule">✦</div><p>For the stranger who arrived<br/>the morning after my prayer,<br/>and became the man I wanted<br/>every tomorrow with.</p><Flourish/><span className="signature">And for all our tomorrows.</span></div>}
    {leaf.kind === 'endpaper' && <div className="ceremonial"><Flourish/><p className="signature">Written with love, for you</p></div>}
    {leaf.kind === 'story' && <><div className="running-head">{leaf.part}</div><div className={`chapter-heading ${leaf.continued ? 'continued' : ''}`}><span className="eyebrow">{leaf.continued ? `${String(leaf.section).padStart(2, '0')} · continued` : `CHAPTER ${String(leaf.section).padStart(2, '0')}`}</span><h2>{leaf.title}</h2></div><p className="story-text">{leaf.text}</p></>}
    {leaf.kind === 'memory' && leaf.memory && <div className="memory-page"><div className="running-head">FROM OUR ARCHIVE</div><span className="eyebrow">A LITTLE PIECE OF THEN</span><button className="polaroid" onClick={() => onMemory(leaf.memory!)} aria-label={`Enlarge: ${leaf.memory.caption}`}><span className="tape"/><img src={leaf.memory.src} alt={leaf.memory.alt} loading="lazy" draggable="false"/><span>{leaf.memory.caption}</span></button><p className="memory-hint">↗ Tap the memory to look a little closer</p></div>}
    {leaf.kind === 'portrait-intro' && <div className="ceremonial portrait-intro"><span className="eyebrow">A KEEPSAKE BETWEEN CHAPTERS</span><Flourish/><h2>The faces behind<br/>our words</h2><p className="italic">Before we could stand beside each other, there were photographs.</p><span className="signature">Our first pictures, kept together.</span></div>}
    {leaf.kind === 'portrait' && leaf.memory && <div className="portrait-page"><div className="running-head">THE FACES BEHIND OUR WORDS</div><h2>{leaf.memory.heading}</h2><button className="portrait-mount" onClick={() => onMemory(leaf.memory!)} aria-label={`Enlarge: ${leaf.memory.caption}`}><img src={leaf.memory.src} alt={leaf.memory.alt} loading="lazy" draggable="false"/><span className="photo-corner top-left"/><span className="photo-corner bottom-right"/></button><p className="portrait-caption">{leaf.memory.caption}</p><p className="portrait-note">{leaf.memory.note}</p><span className="portrait-floret" aria-hidden="true">✦</span></div>}
    {leaf.kind === 'final' && <div className="ceremonial finale"><span className="eyebrow">THIS IS ONLY THE BEGINNING</span><span className="heart" aria-hidden="true">♡</span><p>The end of our first year.<br/>Not the end of our story.</p><h2>To Be<br/>Continued...</h2><p className="italic">The next chapter begins the day I finally see you in black, and you see me in yellow.</p><button className="paper-button" onClick={onRestart}>Return to the cover <span>↗</span></button></div>}
  </article><footer className="page-footer"><span>THE NIGHT BEFORE YOU</span><span>{String(index + 1).padStart(2, '0')}</span></footer></div>;
});

export default function App() {
  const [opened, setOpened] = useState(false), [opening, setOpening] = useState(false);
  const [size, setSize] = useState(dimensions), [pages, setPages] = useState<Leaf[]>([]), [current, setCurrent] = useState(0);
  const [muted, setMuted] = useState(() => audioPreferences().pagesMuted === true);
  const [musicMuted, setMusicMuted] = useState(() => audioPreferences().musicMuted === true);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [simple, setSimple] = useState(false), [contents, setContents] = useState(false), [memory, setMemory] = useState<Memory | null>(null);
  const [unlocked, setUnlocked] = useState(!import.meta.env.VITE_ACCESS_PASSCODE), [passcode, setPasscode] = useState(''), [error, setError] = useState('');
  const book = useRef<{ pageFlip: () => { flipNext: () => void; flipPrev: () => void; turnToPage: (n: number) => void } } | null>(null);
  const pendingFlipSound = useRef(false);
  const music = useRef<HTMLAudioElement>(null);
  const musicSource = useRef<MediaElementAudioSourceNode | null>(null);
  const musicGain = useRef<GainNode | null>(null);
  const audio = useRef<AudioContext | null>(null), busy = useRef(false), pageRef = useRef(0), leaves = useRef<Leaf[]>([]), lastFocus = useRef<HTMLElement | null>(null);
  const modal = useRef<HTMLDialogElement>(null), openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flat = simple || reduced;
  useEffect(() => { const query = matchMedia('(prefers-reduced-motion: reduce)'); const update = () => setReduced(query.matches); query.addEventListener('change', update); return () => query.removeEventListener('change', update); }, []);
  useEffect(() => { let active = true; void document.fonts.ready.then(() => { if (active) setSize(dimensions()); }); return () => { active = false; }; }, []);
  useEffect(() => { let timer: ReturnType<typeof setTimeout>; const resize = () => { clearTimeout(timer); timer = setTimeout(() => setSize(dimensions()), 200); }; window.addEventListener('resize', resize); return () => { clearTimeout(timer); window.removeEventListener('resize', resize); }; }, []);
  useLayoutEffect(() => {
    const next = paginate(size.width, size.height, !size.mobile);
    let saved: { key?: string; section?: number; offset?: number } = {};
    try { saved = JSON.parse(readStorage('night-position') || '{}'); } catch { /* Ignore damaged storage. */ }
    let index = next.findIndex(p => p.key === saved.key);
    if (index < 0 && saved.section) { next.forEach((p, i) => { if (p.kind === 'story' && p.section === saved.section && (p.offset || 0) <= (saved.offset || 0)) index = i; }); }
    index = Math.max(0, index);
    if (!size.mobile && index % 2) index--;
    leaves.current = next; pageRef.current = index; setCurrent(index); setPages(next);
  }, [size]);
  useEffect(() => { writeStorage('night-audio-preferences', JSON.stringify({ pagesMuted: muted, musicMuted })); }, [muted, musicMuted]);
  useEffect(() => () => { if (openTimer.current) clearTimeout(openTimer.current); void audio.current?.close(); }, []);
  const remember = useCallback((index: number) => { const leaf = leaves.current[index]; if (!leaf) return; pageRef.current = index; setCurrent(index); writeStorage('night-position', JSON.stringify({ key: leaf.key, section: leaf.section, offset: leaf.offset })); }, []);
  const enableAudio = useCallback(() => {
    if (!audio.current || audio.current.state === 'closed') {
      try { audio.current = new AudioContext(); } catch { return; }
    }
    if (music.current && !musicSource.current) {
      // A Web Audio gain keeps music quiet on mobile browsers too.
      musicSource.current = audio.current.createMediaElementSource(music.current);
      musicGain.current = audio.current.createGain();
      musicGain.current.gain.value = .085;
      musicSource.current.connect(musicGain.current);
      musicGain.current.connect(audio.current.destination);
    }
    void audio.current.resume().catch(() => {});
  }, []);
  const startMusic = useCallback(() => {
    if (!music.current) return;
    enableAudio();
    if (!musicGain.current) return;
    music.current.volume = 1;
    // Called directly from Open/Unmute gestures for iPhone media policies.
    void music.current.play().catch(() => setMusicPlaying(false));
  }, [enableAudio]);
  useEffect(() => {
    const sync = () => {
      if (opened && !musicMuted && !document.hidden) startMusic();
      else music.current?.pause();
    };
    sync();
    document.addEventListener('visibilitychange', sync);
    return () => document.removeEventListener('visibilitychange', sync);
  }, [opened, musicMuted, startMusic]);
  const sound = useCallback(() => {
    if (muted || !audio.current || audio.current.state !== 'running') return;
    playPageTurn(audio.current);
  }, [muted]);
  const turn = useCallback((direction: number) => {
    if (busy.current || memory || contents) return;
    const step = size.mobile ? 1 : 2, target = pageRef.current + direction * step;
    if (target < 0 || target >= leaves.current.length) return;
    if (audio.current?.state === 'suspended') void audio.current.resume().catch(() => {});
    if (flat) { remember(target); sound(); }
    else if (book.current) { busy.current = true; try { if (direction > 0) book.current.pageFlip().flipNext(); else book.current.pageFlip().flipPrev(); } catch { busy.current = false; setSimple(true); remember(target); } }
  }, [flat, size.mobile, memory, contents, remember, sound]);
  const jump = (index: number) => { const target = size.mobile ? index : index - index % 2; busy.current = false; pendingFlipSound.current = false; if (!flat && book.current) book.current.pageFlip().turnToPage(target); remember(target); setContents(false); };
  useEffect(() => { const key = (e: KeyboardEvent) => { if (!opened || memory || contents || /INPUT|TEXTAREA|SELECT/.test((e.target as HTMLElement).tagName)) return; if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); turn(e.key === 'ArrowRight' ? 1 : -1); } }; window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key); }, [opened, memory, contents, turn]);
  useEffect(() => { if (memory || contents) { lastFocus.current = document.activeElement as HTMLElement; modal.current?.showModal(); } else { modal.current?.close(); lastFocus.current?.focus(); } }, [memory, contents]);
  const restart = () => { music.current?.pause(); setOpened(false); setOpening(false); busy.current = false; remember(0); };
  const open = () => { enableAudio(); if (!musicMuted) startMusic(); setOpening(true); openTimer.current = setTimeout(() => { setOpened(true); setOpening(false); }, reduced ? 0 : 800); };
  const progress = pages.length ? Math.min(100, ((current + (size.mobile ? 1 : 2)) / pages.length) * 100) : 0;
  return <main className={opened ? 'app reading' : 'app'}>
    <audio ref={music} src="/audio/our-quiet-pages.wav" loop preload="none" onPlaying={() => setMusicPlaying(true)} onPause={() => setMusicPlaying(false)} onError={() => setMusicPlaying(false)} aria-hidden="true"/>
    <div className="ambient-stars" aria-hidden="true"/>
    <header className="site-header"><button className="wordmark" onClick={restart} aria-label="Return to cover"><span className="monogram">M<span>&</span>K</span><span className="wordmark-caption">A STORY WRITTEN IN THE STARS</span></button><span className="header-date">11 OCTOBER <i>·</i> ONE YEAR OF US</span>{opened && <button className="header-action" onClick={() => setContents(true)}>Contents <span>☷</span></button>}</header>
    {!opened ? <section className={`landing ${opening ? 'opening' : ''}`} aria-label="Book cover"><p className="landing-kicker"><span/>SOME BEGINNINGS ARRIVE QUIETLY<span/></p><div className="cover-stage"><Cover/></div><div className="landing-actions">{unlocked ? <button className="open-button" disabled={opening || !pages.length} onClick={open}>{opening ? 'Turning to us…' : 'Open Our Story'}<span>↗</span></button> : <form className="passcode-form" onSubmit={e => { e.preventDefault(); if (passcode === import.meta.env.VITE_ACCESS_PASSCODE) { setUnlocked(true); setError(''); } else setError('That is not quite right. Try again.'); }}><label htmlFor="passcode">A little secret, just for us</label><input id="passcode" type="password" value={passcode} onChange={e => setPasscode(e.target.value)} autoComplete="off" required/><button className="open-button" type="submit">Unlock our story ↗</button>{error && <p role="alert">{error}</p>}</form>}<p className="landing-note">26 chapters. A thousand little moments. One us.</p>{current > 0 && <span className="resume-note">Your place is kept, just as you left it.</span>}</div></section> : <section className="reader" aria-label="Our anniversary book" onPointerDownCapture={enableAudio}><div className="reader-top"><span>{pages[current]?.kind === 'story' ? `CHAPTER ${String(pages[current]?.section).padStart(2, '0')} OF 26` : 'THE NIGHT BEFORE YOU'}</span><div><button onClick={() => { enableAudio(); setMuted(!muted); }} aria-label={muted ? 'Enable page-turn sound' : 'Mute page-turn sound'} aria-pressed={!muted}>{muted ? 'Pages: off' : 'Pages: on'}</button><button onClick={() => { if (musicPlaying) { music.current?.pause(); setMusicMuted(true); } else { setMusicMuted(false); startMusic(); } }} aria-label={musicPlaying ? 'Mute reading music' : 'Play reading music'} aria-pressed={musicPlaying}>{musicPlaying ? '♫ Music on' : '♫ Music off'}</button><button onClick={() => { busy.current = false; setSimple(!simple); }} aria-pressed={flat} disabled={reduced}>{flat ? 'Plain pages' : 'Page turns'}</button></div></div><div className="book-surface" style={{ width: size.width * (size.mobile ? 1 : 2), minHeight: size.height }}>
      {flat ? <div className="flat-book" style={{ height: size.height }}>{pages.slice(current, current + (size.mobile ? 1 : 2)).map((leaf, i) => <Paper key={leaf.key} leaf={leaf} index={current + i} onMemory={setMemory} onRestart={restart}/>)}</div> : <HTMLFlipBook key={`${size.width}-${size.height}-${pages.length}`} ref={book} width={size.width} height={size.height} size="fixed" minWidth={250} maxWidth={450} minHeight={550} maxHeight={690} startPage={current} drawShadow flippingTime={850} usePortrait startZIndex={1} autoSize maxShadowOpacity={.3} showCover={false} mobileScrollSupport clickEventForward useMouseEvents swipeDistance={35} showPageCorners disableFlipByClick className="flip-book" style={{}} onChangeState={e => { busy.current = e.data !== 'read'; if (e.data === 'flipping') pendingFlipSound.current = true; }} onInit={() => { busy.current = false; }} onFlip={e => { if (pageRef.current !== e.data) { remember(e.data); if (pendingFlipSound.current) sound(); pendingFlipSound.current = false; } }}>{pages.map((leaf, index) => <Paper key={leaf.key} leaf={leaf} index={index} onMemory={setMemory} onRestart={restart}/>)}</HTMLFlipBook>}
    </div><div className="reader-controls"><button onClick={() => turn(-1)} disabled={current === 0} aria-label="Previous page">← <span>Previous</span></button><div className="page-status" aria-live="polite"><span>PAGE {current + 1}{!size.mobile && current + 2 <= pages.length ? ` — ${current + 2}` : ''} <span className="of">OF {pages.length}</span></span><progress max="100" value={progress} aria-label="Reading progress"/></div><button onClick={() => turn(1)} disabled={current + (size.mobile ? 1 : 2) >= pages.length} aria-label="Next page"><span>Next</span> →</button></div><p className="reader-hint">{flat ? 'Use the arrows to wander through our story' : size.mobile ? 'Swipe gently to turn a page' : 'Drag a page corner, or use your arrow keys'} <span>·</span> Your place is saved</p></section>}
    <footer className="site-footer"><span>OCTOBER 2025 — OCTOBER 2026</span><span>Made of moments. Kept with love.</span><span>JUST BETWEEN US <i>♡</i></span></footer>
    <dialog ref={modal} className={memory ? 'memory-dialog' : 'contents-dialog'} onCancel={() => { setMemory(null); setContents(false); }} onClick={e => { if (e.target === e.currentTarget) { setMemory(null); setContents(false); } }} aria-label={memory ? 'Enlarged memory' : 'Table of contents'}><button className="dialog-close" onClick={() => { setMemory(null); setContents(false); }} aria-label="Close dialog" autoFocus>×</button>{memory ? <figure><img src={memory.src} alt={memory.alt}/><figcaption>{memory.caption}</figcaption></figure> : <><span className="eyebrow">FIND YOUR WAY THROUGH US</span><h2>Our chapters</h2><nav aria-label="Book chapters"><button onClick={() => jump(0)}><span>✦</span>The dedication</button>{sections.map(s => <button key={s.id} onClick={() => jump(pages.findIndex(p => p.kind === 'story' && p.section === s.id))}><span>{String(s.id).padStart(2, '0')}</span>{s.title}</button>)}<button onClick={() => jump(pages.findIndex(p => p.kind === 'portrait'))}><span>♡</span>Our first photographs</button><button onClick={() => jump(pages.length - 1)}><span>♡</span>To Be Continued...</button></nav></>}</dialog>
  </main>;
}


