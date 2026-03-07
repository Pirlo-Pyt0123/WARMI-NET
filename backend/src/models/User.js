import pool from '../config/database.js';

class User {
  // Crear nuevo usuario
  static async create(userData) {
    const { ci, nombres, apellidos, edad, usuario, pin, faceDescriptor, faceImageUrl, documentImageUrl } = userData;
    
    const [result] = await pool.execute(
      `INSERT INTO users (ci, nombres, apellidos, edad, usuario, pin, face_descriptor, face_image_url, document_image_url, verificado) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [ci, nombres, apellidos, edad, usuario, pin, JSON.stringify(faceDescriptor), faceImageUrl, documentImageUrl]
    );
    
    return result.insertId;
  }

  // Buscar usuario por CI
  static async findByCI(ci) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE ci = ? AND activo = TRUE',
      [ci]
    );
    return rows[0];
  }

  // Buscar usuario por username
  static async findByUsername(usuario) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE usuario = ? AND activo = TRUE',
      [usuario]
    );
    return rows[0];
  }

  // Buscar usuario por ID
  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, ci, nombres, apellidos, nombre_completo, edad, usuario, email, telefono, face_image_url, verificado, created_at FROM users WHERE id = ? AND activo = TRUE',
      [id]
    );
    return rows[0];
  }

  // Verificar PIN
  static async verifyPin(ci, pin) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE ci = ? AND pin = ? AND activo = TRUE',
      [ci, pin]
    );
    return rows[0];
  }

  // Actualizar último login
  static async updateLastLogin(id) {
    await pool.execute(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
  }

  // Actualizar perfil
  static async update(id, data) {
    const fields = [];
    const values = [];
    
    if (data.telefono !== undefined) {
      fields.push('telefono = ?');
      values.push(data.telefono);
    }
    if (data.email !== undefined) {
      fields.push('email = ?');
      values.push(data.email);
    }
    
    if (fields.length === 0) return false;
    
    values.push(id);
    
    const [result] = await pool.execute(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    return result.affectedRows > 0;
  }

  // Obtener comunidades del usuario
  static async getCommunities(userId) {
    const [rows] = await pool.execute(
      `SELECT c.*, cm.rol, cm.fecha_union 
       FROM communities c
       INNER JOIN community_members cm ON c.id = cm.community_id
       WHERE cm.user_id = ? AND cm.estado = 'activo'
       ORDER BY cm.fecha_union DESC`,
      [userId]
    );
    return rows;
  }

  // Obtener servicios publicados por el usuario
  static async getServices(userId) {
    const [rows] = await pool.execute(
      `SELECT s.*, c.nombre as comunidad_nombre
       FROM services s
       INNER JOIN communities c ON s.community_id = c.id
       WHERE s.user_id = ?
       ORDER BY s.created_at DESC`,
      [userId]
    );
    return rows;
  }
}

export default User;
