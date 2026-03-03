import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Clock, Scan, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';

const AttendanceTerminal = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [dni, setDni] = useState('');
    const [status, setStatus] = useState('idle'); // idle, processing, success, error
    const [feedback, setFeedback] = useState(null);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    // Actualizar reloj
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Mantener foco en el input siempre (para lectores que actúan como teclado)
    useEffect(() => {
        const focusInput = () => {
            if (inputRef.current) {
                inputRef.current.focus();
            }
        };
        focusInput();

        // Refocus si el usuario hace click fuera
        document.addEventListener('click', focusInput);
        return () => document.removeEventListener('click', focusInput);
    }, []);

    // Auto-limpiar mensajes después de unos segundos
    useEffect(() => {
        if (status === 'success' || status === 'error') {
            const timer = setTimeout(() => {
                setStatus('idle');
                setFeedback(null);
                setDni('');
            }, 5000); // 5 segundos para leer el mensaje
            return () => clearTimeout(timer);
        }
    }, [status]);

    const handleIdentify = async (e) => {
        e.preventDefault();
        if (!dni || dni.length < 8) return;

        setStatus('processing');
        try {
            const response = await axios.post('http://localhost:3000/api/attendance/register', {
                dni: dni
            });

            const data = response.data;
            setStatus('success');
            setFeedback({
                type: data.type, // ENTRADA o SALIDA
                message: data.message,
                user: data.user,
                time: data.time
            });

            // Reproducir sonido beep si fuera posible (opcional)
        } catch (error) {
            console.error("Error marcando:", error);
            setStatus('error');
            setFeedback({
                message: error.response?.data?.message || 'Error de conexión o DNI no encontrado.'
            });
        }
        setDni('');
    };

    return (
        <div className="terminal-container">
            {/* Botón para regresar al Login */}
            <button
                onClick={() => navigate('/login')}
                className="btn-exit-terminal"
                title="Volver al inicio de sesión"
            >
                <ArrowLeft size={24} />
                <span>Salir</span>
            </button>

            <header className="terminal-header">
                <img src="/muni_logo.png" alt="Logo" className="terminal-logo" />
                <div className="terminal-titles">
                    <h1>Control de Asistencia</h1>
                    <p>Municipalidad Distrital de San Juan Bautista</p>
                </div>
            </header>

            <main className="terminal-body">
                {/* Reloj Grande */}
                <div className="terminal-clock-card">
                    <div className="digital-clock">
                        {currentTime.toLocaleTimeString('es-PE', { hour12: true })}
                    </div>
                    <div className="digital-date">
                        {currentTime.toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </div>

                {/* Área de Estado Visual */}
                <div className={`status-display ${status}`}>
                    {status === 'idle' && (
                        <div className="idle-state">
                            <div className="pulse-ring"></div>
                            <Scan size={64} className="scan-icon" />
                            <h2>Escanee su DNI ahora</h2>
                            <p>Acerque su código de barras al lector o ingrese su DNI</p>
                        </div>
                    )}

                    {status === 'processing' && (
                        <div className="processing-state">
                            <div className="spinner"></div>
                            <h2>Procesando...</h2>
                        </div>
                    )}

                    {status === 'success' && feedback && (
                        <div className="success-state">
                            <ShieldCheck size={80} className="success-icon" />
                            <div className="success-info">
                                <h3>¡{feedback.type} REGISTRADA!</h3>
                                <div className="user-name">{feedback.user}</div>
                                <div className="timestamp">{feedback.time}</div>
                                <p>{feedback.message}</p>
                            </div>
                        </div>
                    )}

                    {status === 'error' && feedback && (
                        <div className="error-state">
                            <AlertCircle size={80} className="error-icon" />
                            <h3>No se pudo registrar</h3>
                            <p>{feedback.message}</p>
                        </div>
                    )}
                </div>

                {/* Input Oculto/Visible para Captura */}
                <form onSubmit={handleIdentify} className="input-form">
                    <input
                        ref={inputRef}
                        type="text"
                        value={dni}
                        onChange={(e) => setDni(e.target.value.replace(/\D/g, '').slice(0, 8))}
                        placeholder="Ingrese DNI manual..."
                        className="dni-input"
                        autoComplete="off"
                        autoFocus
                    />
                    <button type="submit" className="btn-manual-submit">Marcar</button>
                    <p className="input-hint">El cursor debe estar aquí para usar el lector</p>
                </form>
            </main>

            <style>{`
                .terminal-container {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
                    background-image: url('/images/muni_background.jpg');
                    background-size: cover;
                    background-position: center;
                    background-repeat: no-repeat;
                    color: white;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    font-family: 'Segoe UI', system-ui, sans-serif;
                    padding: 2rem;
                    position: relative;
                }
                
                .terminal-container::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(135deg, rgba(30, 60, 114, 0.88) 0%, rgba(42, 82, 152, 0.92) 100%);
                    z-index: 1;
                }
                
                .terminal-container > * {
                    position: relative;
                    z-index: 2;
                }

                .btn-exit-terminal {
                    position: absolute;
                    top: 25px;
                    left: 25px;
                    background: rgba(255, 255, 255, 0.15);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    color: white;
                    padding: 10px 20px;
                    border-radius: 30px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 1rem;
                    font-weight: 500;
                    transition: all 0.3s ease;
                    backdrop-filter: blur(5px);
                    z-index: 100;
                }
                .btn-exit-terminal:hover {
                    background: rgba(255, 255, 255, 0.3);
                    transform: translateX(-3px);
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                }

                .terminal-header {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    margin-bottom: 3rem;
                    text-align: center;
                }
                .terminal-logo { height: 80px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3)); }
                .terminal-titles h1 { margin: 0; font-size: 2.5rem; text-shadow: 0 2px 4px rgba(0,0,0,0.3); }
                .terminal-titles p { margin: 0; font-size: 1.1rem; opacity: 0.9; }

                .terminal-body {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 2rem;
                    width: 100%;
                    max-width: 600px;
                }

                .terminal-clock-card {
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    padding: 2rem;
                    border-radius: 20px;
                    text-align: center;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    width: 100%;
                }
                .digital-clock { font-size: 4rem; font-weight: 700; font-variant-numeric: tabular-nums; letter-spacing: 2px; }
                .digital-date { font-size: 1.2rem; text-transform: capitalize; opacity: 0.9; margin-top: 0.5rem; }

                .status-display {
                    background: rgba(0, 0, 0, 0.3);
                    backdrop-filter: blur(15px);
                    color: white;
                    width: 100%;
                    min-height: 300px;
                    border-radius: 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    padding: 2rem;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.5);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                }

                .status-display.idle { border-bottom: 5px solid rgba(255, 255, 255, 0.3); }
                
                .status-display.success { 
                    background: rgba(40, 167, 69, 0.2);
                    border: 1px solid rgba(40, 167, 69, 0.5);
                    color: #e8f5e9;
                    box-shadow: 0 0 30px rgba(40, 167, 69, 0.3);
                }
                
                .status-display.error { 
                    background: rgba(220, 53, 69, 0.2);
                    border: 1px solid rgba(220, 53, 69, 0.5);
                    color: #ffebee;
                    box-shadow: 0 0 30px rgba(220, 53, 69, 0.3);
                }

                .scan-icon { color: #64b5f6; margin-bottom: 1rem; animation: float 3s ease-in-out infinite; filter: drop-shadow(0 0 10px rgba(100, 181, 246, 0.5)); }
                .success-icon { color: #4caf50; margin-bottom: 1rem; animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); filter: drop-shadow(0 0 10px rgba(76, 175, 80, 0.5)); }
                .error-icon { color: #ff5252; margin-bottom: 1rem; animation: shake 0.5s; filter: drop-shadow(0 0 10px rgba(255, 82, 82, 0.5)); }

                .user-name { font-size: 2.5rem; font-weight: 800; margin: 15px 0; text-shadow: 0 2px 10px rgba(0,0,0,0.5); letter-spacing: 1px; }
                .timestamp { font-size: 1.4rem; margin-bottom: 15px; opacity: 0.9; font-weight: 300; }

                .input-form {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                    width: 100%;
                    opacity: 0.7;
                    transition: opacity 0.3s;
                }
                .input-form:hover, .input-form:focus-within { opacity: 1; }
                
                .dni-input {
                    padding: 10px 15px;
                    border-radius: 50px;
                    border: none;
                    text-align: center;
                    font-size: 1.2rem;
                    width: 200px;
                    background: rgba(255,255,255,0.2);
                    color: white;
                    outline: none;
                }
                .dni-input::placeholder { color: rgba(255,255,255,0.6); }
                .dni-input:focus { background: rgba(255,255,255,0.3); box-shadow: 0 0 0 2px rgba(255,255,255,0.5); }
                
                .btn-manual-submit {
                    background: transparent;
                    border: 1px solid rgba(255,255,255,0.4);
                    color: white;
                    padding: 5px 15px;
                    border-radius: 20px;
                    cursor: pointer;
                }

                @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
                @keyframes popIn { 0% { transform: scale(0); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
                @keyframes shake { 0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); } 20%, 40%, 60%, 80% { transform: translateX(5px); } }
            `}</style>
        </div>
    );
};

export default AttendanceTerminal;
