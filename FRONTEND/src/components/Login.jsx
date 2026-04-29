import { useState, useEffect, useRef } from 'react';
import { User, Lock, UserCheck, Shield, AlertTriangle, Clock } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MAX_ATTEMPTS = 8;

// ──────────────────────────────────────────────
//  Componente de cuenta regresiva del bloqueo
// ──────────────────────────────────────────────
const LockCountdown = ({ lockedUntil, onUnlock }) => {
    const [remaining, setRemaining] = useState(Math.max(0, lockedUntil - Date.now()));

    useEffect(() => {
        if (remaining <= 0) { onUnlock(); return; }
        const interval = setInterval(() => {
            const left = Math.max(0, lockedUntil - Date.now());
            setRemaining(left);
            if (left <= 0) { clearInterval(interval); onUnlock(); }
        }, 1000);
        return () => clearInterval(interval);
    }, [lockedUntil]);

    const totalSec = Math.ceil(remaining / 1000);
    const min      = Math.floor(totalSec / 60);
    const sec      = totalSec % 60;
    const progress = Math.max(0, (remaining / (15 * 60 * 1000)) * 100);

    return (
        <div style={{
            background: 'linear-gradient(135deg, #ff4d4d15, #ff000010)',
            border: '1.5px solid #ff4d4d55',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px',
            textAlign: 'center'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                <Clock size={18} color="#e53e3e" />
                <span style={{ color: '#e53e3e', fontWeight: '700', fontSize: '0.95rem' }}>
                    Cuenta bloqueada temporalmente
                </span>
            </div>
            <div style={{
                fontSize: '2rem',
                fontWeight: '800',
                color: '#c53030',
                letterSpacing: '2px',
                fontVariantNumeric: 'tabular-nums',
                marginBottom: '8px'
            }}>
                {String(min).padStart(2, '0')}:{String(sec).padStart(2, '0')}
            </div>
            {/* Barra de progreso */}
            <div style={{ background: '#fed7d7', borderRadius: '999px', height: '6px', overflow: 'hidden' }}>
                <div style={{
                    width: `${progress}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #e53e3e, #fc8181)',
                    borderRadius: '999px',
                    transition: 'width 1s linear'
                }} />
            </div>
            <p style={{ color: '#742a2a', fontSize: '0.8rem', marginTop: '8px' }}>
                Demasiados intentos fallidos. Vuelva a intentar cuando expire el tiempo.
            </p>
        </div>
    );
};

// ──────────────────────────────────────────────
//  Barra de intentos restantes
// ──────────────────────────────────────────────
const AttemptsBar = ({ remaining }) => {
    if (remaining >= MAX_ATTEMPTS) return null;
    const pct     = (remaining / MAX_ATTEMPTS) * 100;
    const color   = remaining <= 2 ? '#e53e3e' : remaining <= 4 ? '#dd6b20' : '#d69e2e';
    const bgColor = remaining <= 2 ? '#fff5f5' : remaining <= 4 ? '#fffaf0' : '#fffff0';
    const borderC = remaining <= 2 ? '#fc8181' : remaining <= 4 ? '#f6ad55' : '#f6e05e';

    return (
        <div style={{
            background: bgColor,
            border: `1.5px solid ${borderC}`,
            borderRadius: '10px',
            padding: '10px 14px',
            marginBottom: '14px'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={15} color={color} />
                    <span style={{ color, fontSize: '0.82rem', fontWeight: '600' }}>
                        Contraseña incorrecta
                    </span>
                </div>
                <span style={{ color, fontWeight: '800', fontSize: '0.85rem' }}>
                    {remaining} / {MAX_ATTEMPTS} intentos
                </span>
            </div>
            <div style={{ background: '#e2e8f0', borderRadius: '999px', height: '5px', overflow: 'hidden' }}>
                <div style={{
                    width: `${pct}%`,
                    height: '100%',
                    background: color,
                    borderRadius: '999px',
                    transition: 'width 0.4s ease'
                }} />
            </div>
            {remaining <= 3 && (
                <p style={{ color, fontSize: '0.76rem', marginTop: '6px' }}>
                    ⚠️ Después de {remaining} intento{remaining !== 1 ? 's' : ''} más su cuenta será bloqueada 15 minutos.
                </p>
            )}
        </div>
    );
};

// ──────────────────────────────────────────────
//  Componente principal Login
// ──────────────────────────────────────────────
const Login = ({ setUser }) => {
    const [userType, setUserType]           = useState('practicant');
    const [formData, setFormData]           = useState({ dni: '', password: '', username: '' });
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [forgotData, setForgotData]       = useState({ identifier: '' });
    const [forgotStatus, setForgotStatus]   = useState(null);
    const [forgotMessage, setForgotMessage] = useState('');
    const [isLoading, setIsLoading]         = useState(false);

    // Estado de bloqueo
    const [lockedUntil, setLockedUntil]         = useState(null);   // timestamp ms
    const [attemptsRemaining, setAttemptsRemaining] = useState(MAX_ATTEMPTS);

    const navigate = useNavigate();

    // Al cambiar de tipo de usuario, limpiar estado de error/bloqueo
    const handleTypeChange = (type) => {
        setUserType(type);
        setLockedUntil(null);
        setAttemptsRemaining(MAX_ATTEMPTS);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (lockedUntil && Date.now() < lockedUntil) return; // doble-check cliente
        setIsLoading(true);

        try {
            const payload = {
                type: userType,
                password: formData.password,
                ...(userType === 'practicant' ? { dni: formData.dni } : { username: formData.username })
            };

            const response = await axios.post('http://localhost:3000/api/auth/login', payload);

            // Login exitoso → limpiar estado
            setLockedUntil(null);
            setAttemptsRemaining(MAX_ATTEMPTS);
            setUser(response.data.user);
            localStorage.setItem('token', response.data.token);
            navigate(userType === 'practicant' ? '/practicant' : '/admin');

        } catch (error) {
            const data = error.response?.data || {};

            if (data.locked) {
                // Cuenta bloqueada
                setLockedUntil(data.lockedUntil || Date.now() + 15 * 60 * 1000);
                setAttemptsRemaining(0);
            } else if (typeof data.attemptsRemaining === 'number') {
                setAttemptsRemaining(data.attemptsRemaining);
                setLockedUntil(null);
            } else {
                // Error genérico (ej: no puede conectar)
                alert(data.message || 'Error al conectar con el servidor. Verifica que esté encendido y la base de datos conectada.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        if (!forgotData.identifier) {
            alert('Por favor, ingrese su DNI o Usuario.');
            return;
        }
        setForgotStatus('loading');
        setForgotMessage('Procesando solicitud...');

        try {
            const response = await axios.post('http://localhost:3000/api/auth/forgot-password', {
                dni: forgotData.identifier
            });
            setForgotStatus('success');
            setForgotMessage(response.data.message || 'Contraseña restablecida correctamente.');

            // Al restablecer contraseña, limpiar bloqueo en frontend también
            setLockedUntil(null);
            setAttemptsRemaining(MAX_ATTEMPTS);

            setTimeout(() => {
                setShowForgotModal(false);
                setForgotStatus(null);
                setForgotMessage('');
                setForgotData({ identifier: '' });
            }, 4000);

        } catch (error) {
            setForgotStatus('error');
            setForgotMessage(error.response?.data?.message || 'Error al procesar la solicitud. Verifique que el usuario existe.');
        }
    };

    const isLocked = lockedUntil && Date.now() < lockedUntil;

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <img src="/muni_logo.png" alt="Logo Muni" style={{ width: '150px', marginBottom: '20px' }} />
                    <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold' }} className="login-title-h1">MUNICIPALIDAD DISTRITAL DE</h1>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }} className="login-title-h2">SAN JUAN BAUTISTA</h2>
                    <p style={{ marginTop: '10px', fontSize: '0.9rem' }} className="login-subtitle">"Juntos Pueblo y Municipio"</p>
                </div>

                <div className="user-type-selector">
                    <div
                        className={`user-type-btn ${userType === 'practicant' ? 'active' : ''} practicant`}
                        onClick={() => handleTypeChange('practicant')}
                    >
                        <UserCheck size={32} style={{ margin: '0 auto 10px', color: 'var(--practicant)' }} />
                        <span>Practicante</span>
                    </div>
                    <div
                        className={`user-type-btn ${userType === 'admin' ? 'active' : ''} admin`}
                        onClick={() => handleTypeChange('admin')}
                    >
                        <Lock size={32} style={{ margin: '0 auto 10px', color: 'var(--admin)' }} />
                        <span>Encargada/Admin</span>
                    </div>
                </div>

                <form onSubmit={handleLogin} className={`login-form active`}>
                    {userType === 'practicant' ? (
                        <>
                            <h3 style={{ marginBottom: '20px', color: 'var(--practicant)' }}>Acceso Practicante</h3>
                            <div className="form-group">
                                <label>DNI</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Ingrese su DNI"
                                    value={formData.dni}
                                    onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                                    disabled={!!isLocked}
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 style={{ marginBottom: '20px', color: 'var(--admin)' }}>Acceso Administrador</h3>
                            <div className="form-group">
                                <label>Usuario</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Usuario administrador"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    disabled={!!isLocked}
                                />
                            </div>
                        </>
                    )}

                    <div className="form-group">
                        <label>Contraseña</label>
                        <input
                            type="password"
                            className="form-control"
                            placeholder="Ingrese su contraseña"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            disabled={!!isLocked}
                        />
                    </div>

                    {/* ── Bloqueo activo ── */}
                    {isLocked && (
                        <LockCountdown
                            lockedUntil={lockedUntil}
                            onUnlock={() => {
                                setLockedUntil(null);
                                setAttemptsRemaining(MAX_ATTEMPTS);
                            }}
                        />
                    )}

                    {/* ── Intentos restantes (cuando no está bloqueado pero hay intentos usados) ── */}
                    {!isLocked && attemptsRemaining < MAX_ATTEMPTS && (
                        <AttemptsBar remaining={attemptsRemaining} />
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', opacity: isLocked || isLoading ? 0.6 : 1, cursor: isLocked ? 'not-allowed' : 'pointer' }}
                        disabled={!!isLocked || isLoading}
                    >
                        {isLoading ? 'Verificando...' : isLocked ? 'Bloqueado' : 'Ingresar'}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '15px' }}>
                        <a
                            href="#"
                            onClick={(e) => { e.preventDefault(); setShowForgotModal(true); setForgotStatus(null); setForgotMessage(''); }}
                            style={{ color: '#0056b3', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500' }}
                        >
                            ¿Recuperar contraseña?
                        </a>
                    </div>
                </form>

                <div className="terminal-link-container" style={{ marginTop: '20px', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                    <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '10px' }}>¿Desea marcar asistencia sin iniciar sesión?</p>
                    <button
                        onClick={() => navigate('/terminal')}
                        className="btn-terminal"
                        style={{
                            background: 'transparent',
                            border: '2px solid #3f51b5',
                            color: '#3f51b5',
                            padding: '8px 15px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontWeight: '600',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Shield size={16} /> Ir a Terminal de Asistencia
                    </button>
                </div>
            </div>

            {/* Forgot Password Modal */}
            {showForgotModal && (
                <div className="modal active" style={{ display: 'flex', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, justifyContent: 'center', alignItems: 'center' }}>
                    <div className="modal-content" style={{ background: 'white', padding: '30px', borderRadius: '15px', width: '90%', maxWidth: '400px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                        <h3 style={{ marginBottom: '15px', color: '#333' }}>Recuperar Contraseña</h3>
                        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '20px' }}>
                            Ingrese su DNI (practicantes) o Usuario (administradores). Su contraseña será <strong>restablecida automáticamente</strong> a su número de identificación.
                        </p>

                        <form onSubmit={handleForgotPassword}>
                            <div className="form-group" style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>DNI / Usuario</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Ingrese su identificación"
                                    value={forgotData.identifier}
                                    onChange={(e) => setForgotData({ identifier: e.target.value })}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                                    required
                                />
                            </div>

                            {forgotMessage && (
                                <div style={{
                                    padding: '10px',
                                    marginBottom: '20px',
                                    borderRadius: '8px',
                                    fontSize: '0.9rem',
                                    backgroundColor: forgotStatus === 'success' ? '#d4edda' : forgotStatus === 'error' ? '#f8d7da' : '#e2e3e5',
                                    color: forgotStatus === 'success' ? '#155724' : forgotStatus === 'error' ? '#721c24' : '#383d41'
                                }}>
                                    {forgotMessage}
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setShowForgotModal(false)} className="btn btn-danger" style={{ padding: '8px 15px', borderRadius: '8px', border: 'none', background: '#dc3545', color: 'white', cursor: 'pointer' }}>
                                    {forgotStatus === 'success' ? 'Cerrar' : 'Cancelar'}
                                </button>
                                {forgotStatus !== 'success' && (
                                    <button type="submit" className="btn btn-primary" disabled={forgotStatus === 'loading'} style={{ padding: '8px 15px', borderRadius: '8px', border: 'none', background: '#0056b3', color: 'white', cursor: 'pointer' }}>
                                        {forgotStatus === 'loading' ? 'Procesando...' : 'Aceptar'}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;
