import { normalizeTagsAndLinks } from '../../../utils/tagLinkUtils';
import { Task } from '@research/types';

export function buildTaskFromSelection({
  selectionText,
  sourceFileId,
  sourceFileTitle,
  defaultPriority = "med",
}: {
  selectionText: string;
  sourceFileId: string;
  sourceFileTitle?: string;
  defaultPriority?: "low" | "med" | "high" | "urgent";
}): Partial<Task> {
  const rawTitle = selectionText?.trim() || "New Task";
  const { text, tags, links } = normalizeTagsAndLinks(rawTitle);

  const now = new Date().toISOString();
  return {
    title: text || "New Task",
    description: `Created from [[${sourceFileTitle || sourceFileId}]]`,
    status: "todo",
    priority: defaultPriority,
    createdAt: now,
    updatedAt: now,
    tags,
    links: [...links, sourceFileId], // keep a hard link to source file id
  };
}
