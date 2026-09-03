import React, { useState, useEffect } from 'react';
import {
    Box, Paper, TextField, Button, Table, TableContainer, TableHead,
    TableRow, TableCell, TableBody, Dialog, DialogTitle,
    DialogContent, DialogActions, IconButton, Typography,
    CircularProgress, Container, TablePagination, Drawer, Toolbar, Divider,
    List, ListItemButton, ListItemIcon, ListItemText, Collapse, AppBar, CssBaseline,
    ThemeProvider, createTheme
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import LogoutIcon from '@mui/icons-material/Logout';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import MenuIcon from '@mui/icons-material/Menu';
import AdministrarMultas from './pages/Multas/AdministrarMultas';
import AsignarModulos from './pages/Usuarios/AsignarModulos';
import AdministrarInspector from './pages/Usuarios/AdministrarInspector';
import AdministrarUsuarios from './pages/Usuarios/AdministrarUsuarios';

// === DASHBOARD COMPONENT ===
function Dashboard({ onLogout }) {
    const [vistaActual, setVistaActual] = useState("inicio");
    
    // Objeto con mapeo de vistas (nombres que vienen de BD a componentes)
    const COMPONENTES_VISTA = {
        "Administrar Multas": <AdministrarMultas onLogout={onLogout} />,
        "Asignar Modulos": <AsignarModulos onLogout={onLogout} />,
        "Administrar Inspectores": <AdministrarInspector onLogout={onLogout} />,
        "Editar Inspector": <Typography>Vista Editar Inspector (Pendiente)</Typography>,
        "Administrar Usuarios": <AdministrarUsuarios onLogout={onLogout} />,
        // Agrega aquí los demás nombres exactos que vengan de tu base de datos
    };

    const [menuData, setMenuData] = useState([]);
    const [openSubMenus, setOpenSubMenus] = useState({});

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/modulo/menu', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setMenuData(data);
                }
            } catch (err) {
                console.error("Error al obtener el menú", err);
            }
        };
        fetchMenu();
    }, []);

    const handleToggleMenu = (padre) => {
        setOpenSubMenus((prev) => ({
            ...prev,
            [padre]: !prev[padre]
        }));
    };

    const drawerWidth = 240;

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F5F5F5' }}>
            <CssBaseline />
            {/* AppBar superior */}
            <AppBar 
                position="fixed" 
                sx={{ 
                    zIndex: (theme) => theme.zIndex.drawer + 1, 
                    backgroundColor: "white", 
                    boxShadow: "none", 
                    borderBottom: "1px solid #e0e0e0" 
                }}
            >
                <Toolbar sx={{ p: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', flexGrow: 1, alignItems: 'center' }}>
                        <Typography variant="h6" sx={{ color: 'black', fontWeight: 'bold' }}>
                            Sistema de Multas
                        </Typography>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Menú Lateral */}
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: { 
                        width: drawerWidth, 
                        boxSizing: 'border-box', 
                        backgroundColor: 'white',
                        borderRight: "1px solid #e0e0e0",
                        display: 'flex',
                        flexDirection: 'column'
                    },
                }}
            >
                <Toolbar /> {/* Espaciador para que no quede debajo del AppBar */}
                <Box sx={{ overflow: "auto", flexGrow: 1, mt: 2 }}>
                    <List>
                        {menuData.map((menuGroup, index) => (
                            <React.Fragment key={index}>
                                <ListItemButton onClick={() => handleToggleMenu(menuGroup.padre)}>
                                    <ListItemText 
                                        primary={menuGroup.padre} 
                                        primaryTypographyProps={{ 
                                            fontSize: '18px', 
                                            fontWeight: 'bold', 
                                            color: "black", 
                                            fontFamily: 'Roboto, sans-serif' 
                                        }} 
                                    />
                                    {openSubMenus[menuGroup.padre] ? <ExpandLess /> : <ExpandMore />}
                                </ListItemButton>
                                <Collapse in={openSubMenus[menuGroup.padre]} timeout="auto" unmountOnExit>
                                    <List component="div" disablePadding>
                                        {menuGroup.hijos.map((hijo) => (
                                            <ListItemButton key={hijo.id} sx={{ pl: 4 }} onClick={() => setVistaActual(hijo.nombre)}>
                                                <ListItemText primary={hijo.nombre} />
                                            </ListItemButton>
                                        ))}
                                    </List>
                                </Collapse>
                            </React.Fragment>
                        ))}
                    </List>
                </Box>
                
                {/* Botón de Cerrar Sesión al fondo */}
                <Box sx={{ p: 2, borderTop: "1px solid #e0e0e0", mt: 'auto' }}>
                    <ListItemButton
                        onClick={onLogout}
                        sx={{
                            backgroundColor: "#ffebee",
                            color: "#d32f2f",
                            borderRadius: 1,
                            '&:hover': {
                                backgroundColor: "#ffcdd2",
                            }
                        }}
                    >
                        <ExitToAppIcon sx={{ mr: 2, transform: 'rotate(180deg)' }} />
                        <ListItemText primary="Cerrar sesión" primaryTypographyProps={{ fontWeight: 'bold' }} />
                    </ListItemButton>
                </Box>
            </Drawer>

            {/* Contenido Principal */}
            <Box component="main" sx={{ 
                flexGrow: 1, 
                p: 3, 
                width: `calc(100% - ${drawerWidth}px)`, 
                boxSizing: 'border-box',
                display: "flex", 
                flexDirection: "column",
                overflowX: 'hidden' 
            }}>
            <Toolbar /> {/* Espaciador para el AppBar */}
            
            <Box sx={{ mt: 1, width: '100%', boxSizing: 'border-box' }}>
                {vistaActual === 'inicio' && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                        <Typography variant="h4" color="text.secondary">Bienvenido</Typography>
                    </Box>
                )}

                {COMPONENTES_VISTA[vistaActual] || (vistaActual !== 'inicio' && <Typography>Vista no encontrada: {vistaActual}</Typography>)}
            </Box>
            </Box>
        </Box>
    );
}

// === LOGIN COMPONENT ===
function Login({ onLoginSuccess }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!username || !password) {
            setError('Por favor, ingrese usuario y contraseña');
            return;
        }

        setLoading(true);
        
        try {
            const response = await fetch('/usuario/loginWeb', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    password: password 
                })
            });
            
            const data = await response.json();
            
            if (!response.ok || data.error) {
                setError(data.error || "Ocurrió un error al intentar iniciar sesión");
            } else if (data.token) {
                onLoginSuccess(data.token);
            } else {
                setError("Respuesta inesperada del servidor");
            }
        } catch (err) {
            setError("No se pudo conectar con el servidor: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' // Gradiente moderno
        }}>
            <Container component="main" maxWidth="xs">
                <Paper 
                    elevation={6} 
                    sx={{ 
                        p: 4, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        width: '100%',
                        borderRadius: 3
                    }}
                >
                    <Typography component="h1" variant="h4" sx={{ fontWeight: 'bold', mb: 3, color: '#1e3c72' }}>
                        Sistema
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Ingresa tus credenciales para acceder
                    </Typography>
                    
                    {error && (
                        <Paper sx={{ p: 2, mb: 3, width: '100%', bgcolor: '#fce8e6', color: '#d93025', border: '1px solid #f6c8c4', borderRadius: 2 }}>
                            <Typography variant="body2" align="center">{error}</Typography>
                        </Paper>
                    )}

                    <Box component="form" onSubmit={handleLogin} sx={{ width: '100%' }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="username"
                            label="Usuario"
                            name="username"
                            autoFocus
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Contraseña"
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 4, mb: 2, py: 1.5, fontSize: '1rem', borderRadius: 2, fontWeight: 'bold', textTransform: 'none' }}
                            disabled={loading}
                        >
                            {loading ? 'Iniciando sesión...' : 'Ingresar al Sistema'}
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}

// === TEMA GLOBAL ===
const theme = createTheme({
  shape: {
    borderRadius: 12,
  },
  palette: {
    primary: {
      main: '#1976d2',
    },
    background: {
      default: '#f4f6f8',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

// === APP COMPONENT ===
function App() {
    const [token, setToken] = useState(localStorage.getItem('token'));

    const handleLoginSuccess = (newToken) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken(null);
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {token ? <Dashboard onLogout={handleLogout} /> : <Login onLoginSuccess={handleLoginSuccess} />}
        </ThemeProvider>
    );
}

export default App;
