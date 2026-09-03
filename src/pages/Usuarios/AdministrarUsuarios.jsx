import React, { useState, useEffect } from "react";
import {
    Box, Paper, Button, Table, TableContainer, TableHead,
    TableRow, TableCell, TableBody, Dialog, DialogTitle,
    DialogContent, DialogActions, IconButton, Typography,
    CircularProgress, TablePagination, Select, MenuItem,
    FormControl, InputLabel, TextField, Alert, Chip, Switch, FormControlLabel
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { regiones, comunas } from "../../utils/dataGeografica";

function AdministrarUsuarios({ onLogout }) {
    const [usuarios, setUsuarios] = useState([]);
    const [perfiles, setPerfiles] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(null);

    // Paginación
    const [pagina, setPagina] = useState(0);
    const [filaPorPagina, setFilaPorPagina] = useState(10);
    const [totalUsuarios, setTotalUsuarios] = useState(0);

    // Modal Crear
    const [openDialogCrear, setOpenDialogCrear] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        comuna: '',
        perfil: '' // guardará el ID del perfil
    });
    
    // Selectores geográficos
    const [formRegion, setFormRegion] = useState('');
    const [formComunaId, setFormComunaId] = useState('');
    
    const [creando, setCreando] = useState(false);
    const [crearError, setCrearError] = useState('');

    const comunasDisponibles = comunas.filter(c => c.regionId === formRegion);

    // Modal Editar
    const [openDialogEditar, setOpenDialogEditar] = useState(false);
    const [usuarioEditando, setUsuarioEditando] = useState(null);
    const [formDataEdit, setFormDataEdit] = useState({
        username: '',
        password: '', // Opcional al editar
        email: '',
        comuna: '',
        perfil: '',
        estado: true,
        es_inspector: false
    });
    const [formRegionEdit, setFormRegionEdit] = useState('');
    const [formComunaIdEdit, setFormComunaIdEdit] = useState('');
    const [editando, setEditando] = useState(false);
    const [editarError, setEditarError] = useState('');

    const comunasDisponiblesEdit = comunas.filter(c => c.regionId === formRegionEdit);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsuarios();
        }, 300);
        return () => clearTimeout(timer);
    }, [pagina, filaPorPagina]);

    useEffect(() => {
        fetchPerfiles();
    }, []);

    const fetchPerfiles = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/perfil', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setPerfiles(data);
            }
        } catch (e) {
            console.error("Error al cargar perfiles", e);
        }
    };

    const fetchUsuarios = async () => {
        try {
            setCargando(true);
            const token = localStorage.getItem('token');
            
            const response = await fetch(`/usuario?pagina=${pagina}&tamanio=${filaPorPagina}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    if (onLogout) onLogout();
                    return;
                }
                throw new Error('No se pudieron obtener los usuarios');
            }
            
            const data = await response.json();
            
            if (data && data.content) {
                setUsuarios(data.content);
                setTotalUsuarios(data.totalElements || 0);
            } else {
                const arr = Array.isArray(data) ? data : [];
                setUsuarios(arr);
                setTotalUsuarios(data.totalElements || arr.length);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCrear = async () => {
        if (!formData.username || !formData.password || !formData.email || !formData.perfil) {
            setCrearError('Los campos Username, Password, Email y Perfil son obligatorios');
            return;
        }

        setCreando(true);
        setCrearError('');
        const token = localStorage.getItem('token');

        const payload = {
            username: formData.username,
            password: formData.password,
            email: formData.email,
            comuna: formData.comuna,
            perfil: { id: formData.perfil }
        };

        try {
            const response = await fetch(`/usuario`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                let errorMsg = 'Error al crear el usuario';
                try {
                    const errorData = await response.json();
                    if (errorData && errorData.error) {
                        errorMsg = errorData.error;
                    } else if (errorData && errorData.message) {
                        errorMsg = errorData.message;
                    }
                } catch (e) {
                    // Fallback
                }
                throw new Error(errorMsg);
            }

            setOpenDialogCrear(false);
            setFormData({ username: '', password: '', email: '', comuna: '', perfil: '' });
            setFormRegion('');
            setFormComunaId('');
            fetchUsuarios();
        } catch (err) {
            setCrearError(err.message);
        } finally {
            setCreando(false);
        }
    };

    const handleFormEditChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormDataEdit(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
    };

    const handleOpenEditar = (usu) => {
        setUsuarioEditando(usu.id);
        setFormDataEdit({
            username: usu.username || '',
            password: '', // En blanco por seguridad, si no se llena no se actualiza
            email: usu.email || '',
            comuna: usu.comuna || '',
            perfil: usu.idPerfil || (typeof usu.perfil === 'object' ? usu.perfil?.id : usu.perfil) || '',
            estado: usu.estado !== undefined ? usu.estado : true,
            es_inspector: usu.es_inspector !== undefined ? usu.es_inspector : false
        });
        setEditarError('');

        // Cargar comuna preseleccionada
        if (usu.comuna) {
            const comunaObj = comunas.find(c => c.nombre.toLowerCase() === usu.comuna.toLowerCase());
            if (comunaObj) {
                setFormRegionEdit(comunaObj.regionId);
                setFormComunaIdEdit(comunaObj.id);
            } else {
                setFormRegionEdit('');
                setFormComunaIdEdit('');
            }
        } else {
            setFormRegionEdit('');
            setFormComunaIdEdit('');
        }

        setOpenDialogEditar(true);
    };

    const handleEditar = async () => {
        if (!formDataEdit.username || !formDataEdit.perfil) {
            setEditarError('Los campos Username y Perfil son obligatorios');
            return;
        }

        setEditando(true);
        setEditarError('');
        const token = localStorage.getItem('token');

        const payload = {
            email: formDataEdit.email,
            estado: formDataEdit.estado,
            username: formDataEdit.username,
            perfil: Number(formDataEdit.perfil),
            es_inspector: formDataEdit.es_inspector,
            comuna: formDataEdit.comuna
        };
        
        if (formDataEdit.password) {
            payload.password = formDataEdit.password;
        }

        try {
            const response = await fetch(`/usuario/${usuarioEditando}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                let errorMsg = 'Error al actualizar el usuario';
                try {
                    const errorData = await response.json();
                    if (errorData && errorData.error) errorMsg = errorData.error;
                    else if (errorData && errorData.message) errorMsg = errorData.message;
                } catch (e) {}
                throw new Error(errorMsg);
            }

            setOpenDialogEditar(false);
            fetchUsuarios();
        } catch (err) {
            setEditarError(err.message);
        } finally {
            setEditando(false);
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
                        Administración de Usuarios
                    </Typography>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        startIcon={<AddIcon />}
                        sx={{ borderRadius: 2, fontWeight: 'bold' }}
                        onClick={() => setOpenDialogCrear(true)}
                    >
                        Crear Usuario
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
                                            <TableCell align="center">Email</TableCell>
                                            <TableCell align="center">Perfil</TableCell>
                                            <TableCell align="center">Comuna</TableCell>
                                            <TableCell align="center">Tipo</TableCell>
                                            <TableCell align="center">Estado</TableCell>
                                            <TableCell align="center">Acciones</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {usuarios.length > 0 ? (
                                            usuarios.map((usu) => (
                                                <TableRow key={usu.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                    <TableCell align="center">{usu.username}</TableCell>
                                                    <TableCell align="center">{usu.email || '-'}</TableCell>
                                                    <TableCell align="center">
                                                        <Chip label={usu.nombrePerfil || 'N/A'} color="primary" variant="outlined" size="small" />
                                                    </TableCell>
                                                    <TableCell align="center">{usu.comuna || '-'}</TableCell>
                                                    <TableCell align="center">
                                                        {usu.es_inspector ? (
                                                            <Chip label="Inspector" color="primary" size="small" />
                                                        ) : (
                                                            <Chip label="Regular" color="default" size="small" />
                                                        )}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        {usu.estado ? (
                                                            <Chip label="Activo" color="success" size="small" />
                                                        ) : (
                                                            <Chip label="Inactivo" color="error" size="small" />
                                                        )}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <IconButton color="primary" onClick={() => handleOpenEditar(usu)}>
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
                                                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
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
                                count={totalUsuarios}
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

            {/* Dialog - Crear Usuario */}
            <Dialog open={openDialogCrear} onClose={() => setOpenDialogCrear(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold', color: '#1e3c72' }}>Crear Nuevo Usuario</DialogTitle>
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
                            label="Email"
                            name="email"
                            type="email"
                            variant="outlined"
                            fullWidth
                            value={formData.email}
                            onChange={handleFormChange}
                        />
                        
                        <FormControl fullWidth>
                            <InputLabel>Perfil</InputLabel>
                            <Select
                                name="perfil"
                                value={formData.perfil}
                                label="Perfil"
                                onChange={handleFormChange}
                            >
                                {perfiles.map((p) => (
                                    <MenuItem key={p.id} value={p.id}>{p.nombre}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Box sx={{ gridColumn: { xs: '1', sm: '1 / span 2' }, mt: 2 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#666' }}>
                                Asignación de Comuna
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2, gridColumn: { xs: '1', sm: '1 / span 2' } }}>
                            <FormControl fullWidth>
                                <InputLabel>Región</InputLabel>
                                <Select
                                    value={formRegion}
                                    label="Región"
                                    onChange={(e) => {
                                        setFormRegion(e.target.value);
                                        setFormComunaId('');
                                        setFormData(prev => ({ ...prev, comuna: '' }));
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
                                    value={formComunaId}
                                    label="Comuna"
                                    onChange={(e) => {
                                        setFormComunaId(e.target.value);
                                        const comunaObj = comunas.find(c => c.id === e.target.value);
                                        if (comunaObj) {
                                            setFormData(prev => ({ ...prev, comuna: comunaObj.nombre }));
                                        }
                                    }}
                                >
                                    {comunasDisponibles.map((c) => (
                                        <MenuItem key={c.id} value={c.id}>{c.nombre}</MenuItem>
                                    ))}
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
                        disabled={creando}
                        sx={{ fontWeight: 'bold', borderRadius: 2 }}
                    >
                        {creando ? <CircularProgress size={24} /> : "Crear"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog - Editar Usuario */}
            <Dialog open={openDialogEditar} onClose={() => setOpenDialogEditar(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold', color: '#1e3c72' }}>Editar Usuario</DialogTitle>
                <DialogContent>
                    {editarError && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{editarError}</Alert>}
                    
                    <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                        <TextField
                            label="Username"
                            name="username"
                            variant="outlined"
                            fullWidth
                            value={formDataEdit.username}
                            onChange={handleFormEditChange}
                        />
                        <TextField
                            label="Email"
                            name="email"
                            type="email"
                            variant="outlined"
                            fullWidth
                            value={formDataEdit.email}
                            onChange={handleFormEditChange}
                        />

                        <FormControl fullWidth>
                            <InputLabel>Perfil</InputLabel>
                            <Select
                                name="perfil"
                                value={formDataEdit.perfil}
                                label="Perfil"
                                onChange={handleFormEditChange}
                            >
                                {perfiles.map((p) => (
                                    <MenuItem key={p.id} value={p.id}>{p.nombre}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', ml: { sm: 2 } }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formDataEdit.estado}
                                        onChange={handleFormEditChange}
                                        name="estado"
                                        color="primary"
                                    />
                                }
                                label="Activo"
                            />
                          
                        </Box>

                        <Box sx={{ gridColumn: { xs: '1', sm: '1 / span 2' }, mt: 2 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#666' }}>
                                Asignación de Comuna
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2, gridColumn: { xs: '1', sm: '1 / span 2' } }}>
                            <FormControl fullWidth>
                                <InputLabel>Región</InputLabel>
                                <Select
                                    value={formRegionEdit}
                                    label="Región"
                                    onChange={(e) => {
                                        setFormRegionEdit(e.target.value);
                                        setFormComunaIdEdit('');
                                        setFormDataEdit(prev => ({ ...prev, comuna: '' }));
                                    }}
                                >
                                    {regiones.map((r) => (
                                        <MenuItem key={r.id} value={r.id}>{r.nombre}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            
                            <FormControl fullWidth disabled={!formRegionEdit}>
                                <InputLabel>Comuna</InputLabel>
                                <Select
                                    value={formComunaIdEdit}
                                    label="Comuna"
                                    onChange={(e) => {
                                        setFormComunaIdEdit(e.target.value);
                                        const comunaObj = comunas.find(c => c.id === e.target.value);
                                        if (comunaObj) {
                                            setFormDataEdit(prev => ({ ...prev, comuna: comunaObj.nombre }));
                                        }
                                    }}
                                >
                                    {comunasDisponiblesEdit.map((c) => (
                                        <MenuItem key={c.id} value={c.id}>{c.nombre}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenDialogEditar(false)} color="inherit" sx={{ fontWeight: 'bold' }}>
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleEditar} 
                        variant="contained" 
                        color="primary"
                        disabled={editando}
                        sx={{ fontWeight: 'bold', borderRadius: 2 }}
                    >
                        {editando ? <CircularProgress size={24} /> : "Guardar Cambios"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default AdministrarUsuarios;
