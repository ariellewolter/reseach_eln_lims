import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Square, 
  CheckCircle, 
  Circle, 
  Clock, 
  Calendar, 
  Tag, 
  Link, 
  AlertTriangle,
  MoreHorizontal,
  Edit3,
  Trash2,
  Archive,
  Star,
  Eye
} from 'lucide-react';
import { useTasksStore } from '../store/useTasksStore';
import { Task, TaskStatus, TaskPriority } from '@research/types';

interface TaskItemProps {
  task: Task;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onEdit?: (task: Task) => void;
  className?: string;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  isSelected = false,
  onSelect,
  onEdit,
  className = '',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [showMenu, setShowMenu] = useState(false);
  
  const titleInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const updateTask = useTasksStore((state) => state.updateTask);
  const deleteTask = useTasksStore((state) => state.deleteTask);
  const toggleTimer = useTasksStore((state) => state.toggleTimer);
  const completeTask = useTasksStore((state) => state.completeTask);
  const archiveTasks = useTasksStore((state) => state.archiveTasks);
  const activeTimerId = useTasksStore((state) => state.activeTimerId);

  const isTimerActive = activeTimerId === task.id;

  useEffect(() => {
    if (isEditing && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTitleEdit = () => {
    setIsEditing(true);
  };

  const handleTitleSave = () => {
    if (editTitle.trim()) {
      updateTask(task.id, { title: editTitle.trim() });
    }
    setIsEditing(false);
  };

  const handleTitleCancel = () => {
    setEditTitle(task.title);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      handleTitleCancel();
    }
  };

  const handleStatusChange = (newStatus: TaskStatus) => {
    updateTask(task.id, { status: newStatus });
    if (newStatus === 'done') {
      completeTask(task.id);
    }
  };

  const handlePriorityChange = (newPriority: TaskPriority) => {
    updateTask(task.id, { priority: newPriority });
  };

  const handleTimerToggle = () => {
    toggleTimer(task.id);
  };

  const handleDelete = () => {
    deleteTask(task.id);
    setShowMenu(false);
  };

  const handleArchive = () => {
    archiveTasks([task.id]);
    setShowMenu(false);
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'done':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'in_progress':
        return <Circle className="w-5 h-5 text-blue-500" />;
      case 'blocked':
        return <Circle className="w-5 h-5 text-red-500" />;
      case 'cancelled':
        return <Circle className="w-5 h-5 text-gray-400" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
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

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'done': return 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800';
      case 'in_progress': return 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800';
      case 'blocked': return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800';
      case 'cancelled': return 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
      default: return 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  return (
    <div
      className={`group relative p-6 bg-card border border-border rounded-xl hover:shadow-lg hover:shadow-border/50 transition-all duration-200 task-card ${
        isSelected ? 'ring-2 ring-accent ring-offset-2 ring-offset-background' : ''
      } ${isOverdue ? 'border-red-200 dark:border-red-700 bg-red-50/50 dark:bg-red-950/20' : ''} ${className}`}
      onClick={() => onSelect?.(task.id)}
    >
      {/* Top Row - Status, Priority, Actions */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Status Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleStatusChange(task.status === 'done' ? 'todo' : 'done');
            }}
            className="hover:scale-110 transition-transform duration-200 status-indicator"
          >
            {getStatusIcon(task.status)}
          </button>
          
          {/* Priority Badge */}
          {task.priority !== 'med' && (
            <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
          )}
          
          {/* Status Badge */}
          <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(task.status)}`}>
            {task.status.replace('_', ' ')}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Timer Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleTimerToggle();
            }}
            className={`p-2.5 rounded-full transition-all duration-200 ${isTimerActive ? 'pulse-glow' : ''} ${
              isTimerActive 
                ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 shadow-lg shadow-red-200/50' 
                : 'bg-card-muted text-muted hover:bg-card hover:shadow-md'
            }`}
          >
            {isTimerActive ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          
          {/* Menu Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-2 text-muted hover:text-foreground opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-card-muted rounded-lg"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="mb-3">
        {isEditing ? (
          <input
            ref={titleInputRef}
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleTitleSave}
            className="w-full text-xl font-semibold bg-transparent border-b-2 border-accent focus:outline-none focus:border-accent text-foreground placeholder-muted focus-ring"
            placeholder="Task title..."
          />
        ) : (
          <h3 
            className={`text-xl font-semibold cursor-pointer hover:text-accent text-foreground transition-colors duration-200 ${
              task.status === 'done' ? 'line-through text-muted' : ''
            }`}
            onClick={handleTitleEdit}
          >
            {task.title}
          </h3>
        )}
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-muted mb-4 text-sm leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Time Tracking */}
      {task.spentMin && task.spentMin > 0 && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg shadow-blue">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">Time Spent: {formatTime(task.spentMin)}</span>
          </div>
        </div>
      )}

      {/* Metadata Row */}
      <div className="flex items-center gap-4 text-sm text-muted mb-4">
        {task.dueDate && (
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
            isOverdue 
              ? 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300 border border-red-200 dark:border-red-800' 
              : 'bg-card-muted border border-border'
          }`}>
            <Calendar className="w-4 h-4" />
            <span className="font-medium">{new Date(task.dueDate).toLocaleDateString()}</span>
            {isOverdue && <AlertTriangle className="w-4 h-4" />}
          </div>
        )}
        
        {task.estimateMin && (
          <div className="flex items-center gap-2 px-3 py-2 bg-card-muted border border-border rounded-lg">
            <Clock className="w-4 h-4" />
            <span className="font-medium">Est: {formatTime(task.estimateMin)}</span>
          </div>
        )}
      </div>

      {/* Tags and Links */}
      <div className="flex items-center gap-3 mb-4">
        {task.tags.length > 0 && (
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-muted" />
            <div className="flex gap-1">
              {task.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs bg-card-muted text-muted rounded-md border border-border"
                >
                  {tag}
                </span>
              ))}
              {task.tags.length > 3 && (
                <span className="px-2 py-1 text-xs bg-card-muted text-muted rounded-md border border-border">
                  +{task.tags.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
        
        {task.links.length > 0 && (
          <div className="flex items-center gap-2">
            <Link className="w-4 h-4 text-muted" />
            <span className="text-xs text-muted">
              {task.links.length} link{task.links.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Action Menu */}
      {showMenu && (
        <div
          ref={menuRef}
          className="absolute right-0 top-16 z-20 w-56 bg-card border border-border rounded-xl shadow-xl py-2 backdrop-blur-sm slide-in-up"
        >
                      <div className="px-3 py-2 border-b border-border">
              <h4 className="text-sm font-medium text-foreground">Task Actions</h4>
            </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(task);
              setShowMenu(false);
            }}
            className="w-full px-4 py-3 text-left text-sm text-foreground hover:bg-card-muted flex items-center gap-3 transition-colors duration-150"
          >
            <Edit3 className="w-4 h-4" />
            Edit Details
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePriorityChange(task.priority === 'high' ? 'med' : task.priority === 'med' ? 'low' : 'high');
              setShowMenu(false);
            }}
            className="w-full px-4 py-3 text-left text-sm text-foreground hover:bg-card-muted flex items-center gap-3 transition-colors duration-150"
          >
            <Star className="w-4 h-4" />
            Cycle Priority
          </button>
          
          <button
            onClick={handleArchive}
            className="w-full px-4 py-3 text-left text-sm text-foreground hover:bg-card-muted flex items-center gap-3 transition-colors duration-150"
          >
            <Archive className="w-4 h-4" />
            Archive
          </button>
          
          <div className="border-t border-border my-1" />
          
          <button
            onClick={handleDelete}
            className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-3 transition-colors duration-150"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
};
