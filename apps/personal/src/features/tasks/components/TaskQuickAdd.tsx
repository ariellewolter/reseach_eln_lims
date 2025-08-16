import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, Clock, Tag, Link, Calendar, AlertTriangle, Sparkles } from 'lucide-react';
import { useTasksStore } from '../store/useTasksStore';
import { useQuickAddParser } from '../utils/quickAddParser';
import { Task, TaskPriority } from '@research/types';

interface TaskQuickAddProps {
  onTaskCreated?: (task: Task) => void;
  placeholder?: string;
  className?: string;
}

export const TaskQuickAdd: React.FC<TaskQuickAddProps> = ({
  onTaskCreated,
  placeholder = "Add a task... (e.g., 'Write methods section tomorrow 2-4pm #writing [[Paper1]] !high')",
  className = '',
}) => {
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMultiline, setIsMultiline] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const addTask = useTasksStore((state) => state.addTask);
  const { parse } = useQuickAddParser();

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  useEffect(() => {
    if (input.trim()) {
      try {
        const parsed = parse(input);
        setPreview(parsed);
      } catch (error) {
        setPreview(null);
      }
    } else {
      setPreview(null);
    }
  }, [input, parse]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      const parsed = parse(input);
      const task = addTask({
        title: parsed.title,
        dueDate: parsed.dueDate,
        priority: parsed.priority || 'med',
        tags: parsed.tags,
        links: parsed.links,
        estimateMin: parsed.estimateMin,
        context: parsed.context,
        status: 'todo',
      });

      setInput('');
      setIsExpanded(false);
      setIsMultiline(false);
      setPreview(null);
      
      if (onTaskCreated) {
        onTaskCreated(task);
      }
    } catch (error) {
      console.error('Failed to parse task:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    } else if (e.key === 'Enter' && e.shiftKey) {
      setIsMultiline(true);
    } else if (e.key === 'Escape') {
      setIsExpanded(false);
      setIsMultiline(false);
      setInput('');
      setPreview(null);
    }
  };

  const handleFocus = () => {
    setIsExpanded(true);
  };

  const handleBlur = () => {
    // Delay hiding to allow for clicks on preview elements
    setTimeout(() => {
      if (!input.trim()) {
        setIsExpanded(false);
        setIsMultiline(false);
        setPreview(null);
      }
    }, 200);
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent': return 'text-red-700 bg-red-50 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800';
      case 'high': return 'text-orange-700 bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:text-orange-300 dark:border-orange-800';
      case 'med': return 'text-yellow-700 bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-300 dark:border-yellow-800';
      case 'low': return 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800';
      default: return 'text-gray-700 bg-gray-50 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className={`flex items-center gap-3 px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-200 transform hover:scale-105 ${className}`}
      >
        <Plus className="w-5 h-5" />
        <span>Quick Add Task</span>
        <Sparkles className="w-4 h-4 opacity-80" />
      </button>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          {isMultiline ? (
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={placeholder}
              className="w-full px-5 py-4 text-sm border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-800 dark:text-white resize-none shadow-lg shadow-gray-200/50 dark:shadow-black/20 transition-all duration-200"
              rows={3}
            />
          ) : (
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={placeholder}
              className="w-full px-5 py-4 text-sm border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-800 dark:text-white shadow-lg shadow-gray-200/50 dark:shadow-black/20 transition-all duration-200"
            />
          )}
          
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preview */}
        {preview && (
          <div className="p-5 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-950/20 rounded-2xl border-2 border-blue-200 dark:border-blue-800 shadow-lg shadow-blue-200/50 dark:shadow-blue-900/20">
            <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 mb-3 font-medium">
              <Sparkles className="w-3 h-3" />
              Preview:
            </div>
            
            <div className="space-y-3">
              <div className="font-semibold text-gray-900 dark:text-white text-base">
                {preview.title}
              </div>
              
              {preview.dueDate && (
                <div className="flex items-center gap-2 text-xs">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg border border-blue-200 dark:border-blue-800">
                    Due: {new Date(preview.dueDate).toLocaleDateString()}
                  </span>
                </div>
              )}
              
              {preview.startTime && preview.endTime && (
                <div className="flex items-center gap-2 text-xs">
                  <Clock className="w-4 h-4 text-green-500" />
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg border border-green-200 dark:border-green-800">
                    {preview.startTime} - {preview.endTime}
                  </span>
                </div>
              )}
              
              {preview.priority && (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  <span className={`px-3 py-1 text-xs rounded-lg border ${getPriorityColor(preview.priority)}`}>
                    {preview.priority}
                  </span>
                </div>
              )}
              
              {preview.tags.length > 0 && (
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-purple-500" />
                  <div className="flex gap-2">
                    {preview.tags.map((tag: string) => (
                      <span key={tag} className="px-3 py-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg border border-purple-200 dark:border-purple-800 font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {preview.links.length > 0 && (
                <div className="flex items-center gap-2">
                  <Link className="w-4 h-4 text-indigo-500" />
                  <div className="flex gap-2">
                    {preview.links.map((link: string) => (
                      <span key={link} className="px-3 py-1 text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg border border-indigo-200 dark:border-indigo-800 font-medium">
                        [[{link}]]
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {preview.estimateMin && (
                <div className="text-xs text-gray-600 dark:text-gray-400 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  Estimate: {Math.floor(preview.estimateMin / 60)}h {preview.estimateMin % 60}m
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span>Press Enter to create, Shift+Enter for multiline</span>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMultiline(!isMultiline)}
              className="px-4 py-2 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 transition-all duration-200"
            >
              {isMultiline ? 'Single line' : 'Multiline'}
            </button>
            
            <button
              type="submit"
              disabled={!input.trim()}
              className="px-6 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-200 transform hover:scale-105"
            >
              Create Task
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
