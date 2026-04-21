const API_BASE_URL = 'http://localhost:3000/api';const api = {
    async fetch(endpoint, options = {}) {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        const text = await response.text();
let data;

try {
    data = JSON.parse(text);
} catch {
    console.error("Server returned:", text); // 👈 shows real problem
    throw new Error("Server is not returning JSON. Check backend.");
}

        if (!response.ok) {
            throw new Error(data.detail || data.message || 'Something went wrong');
        }

        return data;
    },

    auth: {
        register(userData) {
            return api.fetch('/auth/register', {
                method: 'POST',
                body: JSON.stringify(userData),
            });
        },
        login(credentials) {
            return api.fetch('/auth/login', {
                method: 'POST',
                body: JSON.stringify(credentials),
            });
        }
    },

    events: {
    getAll() {
        return api.fetch('/events');
    },
    create(eventData) {
        return api.fetch('/events/', {
            method: 'POST',
            body: JSON.stringify(eventData),
        });
    },
    delete(id) {
        return api.fetch(`/events/${id}/`, {
            method: 'DELETE',
        });
    }
},

    registrations: {
    getAll() {
        return api.fetch('/registrations/');
    },
    create(registrationData) {
        return api.fetch('/registrations/', {
            method: 'POST',
            body: JSON.stringify(registrationData),
        });
    },
    updateStatus(id, status) {
        return api.fetch(`/registrations/${id}/`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });
    }
}
};

window.api = api;
