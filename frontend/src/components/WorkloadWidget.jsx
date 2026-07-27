import React from 'react';
import { useBoardStore } from '../store/useBoardStore';
import { BarChart3, AlertCircle } from 'lucide-react';

export default function WorkloadWidget() {
  const { workloadReport, users } = useBoardStore();

  const getProcessedWorkload = () => {
    const data = {};

    users.forEach((user) => {
      data[user.id] = {
        user,
        Todo: 0,
        'In Progress': 0,
        Done: 0,
        total: 0,
      };
    });

    workloadReport.forEach((item) => {
      const key = item.assigneeId;
      const count = parseInt(item.taskCount, 10) || 0;

      if (key === null) {
        if (!data['unassigned']) {
          data['unassigned'] = {
            user: { id: null, name: 'Unassigned', role: 'N/A' },
            Todo: 0,
            'In Progress': 0,
            Done: 0,
            total: 0,
          };
        }
        data['unassigned'][item.status] = count;
        data['unassigned'].total += count;
      } else {
        if (!data[key]) {
          data[key] = {
            user: item.assignee || { id: key, name: `User #${key}`, role: 'Member' },
            Todo: 0,
            'In Progress': 0,
            Done: 0,
            total: 0,
          };
        }
        data[key][item.status] = count;
        data[key].total += count;
      }
    });

    return Object.values(data).sort((a, b) => {
      if (a.user.id === null) return 1;
      if (b.user.id === null) return -1;
      return a.user.name.localeCompare(b.user.name);
    });
  };

  const processedData = getProcessedWorkload();

  return (
    <div className="workload-widget">
      <div className="widget-header">
        <BarChart3 size={16} style={{ color: 'var(--color-primary)' }} />
        <h3 className="widget-title">Workload Summary</h3>
      </div>

      <div className="workload-list">
        {processedData.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            <AlertCircle size={16} />
            <span>No workload data available.</span>
          </div>
        ) : (
          processedData.map((item) => {
            const { user, Todo, 'In Progress': inProgress, Done, total } = item;
            const initials = user.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);

            return (
              <div className="workload-item" key={user.id ?? 'unassigned'} style={{ paddingBottom: '0.5rem', borderBottom: '1px solid #f4f5f7' }}>
                <div className="workload-item-header" style={{ marginBottom: '0.15rem' }}>
                  <div className="workload-user-details">
                    <div className="assignee-avatar-mini" style={{ width: '1.5rem', height: '1.5rem', fontSize: '0.65rem' }}>
                      {initials || '?'}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className="workload-user-name" style={{ fontSize: '0.825rem' }}>{user.name}</span>
                      <span className="workload-user-role" style={{ fontSize: '0.65rem' }}>{user.role}</span>
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', paddingLeft: '2rem' }}>
                  Tasks: <strong>{total}</strong> (Todo: {Todo} | In Progress: {inProgress} | Done: {Done})
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
