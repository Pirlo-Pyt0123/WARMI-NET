import pool from '../config/database.js';

class Community {
  // Crear nueva comunidad
  static async create(data) {
    const { nombre, descripcion, ubicacion, createdBy } = data;
    
    const [result] = await pool.execute(
      `INSERT INTO communities (nombre, descripcion, ubicacion, created_by) 
       VALUES (?, ?, ?, ?)`,
      [nombre, descripcion, ubicacion, createdBy]
    );
    
    return result.insertId;
  }

  // Obtener todas las comunidades
  static async findAll() {
    const [rows] = await pool.execute(
      `SELECT * FROM v_communities_stats ORDER BY total_miembros DESC`
    );
    return rows;
  }

  // Obtener comunidad por ID
  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM v_communities_stats WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  // Obtener comunidad por nombre
  static async findByName(nombre) {
    const [rows] = await pool.execute(
      'SELECT * FROM communities WHERE nombre = ?',
      [nombre]
    );
    return rows[0];
  }

  // Unirse a una comunidad
  static async joinCommunity(userId, communityId) {
    try {
      const [result] = await pool.execute(
        `INSERT INTO community_members (user_id, community_id, estado) 
         VALUES (?, ?, 'activo')`,
        [userId, communityId]
      );
      return result.insertId;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Ya eres miembro de esta comunidad');
      }
      throw error;
    }
  }

  // Salir de una comunidad
  static async leaveCommunity(userId, communityId) {
    const [result] = await pool.execute(
      'DELETE FROM community_members WHERE user_id = ? AND community_id = ?',
      [userId, communityId]
    );
    return result.affectedRows > 0;
  }

  // Verificar si un usuario es miembro
  static async isMember(userId, communityId) {
    const [rows] = await pool.execute(
      'SELECT * FROM community_members WHERE user_id = ? AND community_id = ? AND estado = "activo"',
      [userId, communityId]
    );
    return rows.length > 0;
  }

  // Obtener miembros de una comunidad
  static async getMembers(communityId) {
    const [rows] = await pool.execute(
      `SELECT u.id, u.nombres, u.apellidos, u.usuario, cm.rol, cm.fecha_union
       FROM users u
       INNER JOIN community_members cm ON u.id = cm.user_id
       WHERE cm.community_id = ? AND cm.estado = 'activo'
       ORDER BY cm.fecha_union DESC`,
      [communityId]
    );
    return rows;
  }

  // Obtener servicios de una comunidad
  static async getServices(communityId, filters = {}) {
    let query = 'SELECT * FROM v_services_full WHERE community_id = ?';
    const params = [communityId];

    if (filters.tipo) {
      query += ' AND tipo = ?';
      params.push(filters.tipo);
    }

    if (filters.disponible !== undefined) {
      query += ' AND disponible = ?';
      params.push(filters.disponible);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  // Actualizar comunidad
  static async update(id, data) {
    const fields = [];
    const values = [];
    
    if (data.descripcion !== undefined) {
      fields.push('descripcion = ?');
      values.push(data.descripcion);
    }
    if (data.ubicacion !== undefined) {
      fields.push('ubicacion = ?');
      values.push(data.ubicacion);
    }
    if (data.imagen_url !== undefined) {
      fields.push('imagen_url = ?');
      values.push(data.imagen_url);
    }
    
    if (fields.length === 0) return false;
    
    values.push(id);
    
    const [result] = await pool.execute(
      `UPDATE communities SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    return result.affectedRows > 0;
  }
}

export default Community;
