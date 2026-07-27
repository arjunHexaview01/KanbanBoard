import React, { useState } from 'react';
import TaskCard from './TaskCard';
import { useBoardStore } from '../store/useBoardStore';
import { KanbanSquare, Play, CheckCircle } from 'lucide-react';

export default function BoardColumn({ status, tasks, onEdit }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const { updateTask } = useBoardStore();

  const getColumnIcon = () => {
    switch (status) {
      case 'Todo':
        return <KanbanSquare size={18} style={{ color: 'var(--color-primary)' }} />;
      case 'In Progress':
        return <Play size={18} style={{ color: 'var(--color-warning)' }} />;
      case 'Done':
        return <CheckCircle size={18} style={{ color: 'var(--color-success)' }} />;
      default:
        return null;
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    try {
      await updateTask(taskId, { status });
    } catch (err) {
      console.error('Failed to move task:', err);
    }
  };

  return (
    <div
      className={`board-column ${isDragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="column-header">
        <div className="column-title-group">
          {getColumnIcon()}
          <span className="column-title">{status}</span>
        </div>
        <span className="column-badge">{tasks.length}</span>
      </div>

      <div className="task-list">
        {tasks.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem 1rem', borderStyle: 'none' }}>
            <span className="empty-state-title" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              No tasks
            </span>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={onEdit} />
          ))
        )}
      </div>
    </div>
  );
}
