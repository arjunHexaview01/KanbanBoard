import { create } from 'zustand';

const defaultFilters = {
  assigneeId: '',
  priority: '',
  page: 1,
  limit: 10,
};

export const useBoardStore = create((set, get) => ({
  token: localStorage.getItem('token') || null,
  currentUser: JSON.parse(localStorage.getItem('currentUser')) || null,

  tasks: [],
  users: [],
  workloadReport: [],

  filters: { ...defaultFilters },
  totalPages: 1,
  totalItems: 0,

  isLoading: false,
  error: null,

  getHeaders: () => {
    const token = get().token;
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
  },

  handleApiError: async (response) => {
    try {
      const data = await response.json();
      return data.message || data.error || 'Something went wrong';
    } catch {
      return `HTTP error: ${response.status}`;
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorMsg = await get().handleApiError(res);
        throw new Error(errorMsg);
      }

      const data = await res.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('currentUser', JSON.stringify(data.user));

      set({
        token: data.token,
        currentUser: data.user,
        isLoading: false,
      });

      await get().fetchUsers();
      await get().fetchTasks();
      await get().fetchWorkloadReport();
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  register: async (name, email, password, role) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      if (!res.ok) {
        const errorMsg = await get().handleApiError(res);
        throw new Error(errorMsg);
      }

      const data = await res.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('currentUser', JSON.stringify(data.user));

      set({
        token: data.token,
        currentUser: data.user,
        isLoading: false,
      });

      await get().fetchUsers();
      await get().fetchTasks();
      await get().fetchWorkloadReport();
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    set({
      token: null,
      currentUser: null,
      tasks: [],
      users: [],
      workloadReport: [],
      filters: { ...defaultFilters },
      error: null,
    });
  },

  fetchUsers: async () => {
    try {
      const res = await fetch('/users', {
        headers: get().getHeaders(),
      });
      if (res.ok) {
        const users = await res.json();
        set({ users });
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  },

  fetchTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const { assigneeId, priority, page, limit } = get().filters;
      const queryParams = new URLSearchParams();
      if (assigneeId) queryParams.append('assigneeId', assigneeId);
      if (priority) queryParams.append('priority', priority);
      queryParams.append('page', page);
      queryParams.append('limit', limit);

      const res = await fetch(`/tasks?${queryParams.toString()}`, {
        headers: get().getHeaders(),
      });

      if (!res.ok) {
        const errorMsg = await get().handleApiError(res);
        throw new Error(errorMsg);
      }

      const data = await res.json();
      set({
        tasks: data.tasks,
        totalPages: data.totalPages,
        totalItems: data.totalItems,
        isLoading: false,
      });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  createTask: async (taskData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/tasks', {
        method: 'POST',
        headers: get().getHeaders(),
        body: JSON.stringify(taskData),
      });

      if (!res.ok) {
        const errorMsg = await get().handleApiError(res);
        throw new Error(errorMsg);
      }

      set({ isLoading: false });
      await get().fetchTasks();
      await get().fetchWorkloadReport();
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  updateTask: async (taskId, updateData) => {
    set({ error: null });
    try {
      const res = await fetch(`/tasks/${taskId}`, {
        method: 'PATCH',
        headers: get().getHeaders(),
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        const errorMsg = await get().handleApiError(res);
        throw new Error(errorMsg);
      }

      const updatedTask = await res.json();

      const updatedTasks = get().tasks.map((t) =>
        t.id === taskId || t.id === parseInt(taskId, 10) ? updatedTask : t
      );
      set({ tasks: updatedTasks });

      await get().fetchTasks();
      await get().fetchWorkloadReport();
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  deleteTask: async (taskId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/tasks/${taskId}`, {
        method: 'DELETE',
        headers: get().getHeaders(),
      });

      if (!res.ok) {
        const errorMsg = await get().handleApiError(res);
        throw new Error(errorMsg);
      }

      set({ isLoading: false });
      await get().fetchTasks();
      await get().fetchWorkloadReport();
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  fetchWorkloadReport: async () => {
    try {
      const res = await fetch('/reports/workload', {
        headers: get().getHeaders(),
      });
      if (res.ok) {
        const workloadReport = await res.json();
        set({ workloadReport });
      }
    } catch (err) {
      console.error('Failed to fetch workload report:', err);
    }
  },

  setFilter: (name, value) => {
    set((state) => ({
      filters: {
        ...state.filters,
        [name]: value,
        page: name === 'page' ? value : 1,
      },
    }));
    get().fetchTasks();
  },

  clearFilters: () => {
    set({ filters: { ...defaultFilters } });
    get().fetchTasks();
  },
}));
