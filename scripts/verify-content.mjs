import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const sections = JSON.parse(readFileSync('src/data/manuscript.json', 'utf8'));
const source = readFileSync('manuscript-extracted.txt', 'utf8');
const additions = JSON.parse(readFileSync('src/data/author-additions.json', 'utf8'));
assert.deepEqual(sections.map(s => s.id), Array.from({ length: 26 }, (_, i) => i + 1));
const normalized = source.replace(/\s+/g, ' ');
for (const section of sections) {
  assert(normalized.includes(section.paragraphs.join(' ').replace(/\s+/g, ' ')), `Section ${section.id} differs from PDF`);
  assert(!section.paragraphs.join('').includes('\ufffd'), `Unresolved glyph in section ${section.id}`);
}
console.log('All 26 sections match the full extracted PDF text, word for word.');
for (const addition of additions) {
  const section = sections.find(section => section.id === addition.section);
  assert(section, `Unknown section for author addition: ${addition.section}`);
  assert.equal(section.paragraphs.join(' ').split(addition.after).length - 1, 1, `Addition anchor must occur exactly once in section ${addition.section}`);
  assert(addition.text.trim(), `Empty author addition in section ${addition.section}`);
}
console.log(`${additions.length} author-requested addition(s) have valid insertion points within existing chapters.`);
