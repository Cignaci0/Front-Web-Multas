import React, { useState, useEffect } from "react";
import {
    Box, Paper, Button, Table, TableContainer, TableHead,
    TableRow, TableCell, TableBody, Dialog, DialogTitle,
    DialogContent, DialogActions, IconButton, Typography,
    CircularProgress, TablePagination, Select, MenuItem,
    FormControl, InputLabel, TextField, Alert
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { regiones, comunas } from "../../utils/dataGeografica";

function AdministrarMunicipio({ onLogout }) {
    const [municipios, setMunicipios] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(null);

    // Paginación
    const [pagina, setPagina] = useState(0);
    const [filaPorPagina, setFilaPorPagina] = useState(10);
    const [totalMunicipios, setTotalMunicipios] = useState(0);

    // Buscador
    const [regionBusqueda, setRegionBusqueda] = useState('');
    const [comunaBusqueda, setComunaBusqueda] = useState('');
    const comunasDisponiblesBusqueda = comunas.filter(c => c.regionId === regionBusqueda);

    // Modal Crear
    const [openDialogCrear, setOpenDialogCrear] = useState(false);
    const [nuevaRegion, setNuevaRegion] = useState('');
    const [nuevaComuna, setNuevaComuna] = useState('');
    const [nuevoNombre, setNuevoNombre] = useState('');
    const [creando, setCreando] = useState(false);
    const [crearError, setCrearError] = useState('');

    const comunasDisponiblesCrear = comunas.filter(c => c.regionId === nuevaRegion);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchMunicipios();
        }, 300);
        return () => clearTimeout(timer);
    }, [pagina, filaPorPagina, comunaBusqueda]);

    const fetchMunicipios = async () => {
        try {
            setCargando(true);
            const token = localStorage.getItem('token');
            
            const queryParams = new URLSearchParams({
                pagina: pagina,
                tamanio: filaPorPagina
            });

            if (comunaBusqueda) {
                const comunaObj = comunas.find(c => c.id === comunaBusqueda);
                if (comunaObj) {
                    queryParams.append('comuna', comunaObj.nombre);
                }
            }

            const response = await fetch(`/municipio?${queryParams.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    if (onLogout) onLogout();
                    return;
                }
                throw new Error('No se pudieron obtener los municipios');
            }
            
            const data = await response.json();
            
            if (data && data.content) {
                setMunicipios(data.content);
                setTotalMunicipios(data.totalElements || 0);
            } else {
                const arr = Array.isArray(data) ? data : [];
                setMunicipios(arr);
                setTotalMunicipios(data.totalElements || arr.length);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    const handleCrear = async () => {
        if (!nuevaComuna || !nuevoNombre) {
            setCrearError('Todos los campos son obligatorios');
            return;
        }

        const comunaObj = comunas.find(c => c.id === nuevaComuna);
        if (!comunaObj) return;

        setCreando(true);
        setCrearError('');
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`/municipio`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    comuna: comunaObj.nombre,
                    nombre: nuevoNombre.trim()
                })
            });

            if (!response.ok) {
                throw new Error('Error al crear el municipio');
            }

            setOpenDialogCrear(false);
            setNuevaRegion('');
            setNuevaComuna('');
            setNuevoNombre('');
            fetchMunicipios();
        } catch (err) {
            setCrearError(err.message);
        } finally {
            setCreando(false);
        }
    };

    const handleChangePage = (event, newPage) => {
        setPagina(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setFilaPorPagina(parseInt(event.target.value, 10));
        setPagina(0);
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
                minHeight: 'calc(100vh - 120px)',
                overflow: "hidden"
            }}>
                {/* Cabecera / Título */}
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1e3c72' }}>
                        Administración de Municipios
                    </Typography>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        startIcon={<AddIcon />}
                        sx={{ borderRadius: 2, fontWeight: 'bold' }}
                        onClick={() => setOpenDialogCrear(true)}
                    >
                        Crear Municipio
                    </Button>
                </Box>

                {/* Buscador */}
                <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: 'center' }}>
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Región</InputLabel>
                        <Select
                            value={regionBusqueda}
                            label="Región"
                            onChange={(e) => {
                                setRegionBusqueda(e.target.value);
                                setComunaBusqueda('');
                                setPagina(0);
                            }}
                            sx={{ borderRadius: 2 }}
                        >
                            <MenuItem value=""><em>Todas</em></MenuItem>
                            {regiones.map((r) => (
                                <MenuItem key={r.id} value={r.id}>{r.nombre}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 200 }} disabled={!regionBusqueda}>
                        <InputLabel>Comuna</InputLabel>
                        <Select
                            value={comunaBusqueda}
                            label="Comuna"
                            onChange={(e) => {
                                setComunaBusqueda(e.target.value);
                                setPagina(0);
                            }}
                            sx={{ borderRadius: 2 }}
                        >
                            <MenuItem value=""><em>Todas</em></MenuItem>
                            {comunasDisponiblesBusqueda.map((c) => (
                                <MenuItem key={c.id} value={c.id}>{c.nombre}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
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
                                            <TableCell align="center">Comuna</TableCell>
                                            <TableCell align="center">Nombre</TableCell>
                                            <TableCell align="center">Acciones</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {municipios.length > 0 ? (
                                            municipios.map((mun) => (
                                                <TableRow key={mun.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                    <TableCell align="center">{mun.comuna}</TableCell>
                                                    <TableCell align="center">{mun.nombre}</TableCell>
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
                                                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
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
                                count={totalMunicipios}
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

            {/* Dialog - Crear Municipio */}
            <Dialog open={openDialogCrear} onClose={() => setOpenDialogCrear(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold', color: '#1e3c72' }}>Crear Municipio</DialogTitle>
                <DialogContent>
                    {crearError && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{crearError}</Alert>}
                    
                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <FormControl fullWidth>
                            <InputLabel>Región</InputLabel>
                            <Select
                                value={nuevaRegion}
                                label="Región"
                                onChange={(e) => {
                                    setNuevaRegion(e.target.value);
                                    setNuevaComuna('');
                                }}
                            >
                                {regiones.map((r) => (
                                    <MenuItem key={r.id} value={r.id}>{r.nombre}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth disabled={!nuevaRegion}>
                            <InputLabel>Comuna</InputLabel>
                            <Select
                                value={nuevaComuna}
                                label="Comuna"
                                onChange={(e) => setNuevaComuna(e.target.value)}
                            >
                                {comunasDisponiblesCrear.map((c) => (
                                    <MenuItem key={c.id} value={c.id}>{c.nombre}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            label="Nombre del Municipio"
                            variant="outlined"
                            fullWidth
                            value={nuevoNombre}
                            onChange={(e) => setNuevoNombre(e.target.value)}
                        />
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
        </Box>
    );
}

export default AdministrarMunicipio;
