"use client";

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext({
    user: null,
    loading: true,
    refreshUser: () => { },
    logout: () => { }
});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const res = await fetch('/api/profile');
            const data = await res.json();
            if (data.success && data.data) {
                // Return data.data which includes { ...user, profile } from the API
                setUser(data.data);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const value = {
        user,
        loading,
        refreshUser: fetchUser,
        logout: async () => {
            try {
                await fetch('/api/auth/logout', { method: 'POST' });
            } catch (err) {
                console.error("Logout error", err);
            }
            setUser(null);
            window.location.href = '/auth/login';
        }
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
