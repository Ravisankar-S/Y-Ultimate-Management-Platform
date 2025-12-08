import { create } from 'zustand';

const TOKEN_KEY = 'access_token';
const ROLE_KEY = 'user_role';

const readStorage = (key) => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(key);
};

const persist = (key, value) => {
    if (typeof window === 'undefined') return;
    if (value === null || value === undefined) {
        localStorage.removeItem(key);
    } else {
        localStorage.setItem(key, value);
    }
};

const initialState = {
    token: readStorage(TOKEN_KEY),
    role: readStorage(ROLE_KEY),
};

export const useAuthStore = create((set) => ({
    token: initialState.token,
    role: initialState.role,
    setAuth: ({ token, role }) => {
        persist(TOKEN_KEY, token);
        persist(ROLE_KEY, role ?? null);
        set({ token, role: role ?? null });
    },
    setToken: (token) => {
        persist(TOKEN_KEY, token);
        set((state) => ({ token, role: state.role }));
    },
    setRole: (role) => {
        persist(ROLE_KEY, role ?? null);
        set((state) => ({ token: state.token, role: role ?? null }));
    },
    logout: () => {
        persist(TOKEN_KEY, null);
        persist(ROLE_KEY, null);
        set({ token: null, role: null });
    },
}));