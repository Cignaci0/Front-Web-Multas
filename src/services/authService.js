import { apiFetch } from './apiClient';

export const loginWeb = async (username, password) => {
    const response = await apiFetch('/usuario/loginWeb', {
        method: 'POST',
        body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
};

export const getMenu = async () => {
    const response = await apiFetch('/modulo/menu');
    let data = null;
    if (response.ok) {
        data = await response.json();
    }
    return { ok: response.ok, status: response.status, data };
};
