// src/lib/api.js

const API_BASE_URL = 'http://127.0.0.1:8000/api/game';

// Helper to get the access token from localStorage
function getAccessToken() {
    return localStorage.getItem('accessToken');
}

// Helper function for making authenticated API requests
async function request(endpoint, options = {}) {
    const token = getAccessToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // If a token exists, add it to the Authorization header
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.error || 'An API error occurred');
    }
    if (response.status === 204) {
        return null;
    }
    return response.json();
}

// --- User Authentication ---
export const registerUser = (username, password) => {
    return request('/auth/register/', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
    });
};

export const loginUser = async (username, password) => {
    const data = await request('/auth/token/', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
    });
    // On successful login, store the tokens in localStorage
    if (data.access) {
        localStorage.setItem('accessToken', data.access);
        localStorage.setItem('refreshToken', data.refresh);
    }
    return data;
};

export const logoutUser = () => {
    // On logout, remove the tokens from localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    // We can also call a backend endpoint to blacklist the token if needed,
    // but for now, client-side removal is sufficient.
    return Promise.resolve();
};

export const getCurrentUser = () => {
    // This now relies on the token being sent in the header
    return request('/auth/user/');
};

// --- Match Management ---
// Note: These no longer need to send the username, as the user
// is identified by the token in the Authorization header.
export const createMatch = (overs, wickets) => {
    return request('/matches/create/', {
        method: 'POST',
        body: JSON.stringify({ overs, wickets }),
    });
};

export const joinMatch = (match_code) => {
    return request('/matches/join/', {
        method: 'POST',
        body: JSON.stringify({ match_code }),
    });
};

