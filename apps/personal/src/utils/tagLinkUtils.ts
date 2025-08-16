export interface NormalizedContent {
  text: string;
  tags: string[];
  links: string[];
}

export function normalizeTagsAndLinks(content: string): NormalizedContent {
  const tags: string[] = [];
  const links: string[] = [];
  
  // Extract tags (#tag)
  const tagRegex = /#([a-zA-Z0-9_]+)/g;
  let match;
  while ((match = tagRegex.exec(content)) !== null) {
    tags.push(match[1]);
  }
  
  // Extract links [[link]]
  const linkRegex = /\[\[([^\]]+)\]\]/g;
  while ((match = linkRegex.exec(content)) !== null) {
    links.push(match[1]);
  }
  
  // Clean text by removing tags and links
  let cleanText = content
    .replace(tagRegex, '') // Remove tags
    .replace(linkRegex, '') // Remove links
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
  
  return {
    text: cleanText,
    tags: [...new Set(tags)], // Remove duplicates
    links: [...new Set(links)], // Remove duplicates
  };
}
