import { useState, useEffect } from 'react';
import {
    Fingerprint,
    User,
    History,
    Calendar,
    LogOut,
    Clock,
    Sun,
    Moon,
    LogIn,
    Scan,
    X,
    Camera,
    Save,
    Briefcase,
    GraduationCap,
    Phone,
    MapPin,
    BookOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PracticantDashboard = ({ user, onLogout }) => {
    const [activeView, setActiveView] = useState('attendance');
    const [currentTime, setCurrentTime] = useState(new Date());
    // Local state for user to allow updates in UI locally
    const [currentUser, setCurrentUser] = useState(user);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const navigate = useNavigate();

    // Clock effect
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleLogout = () => {
        // Limpiar token de sesión
        localStorage.removeItem('token');

        // Notificar al componente padre (App) para limpiar el estado del usuario
        if (onLogout) {
            onLogout();
        }

        // Forzar navegación al login
        navigate('/login', { replace: true });
    };

    const activeViewComponent = () => {
        switch (activeView) {
            case 'attendance': return <AttendanceView user={currentUser} currentTime={currentTime} />;
            case 'profile': return <ProfileView user={currentUser} onEdit={() => setIsEditModalOpen(true)} />;
            case 'history': return <HistoryView user={currentUser} />;
            case 'schedule': return <ScheduleView user={currentUser} />;
            default: return <AttendanceView user={currentUser} currentTime={currentTime} />;
        }
    };

    return (
        <div className="container">
            {/* Modal Overlay */}
            {isEditModalOpen && (
                <EditProfileModal
                    user={currentUser}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={async (updatedData) => {
                        try {
                            await axios.put(`http://localhost:3000/api/users/${currentUser.id}`, updatedData);
                            setCurrentUser(updatedData);
                            setIsEditModalOpen(false);
                            alert('Perfil actualizado exitosamente.');
                        } catch (error) {
                            alert('Error al actualizar perfil: ' + (error.response?.data?.message || error.message));
                        }
                    }}
                />
            )}

            {/* Header */}
            <header className="main-header">
                <div className="header-content">
                    <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <img src="/muni_logo.png" alt="Logo Muni" style={{ height: '50px' }} />
                        <div>
                            <h1 className="header-title">
                                Municipalidad Distrital de San Juan Bautista
                            </h1>
                            <p className="header-subtitle">Sistema de Control de Asistencia</p>
                        </div>
                    </div>

                    <div className="user-menu">
                        <div className="user-info">
                            <div className="user-name">{currentUser.names || currentUser.name} {currentUser.lastnames}</div>
                            <div className="user-role">Practicante</div>
                        </div>
                        <div
                            className="user-avatar"
                            onClick={() => setActiveView('profile')}
                            style={{ cursor: 'pointer', border: activeView === 'profile' ? '2px solid var(--primary)' : '2px solid transparent', transition: 'all 0.2s' }}
                            title="Ver mi perfil"
                        >
                            <img
                                src={currentUser.photo || `https://ui-avatars.com/api/?name=${currentUser.names || 'U'}+${currentUser.lastnames || 'N'}&background=ff9a00&color=fff&size=150`}
                                alt="Avatar"
                            />
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
                            <a href="#" className={`nav-link ${activeView === 'attendance' ? 'active' : ''}`} onClick={() => setActiveView('attendance')}>
                                <Fingerprint /> <span>Registro de Asistencia</span>
                            </a>
                        </li>
                        <li className="nav-item">
                            <a href="#" className={`nav-link ${activeView === 'history' ? 'active' : ''}`} onClick={() => setActiveView('history')}>
                                <History /> <span>Mi Historial</span>
                            </a>
                        </li>
                        <li className="nav-item">
                            <a href="#" className={`nav-link ${activeView === 'schedule' ? 'active' : ''}`} onClick={() => setActiveView('schedule')}>
                                <Calendar /> <span>Mi Horario</span>
                            </a>
                        </li>
                    </ul>
                </nav>

                <div className="main-content">
                    {activeViewComponent()}
                </div>
            </div>
        </div>
    );
};

// --- Sub-components ---

const EditProfileModal = ({ user, onClose, onSave }) => {
    const [formData, setFormData] = useState({ ...user });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="modal active" style={{ display: 'flex' }}>
            <div className="modal-content">
                <div className="modal-header">
                    <h2 className="modal-title">Actualizar Perfil</h2>
                    <button className="modal-close" onClick={onClose}><X /></button>
                </div>
                <div className="modal-body">
                    <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                            <div className="profile-avatar-edit" style={{ position: 'relative' }}>
                                <img
                                    src={formData.photo || `https://ui-avatars.com/api/?name=${formData.names || 'U'}+${formData.lastnames || 'N'}&background=ff9a00&color=fff&size=150`}
                                    alt="Preview"
                                    style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }}
                                />
                                <label htmlFor="photo-upload" style={{ position: 'absolute', bottom: '0', right: '0', background: 'var(--primary)', color: 'white', padding: '5px', borderRadius: '50%', cursor: 'pointer', display: 'flex' }}>
                                    <Camera size={16} />
                                    <input
                                        type="file"
                                        id="photo-upload"
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

                        <div className="form-row">
                            <div className="form-group">
                                <label>Nombres</label>
                                <input type="text" className="form-control" name="names" value={formData.names || ''} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Apellidos</label>
                                <input type="text" className="form-control" name="lastnames" value={formData.lastnames || ''} onChange={handleChange} required />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Nueva Contraseña (Opcional)</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    name="password"
                                    placeholder="Dejar en blanco para mantener la actual"
                                    value={formData.password || ''}
                                    onChange={handleChange}
                                />
                                <small style={{ color: '#666', fontSize: '0.8rem' }}>Si escribe aquí, su contraseña cambiará.</small>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Universidad</label>
                                <input type="text" className="form-control" name="university" value={formData.university || ''} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Carrera</label>
                                <input type="text" className="form-control" name="career" value={formData.career || ''} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Fecha Inicio</label>
                                <input type="date" className="form-control" name="startDate" value={formData.startDate || ''} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Fecha Fin</label>
                                <input type="date" className="form-control" name="endDate" value={formData.endDate || ''} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Teléfono</label>
                                <input type="text" className="form-control" name="phone" value={formData.phone || ''} onChange={handleChange} />
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

const AttendanceView = ({ user, currentTime }) => {
    const [status, setStatus] = useState(null);
    const [message, setMessage] = useState('');
    const [todayRecord, setTodayRecord] = useState({ entry: null, exit: null });

    // --- ESCUCHA DE ESCÁNER FÍSICO ---
    useEffect(() => {
        let buffer = '';
        let lastKeyTime = Date.now();

        const handleGlobalKeyDown = (e) => {
            // Ignorar si el usuario está escribiendo en un input (ej: editando perfil si estuviera en la misma vista)
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            const now = Date.now();
            const isScannerSpeed = (now - lastKeyTime) < 50; // Los lectores son muy rápidos (<50ms entre teclas)

            // Si pasa mucho tiempo, reiniciamos el buffer (asumimos que es tecleo manual lento o ruido)
            if (now - lastKeyTime > 500) {
                buffer = '';
            }

            lastKeyTime = now;

            if (e.key === 'Enter') {
                if (buffer.length === 8 && /^\d+$/.test(buffer)) {
                    console.log("DNI Detectado por Escáner:", buffer);
                    if (buffer === user.dni) {
                        handleScanDNI();
                    } else {
                        alert(`Error: El DNI escaneado (${buffer}) no coincide con su usuario (${user.dni}).`);
                        setStatus('error');
                        setMessage('❌ El DNI escaneado no le pertenece.');
                    }
                }
                buffer = '';
            } else if (/^\d$/.test(e.key)) {
                buffer += e.key;
            }
        };

        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [user, todayRecord]); // Re-crear si cambia el usuario o el estado

    useEffect(() => {
        fetchTodayStatus();
    }, []);

    const fetchTodayStatus = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/api/attendance/today-status/${user.id}`);
            const data = response.data;
            if (data.entryTime) {
                setTodayRecord({
                    entry: data.entryTime.substring(0, 5), // 'HH:mm'
                    exit: data.exitTime ? data.exitTime.substring(0, 5) : null
                });
            }
        } catch (error) {
            console.error("Error fetching today status:", error);
        }
    };

    const handleScanDNI = async () => {
        setStatus('loading');
        setMessage('Procesando solicitud con el servidor...');

        try {
            const response = await axios.post('http://localhost:3000/api/attendance/register', {
                dni: user.dni
            });

            const data = response.data;

            if (data.type === 'ENTRADA') {
                setTodayRecord(prev => ({ ...prev, entry: data.time.substring(0, 5) }));
                setStatus('success');
                setMessage(`✅ ${data.message}`);
            } else if (data.type === 'SALIDA') {
                setTodayRecord(prev => ({ ...prev, exit: data.time.substring(0, 5) }));
                setStatus('success');
                setMessage(`👋 ${data.message}`);
            }

        } catch (error) {
            console.error("Attendance error:", error);
            setStatus('error');
            const errorMsg = error.response?.data?.message || 'Error de conexión con el servidor.';
            setMessage(`❌ ${errorMsg}`);
        }
    };

    return (
        <>
            <div className="content-header">
                <h1 className="content-title">Registro de Asistencia</h1>
                <div className="current-time">
                    <div className="time-display">{currentTime.toLocaleTimeString('es-PE')}</div>
                    <div className="date-display">{currentTime.toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </div>
            </div>
            <div className="dni-registration">
                <div className="registration-container">
                    <div className="shift-status-container">
                        <div className="shift-info-box">
                            <h4 className="shift-info-title">Turno Actual</h4>
                            <div className={`shift-badge ${user.shift === 'Mañana' ? 'morning' : 'afternoon'}`}>
                                {user.shift === 'Mañana' ? <Sun size={20} /> : <Moon size={20} />}
                                <span><strong>{user.shift}</strong> - {user.shift === 'Mañana' ? '8:00 AM - 12:00 PM' : '2:00 PM - 5:00 PM'}</span>
                            </div>
                        </div>
                        {todayRecord.entry && (
                            <div className="today-status-box success">
                                <h4 className="status-box-title">Estado de Hoy</h4>
                                <div className="status-box-content">
                                    <span>🚪 Ent: <b>{todayRecord.entry}</b></span>
                                    {todayRecord.exit && <span>👋 Sal: <b>{todayRecord.exit}</b></span>}
                                </div>
                            </div>
                        )}
                    </div>

                    {!todayRecord.exit ? (
                        <div className="dni-scanner clickable" onClick={handleScanDNI}>
                            <div className="scanner-icon-container">
                                <Scan size={64} />
                            </div>
                            <h3 className="scanner-title">
                                {todayRecord.entry ? 'Registrar Salida' : 'Registrar Entrada'}
                            </h3>
                            <p className="scanner-hint">
                                {status === 'loading' ? 'Procesando...' : 'Haga clic aquí para simular el escaneo'}
                            </p>
                        </div>
                    ) : (
                        <div className="completion-card">
                            <div className="completion-icon">✅</div>
                            <h3 className="completion-title">Jornada Completada</h3>
                            <p className="completion-text">Has registrado correctamente tu entrada y salida el día de hoy.</p>
                        </div>
                    )}

                    {message && (
                        <div className={`notification-banner ${status}`}>
                            {message}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

const ProfileView = ({ user, onEdit }) => (
    <>
        <div className="content-header">
            <h1 className="content-title">Mi Perfil</h1>
            <button className="btn btn-primary" onClick={onEdit}>Editar Perfil</button>
        </div>
        <div className="profile-container">
            <div className="profile-card">
                <div className="profile-header-banner"></div>
                <div className="profile-avatar">
                    <img src={user.photo || `https://ui-avatars.com/api/?name=${user.names}+${user.lastnames}&background=ff9a00&color=fff&size=150`} alt="Avatar" />
                </div>
                <div className="profile-info">
                    <h3>{user.names} {user.lastnames}</h3>
                    <div className="user-role-badge">Practicante</div>

                    <div className="profile-details-grid">
                        <div className="profile-detail-item">
                            <div className="detail-icon"><Fingerprint size={18} /></div>
                            <div className="detail-content">
                                <span className="detail-label">DNI</span>
                                <span className="detail-value">{user.dni}</span>
                            </div>
                        </div>
                        <div className="profile-detail-item">
                            <div className="detail-icon"><Briefcase size={18} /></div>
                            <div className="detail-content">
                                <span className="detail-label">ÁREA</span>
                                <span className="detail-value">{user.area}</span>
                            </div>
                        </div>
                        <div className="profile-detail-item">
                            <div className="detail-icon"><Clock size={18} /></div>
                            <div className="detail-content">
                                <span className="detail-label">TURNO</span>
                                <span className="detail-value">{user.shift}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="profile-main-content">
                <div className="profile-form-card">
                    <h3 className="profile-section-title"><User size={24} /> Información Personal</h3>

                    <div className="info-cards-grid">
                        <div className="info-card">
                            <div className="info-card-header"><GraduationCap size={18} /> Formación</div>
                            <p><strong>Universidad:</strong> {user.university || 'No registrada'}</p>
                            <p><strong>Carrera:</strong> {user.career || 'No registrada'}</p>
                        </div>

                        <div className="info-card">
                            <div className="info-card-header"><Phone size={18} /> Contacto</div>
                            <p><strong>Teléfono:</strong> {user.phone || 'No registrado'}</p>
                        </div>

                        <div className="info-card">
                            <div className="info-card-header"><Calendar size={18} /> Periodo</div>
                            <p><strong>Inicio:</strong> {user.startDate || 'No definida'}</p>
                            <p><strong>Fin:</strong> {user.endDate || 'No definida'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
);

const HistoryView = ({ user }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/api/attendance/history/${user.id}`);
            setHistory(response.data);
        } catch (error) {
            console.error("Error fetching history:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Cargando historial...</div>;

    return (
        <>
            <div className="content-header">
                <h1 className="content-title">Mi Historial de Asistencias</h1>
                <div className="history-summary">
                    <div className="summary-chip punctual">Puntuales: {history.filter(h => h.status === 'PUNTUAL').length}</div>
                    <div className="summary-chip late">Tardanzas: {history.filter(h => h.status === 'TARDANZA').length}</div>
                </div>
            </div>
            <div className="table-container shadow-sm" style={{ borderRadius: '15px' }}>
                <table>
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Entrada</th>
                            <th>Salida</th>
                            <th>Horas</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.length > 0 ? history.map((item, index) => (
                            <tr key={index}>
                                <td>{new Date(item.date).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                                <td>{item.entryTime ? item.entryTime.substring(0, 5) : '--:--'}</td>
                                <td>{item.exitTime ? item.exitTime.substring(0, 5) : '--:--'}</td>
                                <td>{item.hours ? `${item.hours.toFixed(2)}h` : '--'}</td>
                                <td><span className={`status-badge ${item.status === 'PUNTUAL' ? 'present' : 'late'}`}>{item.status}</span></td>
                            </tr>
                        )) : (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#666' }}>No hay registros disponibles aún</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
};

const ScheduleView = ({ user }) => {
    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
    const isMorning = user.shift === 'Mañana';
    const hours = isMorning ? '08:00 AM - 12:00 PM' : '02:00 PM - 05:00 PM';
    const color = isMorning ? 'var(--practicant)' : '#4a6fa5';
    const bgColor = isMorning ? '#fff8e1' : '#e3f2fd';
    const icon = isMorning ? <Sun size={32} /> : <Moon size={32} />;
    const currentDayIndex = new Date().getDay(); // 0 is Sunday, 1 is Monday...

    return (
        <>
            <div className="content-header">
                <h1 className="content-title">Mi Horario</h1>
            </div>

            <div className="schedule-layout">
                {/* Summary Card */}
                <div className={`schedule-summary-card ${isMorning ? 'morning' : 'afternoon'}`}>
                    <div className="summary-text">
                        <h2 className="summary-title">Turno {user.shift}</h2>
                        <p className="summary-description">Horario regular de prácticas pre-profesionales</p>
                    </div>
                    <div className="summary-highlight">
                        {icon}
                        <span>{hours}</span>
                    </div>
                </div>

                {/* Weekly Grid */}
                <div className="weekly-schedule-container">
                    <h3 className="section-title">Semana Laboral</h3>
                    <div className="weekly-grid">
                        {days.map((day, index) => {
                            const isToday = currentDayIndex === index + 1;
                            return (
                                <div key={day} className={`schedule-day-card ${isToday ? 'today' : ''}`}>
                                    {isToday && <div className="today-badge">HOY</div>}

                                    <div className="day-name">
                                        {day}
                                    </div>

                                    <div className="schedule-slot">
                                        <div className="slot-label">ENTRADA</div>
                                        <div className="slot-time">
                                            {isMorning ? '08:00 AM' : '02:00 PM'}
                                        </div>
                                    </div>

                                    <div className="schedule-slot">
                                        <div className="slot-label">SALIDA</div>
                                        <div className="slot-time">
                                            {isMorning ? '12:00 PM' : '05:00 PM'}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="reminder-box warning">
                    <Clock size={20} />
                    <span><strong>Recordatorio:</strong> Tienes una tolerancia de 15 minutos en tu hora de entrada.</span>
                </div>
            </div>
        </>
    );
};

export default PracticantDashboard;
