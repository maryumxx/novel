import { firstPhotographs, memories, sections } from './data/book';
import type { Memory } from './data/book';
export type Leaf = { kind: 'title' | 'dedication' | 'story' | 'memory' | 'portrait' | 'portrait-intro' | 'endpaper' | 'final'; key: string; section?: number; title?: string; part?: string; text?: string; continued?: boolean; offset?: number; memory?: Memory };
export function paginate(width: number, height: number, spread = false): Leaf[] {
  const pages: Leaf[] = [{ kind: 'title', key: 'title' }, { kind: 'dedication', key: 'dedication' }];
  const measure = document.createElement('div');
  measure.className = 'paper measurement';
  measure.style.width = `${width}px`;
  measure.style.height = `${height}px`;
  document.body.append(measure);
  try {
    for (const section of sections) {
      const words = section.paragraphs.join('\n\n').split(/\s+/);
      let offset = 0;
      while (offset < words.length) {
        const continued = offset > 0;
        measure.innerHTML = `<div class="page-content"><div class="running-head"></div><div class="chapter-heading"><span class="eyebrow"></span><h2></h2></div><p class="story-text"></p></div>`;
        measure.querySelector('.running-head')!.textContent = section.part;
        measure.querySelector('.eyebrow')!.textContent = continued ? `${String(section.id).padStart(2, '0')} · continued` : `CHAPTER ${String(section.id).padStart(2, '0')}`;
        measure.querySelector('h2')!.textContent = section.title;
        if (continued) measure.querySelector('.chapter-heading')!.classList.add('continued');
        const text = measure.querySelector<HTMLElement>('.story-text')!;
        const content = measure.querySelector<HTMLElement>('.page-content')!;
        let low = 1, high = words.length - offset, count = 1;
        while (low <= high) {
          const mid = Math.floor((low + high) / 2);
          text.textContent = words.slice(offset, offset + mid).join(' ');
          if (text.getBoundingClientRect().bottom <= content.getBoundingClientRect().bottom - 8) { count = mid; low = mid + 1; }
          else high = mid - 1;
        }
        // Keep a sentence together where that does not leave a mostly empty page.
        if (offset + count < words.length) {
          // Avoid an almost empty continuation page at the end of a chapter.
          const remaining = words.length - offset - count;
          if (remaining < 45 && count > 90) count -= 45 - remaining;
          for (let i = count; i > count * .72; i--) {
            if (/[.!?]["']?$/.test(words[offset + i - 1])) { count = i; break; }
          }
        }
        pages.push({ kind: 'story', key: `s${section.id}-${offset}`, section: section.id, title: section.title, part: section.part, text: words.slice(offset, offset + count).join(' '), continued, offset });
        offset += count;
      }
      for (const memory of memories.filter(m => m.section === section.id)) pages.push({ kind: 'memory', key: memory.src, section: section.id, memory });
      if (section.id === 20) {
        // Keep his and her portraits facing each other in a desktop spread.
        if (spread && pages.length % 2) pages.push({ kind: 'portrait-intro', key: 'first-photographs', section: 20 });
        for (const memory of firstPhotographs) pages.push({ kind: 'portrait', key: memory.src, section: 20, memory });
      }
    }
  } finally { measure.remove(); }
  if (spread && pages.length % 2 === 0) pages.push({ kind: 'endpaper', key: 'endpaper' });
  pages.push({ kind: 'final', key: 'final' });
  return pages;
}
