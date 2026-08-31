import React, { useState, useEffect } from 'react';
import {
    Box, Paper, TextField, Button, Table, TableContainer, TableHead,
    TableRow, TableCell, TableBody, Dialog, DialogTitle,
    DialogContent, DialogActions, IconButton, Typography,
    CircularProgress, TablePagination, Link
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CameraAltIcon from '@mui/icons-material/CameraAlt';

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
    const [editUbicacion, setEditUbicacion] = useState("");

    const [selectedMultaEliminar, setSelectedMultaEliminar] = useState(null);
    const [openDialogEliminar, setOpenDialogEliminar] = useState(false);

    const [totalMultas, setTotalMultas] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchMultas();
        }, 300);
        return () => clearTimeout(timer);
    }, [pagina, filaPorPagina, busqueda]);

    const fetchMultas = async () => {
        try {
            setCargando(true);
            const token = localStorage.getItem('token');
            
            const queryParams = new URLSearchParams({
                pagina: pagina,
                tamanio: filaPorPagina
            });

            const urlBase = busqueda ? `/multa/${encodeURIComponent(busqueda)}` : '/multa';
            const url = `${urlBase}?${queryParams.toString()}`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    if (onLogout) onLogout();
                    return;
                }
                throw new Error('No se pudieron obtener las multas (Error HTTP ' + response.status + ')');
            }
            
            const data = await response.json();
            
            if (data && data.content) {
                setMultas(data.content);
                setTotalMultas(data.totalElements || 0);
            } else {
                const arr = Array.isArray(data) ? data : [];
                setMultas(arr);
                setTotalMultas(data.totalElements || arr.length);
            }
        } catch (err) {
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

    const handleEditar = () => {
        alert("Función de editar pendiente de endpoint backend");
        setOpenDialogEditar(false);
    };

    const handleEliminar = () => {
        alert("Función de eliminar pendiente de endpoint backend");
        setOpenDialogEliminar(false);
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
                            InputProps={{ disableUnderline: true }} 
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
                                        <TableCell align="center">Patente</TableCell>
                                        <TableCell align="center">Ubicación</TableCell>
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
                                                    {multa.patente || '-'}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Link 
                                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(multa.ubicacion)}`} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        sx={{ textDecoration: 'none', color: 'primary.main', fontWeight: 'bold', '&:hover': { textDecoration: 'underline' } }}
                                                    >
                                                        {multa.ubicacion}
                                                    </Link>
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
                                                            setSelectedMultaEditar(multa);
                                                            setEditUbicacion(multa.ubicacion);
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
                <DialogTitle>Editar Multa</DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ mt: 1 }}>
                        <TextField
                            fullWidth
                            label="Ubicación"
                            size="small"
                            value={editUbicacion}
                            onChange={(e) => setEditUbicacion(e.target.value)}
                        />
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                        * La edición real requiere el endpoint del backend.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialogEditar(false)} color="error">Cancelar</Button>
                    <Button onClick={handleEditar} variant="contained" color="primary">Guardar</Button>
                </DialogActions>
            </Dialog>

            {/* Dialog - Eliminar */}
            <Dialog open={openDialogEliminar} onClose={() => setOpenDialogEliminar(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Eliminar Multa</DialogTitle>
                <DialogContent dividers>
                    <Typography>¿Estás seguro de que deseas eliminar esta multa?</Typography>
                    {selectedMultaEliminar && (
                        <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                            Ubicación: {selectedMultaEliminar.ubicacion}
                        </Typography>
                    )}
                    <Typography variant="caption" color="error" sx={{ display: 'block', mt: 2 }}>
                        * La eliminación real requiere el endpoint del backend.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialogEliminar(false)} color="primary">Cancelar</Button>
                    <Button onClick={handleEliminar} variant="contained" color="error">Eliminar</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
