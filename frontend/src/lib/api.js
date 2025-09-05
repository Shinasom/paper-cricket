// src/lib/api.js

const API_BASE_URL = 'http://127.0.0.1:8000/api/game';

// Helper function for making API requests
async function request(endpoint, options = {}) {
    const defaultOptions = {
        // --- THIS IS THE CRUCIAL FIX ---
        // This tells the browser to send cookies with requests to another domain.
        credentials: 'include',
        // -----------------------------
        headers: {
            'Content-Type': 'application/json',
        },
    };

    // Merge the default options with any custom options for a specific request
    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers,
        },
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, mergedOptions);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.error || 'An API error occurred');
    }
    if (response.status === 204) {
        return null; // Handle successful empty responses (like logout)
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

export const loginUser = (username, password) => {
    return request('/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
    });
};

export const getCurrentUser = () => {
    // This request will now send the session cookie automatically
    return request('/auth/user/');
};

// We will need a logout view in Django soon
export const logoutUser = () => {
    return request('/auth/logout/', { method: 'POST' });
};


// --- Match Management ---
export const createMatch = (username, overs, wickets) => {
    return request('/matches/create/', {
        method: 'POST',
        body: JSON.stringify({ username, overs, wickets }),
    });
};

export const joinMatch = (username, match_code) => {
    return request('/matches/join/', {
        method: 'POST',
        body: JSON.stringify({ username, match_code }),
    });
};
