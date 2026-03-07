-- ====================================================
-- WARMI NET - Base de Datos MySQL
-- Sistema de Red Social Comunitaria
-- ====================================================

CREATE DATABASE IF NOT EXISTS warmi_net CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE warmi_net;

-- ====================================================
-- TABLA: users
-- Usuarios del sistema con verificación biométrica
-- ====================================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ci VARCHAR(20) UNIQUE NOT NULL COMMENT 'Carnet de identidad',
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    nombre_completo VARCHAR(201) GENERATED ALWAYS AS (CONCAT(nombres, ' ', apellidos)) STORED,
    edad INT NOT NULL,
    fecha_nacimiento DATE,
    genero ENUM('M', 'F', 'Otro') DEFAULT NULL,
    telefono VARCHAR(20),
    email VARCHAR(100) UNIQUE,
    usuario VARCHAR(50) UNIQUE NOT NULL COMMENT 'Username único',
    pin VARCHAR(255) NOT NULL COMMENT 'PIN hasheado',
    
    -- Datos biométricos
    face_descriptor TEXT COMMENT 'Descriptor facial (JSON array 128 dimensiones)',
    face_image_url VARCHAR(500) COMMENT 'URL de la imagen facial de referencia',
    document_image_url VARCHAR(500) COMMENT 'URL del documento escaneado',
    
    -- Estado y verificación
    verificado BOOLEAN DEFAULT FALSE,
    activo BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    
    INDEX idx_ci (ci),
    INDEX idx_usuario (usuario),
    INDEX idx_email (email),
    INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- TABLA: communities
-- Comunidades/barrios registrados
-- ====================================================
CREATE TABLE communities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT,
    ubicacion VARCHAR(200) COMMENT 'Dirección o zona geográfica',
    latitud DECIMAL(10, 8),
    longitud DECIMAL(11, 8),
    imagen_url VARCHAR(500),
    
    -- Estadísticas
    total_miembros INT DEFAULT 0,
    total_servicios INT DEFAULT 0,
    
    -- Configuración
    es_publica BOOLEAN DEFAULT TRUE COMMENT 'Comunidad pública o privada',
    requiere_aprobacion BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_nombre (nombre),
    INDEX idx_publica (es_publica)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- TABLA: community_members
-- Relación usuarios-comunidades
-- ====================================================
CREATE TABLE community_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    community_id INT NOT NULL,
    
    -- Estado de membresía
    rol ENUM('miembro', 'moderador', 'admin') DEFAULT 'miembro',
    estado ENUM('pendiente', 'activo', 'suspendido', 'rechazado') DEFAULT 'activo',
    
    -- Timestamps
    fecha_union TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_aprobacion TIMESTAMP NULL,
    aprobado_por INT,
    
    UNIQUE KEY unique_member (user_id, community_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
    FOREIGN KEY (aprobado_por) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_user_community (user_id, community_id),
    INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- TABLA: services
-- Servicios y productos ofrecidos en las comunidades
-- ====================================================
CREATE TABLE services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    community_id INT NOT NULL,
    user_id INT NOT NULL COMMENT 'Usuario que publica el servicio',
    
    -- Información del servicio
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT NOT NULL,
    tipo ENUM('servicio', 'producto') NOT NULL,
    categoria VARCHAR(50) COMMENT 'Ej: educación, comida, salud, reparación',
    
    -- Precio y disponibilidad
    precio DECIMAL(10, 2),
    moneda VARCHAR(10) DEFAULT 'Bs',
    precio_texto VARCHAR(100) COMMENT 'Texto descriptivo del precio',
    disponible BOOLEAN DEFAULT TRUE,
    
    -- Contacto
    telefono_contacto VARCHAR(20),
    horario_atencion VARCHAR(200),
    direccion VARCHAR(300),
    
    -- Media
    imagenes JSON COMMENT 'Array de URLs de imágenes',
    
    -- Interacciones
    total_vistas INT DEFAULT 0,
    total_contactos INT DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    fecha_vencimiento DATE COMMENT 'Fecha opcional de caducidad del anuncio',
    
    FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_community (community_id),
    INDEX idx_user (user_id),
    INDEX idx_tipo (tipo),
    INDEX idx_disponible (disponible),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- TABLA: service_reviews
-- Reseñas y calificaciones de servicios
-- ====================================================
CREATE TABLE service_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_id INT NOT NULL,
    user_id INT NOT NULL,
    
    calificacion INT NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
    comentario TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_review (service_id, user_id),
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_service (service_id),
    INDEX idx_calificacion (calificacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- TABLA: messages
-- Sistema de mensajería entre usuarios
-- ====================================================
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    service_id INT COMMENT 'Mensaje relacionado a un servicio',
    
    asunto VARCHAR(200),
    mensaje TEXT NOT NULL,
    
    leido BOOLEAN DEFAULT FALSE,
    fecha_lectura TIMESTAMP NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL,
    
    INDEX idx_sender (sender_id),
    INDEX idx_receiver (receiver_id),
    INDEX idx_leido (leido)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- TABLA: notifications
-- Sistema de notificaciones
-- ====================================================
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    
    tipo ENUM('mensaje', 'servicio', 'comunidad', 'sistema') NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    contenido TEXT,
    link VARCHAR(500) COMMENT 'URL de redirección',
    
    leida BOOLEAN DEFAULT FALSE,
    fecha_lectura TIMESTAMP NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_user_leida (user_id, leida),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- TRIGGERS: Actualizar contadores automáticamente
-- ====================================================

-- Actualizar total_miembros en communities
DELIMITER $$
CREATE TRIGGER after_member_insert
AFTER INSERT ON community_members
FOR EACH ROW
BEGIN
    IF NEW.estado = 'activo' THEN
        UPDATE communities 
        SET total_miembros = total_miembros + 1 
        WHERE id = NEW.community_id;
    END IF;
END$$

CREATE TRIGGER after_member_update
AFTER UPDATE ON community_members
FOR EACH ROW
BEGIN
    IF OLD.estado != 'activo' AND NEW.estado = 'activo' THEN
        UPDATE communities 
        SET total_miembros = total_miembros + 1 
        WHERE id = NEW.community_id;
    ELSEIF OLD.estado = 'activo' AND NEW.estado != 'activo' THEN
        UPDATE communities 
        SET total_miembros = total_miembros - 1 
        WHERE id = NEW.community_id;
    END IF;
END$$

-- Actualizar total_servicios en communities
CREATE TRIGGER after_service_insert
AFTER INSERT ON services
FOR EACH ROW
BEGIN
    UPDATE communities 
    SET total_servicios = total_servicios + 1 
    WHERE id = NEW.community_id;
END$$

CREATE TRIGGER after_service_delete
AFTER DELETE ON services
FOR EACH ROW
BEGIN
    UPDATE communities 
    SET total_servicios = total_servicios - 1 
    WHERE id = OLD.community_id;
END$$

DELIMITER ;

-- ====================================================
-- DATOS INICIALES: Comunidades de ejemplo
-- ====================================================
INSERT INTO communities (nombre, descripcion, ubicacion, es_publica) VALUES
('Barrio Japón', 'Comunidad del tradicional Barrio Japón', 'Zona Sur, La Paz', TRUE),
('Mercado Central', 'Comerciantes del Mercado Central', 'Centro, La Paz', TRUE),
('Villa Copacabana', 'Residentes de Villa Copacabana', 'Zona Norte, La Paz', TRUE),
('Zona Sur', 'Comunidad general de Zona Sur', 'Zona Sur, La Paz', TRUE);

-- ====================================================
-- VISTAS ÚTILES
-- ====================================================

-- Vista de servicios con información del autor y comunidad
CREATE VIEW v_services_full AS
SELECT 
    s.*,
    u.nombres AS autor_nombres,
    u.apellidos AS autor_apellidos,
    u.usuario AS autor_usuario,
    u.telefono AS autor_telefono,
    c.nombre AS comunidad_nombre,
    COALESCE(AVG(sr.calificacion), 0) AS calificacion_promedio,
    COUNT(sr.id) AS total_resenas
FROM services s
INNER JOIN users u ON s.user_id = u.id
INNER JOIN communities c ON s.community_id = c.id
LEFT JOIN service_reviews sr ON s.id = sr.service_id
GROUP BY s.id;

-- Vista de comunidades con estadísticas
CREATE VIEW v_communities_stats AS
SELECT 
    c.*,
    COUNT(DISTINCT cm.user_id) AS miembros_activos,
    COUNT(DISTINCT s.id) AS servicios_activos,
    u.nombres AS creador_nombres,
    u.apellidos AS creador_apellidos
FROM communities c
LEFT JOIN community_members cm ON c.id = cm.community_id AND cm.estado = 'activo'
LEFT JOIN services s ON c.id = s.community_id AND s.disponible = TRUE
LEFT JOIN users u ON c.created_by = u.id
GROUP BY c.id;

-- ====================================================
-- FIN DEL SCRIPT
-- ====================================================
