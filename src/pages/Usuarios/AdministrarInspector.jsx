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
import { getInspectores, crearInspector, editarInspector } from "../../services/inspectoresService";

function AdministrarInspector({ onLogout }) {
    const [inspectores, setInspectores] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    // Paginación
    const [pagina, setPagina] = useState(0);
    const [filaPorPagina, setFilaPorPagina] = useState(10);
    const [totalInspectores, setTotalInspectores] = useState(0);

    // Modal Crear
    const [openDialogCrear, setOpenDialogCrear] = useState(false);
    const [formData, setFormData] = useState({
        password: '',
        email: '',
        nombre: '',
        apellido: '',
        comuna: ''
    });
    
    // Selectores geográficos
    const [formRegion, setFormRegion] = useState('');
    const [formComunaId, setFormComunaId] = useState('');
    
    const [creando, setCreando] = useState(false);
    const [crearError, setCrearError] = useState('');

    const comunasDisponibles = comunas.filter(c => c.regionId === formRegion);

    // Modal Editar
    const [openDialogEditar, setOpenDialogEditar] = useState(false);
    const [inspectorEditando, setInspectorEditando] = useState(null);
    const [formDataEdit, setFormDataEdit] = useState({
        email: '',
        nombre: '',
        apellido: '',
        comuna: ''
    });
    const [formRegionEdit, setFormRegionEdit] = useState('');
    const [formComunaIdEdit, setFormComunaIdEdit] = useState('');
    const [editando, setEditando] = useState(false);
    const [editarError, setEditarError] = useState('');

    const comunasDisponiblesEdit = comunas.filter(c => c.regionId === formRegionEdit);

    useEffect(() => {
        fetchInspectores();
    }, [pagina, filaPorPagina]);

    const fetchInspectores = async () => {
        try {
            setCargando(true);
            const data = await getInspectores(pagina, filaPorPagina);
            
            if (data && data.content) {
                setInspectores(data.content);
                setTotalInspectores(data.totalElements || 0);
            } else {
                const arr = Array.isArray(data) ? data : [];
                setInspectores(arr);
                setTotalInspectores(data.totalElements || arr.length);
            }
        } catch (err) {
            if (err.status === 401 || err.status === 403) {
                if (onLogout) onLogout();
                return;
            }
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    // fetchMunicipiosPorComuna eliminado

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCrear = async () => {
        if (!formData.username || !formData.password || !formData.nombre || !formData.apellido || !formData.comuna) {
            setCrearError('Todos los campos son obligatorios');
            return;
        }

        setCreando(true);
        setCrearError('');

        const payload = {
            username: formData.username,
            password: formData.password,
            nombre: formData.nombre,
            apellido: formData.apellido,
            comuna: formData.comuna,
            email: formData.email
        };

        try {
            await crearInspector(payload);

            setOpenDialogCrear(false);
            setFormData({ username: '', password: '', email: '', nombre: '', apellido: '', comuna: '' });
            setFormRegion('');
            setFormComunaId('');
            fetchInspectores();
        } catch (err) {
            setCrearError(err.message);
        } finally {
            setCreando(false);
        }
    };

    const handleFormEditChange = (e) => {
        const { name, value } = e.target;
        setFormDataEdit(prev => ({ ...prev, [name]: value }));
    };

    const handleOpenEditar = (insp) => {
        setInspectorEditando(insp.id);
        setFormDataEdit({
            username: insp.usernameUsuario || '',
            email: insp.email || '',
            nombre: insp.nombre || '',
            apellido: insp.apeliido || insp.apellido || '',
            comuna: insp.comuna || ''
        });
        setEditarError('');

        // Cargar comuna preseleccionada
        if (insp.comuna) {
            const comunaObj = comunas.find(c => c.nombre.toLowerCase() === insp.comuna.toLowerCase());
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
        if (!formDataEdit.nombre || !formDataEdit.apellido || !formDataEdit.comuna) {
            setEditarError('Todos los campos son obligatorios');
            return;
        }

        setEditando(true);
        setEditarError('');

        const payload = {
            email: formDataEdit.email,
            nombre: formDataEdit.nombre,
            apellido: formDataEdit.apellido,
            comuna: formDataEdit.comuna
        };

        try {
            await editarInspector(inspectorEditando, payload);

            setOpenDialogEditar(false);
            fetchInspectores();
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
                                            <TableCell align="center">Email</TableCell>
                                            <TableCell align="center">Nombre Completo</TableCell>
                                            <TableCell align="center">Comuna</TableCell>
                                            <TableCell align="center">Acciones</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {inspectores.length > 0 ? (
                                            inspectores.map((insp) => (
                                                <TableRow key={insp.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                    <TableCell align="center">{insp.email || '-'}</TableCell>
                                                    <TableCell align="center">{insp.nombre} {insp.apeliido || insp.apellido}</TableCell>
                                                    <TableCell align="center">{insp.comuna}</TableCell>
                                                    <TableCell align="center">
                                                        <IconButton color="primary" onClick={() => handleOpenEditar(insp)}>
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
                            label="Email"
                            name="email"
                            type="email"
                            variant="outlined"
                            fullWidth
                            value={formData.email}
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

            {/* Dialog - Editar Inspector */}
            <Dialog open={openDialogEditar} onClose={() => setOpenDialogEditar(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold', color: '#1e3c72' }}>Editar Inspector</DialogTitle>
                <DialogContent>
                    {editarError && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{editarError}</Alert>}
                    
                    <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                      
                        <TextField
                            label="Email"
                            name="email"
                            type="email"
                            variant="outlined"
                            fullWidth
                            value={formDataEdit.email}
                            onChange={handleFormEditChange}
                        />
                        <TextField
                            label="Nombre"
                            name="nombre"
                            variant="outlined"
                            fullWidth
                            value={formDataEdit.nombre}
                            onChange={handleFormEditChange}
                        />
                        <TextField
                            label="Apellido"
                            name="apellido"
                            variant="outlined"
                            fullWidth
                            value={formDataEdit.apellido}
                            onChange={handleFormEditChange}
                        />
                        
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

export default AdministrarInspector;
