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
        <BarChart3 size={18} style={{ color: 'var(--color-primary)' }} />
        <h3 className="widget-title">Team Workload</h3>
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
            
            const todoPct = total > 0 ? (Todo / total) * 100 : 0;
            const progressPct = total > 0 ? (inProgress / total) * 100 : 0;
            const donePct = total > 0 ? (Done / total) * 100 : 0;

            const initials = user.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);

            return (
              <div className="workload-item" key={user.id ?? 'unassigned'}>
                <div className="workload-item-header">
                  <div className="workload-user-details">
                    <div className="assignee-avatar-mini" style={{ width: '1.75rem', height: '1.75rem', fontSize: '0.7rem' }}>
                      {initials || '?'}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className="workload-user-name">{user.name}</span>
                      <span className="workload-user-role">{user.role}</span>
                    </div>
                  </div>
                  <span className="workload-total-tasks">
                    {total} {total === 1 ? 'task' : 'tasks'}
                  </span>
                </div>

                {total > 0 ? (
                  <>
                    <div className="workload-bar-split">
                      {Todo > 0 && (
                        <div
                          className="workload-bar-chunk workload-bar-todo"
                          style={{ width: `${todoPct}%` }}
                          title={`Todo: ${Todo}`}
                        />
                      )}
                      {inProgress > 0 && (
                        <div
                          className="workload-bar-chunk workload-bar-progress"
                          style={{ width: `${progressPct}%` }}
                          title={`In Progress: ${inProgress}`}
                        />
                      )}
                      {Done > 0 && (
                        <div
                          className="workload-bar-chunk workload-bar-done"
                          style={{ width: `${donePct}%` }}
                          title={`Done: ${Done}`}
                        />
                      )}
                    </div>
                    <div className="workload-legend">
                      <span className="legend-item" title={`Todo: ${Todo}`}>
                        <span className="legend-dot workload-bar-todo" />
                        <span>Todo: {Todo}</span>
                      </span>
                      <span className="legend-item" title={`In Progress: ${inProgress}`}>
                        <span className="legend-dot workload-bar-progress" />
                        <span>In Progress: {inProgress}</span>
                      </span>
                      <span className="legend-item" title={`Done: ${Done}`}>
                        <span className="legend-dot workload-bar-done" />
                        <span>Done: {Done}</span>
                      </span>
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', paddingLeft: '2.25rem' }}>
                    No assigned tasks
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
