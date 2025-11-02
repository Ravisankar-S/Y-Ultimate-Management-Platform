import { create } from 'zustand';

const initialToken = typeof window !== 'undefined' ? localStorage.getItem('access_Token') : null;

export const useAuthStore = create((set) => ({
    token : initialToken,
    setToken: (token) => {
        if (typeof window !== 'undefined') localStorage.setItem('access_Token', token);
        set({ token });
    },
    logout: () => {
        if (typeof window !== 'undefined') localStorage.removeItem('access_Token');
        set({ token: null });
    },
}));