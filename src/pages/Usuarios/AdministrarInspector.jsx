import React, { useState, useEffect } from "react";
import {
    Box, Paper, Button, Table, TableContainer, TableHead,
    TableRow, TableCell, TableBody, Dialog, DialogTitle,
    DialogContent, DialogActions, IconButton, Typography,
    CircularProgress, TablePagination, Select, MenuItem,
    FormControl, InputLabel, TextField, Alert, Grid
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { regiones, comunas } from "../../utils/dataGeografica";

function AdministrarInspector({ onLogout }) {
    const [inspectores, setInspectores] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(null);

    // Paginación
    const [pagina, setPagina] = useState(0);
    const [filaPorPagina, setFilaPorPagina] = useState(10);
    const [totalInspectores, setTotalInspectores] = useState(0);

    // Modal Crear
    const [openDialogCrear, setOpenDialogCrear] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        nombre: '',
        apellido: '',
        id_municipio: ''
    });
    
    // Selectores geográficos para buscar municipio
    const [formRegion, setFormRegion] = useState('');
    const [formComuna, setFormComuna] = useState('');
    const [municipiosOpciones, setMunicipiosOpciones] = useState([]);
    const [cargandoMunicipios, setCargandoMunicipios] = useState(false);
    
    const [creando, setCreando] = useState(false);
    const [crearError, setCrearError] = useState('');

    const comunasDisponibles = comunas.filter(c => c.regionId === formRegion);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchInspectores();
        }, 300);
        return () => clearTimeout(timer);
    }, [pagina, filaPorPagina]);

    // Cada vez que cambia la comuna en el formulario, buscamos los municipios
    useEffect(() => {
        if (formComuna) {
            const comunaObj = comunas.find(c => c.id === formComuna);
            if (comunaObj) {
                fetchMunicipiosPorComuna(comunaObj.nombre);
            }
        } else {
            setMunicipiosOpciones([]);
            setFormData(prev => ({ ...prev, id_municipio: '' }));
        }
    }, [formComuna]);

    const fetchInspectores = async () => {
        try {
            setCargando(true);
            const token = localStorage.getItem('token');
            
            const response = await fetch(`/inspector?pagina=${pagina}&tamanio=${filaPorPagina}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    if (onLogout) onLogout();
                    return;
                }
                throw new Error('No se pudieron obtener los inspectores');
            }
            
            const data = await response.json();
            
            if (data && data.content) {
                setInspectores(data.content);
                setTotalInspectores(data.totalElements || 0);
            } else {
                const arr = Array.isArray(data) ? data : [];
                setInspectores(arr);
                setTotalInspectores(data.totalElements || arr.length);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    const fetchMunicipiosPorComuna = async (nombreComuna) => {
        setCargandoMunicipios(true);
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`/municipio?comuna=${encodeURIComponent(nombreComuna)}&pagina=0&tamanio=100`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                if (data && data.content) {
                    setMunicipiosOpciones(data.content);
                } else if (Array.isArray(data)) {
                    setMunicipiosOpciones(data);
                } else {
                    setMunicipiosOpciones([]);
                }
            } else {
                setMunicipiosOpciones([]);
            }
        } catch (e) {
            setMunicipiosOpciones([]);
        } finally {
            setCargandoMunicipios(false);
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCrear = async () => {
        if (!formData.username || !formData.password || !formData.nombre || !formData.apellido || !formData.id_municipio) {
            setCrearError('Todos los campos son obligatorios');
            return;
        }

        setCreando(true);
        setCrearError('');
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`/usuario/inspector`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Error al crear el inspector');
            }

            setOpenDialogCrear(false);
            setFormData({ username: '', password: '', nombre: '', apellido: '', id_municipio: '' });
            setFormRegion('');
            setFormComuna('');
            fetchInspectores();
        } catch (err) {
            setCrearError(err.message);
        } finally {
            setCreando(false);
        }
    };

    return (
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
            <Paper elevation={3} sx={{ 
                p: 3, 
                bgcolor: "#FFFFFF", 
                borderRadius: 3, 
                width: "100%",
                display: 'flex',
                flexDirection: 'column',
                minHeight: 'calc(100vh - 120px)',
                overflow: "hidden"
            }}>
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1e3c72' }}>
                        Administración de Inspectores
                    </Typography>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        startIcon={<AddIcon />}
                        sx={{ borderRadius: 2, fontWeight: 'bold' }}
                        onClick={() => setOpenDialogCrear(true)}
                    >
                        Crear Inspector
                    </Button>
                </Box>

                <Box sx={{ flexGrow: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
                    {cargando && (
                        <Box sx={{ 
                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
                            display: 'flex', justifyContent: 'center', alignItems: 'center', 
                            bgcolor: 'rgba(255,255,255,0.7)', zIndex: 2 
                        }}>
                            <CircularProgress />
                        </Box>
                    )}
                    
                    {error ? (
                        <Typography color="error" align="center" sx={{ p: 3 }}>{error}</Typography>
                    ) : (
                        <>
                            <TableContainer sx={{ flexGrow: 1, maxHeight: 'calc(100vh - 250px)', border: '1px solid #e0e0e0', borderRadius: 2 }}>
                                <Table stickyHeader>
                                    <TableHead sx={{ '& th': { bgcolor: '#f9f9f9', borderBottom: '2px solid #ddd', fontWeight: 'bold' } }}>
                                        <TableRow>
                                            <TableCell align="center">Username</TableCell>
                                            <TableCell align="center">Nombre Completo</TableCell>
                                            <TableCell align="center">Municipio</TableCell>
                                            <TableCell align="center">Acciones</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {inspectores.length > 0 ? (
                                            inspectores.map((insp) => (
                                                <TableRow key={insp.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                    <TableCell align="center">{insp.usernameUsuario}</TableCell>
                                                    <TableCell align="center">{insp.nombre} {insp.apeliido || insp.apellido}</TableCell>
                                                    <TableCell align="center">{insp.nombreMunicipio}</TableCell>
                                                    <TableCell align="center">
                                                        <IconButton color="primary" onClick={() => alert("Editar pendiente")}>
                                                            <EditIcon />
                                                        </IconButton>
                                                        <IconButton color="error" onClick={() => alert("Eliminar pendiente")}>
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                                    <Typography variant="body1" color="text.secondary">
                                                        No se encontraron registros.
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 20]}
                                component="div"
                                count={totalInspectores}
                                rowsPerPage={filaPorPagina}
                                page={pagina}
                                onPageChange={(e, newPage) => setPagina(newPage)}
                                onRowsPerPageChange={(e) => {
                                    setFilaPorPagina(parseInt(e.target.value, 10));
                                    setPagina(0);
                                }}
                                labelRowsPerPage="Filas por página"
                                labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                            />
                        </>
                    )}
                </Box>
            </Paper>

            {/* Dialog - Crear Inspector */}
            <Dialog open={openDialogCrear} onClose={() => setOpenDialogCrear(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold', color: '#1e3c72' }}>Crear Nuevo Inspector</DialogTitle>
                <DialogContent>
                    {crearError && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{crearError}</Alert>}
                    
                    <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                        <TextField
                            label="Username"
                            name="username"
                            variant="outlined"
                            fullWidth
                            value={formData.username}
                            onChange={handleFormChange}
                        />
                        <TextField
                            label="Password"
                            name="password"
                            type="password"
                            variant="outlined"
                            fullWidth
                            value={formData.password}
                            onChange={handleFormChange}
                        />
                        <TextField
                            label="Nombre"
                            name="nombre"
                            variant="outlined"
                            fullWidth
                            value={formData.nombre}
                            onChange={handleFormChange}
                        />
                        <TextField
                            label="Apellido"
                            name="apellido"
                            variant="outlined"
                            fullWidth
                            value={formData.apellido}
                            onChange={handleFormChange}
                        />
                        
                        <Box sx={{ gridColumn: { xs: '1', sm: '1 / span 2' }, mt: 2 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#666' }}>
                                Asignación de Municipio
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2, gridColumn: { xs: '1', sm: '1 / span 2' } }}>
                            <FormControl fullWidth>
                                <InputLabel>Región</InputLabel>
                                <Select
                                    value={formRegion}
                                    label="Región"
                                    onChange={(e) => {
                                        setFormRegion(e.target.value);
                                        setFormComuna('');
                                    }}
                                >
                                    {regiones.map((r) => (
                                        <MenuItem key={r.id} value={r.id}>{r.nombre}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            
                            <FormControl fullWidth disabled={!formRegion}>
                                <InputLabel>Comuna</InputLabel>
                                <Select
                                    value={formComuna}
                                    label="Comuna"
                                    onChange={(e) => setFormComuna(e.target.value)}
                                >
                                    {comunasDisponibles.map((c) => (
                                        <MenuItem key={c.id} value={c.id}>{c.nombre}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            
                            <FormControl fullWidth disabled={!formComuna || cargandoMunicipios}>
                                <InputLabel>{cargandoMunicipios ? "Cargando..." : "Municipio"}</InputLabel>
                                <Select
                                    name="id_municipio"
                                    value={formData.id_municipio}
                                    label={cargandoMunicipios ? "Cargando..." : "Municipio"}
                                    onChange={handleFormChange}
                                >
                                    {municipiosOpciones.length > 0 ? (
                                        municipiosOpciones.map((m) => (
                                            <MenuItem key={m.id} value={m.id}>{m.nombre}</MenuItem>
                                        ))
                                    ) : (
                                        <MenuItem value="" disabled>No hay municipios</MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenDialogCrear(false)} color="inherit" sx={{ fontWeight: 'bold' }}>
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleCrear} 
                        variant="contained" 
                        color="primary"
                        disabled={creando || cargandoMunicipios}
                        sx={{ fontWeight: 'bold', borderRadius: 2 }}
                    >
                        {creando ? <CircularProgress size={24} /> : "Crear"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default AdministrarInspector;
