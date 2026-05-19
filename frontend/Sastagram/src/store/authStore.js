import { create } from 'zustand';

const storedToken = localStorage.getItem('token');
const storedUser = localStorage.getItem('user');

export const useAuthStore = create((set) => ({
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken,
  isAuthenticated: !!storedToken,

  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  updateUser: (partial) =>
    set((state) => {
      if (!state.user) return state;
      const updated = { ...state.user, ...partial };
      localStorage.setItem('user', JSON.stringify(updated));
      return { user: updated };
    }),

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
