import { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    Users,
    ClipboardCheck,
    BarChart3,
    LogOut,
    UserPlus,
    Search,
    FileText,
    X,
    Edit,
    Trash2,
    Save,
    Download,
    Eye,
    Camera,
    User as UserIcon,
    Shield,
    Mail,
    MapPin,
    Activity,
    Phone,
    Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

const AdminDashboard = ({ user, onLogout }) => {
    const [activeView, setActiveView] = useState('dashboard');
    const [currentUser, setCurrentUser] = useState(user);
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [areaFilter, setAreaFilter] = useState(null);
    const navigate = useNavigate();

    // Lifted state for persistence across tabs
    const [practicants, setPracticants] = useState([]);

    const fetchPracticants = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/users');
            setPracticants(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    useEffect(() => {
        fetchPracticants();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        if (onLogout) onLogout();
        // El redireccionamiento lo maneja App.jsx automáticamente al detectar user null
    };

    const renderContent = () => {
        switch (activeView) {
            case 'dashboard':
                return <DashboardHome onViewChange={setActiveView} practicants={practicants} setAreaFilter={setAreaFilter} />;
            case 'practicants':
                return <PracticantsManagement practicants={practicants} onRefresh={fetchPracticants} />;
            case 'attendance':
                return <AttendanceControl areaFilter={areaFilter} setAreaFilter={setAreaFilter} />;
            case 'reports':
                return <ReportsView />;
            case 'profile':
                return <AdminProfileView user={currentUser} onEdit={() => setIsEditProfileOpen(true)} />;
            default:
                return <DashboardHome onViewChange={setActiveView} totalPracticants={practicants.length} />;
        }
    };

    return (
        <div className="container">
            {isEditProfileOpen && (
                <EditAdminProfileModal
                    user={currentUser}
                    onClose={() => setIsEditProfileOpen(false)}
                    onSave={async (updatedData) => {
                        try {
                            await axios.put(`http://localhost:3000/api/users/${currentUser.id}`, updatedData);
                            setCurrentUser(updatedData);
                            setIsEditProfileOpen(false);
                            alert('Perfil de administrador actualizado.');
                        } catch (error) {
                            alert('Error al actualizar: ' + (error.response?.data?.message || error.message));
                        }
                    }}
                />
            )}
            <header className="main-header">
                <div className="header-content">
                    <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <img src="/muni_logo.png" alt="Logo Muni" style={{ height: '50px' }} />
                        <div>
                            <h1 className="header-title">
                                Municipalidad Distrital de San Juan Bautista
                            </h1>
                            <p className="header-subtitle">Panel de Control Administrativo</p>
                        </div>
                    </div>

                    <div className="user-menu">
                        <div className="user-info">
                            <div className="user-name">{currentUser.names}</div>
                            <div className="user-role">Administradora</div>
                        </div>
                        <div
                            className="user-avatar"
                            onClick={() => setActiveView('profile')}
                            style={{ cursor: 'pointer', border: activeView === 'profile' ? '2px solid var(--primary)' : '2px solid transparent', transition: 'all 0.2s' }}
                            title="Ver mi perfil"
                        >
                            <img src={currentUser.photo || `https://ui-avatars.com/api/?name=${currentUser.names}&background=003B5C&color=fff&size=150`} alt="Admin" />
                        </div>
                        <button className="btn btn-danger" onClick={handleLogout}>
                            <LogOut size={16} /> Salir
                        </button>
                    </div>
                </div>
            </header>

            <div className="dashboard">
                <nav className="sidebar">
                    <ul className="nav-menu">
                        <li className="nav-item">
                            <a href="#" className={`nav-link ${activeView === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveView('dashboard')}>
                                <LayoutDashboard /> <span>Panel de Gestión</span>
                            </a>
                        </li>
                        <li className="nav-item">
                            <a href="#" className={`nav-link ${activeView === 'practicants' ? 'active' : ''}`} onClick={() => setActiveView('practicants')}>
                                <Users /> <span>Administración de Practicantes</span>
                            </a>
                        </li>
                        <li className="nav-item">
                            <a href="#" className={`nav-link ${activeView === 'attendance' ? 'active' : ''}`} onClick={() => setActiveView('attendance')}>
                                <ClipboardCheck /> <span>Control de Asistencia</span>
                            </a>
                        </li>
                        <li className="nav-item">
                            <a href="#" className={`nav-link ${activeView === 'reports' ? 'active' : ''}`} onClick={() => setActiveView('reports')}>
                                <BarChart3 /> <span>Reportes</span>
                            </a>
                        </li>
                    </ul>
                </nav>

                <div className="main-content">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

// --- Sub-components ---

const DashboardHome = ({ onViewChange, practicants, setAreaFilter }) => {
    const [stats, setStats] = useState({ total: practicants.length, present: 0, late: 0, absent: 0 });
    const [areaSummary, setAreaSummary] = useState([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/attendance/today');
                const todayRecords = response.data;
                const lateCount = todayRecords.filter(r => r.status === 'TARDANZA').length;

                setStats({
                    total: practicants.length,
                    present: todayRecords.length,
                    late: lateCount,
                    absent: Math.max(0, practicants.length - todayRecords.length)
                });

                // Calculate Area Summary
                const areas = [...new Set(practicants.map(p => p.area))];
                const summary = areas.map(areaName => {
                    const totalInArea = practicants.filter(p => p.area === areaName).length;
                    const presentInArea = todayRecords.filter(r => r.user?.area === areaName).length;
                    const percentage = totalInArea > 0 ? Math.round((presentInArea / totalInArea) * 100) : 0;

                    return {
                        name: areaName,
                        total: totalInArea,
                        present: presentInArea,
                        percentage: percentage
                    };
                }).sort((a, b) => a.name.localeCompare(b.name));
                setAreaSummary(summary);

            } catch (error) {
                console.error("Error fetching homepage stats:", error);
            }
        };
        fetchStats();
    }, [practicants]);

    return (
        <>
            <div className="content-header">
                <h1 className="content-title">Centro de Control Administrativo</h1>
                <div style={{ color: '#666' }}>
                    📅 Hoy: {new Date().toLocaleDateString('es-PE')}
                </div>
            </div>

            <div className="admin-grid">
                <div className="admin-card" onClick={() => onViewChange('practicants')} style={{ cursor: 'pointer' }}>
                    <div className="admin-card-header">
                        <div className="admin-card-icon icon-add"><UserPlus /></div>
                        <div>
                            <h3>Registrar</h3>
                            <p>Ingresar Datos</p>
                        </div>
                    </div>
                </div>
                <div className="admin-card" onClick={() => onViewChange('practicants')} style={{ cursor: 'pointer' }}>
                    <div className="admin-card-header">
                        <div className="admin-card-icon icon-list"><Users /></div>
                        <div>
                            <h3>Total</h3>
                            <p>{stats.total} Practicantes</p>
                        </div>
                    </div>
                </div>
                <div className="admin-card" onClick={() => onViewChange('attendance')} style={{ cursor: 'pointer' }}>
                    <div className="admin-card-header">
                        <div className="admin-card-icon icon-control"><ClipboardCheck /></div>
                        <div>
                            <h3>Asistencia</h3>
                            <p>{stats.present} Hoy</p>
                        </div>
                    </div>
                </div>
                <div className="admin-card" onClick={() => onViewChange('reports')} style={{ cursor: 'pointer' }}>
                    <div className="admin-card-header">
                        <div className="admin-card-icon icon-report"><FileText /></div>
                        <div>
                            <h3>Reportes</h3>
                            <p>Exportar datos</p>
                        </div>
                    </div>
                </div>
            </div>

            <h3 style={{ color: 'var(--primary)', margin: '40px 0 20px' }}>Resumen por Áreas</h3>
            <div className="table-container">
                <table>
                    <thead>
                        <tr><th>Área Municipal</th><th>Total Practicantes</th><th>Marcaron Asistencia</th><th>% Cumplimiento</th></tr>
                    </thead>
                    <tbody>
                        {areaSummary.length > 0 ? (
                            areaSummary.map((area, idx) => (
                                <tr
                                    key={idx}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => {
                                        setAreaFilter(area.name);
                                        onViewChange('attendance');
                                    }}
                                    title={`Click para ver presentes en ${area.name}`}
                                >
                                    <td>{area.name}</td>
                                    <td>{area.total}</td>
                                    <td>{area.present}</td>
                                    <td>
                                        <span className={`status-badge ${area.percentage === 100 ? 'present' : area.percentage > 50 ? 'late' : 'absent'}`}>
                                            {area.percentage}%
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                                    No hay practicantes registrados por el momento.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
};

const PracticantsManagement = ({ practicants, onRefresh }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [viewingUser, setViewingUser] = useState(null);
    const [formData, setFormData] = useState({ dni: '', names: '', lastnames: '', area: 'Oficina TIC', shift: 'Mañana', university: '', career: '', phone: '', startDate: '', endDate: '' });

    const openModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData(user);
        } else {
            setEditingUser(null);
            setFormData({ dni: '', names: '', lastnames: '', area: 'Oficina TIC', shift: 'Mañana', university: '', career: '', phone: '' });
        }
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (confirm('¿Estás seguro de eliminar este practicante?')) {
            try {
                await axios.delete(`http://localhost:3000/api/users/${id}`);
                onRefresh();
                alert('Practicante eliminado correctamente.');
            } catch (error) {
                alert('Error al eliminar: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                // Edit
                await axios.put(`http://localhost:3000/api/users/${editingUser.id}`, formData);
                alert('Datos actualizados correctamente.');
            } else {
                // Create
                await axios.post('http://localhost:3000/api/users', formData);
                alert('Nuevo practicante creado. Podrá ingresar con su DNI como contraseña.');
            }
            onRefresh();
            setIsModalOpen(false);
        } catch (error) {
            alert('Error al guardar: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <>
            <div className="content-header">
                <h1 className="content-title">Administración de Practicantes</h1>
                <button className="btn btn-success" onClick={() => openModal()}><UserPlus size={18} /> Nuevo Practicante</button>
            </div>
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>DNI</th>
                            <th>Nombres y Apellidos</th>
                            <th>Área</th>
                            <th>Turno</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {practicants.map(p => (
                            <tr key={p.id}>
                                <td>{p.dni}</td>
                                <td
                                    style={{ color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer' }}
                                    onClick={() => { setViewingUser(p); setIsViewModalOpen(true); }}
                                >
                                    {p.names} {p.lastnames}
                                </td>
                                <td>{p.area}</td>
                                <td>{p.shift}</td>
                                <td><span className={`status-badge ${p.status === 'Activo' ? 'present' : 'absent'}`}>{p.status || 'Activo'}</span></td>
                                <td className="action-buttons">
                                    <button className="btn-sm btn-primary" title="Ver Perfil Completo" onClick={() => { setViewingUser(p); setIsViewModalOpen(true); }}><Eye size={16} /></button>
                                    <button className="btn-sm btn-warning" title="Editar" onClick={() => openModal(p)}><Edit size={16} /></button>
                                    <button className="btn-sm btn-danger" title="Eliminar" onClick={() => handleDelete(p.id)}><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal active" style={{ display: 'flex' }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2 className="modal-title">{editingUser ? 'Editar Practicante' : 'Nuevo Practicante'}</h2>
                            <button className="modal-close" onClick={() => setIsModalOpen(false)}><X /></button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleSave}>
                                <div className="form-group">
                                    <label>DNI</label>
                                    <input type="text" name="dni" className="form-control" value={formData.dni} onChange={handleChange} required maxLength="8" />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Nombres</label>
                                        <input type="text" name="names" className="form-control" value={formData.names} onChange={handleChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Apellidos</label>
                                        <input type="text" name="lastnames" className="form-control" value={formData.lastnames} onChange={handleChange} required />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div>
                                        <label>Universidad</label>
                                        <input type="text" name="university" className="form-control" value={formData.university || ''} onChange={handleChange} placeholder="Ej: UNSCH" />
                                    </div>
                                    <div>
                                        <label>Carrera</label>
                                        <input type="text" name="career" className="form-control" value={formData.career || ''} onChange={handleChange} placeholder="Ej: Ingeniería" />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Teléfono</label>
                                        <input type="text" name="phone" className="form-control" value={formData.phone || ''} onChange={handleChange} placeholder="999888777" />
                                    </div>
                                    <div className="form-group">
                                        <label>Fecha de Inicio</label>
                                        <input type="date" name="startDate" className="form-control" value={formData.startDate || ''} onChange={handleChange} />
                                    </div>
                                    <div className="form-group">
                                        <label>Fecha de Fin</label>
                                        <input type="date" name="endDate" className="form-control" value={formData.endDate || ''} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="form-row" style={{ marginTop: '10px' }}>
                                    <div className="form-group">
                                        <label>Área</label>
                                        <select name="area" className="form-control" value={formData.area} onChange={handleChange} style={{ fontSize: '0.9rem' }}>
                                            <optgroup label="Alta Dirección y Órganos Consultivos">
                                                <option>Concejo Municipal</option>
                                                <option>Alcaldía</option>
                                                <option>Gerencia Municipal</option>
                                            </optgroup>
                                            <optgroup label="Órganos de Control y Asesoramiento">
                                                <option>Órgano de Control Institucional</option>
                                                <option>Procuraduría Pública</option>
                                                <option>Oficina General de Atención al Ciudadano</option>
                                                <option>Oficina General de Asesoría Jurídica</option>
                                                <option>Oficina General de Planeamiento y Presupuesto</option>
                                            </optgroup>
                                            <optgroup label="Administración">
                                                <option>Oficina General de Administración</option>
                                                <option>Oficina de Gestión de Recursos Humanos</option>
                                                <option>Oficina de Abastecimiento</option>
                                                <option>Oficina TIC</option>
                                            </optgroup>
                                            <optgroup label="Gerencias de Línea">
                                                <option>Gerencia de Recaudación y Administración Tributaria</option>
                                                <option>Subgerencia de Fiscalización Administrativa</option>
                                                <option>Gerencia de Desarrollo Territorial e Infraestructura</option>
                                                <option>Subgerencia de Obras</option>
                                                <option>Gerencia de Servicios Municipales</option>
                                                <option>Subgerencia de Seguridad Ciudadana</option>
                                                <option>Gerencia de Desarrollo Económico y Social</option>
                                            </optgroup>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Turno</label>
                                        <select name="shift" className="form-control" value={formData.shift} onChange={handleChange}>
                                            <option>Mañana</option>
                                            <option>Tarde</option>
                                        </select>
                                    </div>
                                </div>
                                <div style={{ marginTop: '20px', textAlign: 'right' }}>
                                    <button type="submit" className="btn btn-success"><Save size={16} /> Guardar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* View Profile Modal */}
            {isViewModalOpen && viewingUser && (
                <div className="modal active" style={{ display: 'flex' }}>
                    <div className="modal-content" style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">Perfil del Practicante</h2>
                            <button className="modal-close" onClick={() => setIsViewModalOpen(false)}><X /></button>
                        </div>
                        <div className="modal-body" style={{ textAlign: 'center' }}>
                            <div style={{ marginBottom: '20px' }}>
                                <img
                                    src={viewingUser.photo || `https://ui-avatars.com/api/?name=${viewingUser.names}+${viewingUser.lastnames}&background=003B5C&color=fff&size=150`}
                                    alt="Foto"
                                    style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--primary)', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
                                />
                            </div>
                            <h3 style={{ color: 'var(--primary)', fontSize: '1.4rem', marginBottom: '5px' }}>{viewingUser.names} {viewingUser.lastnames}</h3>
                            <p style={{ color: '#666', fontWeight: 'bold', marginBottom: '20px' }}>DNI: {viewingUser.dni}</p>

                            <div style={{ textAlignment: 'left', background: '#f8fafc', padding: '20px', borderRadius: '15px', display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
                                <div style={{ textAlign: 'left' }}>
                                    <small style={{ color: '#888', display: 'block' }}>ÁREA Y TURNO</small>
                                    <span style={{ fontWeight: '500' }}>{viewingUser.area} - Turno {viewingUser.shift}</span>
                                </div>
                                <div style={{ textAlign: 'left' }}>
                                    <small style={{ color: '#888', display: 'block' }}>UNIVERSIDAD / CARRERA</small>
                                    <span style={{ fontWeight: '500' }}>{viewingUser.university || 'No especificada'} - {viewingUser.career || 'No especificada'}</span>
                                </div>
                                <div style={{ textAlign: 'left' }}>
                                    <small style={{ color: '#888', display: 'block' }}>CONTACTO</small>
                                    <span style={{ fontWeight: '500' }}>📞 {viewingUser.phone || 'No registrado'}</span>
                                </div>
                                <div style={{ textAlign: 'left', display: 'flex', gap: '20px' }}>
                                    <div>
                                        <small style={{ color: '#888', display: 'block' }}>FECHA INICIO</small>
                                        <span style={{ fontWeight: '500' }}>📅 {viewingUser.startDate || '--/--/--'}</span>
                                    </div>
                                    <div>
                                        <small style={{ color: '#888', display: 'block' }}>FECHA FIN</small>
                                        <span style={{ fontWeight: '500' }}>⌛ {viewingUser.endDate || '--/--/--'}</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: '25px' }}>
                                <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setIsViewModalOpen(false)}>Cerrar Ventana</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

const AttendanceControl = ({ areaFilter, setAreaFilter }) => {
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTodayAttendance = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:3000/api/attendance/today');
            setAttendanceData(response.data);
        } catch (error) {
            console.error("Error fetching today's attendance:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTodayAttendance();
    }, []);

    // Filter Logic
    const filteredData = areaFilter
        ? attendanceData.filter(record => record.user?.area === areaFilter)
        : attendanceData;

    const exportToCSV = () => {
        // Headers
        const headers = ["Nombre,Area,Entrada,Salida,Horas,Estado"];

        // Data rows - Use Filtered Data
        const rows = filteredData.map(row =>
            `${row.user?.names} ${row.user?.lastnames},${row.user?.area},${row.entryTime},${row.exitTime || '--:--'},${row.hours || '0'},${row.status}`
        );

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join("\n"), ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `asistencia_${areaFilter || 'todos'}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <>
            <div className="content-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <h1 className="content-title">Control de Asistencia Hoy</h1>
                    {areaFilter && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'white',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            border: '1px solid var(--primary)',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                        }}>
                            <span style={{ fontSize: '0.8rem', color: '#666' }}>Área:</span>
                            <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--primary)' }}>{areaFilter}</span>
                            <X
                                size={14}
                                style={{ cursor: 'pointer', color: 'var(--danger)', marginLeft: '5px' }}
                                onClick={() => setAreaFilter(null)}
                            />
                        </div>
                    )}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-primary" onClick={fetchTodayAttendance}><Search size={16} /> Actualizar</button>
                    <button className="btn btn-success" onClick={exportToCSV}><Download size={16} /> Exportar Excel (CSV)</button>
                </div>
            </div>

            <div className="table-container">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px' }}>Cargando asistencia...</div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Nombre y Apellidos</th>
                                <th>Área</th>
                                <th>Entrada</th>
                                <th>Salida</th>
                                <th>Horas</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length > 0 ? (
                                filteredData.map(row => (
                                    <tr key={row.id}>
                                        <td style={{ fontWeight: '500' }}>{row.user?.names} {row.user?.lastnames}</td>
                                        <td>{row.user?.area}</td>
                                        <td style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{row.entryTime}</td>
                                        <td style={{ color: row.exitTime ? 'var(--secondary)' : '#999' }}>{row.exitTime || '--:--'}</td>
                                        <td>{row.hours || '0'} hrs</td>
                                        <td>
                                            <span className={`status-badge ${row.status === 'PUNTUAL' ? 'present' : 'late'}`}>
                                                {row.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#666' }}>
                                        No hay marcaciones de asistencia registradas para hoy.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </>
    );
};

const ReportsView = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStats = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get('http://localhost:3000/api/attendance/stats/global');
            setStats(response.data);
        } catch (error) {
            console.error("Error fetching global stats:", error);
            setError("No se pudieron cargar las estadísticas. Verifica la conexión con el servidor.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (loading) return (
        <div style={{ textAlign: 'center', padding: '100px' }}>
            <div className="loader" style={{ marginBottom: '20px' }}></div>
            <p style={{ color: '#666' }}>Analizando datos institucionales...</p>
        </div>
    );

    if (error) return (
        <div style={{ textAlign: 'center', padding: '100px' }}>
            <X size={48} style={{ color: 'var(--danger)', marginBottom: '20px' }} />
            <p style={{ color: '#666', marginBottom: '20px' }}>{error}</p>
            <button className="btn btn-primary" onClick={fetchStats}>Reintentar</button>
        </div>
    );

    if (!stats) return <div style={{ textAlign: 'center', padding: '50px' }}>No hay datos disponibles.</div>;

    const COLORS = ['#003B5C', '#009639', '#D4AF37', '#483D8B', '#E67E22', '#dc3545'];

    return (
        <>
            <div className="content-header">
                <h1 className="content-title">Reportes e Inteligencia</h1>
            </div>

            {/* KPI Cards */}
            <div className="admin-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '30px' }}>
                <div className="admin-card" style={{ padding: '20px' }}>
                    <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '5px' }}>Total Practicantes</p>
                    <h2 style={{ color: 'var(--primary)', fontSize: '1.8rem' }}>{stats.cards.totalPracticants}</h2>
                </div>
                <div className="admin-card" style={{ padding: '20px' }}>
                    <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '5px' }}>Asistencia Hoy</p>
                    <h2 style={{ color: 'var(--secondary)', fontSize: '1.8rem' }}>
                        {stats.cards.totalPracticants > 0 ? Math.round((stats.cards.presentToday / stats.cards.totalPracticants) * 100) : 0}%
                    </h2>
                </div>
                <div className="admin-card" style={{ padding: '20px' }}>
                    <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '5px' }}>Tardanzas Hoy</p>
                    <h2 style={{ color: 'var(--danger)', fontSize: '1.8rem' }}>{stats.cards.lateToday}</h2>
                </div>
                <div className="admin-card" style={{ padding: '20px' }}>
                    <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '5px' }}>Horas Trabajadas</p>
                    <h2 style={{ color: 'var(--admin)', fontSize: '1.8rem' }}>{stats.cards.totalHours} hrs</h2>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                {/* Area Breakdown Chart */}
                <div className="admin-card" style={{ padding: '25px' }}>
                    <h3 style={{ marginBottom: '20px', fontSize: '1.1rem', color: 'var(--primary)' }}>Distribución por Áreas</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={stats.areaData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" fontSize={10} tick={{ fill: '#666' }} />
                                <YAxis fontSize={10} tick={{ fill: '#666' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}
                                />
                                <Legend verticalAlign="top" height={36} />
                                <Bar dataKey="total" name="Total Asignados" fill="#d9e2ec" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="present" name="Presentes Hoy" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Trend Chart */}
                <div className="admin-card" style={{ padding: '25px' }}>
                    <h3 style={{ marginBottom: '20px', fontSize: '1.1rem', color: 'var(--primary)' }}>Tendencia Semanal</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <AreaChart data={stats.trendData}>
                                <defs>
                                    <linearGradient id="colorAsist" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--secondary)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--secondary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" fontSize={10} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
                                <YAxis fontSize={10} />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <Tooltip />
                                <Area
                                    type="monotone"
                                    dataKey="asistencias"
                                    stroke="var(--secondary)"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorAsist)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Attendance Matrix / Heatmap placeholder or Summary Table */}
            <div className="admin-card" style={{ marginTop: '25px', padding: '25px' }}>
                <h3 style={{ marginBottom: '15px', fontSize: '1.1rem' }}>Resumen Ejecutivo</h3>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>
                    Basado en los últimos datos, el promedio de puntualidad institucional es del
                    <strong style={{ color: 'var(--secondary)' }}>
                        {stats.cards.presentToday > 0 ? Math.round(((stats.cards.presentToday - stats.cards.lateToday) / stats.cards.presentToday) * 100) : 100}%
                    </strong>.
                    Se recomienda revisar las áreas con mayor índice de tardanzas para optimizar la gestión del talento.
                </p>
            </div>
        </>
    );
};

const AdminProfileView = ({ user, onEdit }) => (
    <>
        <div className="content-header">
            <h1 className="content-title">Perfil de Administrador</h1>
            <button className="btn btn-primary" onClick={onEdit}><Edit size={16} /> Editar Perfil</button>
        </div>

        <div className="profile-container">
            <div className="profile-card">
                <div className="profile-header-banner" style={{ background: 'linear-gradient(135deg, var(--admin), #6a5acd)' }}></div>
                <div className="profile-avatar">
                    <img src={user.photo || `https://ui-avatars.com/api/?name=${user.names}&background=003B5C&color=fff&size=150`} alt="Admin Avatar" />
                </div>
                <div className="profile-info">
                    <h3>{user.names}</h3>
                    <div className="user-role-badge" style={{ background: '#e0e7ff', color: '#4338ca' }}>Administradora</div>

                    <div className="profile-details-grid">
                        <div className="profile-detail-item">
                            <div className="detail-icon"><Shield size={18} /></div>
                            <div className="detail-content">
                                <span className="detail-label">USUARIO</span>
                                <span className="detail-value">{user.username || 'admin'}</span>
                            </div>
                        </div>
                        <div className="profile-detail-item">
                            <div className="detail-icon"><MapPin size={18} /></div>
                            <div className="detail-content">
                                <span className="detail-label">OFICINA</span>
                                <span className="detail-value">{user.area || 'Gerencia Municipal'}</span>
                            </div>
                        </div>
                        <div className="profile-detail-item">
                            <div className="detail-icon"><Activity size={18} /></div>
                            <div className="detail-content">
                                <span className="detail-label">ESTADO</span>
                                <span className="detail-value">{user.status || 'Activo'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="profile-main-content">
                <div className="profile-form-card">
                    <h3 className="profile-section-title"><Shield size={24} /> Datos de la Cuenta</h3>

                    <div className="info-cards-grid">
                        <div className="info-card">
                            <div className="info-card-header"><Mail size={18} /> Contacto</div>
                            <p><strong>Email:</strong> {user.email || 'No registrado'}</p>
                            <p><strong>Teléfono:</strong> {user.phone || 'No registrado'}</p>
                        </div>

                        <div className="info-card">
                            <div className="info-card-header"><Clock size={18} /> Actividad</div>
                            <p><strong>Último Acceso:</strong> {new Date().toLocaleDateString('es-PE')} {new Date().toLocaleTimeString('es-PE', { hour12: false })} hrs</p>
                            <p><strong>Rol:</strong> Gestión de Prácticas</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
);

const EditAdminProfileModal = ({ user, onClose, onSave }) => {
    const [formData, setFormData] = useState({ ...user });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="modal active" style={{ display: 'flex' }}>
            <div className="modal-content">
                <div className="modal-header">
                    <h2 className="modal-title">Actualizar Perfil Administrativo</h2>
                    <button className="modal-close" onClick={onClose}><X /></button>
                </div>
                <div className="modal-body">
                    <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                            <div className="profile-avatar-edit" style={{ position: 'relative' }}>
                                <img
                                    src={formData.photo || `https://ui-avatars.com/api/?name=${formData.names || 'A'}&background=003B5C&color=fff&size=150`}
                                    alt="Preview"
                                    style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }}
                                />
                                <label htmlFor="admin-photo-upload" style={{ position: 'absolute', bottom: '0', right: '0', background: 'var(--primary)', color: 'white', padding: '5px', borderRadius: '50%', cursor: 'pointer', display: 'flex' }}>
                                    <Camera size={16} />
                                    <input
                                        type="file"
                                        id="admin-photo-upload"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setFormData(prev => ({ ...prev, photo: reader.result }));
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Nombres Completos</label>
                            <input type="text" className="form-control" name="names" value={formData.names || ''} onChange={handleChange} required />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Email Institucional</label>
                                <input type="email" className="form-control" name="email" value={formData.email || ''} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Teléfono / Celular</label>
                                <input type="text" className="form-control" name="phone" value={formData.phone || ''} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Oficina / Área de Gestión</label>
                                <input type="text" className="form-control" name="area" value={formData.area || ''} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Estado de Cuenta</label>
                                <select className="form-control" name="status" value={formData.status || 'Activo'} onChange={handleChange}>
                                    <option value="Activo">Activo</option>
                                    <option value="Inactivo">Inactivo</option>
                                    <option value="En Vacaciones">En Vacaciones</option>
                                    <option value="Licencia">Licencia</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ textAlign: 'right', marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button type="button" className="btn btn-danger" onClick={onClose}>Cancelar</button>
                            <button type="submit" className="btn btn-success"><Save size={16} /> Guardar Cambios</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
