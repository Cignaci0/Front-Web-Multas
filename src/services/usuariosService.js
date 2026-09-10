import { apiFetch } from './apiClient';

export const getPerfiles = async () => {
    const response = await apiFetch('/perfil');
    if (response.ok) {
        return await response.json();
    }
    throw new Error('Error al cargar perfiles');
};

export const getUsuarios = async (pagina = 0, tamanio = 10) => {
    const response = await apiFetch(`/usuario?pagina=${pagina}&tamanio=${tamanio}`);
    if (!response.ok) {
        const errorObj = new Error('No se pudieron obtener los usuarios');
        errorObj.status = response.status;
        throw errorObj;
    }
    return await response.json();
};

export const crearUsuario = async (payload) => {
    const response = await apiFetch('/usuario', {
        method: 'POST',
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        let errorMsg = 'Error al crear el usuario';
        try {
            const errorData = await response.json();
            if (errorData?.error) errorMsg = errorData.error;
            else if (errorData?.message) errorMsg = errorData.message;
        } catch (e) {}
        throw new Error(errorMsg);
    }

    return await response.json();
};

export const editarUsuario = async (id, payload) => {
    const response = await apiFetch(`/usuario/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        let errorMsg = 'Error al actualizar el usuario';
        try {
            const errorData = await response.json();
            if (errorData?.error) errorMsg = errorData.error;
            else if (errorData?.message) errorMsg = errorData.message;
        } catch (e) {}
        throw new Error(errorMsg);
    }

    return await response.json();
};
