import { useState } from 'react';
import { User, Lock, UserCheck, Shield } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = ({ setUser }) => {
    const [userType, setUserType] = useState('practicant'); // 'practicant' | 'admin'
    const [formData, setFormData] = useState({ dni: '', password: '', username: '' });
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [forgotData, setForgotData] = useState({ identifier: '' });
    const [forgotStatus, setForgotStatus] = useState(null);
    const [forgotMessage, setForgotMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const payload = {
                type: userType,
                password: formData.password,
                ...(userType === 'practicant' ? { dni: formData.dni } : { username: formData.username })
            };

            // LLAMADA REAL AL BACKEND
            const response = await axios.post('http://localhost:3000/api/auth/login', payload);

            // Si el login es exitoso:
            setUser(response.data.user);
            localStorage.setItem('token', response.data.token);

            // Navegar según el rol
            navigate(userType === 'practicant' ? '/practicant' : '/admin');

        } catch (error) {
            console.error("Login error:", error);
            // Mostrar mensaje real del servidor o error genérico
            const msg = error.response?.data?.message || 'Error al conectar con el servidor. Verifica que esté encendido y la base de datos conectada.';
            alert(msg);
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
            
            // Cerrar el modal automáticamente después de 4 segundos para que pruebe al login
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
                        onClick={() => setUserType('practicant')}
                    >
                        <UserCheck size={32} style={{ margin: '0 auto 10px', color: 'var(--practicant)' }} />
                        <span>Practicante</span>
                    </div>
                    <div
                        className={`user-type-btn ${userType === 'admin' ? 'active' : ''} admin`}
                        onClick={() => setUserType('admin')}
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
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                        Ingresar
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
                            Ingrese su DNI (practicantes) o Usuario (administradores). Su contraseña será **restablecida automáticamente** a su número de identificación.
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
