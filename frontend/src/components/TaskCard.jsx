import React from 'react';
import { Calendar, Edit3, Trash2, User } from 'lucide-react';
import { useBoardStore } from '../store/useBoardStore';

export default function TaskCard({ task, onEdit }) {
  const { deleteTask } = useBoardStore();

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', task.id.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
      try {
        await deleteTask(task.id);
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  };

  const checkIsOverdue = () => {
    if (!task.dueDate || task.status === 'Done') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(task.dueDate);
    return due < today;
  };

  const isOverdue = checkIsOverdue();

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getAssigneeInitials = () => {
    if (!task.assignee || !task.assignee.name) return '';
    return task.assignee.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const initials = getAssigneeInitials();

  return (
    <div
      className="task-card"
      draggable
      onDragStart={handleDragStart}
      onDoubleClick={() => onEdit(task)}
    >
      <div className="task-card-header">
        <span className={`priority-badge priority-${task.priority.toLowerCase()}`}>
          {task.priority}
        </span>
        
        <div className="card-actions">
          <button
            className="btn-icon-action"
            onClick={() => onEdit(task)}
            title="Edit Task"
            aria-label="Edit Task"
          >
            <Edit3 size={14} />
          </button>
          <button
            className="btn-icon-action delete-action"
            onClick={handleDelete}
            title="Delete Task"
            aria-label="Delete Task"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="task-card-title">{task.title}</div>
      {task.description && <div className="task-card-body">{task.description}</div>}

      <div className="task-card-footer">
        <div className={`task-meta-item ${isOverdue ? 'overdue' : ''}`} title={isOverdue ? 'Overdue!' : 'Due Date'}>
          <Calendar size={12} />
          <span>{task.dueDate ? formatDate(task.dueDate) : 'No due date'}</span>
        </div>

        <div className="task-assignee">
          {task.assignee ? (
            <div className="assignee-avatar-mini" title={`Assigned to ${task.assignee.name}`}>
              {initials}
            </div>
          ) : (
            <div className="assignee-avatar-mini" style={{ opacity: 0.5 }} title="Unassigned">
              <User size={10} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
