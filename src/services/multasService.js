import { apiFetch } from './apiClient';

export const getTiposMultaMenu = async () => {
    const response = await apiFetch('/tipoMulta/menu');
    if (response.ok) {
        return await response.json();
    }
    throw new Error(`Error al obtener tipos de multa (${response.status})`);
};

export const buscarTiposMulta = async (query = '', pagina = 0, tamanio = 50) => {
    const queryParams = new URLSearchParams({
        query: query,
        pagina: pagina,
        tamanio: tamanio
    });

    const response = await apiFetch(`/tipoMulta?${queryParams.toString()}`);
    if (!response.ok) {
        throw new Error(`Error al buscar tipos de multa (${response.status})`);
    }
    const data = await response.json();
    if (Array.isArray(data)) {
        return data;
    }
    if (data && Array.isArray(data.content)) {
        return data.content;
    }
    return [];
};

export const getMultas = async (pagina = 0, tamanio = 10, busqueda = '') => {
    const queryParams = new URLSearchParams({
        pagina: pagina,
        tamanio: tamanio
    });

    const urlBase = busqueda ? `/multa/${encodeURIComponent(busqueda)}` : '/multa';
    const url = `${urlBase}?${queryParams.toString()}`;

    const response = await apiFetch(url);
    
    if (!response.ok) {
        const errorObj = new Error(`Error al obtener las multas (Error HTTP ${response.status})`);
        errorObj.status = response.status;
        throw errorObj;
    }

    return await response.json();
};

export const getMultasEliminadas = async (pagina = 0, tamanio = 10, busqueda = '') => {
    const queryParams = new URLSearchParams({
        pagina: pagina,
        tamanio: tamanio
    });

    const urlBase = busqueda ? `/multa/eliminadas/${encodeURIComponent(busqueda)}` : '/multa/eliminadas';
    const url = `${urlBase}?${queryParams.toString()}`;

    const response = await apiFetch(url);
    
    if (!response.ok) {
        const errorObj = new Error(`Error al obtener las multas eliminadas (Error HTTP ${response.status})`);
        errorObj.status = response.status;
        throw errorObj;
    }

    return await response.json();
};

export const editarMulta = async (id, payload) => {
    const response = await apiFetch(`/multa/edit/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        let errorMsg = 'Error al actualizar la multa';
        try {
            const errorData = await response.json();
            if (errorData?.error) errorMsg = errorData.error;
            else if (errorData?.message) errorMsg = errorData.message;
        } catch (e) {}
        throw new Error(errorMsg);
    }

    return await response.json();
};

export const eliminarMulta = async (id, motivoEliminacion) => {
    const response = await apiFetch(`/multa/borrar/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
            descripcion_desactivada: motivoEliminacion
        })
    });

    if (!response.ok) {
        let errorMsg = 'Error al eliminar la multa';
        try {
            const errorData = await response.json();
            if (errorData?.error) errorMsg = errorData.error;
            else if (errorData?.message) errorMsg = errorData.message;
        } catch (e) {}
        throw new Error(errorMsg);
    }

    return await response.json();
};
