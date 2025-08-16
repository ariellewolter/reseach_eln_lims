import React from "react";
import { CalendarDays, Tag, Plus, X } from "lucide-react";

export interface MetaBarProps {
  date?: string;
  onDateChange?: (date: string) => void;
  tags?: string[];
  onTagsChange?: (tags: string[]) => void;
  availableTags?: string[];
  onAddTag?: (tag: string) => void;
  className?: string;
}

export function MetaBar({ 
  date, 
  onDateChange, 
  tags = [], 
  onTagsChange,
  availableTags = [],
  onAddTag,
  className = ""
}: MetaBarProps) {
  const [newTag, setNewTag] = React.useState("");
  const [isAddingTag, setIsAddingTag] = React.useState(false);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()];
      onTagsChange?.(updatedTags);
      onAddTag?.(newTag.trim());
      setNewTag("");
      setIsAddingTag(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    onTagsChange?.(updatedTags);
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === "Escape") {
      setIsAddingTag(false);
      setNewTag("");
    }
  };

  return (
    <div className={`w-full flex flex-wrap items-center gap-3 px-3 py-2 border-b bg-neutral-50/60 dark:bg-neutral-900/60 ${className}`}>
      {/* Date Input */}
      <div className="flex items-center gap-2 text-sm">
        <CalendarDays className="w-4 h-4 opacity-70" />
        <input
          type="date"
          className="bg-transparent outline-none border-none text-sm"
          value={date?.slice(0, 10) || ""}
          onChange={(e) => onDateChange?.(e.target.value)}
          disabled={!onDateChange}
        />
      </div>

      {/* Tags Section */}
      <div className="flex-1 flex items-center gap-2 flex-wrap">
        {/* Existing Tags */}
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs rounded-full"
          >
            <Tag className="w-3 h-3" />
            {tag}
            {onTagsChange && (
              <button
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-800/50 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </span>
        ))}

        {/* Add Tag Button */}
        {onTagsChange && (
          <button
            onClick={() => setIsAddingTag(true)}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-dashed border-gray-300 dark:border-gray-600 rounded-full hover:border-gray-400 dark:hover:border-gray-500"
          >
            <Plus className="w-3 h-3" />
            Add Tag
          </button>
        )}

        {/* Tag Input */}
        {isAddingTag && onTagsChange && (
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={handleTagKeyDown}
              onBlur={handleAddTag}
              placeholder="New tag..."
              className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500 dark:focus:border-blue-400"
              autoFocus
            />
            <button
              onClick={handleAddTag}
              className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add
            </button>
            <button
              onClick={() => {
                setIsAddingTag(false);
                setNewTag("");
              }}
              className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
