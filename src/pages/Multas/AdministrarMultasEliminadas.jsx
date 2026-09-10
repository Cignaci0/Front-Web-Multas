import React, { useState, useEffect } from 'react';
import {
    Box, Paper, TextField, Table, TableContainer, TableHead,
    TableRow, TableCell, TableBody, Dialog, DialogTitle,
    DialogContent, DialogActions, IconButton, Typography,
    CircularProgress, TablePagination, Chip, Button
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import MapIcon from '@mui/icons-material/Map';
import { getMultasEliminadas } from '../../services/multasService';

export default function AdministrarMultasEliminadas({ onLogout }) {
    const [multas, setMultas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    
    // Paginación y Filtrado
    const [busqueda, setBusqueda] = useState("");
    const [pagina, setPagina] = useState(0);
    const [filaPorPagina, setFilaPorPagina] = useState(10);
    const [totalMultas, setTotalMultas] = useState(0);

    // Estados Modal Fotos
    const [selectedMultaFotos, setSelectedMultaFotos] = useState(null);
    const [openDialogFotos, setOpenDialogFotos] = useState(false);

    // Estados Modal Motivo
    const [selectedMotivoText, setSelectedMotivoText] = useState("");
    const [openDialogMotivo, setOpenDialogMotivo] = useState(false);

    useEffect(() => {
        if (!busqueda) {
            fetchMultasEliminadas();
            return;
        }
        const timer = setTimeout(() => {
            fetchMultasEliminadas();
        }, 300);
        return () => clearTimeout(timer);
    }, [pagina, filaPorPagina, busqueda]);

    const fetchMultasEliminadas = async () => {
        try {
            setCargando(true);
            const data = await getMultasEliminadas(pagina, filaPorPagina, busqueda);
            
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
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1e3c72' }}>
                        Administración de Multas Eliminadas
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
                                        <TableCell align="center">Motivo Eliminación</TableCell>
                                        <TableCell align="center">Mapa</TableCell>
                                        <TableCell align="center">Acciones</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {multas.length > 0 ? (
                                        multas.map((multa, index) => (
                                            <TableRow key={index} hover>
                                                <TableCell align="center">
                                                    {multa.fecha_creacion ? new Date(multa.fecha_creacion).toLocaleDateString() : '-'}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {multa.fecha_creacion ? new Date(multa.fecha_creacion).toLocaleTimeString() : '-'}
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
                                                        color="error" 
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
                                                    <Button 
                                                        variant="outlined" 
                                                        color="info" 
                                                        size="small"
                                                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
                                                        onClick={() => {
                                                            const motivo = multa.motivoEliminacion || multa.descripcion_desactivada || multa.motivo_eliminacion || multa.motivoDesactivacion || 'Sin motivo especificado';
                                                            setSelectedMotivoText(motivo);
                                                            setOpenDialogMotivo(true);
                                                        }}
                                                    >
                                                        Ver motivo
                                                    </Button>
                                                </TableCell>
                                                <TableCell align="center">
                                                    {multa.ubicacion ? (
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
                                                    ) : '-'}
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
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                                                <Typography variant="body1" color="text.secondary">
                                                    No se encontraron registros de multas eliminadas.
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

            {/* Dialog - Fotografías */}
            <Dialog open={openDialogFotos} onClose={() => setOpenDialogFotos(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold', color: '#1e3c72' }}>Fotografías de la Multa</DialogTitle>
                <DialogContent dividers>
                    {selectedMultaFotos && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                            {selectedMultaFotos.foto1 && (
                                <Paper elevation={2} sx={{ p: 1, width: '100%', textAlign: 'center' }}>
                                    <Typography variant="caption" display="block" sx={{ mb: 1, fontWeight: 'bold' }}>Foto 1</Typography>
                                    <img src={`data:image/jpeg;base64,${selectedMultaFotos.foto1}`} alt="Foto 1" style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '8px', backgroundColor: '#000' }} />
                                </Paper>
                            )}
                            {selectedMultaFotos.foto2 && (
                                <Paper elevation={2} sx={{ p: 1, width: '100%', textAlign: 'center' }}>
                                    <Typography variant="caption" display="block" sx={{ mb: 1, fontWeight: 'bold' }}>Foto 2</Typography>
                                    <img src={`data:image/jpeg;base64,${selectedMultaFotos.foto2}`} alt="Foto 2" style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '8px', backgroundColor: '#000' }} />
                                </Paper>
                            )}
                            {selectedMultaFotos.foto3 && (
                                <Paper elevation={2} sx={{ p: 1, width: '100%', textAlign: 'center' }}>
                                    <Typography variant="caption" display="block" sx={{ mb: 1, fontWeight: 'bold' }}>Foto 3</Typography>
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

            {/* Dialog - Motivo de Eliminación */}
            <Dialog open={openDialogMotivo} onClose={() => setOpenDialogMotivo(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold', color: '#1e3c72' }}>Motivo de Eliminación</DialogTitle>
                <DialogContent dividers>
                    <Typography 
                        variant="body1" 
                        sx={{ 
                            whiteSpace: 'pre-wrap', 
                            wordBreak: 'break-word', 
                            color: 'text.primary', 
                            p: 1, 
                            fontSize: '1rem',
                            lineHeight: 1.6
                        }}
                    >
                        {selectedMotivoText || "Sin motivo registrado."}
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenDialogMotivo(false)} variant="contained" color="primary" sx={{ fontWeight: 'bold', borderRadius: 2 }}>
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
