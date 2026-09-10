import { apiFetch } from './apiClient';

export const getInspectores = async (pagina = 0, tamanio = 10) => {
    const response = await apiFetch(`/inspector?pagina=${pagina}&tamanio=${tamanio}`);
    if (!response.ok) {
        const errorObj = new Error('No se pudieron obtener los inspectores');
        errorObj.status = response.status;
        throw errorObj;
    }
    return await response.json();
};

export const crearInspector = async (payload) => {
    const response = await apiFetch('/usuario/inspector', {
        method: 'POST',
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        let errorMsg = 'Error al crear el inspector';
        try {
            const errorData = await response.json();
            if (errorData?.error) errorMsg = errorData.error;
            else if (errorData?.message) errorMsg = errorData.message;
        } catch (e) {}
        throw new Error(errorMsg);
    }

    return await response.json();
};

export const editarInspector = async (id, payload) => {
    const response = await apiFetch(`/inspector/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        let errorMsg = 'Error al actualizar el inspector';
        try {
            const errorData = await response.json();
            if (errorData?.error) errorMsg = errorData.error;
            else if (errorData?.message) errorMsg = errorData.message;
        } catch (e) {}
        throw new Error(errorMsg);
    }

    return await response.json();
};
