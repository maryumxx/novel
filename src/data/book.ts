import manuscript from './manuscript.json';
export const sections = manuscript;
export type Memory = { src: string; caption: string; alt: string; section: number };
// Add an original screenshot here to insert another archival page after a section.
export const memories: Memory[] = [
  { src: '/memories/01-first-hello.jpg', section: 5, caption: '11 October 2025 · 4:20 PM · The first hello', alt: 'Original LinkedIn screenshot: Khalique greets Maryam and asks about development, design, and freelance work.' },
  { src: '/memories/02-the-project.jpg', section: 5, caption: 'A website. And a beginning we could not yet see.', alt: 'Original LinkedIn screenshot: Maryam is open to work; Khalique describes a cybersecurity website project.' },
  { src: '/memories/03-he-noticed.jpg', section: 6, caption: 'Before you knew my heart, you noticed what I made.', alt: 'Original LinkedIn screenshot: Khalique praises Maryam’s banners, designs, and colour combinations; she thanks him.' },
  { src: '/memories/04-pakistan.jpg', section: 8, caption: 'Pakistan · An ordinary conversation, kept forever', alt: 'Original LinkedIn screenshot: Khalique and Maryam talk about visiting Pakistan and its roads.' },
  { src: '/memories/05-delhi.jpg', section: 8, caption: 'Delhi · Places that would come to mean so much', alt: 'Original LinkedIn screenshot: Khalique wants to visit Pakistan, invites Maryam to Delhi, and apologises for his excitement.' },
  { src: '/memories/06-ketchup.jpg', section: 19, caption: 'The ketchup situation · Still unresolved', alt: 'Original Instagram screenshot captured from his account. Maryam’s messages are on the left: she dislikes ketchup. His messages are on the right: he eats it with almost everything.' },
];
