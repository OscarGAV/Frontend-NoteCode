const BASE_URL = 'http://localhost:8080/api/v1';

function getToken() {
    return localStorage.getItem('notecode_token');
}

function getUserId() {
    const stored = localStorage.getItem('notecode_user');
    if (!stored) return null;
    try {
        return JSON.parse(stored).id || null;
    } catch {
        return null;
    }
}

async function request(path, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers,
    });

    if (!res.ok) {
        const errorBody = await res.text();
        throw new Error(errorBody || `HTTP ${res.status}`);
    }

    const text = await res.text();
    return text ? JSON.parse(text) : null;
}

// Auth
export async function signUp(username, password, email) {
    return request('/authentication/sign-up', {
        method: 'POST',
        body: JSON.stringify({ username, password, email, roles: [] }),
    });
}

export async function signIn(username, password) {
    return request('/authentication/sign-in', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
    });
}

// Code Snippets
export async function createSnippet(code) {
    return request('/code-snippets', {
        method: 'POST',
        body: JSON.stringify({
            content: code,
            userId: getUserId(),
            isPublic: true,
        }),
    });
}

export async function getSnippetByShareUrl(urlCode) {
    return request(`/code-snippets/share/${urlCode}`);
}

export async function getSnippetById(id) {
    return request(`/code-snippets/${id}`);
}

export async function getSnippetsByUser(userId) {
    return request(`/code-snippets/user/${userId}`);
}