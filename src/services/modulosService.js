import { apiFetch } from './apiClient';

export const getPerfiles = async () => {
    const response = await apiFetch('/perfil');
    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            const err = new Error('Sesión expirada');
            err.status = response.status;
            throw err;
        }
        throw new Error(`Error HTTP: ${response.status}`);
    }
    return await response.json();
};

export const getTodosModulos = async () => {
    const response = await apiFetch('/modulo');
    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            const err = new Error('Sesión expirada');
            err.status = response.status;
            throw err;
        }
        throw new Error(`Error HTTP: ${response.status}`);
    }
    return await response.json();
};

export const getModulosAsignados = async (perfilId) => {
    const response = await apiFetch(`/modulo/asignados/${perfilId}`);
    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            const err = new Error('Sesión expirada');
            err.status = response.status;
            throw err;
        }
        throw new Error(`Error HTTP: ${response.status}`);
    }
    return await response.json();
};

export const asignarModulos = async (perfilId, modulosIds) => {
    const response = await apiFetch(`/modulo/asignar/${perfilId}`, {
        method: 'POST',
        body: JSON.stringify(modulosIds)
    });
    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            const err = new Error('Sesión expirada');
            err.status = response.status;
            throw err;
        }
        throw new Error(`Error HTTP: ${response.status}`);
    }
    return await response.json();
};
