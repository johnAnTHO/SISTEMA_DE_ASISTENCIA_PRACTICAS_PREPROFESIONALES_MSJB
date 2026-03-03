import { useState } from 'react';
import { User, Lock, UserCheck, Shield } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = ({ setUser }) => {
    const [userType, setUserType] = useState('practicant'); // 'practicant' | 'admin'
    const [formData, setFormData] = useState({ dni: '', password: '', username: '' });
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
        </div>
    );
};

export default Login;
