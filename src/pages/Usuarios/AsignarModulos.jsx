import React, { useEffect, useState } from "react";
import {
    Box, Paper, Button, Select, MenuItem, FormControl, InputLabel,
    Typography, List, ListItem, ListItemText, ListItemIcon,
    Stack, Checkbox, CircularProgress, Alert
} from "@mui/material";
import ContentPasteIcon from '@mui/icons-material/ContentPaste';

export default function AsignarModulos({ onLogout }) {
    const [perfiles, setPerfiles] = useState([]);
    const [filtroPerfil, setFiltroPerfil] = useState("");
    
    const [listaIzquierda, setListaIzquierda] = useState([]); // Disponibles
    const [listaDerecha, setListaDerecha] = useState([]); // Asignados
    const [listaSeleccionados, setListaSeleccionados] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(null);
    const [mensajeExito, setMensajeExito] = useState(null);

    // Helper functions for fetch with token
    const fetchWithToken = async (url, options = {}) => {
        const token = localStorage.getItem('token');
        const defaultHeaders = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
        const response = await fetch(url, {
            ...options,
            headers: { ...defaultHeaders, ...options.headers }
        });
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                if (onLogout) onLogout();
                throw new Error("Sesión expirada");
            }
            throw new Error(`Error HTTP: ${response.status}`);
        }
        return response.json();
    };

    // Load perfiles on mount
    useEffect(() => {
        const loadPerfiles = async () => {
            try {
                const data = await fetchWithToken('/perfil');
                setPerfiles(data);
            } catch (err) {
                setError("Error al cargar perfiles: " + err.message);
            }
        };
        loadPerfiles();
    }, []);

    // Load modules when profile changes
    useEffect(() => {
        if (!filtroPerfil) {
            setListaIzquierda([]);
            setListaDerecha([]);
            return;
        }

        const loadModulos = async () => {
            setCargando(true);
            setError(null);
            setMensajeExito(null);
            try {
                // Fetch todos los modulos
                const todos = await fetchWithToken('/modulo');
                // Fetch asignados al perfil
                const asignados = await fetchWithToken(`/modulo/asignados/${filtroPerfil}`);
                
                // Set asignados (derecha)
                setListaDerecha(asignados || []);
                
                // Filtramos los asignados de la lista total para obtener disponibles (izquierda)
                const idsAsignados = new Set((asignados || []).map(m => m.id));
                const disponibles = (todos || []).filter(m => !idsAsignados.has(m.id));
                
                setListaIzquierda(disponibles);
                setListaSeleccionados([]);
            } catch (err) {
                setError("Error al cargar módulos: " + err.message);
            } finally {
                setCargando(false);
            }
        };
        loadModulos();
    }, [filtroPerfil]);

    // Save
    const guardarSubMenus = async () => {
        if (!filtroPerfil) return;
        setCargando(true);
        setError(null);
        setMensajeExito(null);
        try {
            const idsModulos = listaDerecha.map(item => item.id);
            await fetchWithToken(`/modulo/asignar/${filtroPerfil}`, {
                method: 'POST',
                body: JSON.stringify({ idsModulos })
            });
            setMensajeExito("Módulos asignados correctamente.");
        } catch (err) {
            setError("Error al guardar asignaciones: " + err.message);
        } finally {
            setCargando(false);
        }
    };

    const handleToggle = (modulo) => () => {
        const seleccionActual = [...listaSeleccionados];
        const index = seleccionActual.findIndex(m => m.id === modulo.id);
        
        if (index === -1) {
            seleccionActual.push(modulo);
        } else {
            seleccionActual.splice(index, 1);
        }
        setListaSeleccionados(seleccionActual);
    };

    const intersection = (a, b) => {
        return a.filter(e => b.some(f => e.id === f.id));
    };

    const not = (a, b) => {
        return a.filter(e => !b.some(f => e.id === f.id));
    };

    const derecha = () => {
        const leftSelect = intersection(listaSeleccionados, listaIzquierda);
        setListaDerecha([...listaDerecha, ...leftSelect]);
        setListaIzquierda(not(listaIzquierda, leftSelect));
        setListaSeleccionados(not(listaSeleccionados, leftSelect));
    };

    const izquierda = () => {
        const rightSelect = intersection(listaSeleccionados, listaDerecha);
        setListaIzquierda([...listaIzquierda, ...rightSelect]);
        setListaDerecha(not(listaDerecha, rightSelect));
        setListaSeleccionados(not(listaSeleccionados, rightSelect));
    };

    const allRight = () => {
        setListaDerecha([...listaDerecha, ...listaIzquierda]);
        setListaIzquierda([]);
        setListaSeleccionados([]);
    };

    const allLeft = () => {
        setListaIzquierda([...listaIzquierda, ...listaDerecha]);
        setListaDerecha([]);
        setListaSeleccionados([]);
    };

    return (
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
            {/* Contenedor principal */}
            <Paper elevation={3} sx={{ 
                p: 3, 
                bgcolor: "#FFFFFF", 
                borderRadius: 3, 
                width: '100%',
                boxSizing: 'border-box',
                flexGrow: 1, 
                display: 'flex', 
                flexDirection: 'column',
                minHeight: 'calc(100vh - 120px)', // Ajustado ya que no hay header externo
                overflow: 'hidden'
            }}>
                {/* Titulo */}
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1e3c72' }}>
                        Asignar Módulos a Perfil
                    </Typography>
                </Box>
                
                {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
                {mensajeExito && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{mensajeExito}</Alert>}

                <Box sx={{ mb: 3, borderBottom: "1px solid #eaeaea", pb: 3 }}>
                    <FormControl size="small" sx={{ minWidth: 300 }}>
                        <InputLabel>Perfil de usuario</InputLabel>
                        <Select
                            label="Perfil de usuario"
                            value={filtroPerfil}
                            onChange={(e) => setFiltroPerfil(e.target.value)}
                            sx={{ borderRadius: 2 }}
                        >
                            {perfiles.map((p) => (
                                <MenuItem key={p.id} value={p.id}>
                                    {p.nombre}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                {/* Títulos de las listas */}
                <Box sx={{ display: 'flex', gap: 3, px: 1 }}>
                    <Typography variant="subtitle2" sx={{ flex: 1, fontWeight: 'bold', color: '#444' }}>Módulos Disponibles</Typography>
                    <Box sx={{ width: 45 }} /> {/* Espaciador del ancho de los botones */}
                    <Typography variant="subtitle2" sx={{ flex: 1, fontWeight: 'bold', color: '#444' }}>Módulos Asignados</Typography>
                </Box>

                {/* El contenedor principal de listas toma el resto del espacio sin saltar */}
                <Box sx={{ display: 'flex', flex: 1, gap: 3, position: 'relative', minHeight: '400px', mt: 1 }}>
                    {cargando ? (
                        <Box sx={{ 
                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
                            display: 'flex', justifyContent: 'center', alignItems: 'center', 
                            bgcolor: 'rgba(255,255,255,0.7)', zIndex: 2 
                        }}>
                            <CircularProgress />
                        </Box>
                    ) : null}
                        
                    {/* Lista izquierda (Disponibles) */}
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <Paper variant="outlined" sx={{ borderRadius: 2, flex: 1, overflowY: 'auto', bgcolor: '#fafafa', height: '400px' }}>
                            <List dense sx={{ p: 0 }}>
                                {listaIzquierda.map((item) => (
                                    <ListItem key={item.id} button onClick={handleToggle(item)} sx={{ borderBottom: '1px solid #f0f0f0', '&:hover': { bgcolor: '#f0f4f8' } }}>
                                        <ListItemIcon>
                                            <Checkbox
                                                edge="start"
                                                checked={listaSeleccionados.findIndex(s => s.id === item.id) !== -1}
                                                tabIndex={-1}
                                                disableRipple
                                                color="primary"
                                            />
                                        </ListItemIcon>
                                        <ListItemText primary={item.nombre} primaryTypographyProps={{ fontWeight: 500 }} />
                                    </ListItem>
                                ))}
                                {listaIzquierda.length === 0 && <Typography sx={{ p: 3, color: 'text.secondary', textAlign: 'center' }}>No hay módulos disponibles</Typography>}
                            </List>
                        </Paper>
                    </Box>

                    {/* Botones */}
                    <Stack spacing={1.5} sx={{ px: 1, my: 'auto' }}>
                        <Button variant="outlined" size="small" sx={{ minWidth: 45, borderRadius: 2, py: 1 }} onClick={allRight} disabled={listaIzquierda.length === 0}>
                            &gt;&gt;
                        </Button>
                        <Button variant="outlined" size="small" sx={{ minWidth: 45, borderRadius: 2, py: 1 }} onClick={derecha} disabled={intersection(listaSeleccionados, listaIzquierda).length === 0}>
                            &gt;
                        </Button>
                        <Button variant="outlined" size="small" sx={{ minWidth: 45, borderRadius: 2, py: 1 }} onClick={izquierda} disabled={intersection(listaSeleccionados, listaDerecha).length === 0}>
                            &lt;
                        </Button>
                        <Button variant="outlined" size="small" sx={{ minWidth: 45, borderRadius: 2, py: 1 }} onClick={allLeft} disabled={listaDerecha.length === 0}>
                            &lt;&lt;
                        </Button>
                    </Stack>

                    {/* Lista derecha (Asignados) */}
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <Paper variant="outlined" sx={{ borderRadius: 2, flex: 1, overflowY: 'auto', bgcolor: '#fafafa', height: '400px' }}>
                            <List dense sx={{ p: 0 }}>
                                {listaDerecha.map((item) => (
                                    <ListItem key={item.id} button onClick={handleToggle(item)} sx={{ borderBottom: '1px solid #f0f0f0', '&:hover': { bgcolor: '#f0f4f8' } }}>
                                        <ListItemIcon>
                                            <Checkbox
                                                edge="start"
                                                checked={listaSeleccionados.findIndex(s => s.id === item.id) !== -1}
                                                tabIndex={-1}
                                                disableRipple
                                                color="primary"
                                            />
                                        </ListItemIcon>
                                        <ListItemText primary={item.nombre} primaryTypographyProps={{ fontWeight: 500 }} />
                                    </ListItem>
                                ))}
                                {listaDerecha.length === 0 && <Typography sx={{ p: 3, color: 'text.secondary', textAlign: 'center' }}>No hay módulos asignados</Typography>}
                            </List>
                        </Paper>
                    </Box>

                </Box>

                <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #eaeaea', display: 'flex', justifyContent: 'flex-start' }}>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<ContentPasteIcon />}
                        sx={{ px: 5, py: 1.2, borderRadius: 2, fontWeight: 'bold', textTransform: 'none' }}
                        onClick={guardarSubMenus}
                        disabled={cargando || !filtroPerfil}
                    >
                        Guardar Cambios
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
}
