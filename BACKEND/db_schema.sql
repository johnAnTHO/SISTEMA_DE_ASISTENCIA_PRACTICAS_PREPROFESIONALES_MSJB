-- 1. Crear la base de datos (Ejecutar esto primero si no existe)
-- CREATE DATABASE asistencia_db;

-- 2. Conectarse a la base de datos
-- \c asistencia_db;

-- 3. Crear Tabla de Areas (Organigrama Municipal)
CREATE TABLE IF NOT EXISTS "Areas" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    "parentArea" VARCHAR(255) -- Para jerarquía (ej. Gerencia -> Subgerencia)
);

-- 4. Insertar las Áreas de la Municipalidad
INSERT INTO "Areas" (name, "parentArea") VALUES 
-- Alta Dirección
('Concejo Municipal', 'Alta Dirección'),
('Concejo de Coordinación Local Distrital', 'Alta Dirección'),
('Junta de Delegados Vecinales y Comunales', 'Alta Dirección'),
('Alcaldía', 'Alta Dirección'),
('Gerencia Municipal', 'Alta Dirección'),
-- Órganos de Control y Asesoramiento
('Órgano de Control Institucional', 'Control y Asesoramiento'),
('Procuraduría Pública', 'Control y Asesoramiento'),
('Oficina General de Atención al Ciudadano y Gestión Documentaria', 'Control y Asesoramiento'),
('Oficina General de Asesoría Jurídica', 'Control y Asesoramiento'),
('Oficina General de Planeamiento y Presupuesto', 'Control y Asesoramiento'),
('Oficina de Planeamiento, Modernización e Inversiones', 'Oficina General de Planeamiento y Presupuesto'),
('Oficina de Presupuesto', 'Oficina General de Planeamiento y Presupuesto'),
-- Órgano de Apoyo (Administración)
('Oficina General de Administración', 'Administración'),
('Oficina de Administración Financiera', 'Administración'),
('Oficina de Abastecimiento', 'Administración'),
('Oficina de Gestión de Recursos Humanos', 'Administración'),
('Oficina TIC', 'Administración'),
-- Gerencias de Línea
('Gerencia de Recaudación y Administración Tributaria', 'Gerencia Línea'),
('Subgerencia de Rentas', 'Gerencia de Recaudación y Administración Tributaria'),
('Subgerencia de Fiscalización Administrativa y Tributaria', 'Gerencia de Recaudación y Administración Tributaria'),
('Subgerencia de Ejecución Coactiva', 'Gerencia de Recaudación y Administración Tributaria'),
('Gerencia de Desarrollo Territorial e Infraestructura', 'Gerencia Línea'),
('Subgerencia de Desarrollo Territorial y Licencias', 'Gerencia de Desarrollo Territorial e Infraestructura'),
('Subgerencia de Formulación de Estudios y Proyectos', 'Gerencia de Desarrollo Territorial e Infraestructura'),
('Subgerencia de Infraestructura', 'Gerencia de Desarrollo Territorial e Infraestructura'),
('Subgerencia de Supervisión y Liquidación de Proyectos', 'Gerencia de Desarrollo Territorial e Infraestructura'),
('Gerencia de Servicios Municipales y Gestión Ambiental', 'Gerencia Línea'),
('Subgerencia de Participación y Seguridad Ciudadana', 'Gerencia de Servicios Municipales y Gestión Ambiental'),
('Subgerencia de Servicios Municipales y Gestión Ambiental', 'Gerencia de Servicios Municipales y Gestión Ambiental'),
('Subgerencia de Transportes y Seguridad Vial', 'Gerencia de Servicios Municipales y Gestión Ambiental'),
('Gerencia de Desarrollo Económico y Social', 'Gerencia Línea'),
('Subgerencia de Desarrollo Económico y Productivo', 'Gerencia de Desarrollo Económico y Social'),
('Subgerencia de Comercio, Licencias y Control Sanitario', 'Gerencia de Desarrollo Económico y Social'),
('Subgerencia de Servicios y Programas Sociales', 'Gerencia de Desarrollo Económico y Social')
ON CONFLICT (name) DO NOTHING;

-- 5. Crear Tabla de Usuarios
CREATE TABLE IF NOT EXISTS "Users" (
    id SERIAL PRIMARY KEY,
    dni VARCHAR(20) UNIQUE,
    username VARCHAR(50) UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'PRACTICANT',
    names VARCHAR(100),
    lastnames VARCHAR(100),
    area VARCHAR(255), -- Se guardará el nombre del área
    shift VARCHAR(20),
    university VARCHAR(100),
    career VARCHAR(100),
    phone VARCHAR(20),
    photo TEXT,
    email VARCHAR(100),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Crear Tabla de Asistencias
CREATE TABLE IF NOT EXISTS "Attendances" (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER REFERENCES "Users"(id) ON UPDATE CASCADE ON DELETE SET NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    "entryTime" TIME,
    "exitTime" TIME,
    hours FLOAT DEFAULT 0,
    status VARCHAR(20),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Insertar Usuarios de Prueba
-- Admin
INSERT INTO "Users" (username, password, role, names, lastnames, area, "createdAt", "updatedAt")
VALUES 
('admin', 'admin123', 'ADMIN', 'Rosa', 'Mendoza', 'Oficina de Gestión de Recursos Humanos', NOW(), NOW())
ON CONFLICT (username) DO NOTHING;

-- Practicante
INSERT INTO "Users" (dni, password, role, names, lastnames, area, shift, university, career, phone, "createdAt", "updatedAt")
VALUES 
('71234567', '123456', 'PRACTICANT', 'María', 'García López', 'Oficina TIC', 'Mañana', 'UNSCH', 'Ingeniería de Sistemas', '966123456', NOW(), NOW())
ON CONFLICT (dni) DO NOTHING;
