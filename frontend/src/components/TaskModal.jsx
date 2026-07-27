import React, { useState, useEffect } from 'react';
import { useBoardStore } from '../store/useBoardStore';
import { X } from 'lucide-react';

export default function TaskModal({ task, onClose }) {
  const isEdit = !!task;
  const { users, createTask, updateTask, isLoading } = useBoardStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Todo');
  const [priority, setPriority] = useState('Medium');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setStatus(task.status || 'Todo');
      setPriority(task.priority || 'Medium');
      setAssigneeId(task.assigneeId || '');
      setDueDate(task.dueDate || '');
    } else {
      setTitle('');
      setDescription('');
      setStatus('Todo');
      setPriority('Medium');
      setAssigneeId('');
      setDueDate('');
    }
    setErrors({});
  }, [task]);

  const validateForm = () => {
    const tempErrors = {};
    if (!title.trim()) {
      tempErrors.title = 'Title is required';
    }

    if (dueDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const [year, month, day] = dueDate.split('-').map(Number);
      const targetDate = new Date(year, month - 1, day);
      
      if (targetDate < today) {
        tempErrors.dueDate = 'Due date cannot be in the past';
      }
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const taskData = {
      title: title.trim(),
      description: description.trim() || null,
      status,
      priority,
      assigneeId: assigneeId ? parseInt(assigneeId, 10) : null,
      dueDate: dueDate || null,
    };

    try {
      if (isEdit) {
        await updateTask(task.id, taskData);
      } else {
        await createTask(taskData);
      }
      onClose();
    } catch (err) {
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{isEdit ? 'Edit Task' : 'Create Task'}</h3>
          <button className="btn-close" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="modal-form">
              <div className="form-group">
                <label className="form-label">Task Title *</label>
                <input
                  type="text"
                  className={`form-input ${errors.title ? 'error' : ''}`}
                  placeholder="e.g. Add validation middleware"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isLoading}
                />
                {errors.title && <span className="form-error-msg">{errors.title}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  style={{ minHeight: '80px', resize: 'vertical' }}
                  placeholder="Describe the objective of this task..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="filter-select"
                    style={{ width: '100%', padding: '0.625rem 0.75rem' }}
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    disabled={isLoading}
                  >
                    <option value="Todo">Todo</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select
                    className="filter-select"
                    style={{ width: '100%', padding: '0.625rem 0.75rem' }}
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    disabled={isLoading}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Assignee</label>
                  <select
                    className="filter-select"
                    style={{ width: '100%', padding: '0.625rem 0.75rem' }}
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    disabled={isLoading}
                  >
                    <option value="">Unassigned</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    disabled={isLoading}
                  />
                  {errors.dueDate && <span className="form-error-msg">{errors.dueDate}</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? <span className="spinner"></span> : isEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
