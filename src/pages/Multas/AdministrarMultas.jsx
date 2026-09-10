//hola

import React, { useState, useEffect } from 'react';
import {
    Box, Paper, TextField, Button, Table, TableContainer, TableHead,
    TableRow, TableCell, TableBody, Dialog, DialogTitle,
    DialogContent, DialogActions, IconButton, Typography,
    CircularProgress, TablePagination, Link, Chip,
    MenuItem, Select, InputLabel, FormControl, Alert, Autocomplete
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import MapIcon from '@mui/icons-material/Map';
import { getTiposMultaMenu, getMultas, editarMulta, eliminarMulta, buscarTiposMulta } from '../../services/multasService';

export default function AdministrarMultas({ onLogout }) {
    const [multas, setMultas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    
    // Paginación y Filtrado
    const [busqueda, setBusqueda] = useState("");
    const [pagina, setPagina] = useState(0);
    const [filaPorPagina, setFilaPorPagina] = useState(10);

    // Estados Modales
    const [selectedMultaFotos, setSelectedMultaFotos] = useState(null);
    const [openDialogFotos, setOpenDialogFotos] = useState(false);

    const [selectedMultaEditar, setSelectedMultaEditar] = useState(null);
    const [openDialogEditar, setOpenDialogEditar] = useState(false);
    
    // Campos a editar
    const [padreEdit, setPadreEdit] = useState('');
    const [formDataEdit, setFormDataEdit] = useState({
        patente: '',
        direccion: '',
        ubicacion: '',
        tipo_multa: null
    });
    const [editando, setEditando] = useState(false);
    const [editarError, setEditarError] = useState('');

    // Búsqueda dinámica de tipos de multa para Autocomplete
    const [opcionesTipoMulta, setOpcionesTipoMulta] = useState([]);
    const [cargandoTiposMulta, setCargandoTiposMulta] = useState(false);
    const [inputValueTipoMulta, setInputValueTipoMulta] = useState('');

    const [selectedMultaEliminar, setSelectedMultaEliminar] = useState(null);
    const [openDialogEliminar, setOpenDialogEliminar] = useState(false);
    const [motivoEliminacion, setMotivoEliminacion] = useState("");
    const [eliminando, setEliminando] = useState(false);
    const [eliminarError, setEliminarError] = useState("");

    const [totalMultas, setTotalMultas] = useState(0);

    const [tiposMultaMenu, setTiposMultaMenu] = useState([]);

    useEffect(() => {
        if (!openDialogEditar) return;
        const timer = setTimeout(async () => {
            setCargandoTiposMulta(true);
            try {
                const data = await buscarTiposMulta(inputValueTipoMulta);
                setOpcionesTipoMulta(data);
            } catch (err) {
                console.error("Error al buscar tipos de multa:", err);
            } finally {
                setCargandoTiposMulta(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [inputValueTipoMulta, openDialogEditar]);

    useEffect(() => {
        if (!busqueda) {
            fetchMultas();
            return;
        }
        const timer = setTimeout(() => {
            fetchMultas();
        }, 300);
        return () => clearTimeout(timer);
    }, [pagina, filaPorPagina, busqueda]);

    const fetchMultas = async () => {
        try {
            setCargando(true);
            const data = await getMultas(pagina, filaPorPagina, busqueda);
            
            if (data && data.content) {
                setMultas(data.content);
                setTotalMultas(data.totalElements || 0);
            } else {
                const arr = Array.isArray(data) ? data : [];
                setMultas(arr);
                setTotalMultas(data.totalElements || arr.length);
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

    const handleChangePage = (event, newPage) => {
        setPagina(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setFilaPorPagina(parseInt(event.target.value, 10));
        setPagina(0);
    };

    const multasAMostrar = multas;

    const handleEditar = async () => {
        setEditando(true);
        setEditarError('');
        
        try {
            const payload = {
                idTipoMulta: formDataEdit.tipo_multa?.id,
                patente: formDataEdit.patente,
                direccion: formDataEdit.direccion
            };

            await editarMulta(selectedMultaEditar, payload);

            setOpenDialogEditar(false);
            fetchMultas();
        } catch (err) {
            setEditarError(err.message);
        } finally {
            setEditando(false);
        }
    };

    const handleEliminar = async () => {
        if (!motivoEliminacion.trim()) {
            setEliminarError("Debe ingresar un motivo de eliminación");
            return;
        }

        setEliminando(true);
        setEliminarError("");

        try {
            await eliminarMulta(selectedMultaEliminar.id, motivoEliminacion);

            setOpenDialogEliminar(false);
            setMotivoEliminacion("");
            fetchMultas();
        } catch (err) {
            setEliminarError(err.message);
        } finally {
            setEliminando(false);
        }
    };

    return (
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Contenedor unificado principal */}
            <Paper elevation={3} sx={{ 
                p: 3, 
                bgcolor: "#FFFFFF", 
                borderRadius: 3, 
                width: "100%",
                display: 'flex',
                flexDirection: 'column',
                minHeight: 'calc(100vh - 120px)', // Ocupa todo el espacio restante
                overflow: "hidden"
            }}>
                {/* Cabecera / Título */}
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1e3c72' }}>
                        Administración de Multas
                    </Typography>
                </Box>

                {/* Buscador */}
                <Box sx={{ mb: 3, display: "flex", alignItems: 'center' }}>
                    <Paper 
                        variant="outlined"
                        sx={{ 
                            p: "2px 4px", 
                            display: "flex", 
                            alignItems: "center", 
                            width: 350, 
                            height: 45, 
                            borderRadius: 2,
                            borderColor: '#e0e0e0',
                            bgcolor: '#f9f9f9',
                            boxShadow: 'none'
                        }}
                    >
                        <TextField 
                            placeholder="Buscar por Patente..." 
                            variant="standard" 
                            slotProps={{ input: { disableUnderline: true } }} 
                            sx={{ ml: 2, flex: 1 }} 
                            value={busqueda} 
                            onChange={(e) => {
                                setBusqueda(e.target.value);
                                setPagina(0);
                            }} 
                        />
                        <IconButton type="button" sx={{ p: '10px', color: 'text.secondary' }} aria-label="search">
                            <SearchIcon />
                        </IconButton>
                    </Paper>
                </Box>

                {/* Tabla Principal */}
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
                            <TableContainer sx={{ flexGrow: 1, maxHeight: 'calc(100vh - 350px)', border: '1px solid #e0e0e0', borderRadius: 2 }}>
                            <Table stickyHeader>
                                <TableHead sx={{ '& th': { bgcolor: '#f9f9f9', borderBottom: '2px solid #ddd', fontWeight: 'bold' } }}>
                                    <TableRow>
                                        <TableCell align="center">Fecha</TableCell>
                                        <TableCell align="center">Hora</TableCell>
                                        <TableCell align="center">Tipo de Multa</TableCell>
                                        <TableCell align="center">Patente</TableCell>
                                        <TableCell align="center">Dirección</TableCell>
                                        <TableCell align="center">Mapa</TableCell>
                                        <TableCell align="center">Acciones</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {multasAMostrar.length > 0 ? (
                                        multasAMostrar.map((multa, index) => (
                                            <TableRow key={index} hover>
                                                <TableCell align="center">
                                                    {new Date(multa.fecha_creacion).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {new Date(multa.fecha_creacion).toLocaleTimeString()}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip 
                                                         label={
                                                             (typeof multa.tipo_multa === 'string' ? multa.tipo_multa : null) ||
                                                             (typeof multa.tipoMulta === 'string' ? multa.tipoMulta : null) ||
                                                             multa.tipo_multa?.nombre || 
                                                             multa.tipoMulta?.nombre || 
                                                             multa.nombreTipoMulta || 
                                                             'Desconocido'
                                                         } 
                                                        color="primary" 
                                                        variant="outlined" 
                                                        size="small" 
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    {multa.patente || '-'}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {multa.direccion || '-'}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <IconButton 
                                                        component="a"
                                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(multa.ubicacion)}`} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        color="primary"
                                                        title="Ver en Google Maps"
                                                    >
                                                        <MapIcon />
                                                    </IconButton>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <IconButton 
                                                        color="primary" 
                                                        title="Ver Fotos"
                                                        onClick={() => {
                                                            setSelectedMultaFotos(multa);
                                                            setOpenDialogFotos(true);
                                                        }}
                                                    >
                                                        <CameraAltIcon />
                                                    </IconButton>
                                                    <IconButton 
                                                        color="info" 
                                                        title="Editar Multa"
                                                        onClick={() => {
                                                            setSelectedMultaEditar(multa.id);
                                                            
                                                            const getNombre = (m) => {
                                                                if (!m) return '';
                                                                if (typeof m.tipo_multa === 'string') return m.tipo_multa;
                                                                if (typeof m.tipoMulta === 'string') return m.tipoMulta;
                                                                if (m.tipo_multa?.nombre) return m.tipo_multa.nombre;
                                                                if (m.tipoMulta?.nombre) return m.tipoMulta.nombre;
                                                                if (m.nombreTipoMulta) return m.nombreTipoMulta;
                                                                if (m.tipoMultaNombre) return m.tipoMultaNombre;
                                                                return '';
                                                            };

                                                            const getId = (m) => {
                                                                if (!m) return null;
                                                                if (m.idTipoMulta) return m.idTipoMulta;
                                                                if (m.tipo_multa?.id) return m.tipo_multa.id;
                                                                if (m.tipoMulta?.id) return m.tipoMulta.id;
                                                                if (typeof m.tipo_multa === 'number') return m.tipo_multa;
                                                                if (typeof m.tipoMulta === 'number') return m.tipoMulta;
                                                                return null;
                                                            };

                                                            const multaTipoId = getId(multa);
                                                            const multaTipoNombre = getNombre(multa);
                                                            
                                                            const initialTipo = (multaTipoId || multaTipoNombre) ? { 
                                                                id: multaTipoId, 
                                                                nombre: multaTipoNombre || (multaTipoId ? `Tipo Multa #${multaTipoId}` : '') 
                                                            } : null;

                                                            setFormDataEdit({
                                                                patente: multa.patente || '',
                                                                direccion: multa.direccion || '',
                                                                ubicacion: multa.ubicacion || '',
                                                                tipo_multa: initialTipo
                                                            });
                                                            setInputValueTipoMulta(multaTipoNombre);
                                                            setEditarError('');
                                                            setOpenDialogEditar(true);
                                                        }}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                    <IconButton 
                                                        color="error" 
                                                        title="Eliminar Multa"
                                                        onClick={() => {
                                                            setSelectedMultaEliminar(multa);
                                                            setMotivoEliminacion("");
                                                            setEliminarError("");
                                                            setOpenDialogEliminar(true);
                                                        }}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
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
                            rowsPerPageOptions={[5, 10, 25, 50]}
                            component="div"
                            count={totalMultas}
                            rowsPerPage={filaPorPagina}
                            page={pagina}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            labelRowsPerPage="Filas por página"
                            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                        />
                        </>
                    )}
                </Box>
            </Paper>

            {/* Dialog - Fotos */}
            <Dialog 
                open={openDialogFotos} 
                onClose={() => setOpenDialogFotos(false)} 
                maxWidth="md" 
                fullWidth
            >
                <DialogTitle sx={{ bgcolor: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
                    Fotografías de la Multa
                </DialogTitle>
                <DialogContent dividers sx={{ bgcolor: '#fafafa', p: 3 }}>
                    {selectedMultaFotos && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {selectedMultaFotos.foto1 && (
                                <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold', color: '#555' }}>Foto 1</Typography>
                                    <img src={`data:image/jpeg;base64,${selectedMultaFotos.foto1}`} alt="Foto 1" style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '8px', backgroundColor: '#000' }} />
                                </Paper>
                            )}
                            {selectedMultaFotos.foto2 && (
                                <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold', color: '#555' }}>Foto 2</Typography>
                                    <img src={`data:image/jpeg;base64,${selectedMultaFotos.foto2}`} alt="Foto 2" style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '8px', backgroundColor: '#000' }} />
                                </Paper>
                            )}
                            {selectedMultaFotos.foto3 && (
                                <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold', color: '#555' }}>Foto 3</Typography>
                                    <img src={`data:image/jpeg;base64,${selectedMultaFotos.foto3}`} alt="Foto 3" style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '8px', backgroundColor: '#000' }} />
                                </Paper>
                            )}
                            {(!selectedMultaFotos.foto1 && !selectedMultaFotos.foto2 && !selectedMultaFotos.foto3) && (
                                <Typography color="text.secondary">No hay fotografías registradas.</Typography>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenDialogFotos(false)} variant="outlined" color="primary">Cerrar</Button>
                </DialogActions>
            </Dialog>

            {/* Dialog - Editar */}
            <Dialog open={openDialogEditar} onClose={() => setOpenDialogEditar(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold', color: '#1e3c72' }}>Editar Multa</DialogTitle>
                <DialogContent dividers>
                    {editarError && <Alert severity="error" sx={{ mb: 2 }}>{editarError}</Alert>}
                    <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Autocomplete
                            fullWidth
                            options={opcionesTipoMulta}
                            loading={cargandoTiposMulta}
                            getOptionLabel={(option) => {
                                if (typeof option === 'string') return option;
                                return option.nombre || '';
                            }}
                            isOptionEqualToValue={(option, value) => option?.id === value?.id}
                            value={formDataEdit.tipo_multa}
                            onChange={(event, newValue) => {
                                setFormDataEdit(prev => ({ ...prev, tipo_multa: newValue }));
                            }}
                            inputValue={inputValueTipoMulta}
                            onInputChange={(event, newInputValue) => {
                                setInputValueTipoMulta(newInputValue);
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Tipo de Multa"
                                    variant="outlined"
                                    placeholder="Escriba para buscar tipo de multa..."
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                            <React.Fragment>
                                                {cargandoTiposMulta ? <CircularProgress color="inherit" size={20} /> : null}
                                                {params.InputProps?.endAdornment}
                                            </React.Fragment>
                                        ),
                                    }}
                                />
                            )}
                        />

                        <TextField
                            fullWidth
                            label="Patente"
                            name="patente"
                            variant="outlined"
                            value={formDataEdit.patente}
                            onChange={(e) => setFormDataEdit(prev => ({ ...prev, patente: e.target.value }))}
                        />
                        <TextField
                            fullWidth
                            label="Dirección"
                            name="direccion"
                            variant="outlined"
                            value={formDataEdit.direccion}
                            onChange={(e) => setFormDataEdit(prev => ({ ...prev, direccion: e.target.value }))}
                        />
             
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
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

            {/* Dialog - Eliminar */}
            <Dialog open={openDialogEliminar} onClose={() => setOpenDialogEliminar(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold', color: '#d32f2f' }}>Eliminar Multa</DialogTitle>
                <DialogContent dividers>
                    {eliminarError && <Alert severity="error" sx={{ mb: 2 }}>{eliminarError}</Alert>}
                    <Typography gutterBottom>
                        ¿Estás seguro de que deseas eliminar esta multa? Esta acción requiere confirmación y un motivo.
                    </Typography>
                    {selectedMultaEliminar && (
                        <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary', mb: 2 }}>
                            Patente: {selectedMultaEliminar.patente || 'N/A'} - Fecha: {new Date(selectedMultaEliminar.fecha_creacion).toLocaleDateString()}
                        </Typography>
                    )}
                    
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            label="Motivo de Eliminación"
                            variant="outlined"
                            multiline
                            rows={3}
                            value={motivoEliminacion}
                            onChange={(e) => setMotivoEliminacion(e.target.value)}
                            required
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenDialogEliminar(false)} color="inherit" sx={{ fontWeight: 'bold' }}>
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleEliminar} 
                        variant="contained" 
                        color="error"
                        disabled={eliminando || !motivoEliminacion.trim()}
                        sx={{ fontWeight: 'bold', borderRadius: 2 }}
                    >
                        {eliminando ? <CircularProgress size={24} /> : "Confirmar y Eliminar"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
