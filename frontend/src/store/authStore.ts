import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface AuthStore {
    token: string | null;
    username: string | null;

    login: (token: string, username: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            token: null,
            username: null,

            login: (token, username) => set({ token, username }),
            logout: () => set({ token: null, username: null }),
        }),
        {
            name: "omniai-auth-store",
            storage: createJSONStorage(() => localStorage),
        }
    )
);
