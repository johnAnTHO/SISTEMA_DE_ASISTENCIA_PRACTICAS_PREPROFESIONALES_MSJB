import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, ArrowRight, Clock, Database, Server, Cpu, 
  CheckCircle, XCircle, AlertCircle, FileText, Layers, 
  Monitor, User, TrendingUp, Check, FileSpreadsheet, Home, HelpCircle
} from 'lucide-react';

export default function Presentation() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState('next'); // next / prev

  // Slide 2 states (Problem comparator slider)
  const [compareSplit, setCompareSplit] = useState(50); // percentage

  // Slide 3 states (Terminal simulator)
  const [terminalDni, setTerminalDni] = useState('');
  const [terminalStatus, setTerminalStatus] = useState('idle'); // idle, loading, success, error
  const [terminalMessage, setTerminalMessage] = useState('');
  const [terminalLog, setTerminalLog] = useState([]);

  // Slide 4 states (Admin preview charts)
  const [adminTab, setAdminTab] = useState('summary'); // summary, distribution

  // Slide 5 states (Practicant preview)
  const [pracHours, setPracHours] = useState(120);
  const [pracActionLog, setPracActionLog] = useState([
    { time: '08:02 AM', type: 'Entrada', status: 'A tiempo' },
    { time: '01:05 PM', type: 'Salida', status: 'Completado' }
  ]);

  // Slide 6 states (Tech stack)
  const [activeTech, setActiveTech] = useState(null);

  const totalSlides = 7;

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'Escape') {
        navigate('/login');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide]);

  const nextSlide = () => {
    if (currentSlide < totalSlides - 1) {
      setDirection('next');
      setCurrentSlide(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setDirection('prev');
      setCurrentSlide(prev => prev - 1);
    }
  };

  // Simulate Terminal Check-In/Out
  const handleTerminalSubmit = (e) => {
    e.preventDefault();
    if (terminalDni.length !== 8 || isNaN(terminalDni)) {
      setTerminalStatus('error');
      setTerminalMessage('Error: El DNI debe contener exactamente 8 dígitos numéricos.');
      return;
    }

    setTerminalStatus('loading');
    setTerminalMessage('Consultando credenciales en base de datos...');

    setTimeout(() => {
      if (terminalDni === '71234567') {
        setTerminalStatus('success');
        setTerminalMessage('¡Asistencia registrada! Bienvenido María García López (Entrada: 08:14 AM).');
        setTerminalLog(prev => [
          { time: new Date().toLocaleTimeString(), dni: terminalDni, type: 'ENTRADA', user: 'María García' },
          ...prev
        ]);
      } else if (terminalDni === '12345678') {
        setTerminalStatus('success');
        setTerminalMessage('¡Asistencia registrada! Hasta pronto Juan Pérez Díaz (Salida: 01:10 PM).');
        setTerminalLog(prev => [
          { time: new Date().toLocaleTimeString(), dni: terminalDni, type: 'SALIDA', user: 'Juan Pérez' },
          ...prev
        ]);
      } else {
        setTerminalStatus('error');
        setTerminalMessage(`DNI ${terminalDni} no encontrado en el sistema. Verifique su registro.`);
      }
    }, 1000);
  };

  return (
    <div className="presentation-container">
      {/* Background lights */}
      <div className="bg-glow bg-glow-1"></div>
      <div className="bg-glow bg-glow-2"></div>
      <div className="bg-glow bg-glow-3"></div>

      {/* Top Header */}
      <header className="pres-header">
        <div className="pres-logo-section">
          <img src="/muni_logo.png" alt="MDSJB Logo" className="pres-muni-logo" onError={(e) => e.target.style.display = 'none'} />
          <div>
            <span className="pres-badge">MDSJB 2026</span>
            <h1 className="pres-app-title">Sistema de Asistencia de Practicantes</h1>
          </div>
        </div>
        <button className="pres-exit-btn" onClick={() => navigate('/login')}>
          <Home size={16} style={{ marginRight: '8px' }} />
          Salir al Login
        </button>
      </header>

      {/* Main Slide Frame */}
      <main className="pres-main-frame">
        <div className={`slide-wrapper slide-fade-${direction}`}>
          
          {/* SLIDE 1: PORTADA */}
          {currentSlide === 0 && (
            <div className="slide-content slide-cover-layout">
              <div className="slide-cover-text">
                <div className="slide-tag">SISTEMA INTEGRAL WEB</div>
                <h2 className="slide-title-primary">Control de Asistencia Digitalizado</h2>
                <p className="slide-desc-large">
                  Una plataforma moderna para el registro, supervisión y reporte automatizado de las prácticas preprofesionales en la Municipalidad Distrital de San Juan Bautista.
                </p>
                <div className="slide-features-grid">
                  <div className="feature-item-mini">
                    <span className="icon-wrapper"><Clock size={18} /></span>
                    <div>
                      <strong>Marcación Rápida</strong>
                      <span>Por DNI en segundos</span>
                    </div>
                  </div>
                  <div className="feature-item-mini">
                    <span className="icon-wrapper"><TrendingUp size={18} /></span>
                    <div>
                      <strong>Métricas en Vivo</strong>
                      <span>Para administradores</span>
                    </div>
                  </div>
                </div>
                <button className="pres-primary-btn" onClick={nextSlide}>
                  Empezar Presentación
                  <ArrowRight size={18} style={{ marginLeft: '10px' }} />
                </button>
              </div>
              <div className="slide-cover-image-container">
                <img 
                  src="/images/slide_cover.png" 
                  alt="Sistema de Asistencia" 
                  className="slide-cover-image" 
                  onError={(e) => {
                    e.target.src = '/images/muni_background.jpg';
                  }}
                />
                <div className="image-overlay-card">
                  <div className="dot-green"></div>
                  <span>Sistema Online</span>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 2: PROBLEMÁTICA */}
          {currentSlide === 1 && (
            <div className="slide-content">
              <div className="slide-header-section">
                <span className="slide-num">02 / 07</span>
                <h2 className="slide-title">La Problemática Tradicional vs Solución Digital</h2>
                <p className="slide-subtitle">Desliza la barra central para comparar el método anterior con la nueva solución digitalizada.</p>
              </div>

              <div className="comparison-slider-container">
                <div className="comparison-slider" style={{ '--split-pos': `${compareSplit}%` }}>
                  {/* Left Side: Manual */}
                  <div className="slider-side side-manual">
                    <div className="side-card-content">
                      <div className="side-badge bad">MÉTODO MANUAL TRADICIONAL</div>
                      <h3 className="side-title">Registro en Cuadernos de Papel</h3>
                      <ul className="side-list">
                        <li>⚠️ Vulnerable a falsificaciones y firmas incorrectas.</li>
                        <li>⚠️ Pérdida de tiempo al inicio de jornada haciendo filas físicas.</li>
                        <li>⚠️ Consumo masivo de papel e impacto ambiental negativo.</li>
                        <li>⚠️ Cálculo manual lento de horas trabajadas para reportes finales.</li>
                        <li>⚠️ Falta de visibilidad inmediata de practicantes ausentes.</li>
                      </ul>
                    </div>
                  </div>

                  {/* Right Side: Digital */}
                  <div className="slider-side side-digital">
                    <div className="side-card-content">
                      <div className="side-badge good">SISTEMA WEB DIGITAL</div>
                      <h3 className="side-title">Marcación en Terminal Inteligente</h3>
                      <ul className="side-list">
                        <li>✅ Registro biométrico exacto por DNI digitalizado.</li>
                        <li>✅ Marcación ágil en 3 segundos sin demoras ni filas.</li>
                        <li>✅ Cero consumo de papel (100% digital e institucional).</li>
                        <li>✅ Cálculo automático en tiempo real de minutos y horas de prácticas.</li>
                        <li>✅ Alertas inmediatas y monitoreo en vivo para la Oficina de RRHH.</li>
                      </ul>
                    </div>
                  </div>

                  {/* Split Handle */}
                  <div className="slider-handle" style={{ left: `${compareSplit}%` }}>
                    <div className="handle-line"></div>
                    <div className="handle-button">
                      <ArrowLeft size={12} />
                      <ArrowRight size={12} />
                    </div>
                  </div>

                  {/* Invisible Range Input on top */}
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={compareSplit} 
                    onChange={(e) => setCompareSplit(Number(e.target.value))} 
                    className="slider-range-input"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 3: SIMULACIÓN TERMINAL */}
          {currentSlide === 2 && (
            <div className="slide-content">
              <div className="slide-header-section">
                <span className="slide-num">03 / 07</span>
                <h2 className="slide-title">Terminal de Asistencia (Simulador en Vivo)</h2>
                <p className="slide-subtitle">Prueba el registro ingresando un DNI. DNI de prueba: <strong>71234567</strong> (María) o <strong>12345678</strong> (Juan).</p>
              </div>

              <div className="terminal-slide-layout">
                {/* Simulated Device */}
                <div className="sim-device">
                  <div className="device-header">
                    <div className="device-dot red"></div>
                    <div className="device-dot yellow"></div>
                    <div className="device-dot green"></div>
                    <span className="device-title">TERMINAL DE MARCACIÓN - MDSJB</span>
                  </div>

                  <div className="device-body">
                    <div className="device-screen">
                      <div className="screen-time-display">
                        <Clock size={20} className="pulse-icon" />
                        <span>08:15 AM</span>
                      </div>

                      <h3 className="screen-prompt">INGRESE SU DNI</h3>

                      <form onSubmit={handleTerminalSubmit} className="screen-form">
                        <input
                          type="text"
                          maxLength={8}
                          placeholder="Escriba su DNI..."
                          value={terminalDni}
                          onChange={(e) => setTerminalDni(e.target.value.replace(/\D/g, ''))}
                          disabled={terminalStatus === 'loading'}
                          className="screen-input"
                        />
                        <button type="submit" className="screen-submit-btn" disabled={terminalStatus === 'loading'}>
                          {terminalStatus === 'loading' ? 'Procesando...' : 'REGISTRAR'}
                        </button>
                      </form>

                      {/* Display Status */}
                      <div className={`screen-status-box status-${terminalStatus}`}>
                        {terminalStatus === 'idle' && (
                          <p className="status-placeholder"><HelpCircle size={16} /> Digite un DNI para simular una marcación.</p>
                        )}
                        {terminalStatus === 'loading' && (
                          <div className="spinner-mini"></div>
                        )}
                        {terminalStatus === 'success' && (
                          <div className="status-detail">
                            <CheckCircle size={18} className="icon-success" />
                            <p>{terminalMessage}</p>
                          </div>
                        )}
                        {terminalStatus === 'error' && (
                          <div className="status-detail">
                            <XCircle size={18} className="icon-error" />
                            <p>{terminalMessage}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Simulated Database Records Log */}
                <div className="sim-log-panel">
                  <h4 className="log-panel-title">Marcaciones del Servidor en Vivo</h4>
                  <div className="log-list">
                    {terminalLog.length === 0 ? (
                      <div className="log-empty">
                        <Database size={24} style={{ opacity: 0.3, marginBottom: '8px' }} />
                        <span>Esperando registros de asistencia...</span>
                      </div>
                    ) : (
                      terminalLog.map((log, index) => (
                        <div key={index} className="log-row">
                          <span className="log-time">{log.time}</span>
                          <span className={`log-type ${log.type === 'ENTRADA' ? 'in' : 'out'}`}>{log.type}</span>
                          <span className="log-user">{log.user}</span>
                          <span className="log-dni">DNI: {log.dni}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 4: DASHBOARD ADMIN */}
          {currentSlide === 3 && (
            <div className="slide-content">
              <div className="slide-header-section">
                <span className="slide-num">04 / 07</span>
                <h2 className="slide-title">Panel Administrativo de Recursos Humanos</h2>
                <p className="slide-subtitle">Gestión centralizada de horarios, reportes listos para imprimir y métricas de puntualidad.</p>
              </div>

              <div className="admin-slide-layout">
                {/* Sidebar Navigation Mock */}
                <div className="mock-sidebar">
                  <div className="sidebar-header">ADMIN CONTROL</div>
                  <button className={`sidebar-link ${adminTab === 'summary' ? 'active' : ''}`} onClick={() => setAdminTab('summary')}>
                    <TrendingUp size={16} /> Resumen General
                  </button>
                  <button className={`sidebar-link ${adminTab === 'distribution' ? 'active' : ''}`} onClick={() => setAdminTab('distribution')}>
                    <Layers size={16} /> Distribución por Área
                  </button>
                </div>

                {/* Dashboard Main Visual Area */}
                <div className="mock-dashboard-content">
                  {adminTab === 'summary' ? (
                    <div className="dashboard-view-fade">
                      {/* Metric cards */}
                      <div className="metrics-grid-mini">
                        <div className="metric-box-mini">
                          <span className="m-label">Total Practicantes</span>
                          <span className="m-val">28</span>
                          <span className="m-sub">Registrados</span>
                        </div>
                        <div className="metric-box-mini">
                          <span className="m-label">Asistencia Hoy</span>
                          <span className="m-val green-text">92.8%</span>
                          <span className="m-sub">26 presentes</span>
                        </div>
                        <div className="metric-box-mini">
                          <span className="m-label">Tardanzas Hoy</span>
                          <span className="m-val orange-text">2</span>
                          <span className="m-sub">Justificadas</span>
                        </div>
                      </div>

                      {/* Custom SVG Bar Chart */}
                      <div className="chart-container-mini">
                        <h4 className="chart-title">Asistencia durante la semana pasada</h4>
                        <div className="svg-chart-wrapper">
                          <svg viewBox="0 0 400 120" className="animated-svg-chart">
                            {/* Grid Lines */}
                            <line x1="30" y1="10" x2="380" y2="10" stroke="#2a2f42" strokeDasharray="3,3" />
                            <line x1="30" y1="50" x2="380" y2="50" stroke="#2a2f42" strokeDasharray="3,3" />
                            <line x1="30" y1="90" x2="380" y2="90" stroke="#2a2f42" strokeDasharray="3,3" />
                            
                            {/* Bars */}
                            {/* Lunes: 90% */}
                            <rect x="50" y="20" width="30" height="80" rx="3" fill="url(#gradBlue)" className="bar-rect" />
                            {/* Martes: 95% */}
                            <rect x="110" y="15" width="30" height="85" rx="3" fill="url(#gradBlue)" className="bar-rect" />
                            {/* Miércoles: 88% */}
                            <rect x="170" y="22" width="30" height="78" rx="3" fill="url(#gradBlue)" className="bar-rect" />
                            {/* Jueves: 92% */}
                            <rect x="230" y="18" width="30" height="82" rx="3" fill="url(#gradBlue)" className="bar-rect" />
                            {/* Viernes: 96% */}
                            <rect x="290" y="14" width="30" height="86" rx="3" fill="url(#gradBlue)" className="bar-rect" />
                            
                            {/* Labels */}
                            <text x="65" y="115" fill="#a0aec0" fontSize="10" textAnchor="middle">Lun</text>
                            <text x="125" y="115" fill="#a0aec0" fontSize="10" textAnchor="middle">Mar</text>
                            <text x="185" y="115" fill="#a0aec0" fontSize="10" textAnchor="middle">Mie</text>
                            <text x="245" y="115" fill="#a0aec0" fontSize="10" textAnchor="middle">Jue</text>
                            <text x="305" y="115" fill="#a0aec0" fontSize="10" textAnchor="middle">Vie</text>

                            {/* Gradients */}
                            <defs>
                              <linearGradient id="gradBlue" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#4f46e5" />
                                <stop offset="100%" stopColor="#312e81" />
                              </linearGradient>
                            </defs>
                          </svg>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="dashboard-view-fade">
                      <h4 className="chart-title">Distribución de Practicantes por Oficinas</h4>
                      <div className="area-dist-list">
                        <div className="area-bar-row">
                          <span className="area-name">Oficina de Gestión de RRHH</span>
                          <div className="area-progress-bg">
                            <div className="area-progress-fill" style={{ width: '35%', background: '#6366f1' }}></div>
                          </div>
                          <span className="area-count">8 (35%)</span>
                        </div>
                        <div className="area-bar-row">
                          <span className="area-name">Oficina de Informática y TIC</span>
                          <div className="area-progress-bg">
                            <div className="area-progress-fill" style={{ width: '25%', background: '#10b981' }}></div>
                          </div>
                          <span className="area-count">6 (25%)</span>
                        </div>
                        <div className="area-bar-row">
                          <span className="area-name">Administración y Finanzas</span>
                          <div className="area-progress-bg">
                            <div className="area-progress-fill" style={{ width: '20%', background: '#f59e0b' }}></div>
                          </div>
                          <span className="area-count">5 (20%)</span>
                        </div>
                        <div className="area-bar-row">
                          <span className="area-name">Secretaría General</span>
                          <div className="area-progress-bg">
                            <div className="area-progress-fill" style={{ width: '20%', background: '#ec4899' }}></div>
                          </div>
                          <span className="area-count">5 (20%)</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 5: PANEL PRACTICANTE */}
          {currentSlide === 4 && (
            <div className="slide-content">
              <div className="slide-header-section">
                <span className="slide-num">05 / 07</span>
                <h2 className="slide-title">Panel del Practicante / Estudiante</h2>
                <p className="slide-subtitle">El practicante puede monitorear sus horas de forma independiente y autónoma.</p>
              </div>

              <div className="practicant-slide-layout">
                {/* Left Card: Intern Profile & Hours Ring */}
                <div className="practicant-profile-card">
                  <div className="prof-header">
                    <div className="prof-avatar">M</div>
                    <div>
                      <h3 className="prof-name">María García López</h3>
                      <p className="prof-career">Ingeniería de Sistemas - UNSCH</p>
                    </div>
                  </div>

                  <div className="hours-ring-container">
                    <svg width="120" height="120" viewBox="0 0 120 120">
                      {/* Track Circle */}
                      <circle cx="60" cy="60" r="50" fill="none" stroke="#2d3748" strokeWidth="10" />
                      {/* Progress Circle (37.5% represented) */}
                      <circle 
                        cx="60" 
                        cy="60" 
                        r="50" 
                        fill="none" 
                        stroke="#10b981" 
                        strokeWidth="10" 
                        strokeDasharray="314.15" 
                        strokeDashoffset={314.15 * (1 - pracHours / 320)} 
                        strokeLinecap="round"
                        transform="rotate(-90 60 60)"
                        className="circle-prog-anim"
                      />
                      <text x="60" y="65" textAnchor="middle" fill="#ffffff" fontWeight="bold" fontSize="16">
                        {Math.round((pracHours / 320) * 100)}%
                      </text>
                    </svg>

                    <div className="hours-stats">
                      <div>
                        <span className="hours-large">{pracHours}h</span>
                        <span className="hours-label">Acumuladas</span>
                      </div>
                      <div className="stat-separator"></div>
                      <div>
                        <span className="hours-large">320h</span>
                        <span className="hours-label">Requeridas</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Card: Personal Attendance Logs */}
                <div className="practicant-logs-card">
                  <div className="logs-header">
                    <h4>Mi Historial Reciente</h4>
                    <button className="simulate-btn" onClick={() => setPracHours(prev => prev >= 320 ? 120 : prev + 10)}>
                      Simular +10 Horas
                    </button>
                  </div>
                  <div className="logs-list-mini">
                    {pracActionLog.map((log, index) => (
                      <div key={index} className="log-item-custom">
                        <div className={`log-indicator ${log.type === 'Entrada' ? 'bg-in' : 'bg-out'}`}></div>
                        <div className="log-info">
                          <strong className="log-act-title">{log.type} Registrada</strong>
                          <span className="log-act-subtitle">Lunes 24 de Agosto</span>
                        </div>
                        <div className="log-meta">
                          <span className="log-act-time">{log.time}</span>
                          <span className="log-act-status">{log.status}</span>
                        </div>
                      </div>
                    ))}
                    <div className="log-item-custom opacity-70">
                      <div className="log-indicator bg-in"></div>
                      <div className="log-info">
                        <strong className="log-act-title">Entrada Registrada</strong>
                        <span className="log-act-subtitle">Viernes 21 de Agosto</span>
                      </div>
                      <div className="log-meta">
                        <span className="log-act-time">08:05 AM</span>
                        <span className="log-act-status">A tiempo</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 6: ARQUITECTURA TECNOLÓGICA */}
          {currentSlide === 5 && (
            <div className="slide-content">
              <div className="slide-header-section">
                <span className="slide-num">06 / 07</span>
                <h2 className="slide-title">Arquitectura y Pila Tecnológica Moderna</h2>
                <p className="slide-subtitle">Haga clic en cualquiera de los componentes para ver detalles técnicos de su rol en el sistema.</p>
              </div>

              <div className="tech-stack-layout">
                {/* Tech Cards Grid */}
                <div className="tech-cards-grid">
                  <div 
                    className={`tech-card ${activeTech === 'frontend' ? 'active' : ''}`}
                    onClick={() => setActiveTech('frontend')}
                  >
                    <Monitor className="tech-icon color-cyan" size={32} />
                    <h3>FRONTEND</h3>
                    <p>Vite + React (Javascript)</p>
                    <span className="action-hint">Ver más detalles</span>
                  </div>

                  <div 
                    className={`tech-card ${activeTech === 'backend' ? 'active' : ''}`}
                    onClick={() => setActiveTech('backend')}
                  >
                    <Server className="tech-icon color-green" size={32} />
                    <h3>BACKEND</h3>
                    <p>Node.js + Express API</p>
                    <span className="action-hint">Ver más detalles</span>
                  </div>

                  <div 
                    className={`tech-card ${activeTech === 'database' ? 'active' : ''}`}
                    onClick={() => setActiveTech('database')}
                  >
                    <Database className="tech-icon color-blue" size={32} />
                    <h3>BASE DE DATOS</h3>
                    <p>PostgreSQL Relacional</p>
                    <span className="action-hint">Ver más detalles</span>
                  </div>

                  <div 
                    className={`tech-card ${activeTech === 'orm' ? 'active' : ''}`}
                    onClick={() => setActiveTech('orm')}
                  >
                    <Cpu className="tech-icon color-purple" size={32} />
                    <h3>ORM / ENLACE</h3>
                    <p>Sequelize</p>
                    <span className="action-hint">Ver más detalles</span>
                  </div>
                </div>

                {/* Tech details panel */}
                <div className="tech-detail-panel">
                  {activeTech === null ? (
                    <div className="detail-empty">
                      <HelpCircle size={36} style={{ marginBottom: '12px', opacity: 0.3 }} />
                      <p>Seleccione una capa tecnológica del panel izquierdo para analizar sus ventajas y configuración.</p>
                    </div>
                  ) : (
                    <div className="detail-content-active">
                      {activeTech === 'frontend' && (
                        <>
                          <span className="detail-badge badge-cyan">Interfaz de Usuario</span>
                          <h4>React + Vite SPA</h4>
                          <p className="detail-desc">
                            Construido sobre React con empaquetado ultra rápido mediante Vite. Permite transiciones fluidas de tipo Single Page Application (SPA), brindando al usuario final una navegación similar a la de una aplicación de escritorio.
                          </p>
                          <ul className="detail-bullets">
                            <li>⚡ Renderizado veloz e interactividad de formularios.</li>
                            <li>🎨 Diseño adaptativo (responsive) para terminales tipo Tablet.</li>
                            <li>🔄 Intercomunicación en vivo vía Axios.</li>
                          </ul>
                        </>
                      )}
                      {activeTech === 'backend' && (
                        <>
                          <span className="detail-badge badge-green">Lógica del Servidor</span>
                          <h4>Express RESTful API</h4>
                          <p className="detail-desc">
                            Servidor Node.js que expone APIs seguras para el guardado de asistencias, autenticación por JSON Web Token (JWT) y administración de perfiles.
                          </p>
                          <ul className="detail-bullets">
                            <li>🔒 Rutas seguras protegidas con Middlewares y tokens.</li>
                            <li>⚙️ Conexión persistente de base de datos.</li>
                            <li>📦 Escalable para añadir soporte de marcación biométrica física.</li>
                          </ul>
                        </>
                      )}
                      {activeTech === 'database' && (
                        <>
                          <span className="detail-badge badge-blue">Persistencia de Datos</span>
                          <h4>PostgreSQL</h4>
                          <p className="detail-desc">
                            Motor de base de datos relacional de grado empresarial, seleccionado por su alta consistencia de datos, soporte de transacciones robustas y velocidad para consultas de reportes.
                          </p>
                          <ul className="detail-bullets">
                            <li>📊 Tablas de Usuarios, Asistencias y Horarios relacionadas.</li>
                            <li>🔑 Restricciones de integridad referencial rígidas.</li>
                            <li>💼 Altamente seguro ante cortes de energía o fallos en el servidor.</li>
                          </ul>
                        </>
                      )}
                      {activeTech === 'orm' && (
                        <>
                          <span className="detail-badge badge-purple">Mapeo Objeto-Relacional</span>
                          <h4>Sequelize ORM</h4>
                          <p className="detail-desc">
                            Permite interactuar con la base de datos PostgreSQL a través de objetos Javascript puros en lugar de consultas SQL manuales, acelerando el desarrollo y reduciendo errores de sintaxis.
                          </p>
                          <ul className="detail-bullets">
                            <li>🗃️ Sincronización automática de tablas en base a modelos.</li>
                            <li>📈 Consultas optimizadas con relaciones precargadas.</li>
                            <li>🌱 Facilidad para correr semillas ("seeds") de inicialización.</li>
                          </ul>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 7: BENEFICIOS */}
          {currentSlide === 6 && (
            <div className="slide-content">
              <div className="slide-header-section text-center">
                <span className="slide-num">07 / 07</span>
                <h2 className="slide-title text-center">Beneficios Clave del Proyecto</h2>
                <p className="slide-subtitle text-center">Impacto directo del sistema en la eficiencia y administración de la municipalidad.</p>
              </div>

              <div className="benefits-grid-layout">
                <div className="benefit-card">
                  <div className="benefit-icon-wrapper b-cyan">
                    <FileSpreadsheet size={28} />
                  </div>
                  <h3>Reportes en un Clic</h3>
                  <p>
                    Se acabaron las horas sumando minutos a mano. Exporta reportes de asistencia en segundos, listos para anexar a expedientes de pago.
                  </p>
                </div>

                <div className="benefit-card">
                  <div className="benefit-icon-wrapper b-green">
                    <Clock size={28} />
                  </div>
                  <h3>Monitoreo en Tiempo Real</h3>
                  <p>
                    El departamento de RRHH puede visualizar instantáneamente quién está en la oficina y quién llegó tarde, agilizando la toma de decisiones.
                  </p>
                </div>

                <div className="benefit-card">
                  <div className="benefit-icon-wrapper b-orange">
                    <FileText size={28} />
                  </div>
                  <h3>Ahorro Ecológico</h3>
                  <p>
                    Reducción al 100% de impresión de cuadernos de control de asistencia. Promueve una municipalidad alineada con la ecología y modernidad.
                  </p>
                </div>

                <div className="benefit-card">
                  <div className="benefit-icon-wrapper b-purple">
                    <CheckCircle size={28} />
                  </div>
                  <h3>Autonomía del Estudiante</h3>
                  <p>
                    El practicante puede comprobar sus horas acumuladas de manera transparente, eliminando dudas o desacuerdos al finalizar sus prácticas.
                  </p>
                </div>
              </div>

              <div className="final-slide-actions text-center">
                <p className="final-concl">¡Un paso firme hacia la transformación digital institucional!</p>
                <button className="pres-accent-btn" onClick={() => navigate('/login')}>
                  Ir al Panel de Acceso
                  <ArrowRight size={16} style={{ marginLeft: '8px' }} />
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Navigation Controls footer */}
      <footer className="pres-footer">
        <div className="pres-controls">
          <button 
            onClick={prevSlide} 
            className="pres-nav-btn" 
            disabled={currentSlide === 0}
            title="Slide anterior (Flecha Izquierda)"
          >
            <ArrowLeft size={20} />
            Anterior
          </button>

          {/* Dots Indicator */}
          <div className="pres-dots-container">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <button
                key={i}
                className={`pres-dot-indicator ${currentSlide === i ? 'active' : ''}`}
                onClick={() => {
                  setDirection(i > currentSlide ? 'next' : 'prev');
                  setCurrentSlide(i);
                }}
                title={`Ir a diapositiva ${i + 1}`}
              />
            ))}
          </div>

          <button 
            onClick={nextSlide} 
            className="pres-nav-btn" 
            disabled={currentSlide === totalSlides - 1}
            title="Siguiente slide (Flecha Derecha)"
          >
            Siguiente
            <ArrowRight size={20} />
          </button>
        </div>
      </footer>
    </div>
  );
}
