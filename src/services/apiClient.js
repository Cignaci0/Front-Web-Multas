export const getToken = () => {
    return sessionStorage.getItem('token') || localStorage.getItem('token');
};

export const apiFetch = async (url, options = {}) => {
    const token = getToken();
    const defaultHeaders = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

    const response = await fetch(fullUrl, {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers
        }
    });

    return response;
};
