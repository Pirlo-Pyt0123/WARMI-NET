import pool from '../config/database.js';

class Service {
  // Crear nuevo servicio
  static async create(data) {
    const { 
      community_id, user_id, titulo, descripcion, tipo, categoria,
      precio, moneda, precio_texto, telefono_contacto, horario_atencion,
      direccion, imagenes
    } = data;
    
    const [result] = await pool.execute(
      `INSERT INTO services (
        community_id, user_id, titulo, descripcion, tipo, categoria,
        precio, moneda, precio_texto, telefono_contacto, horario_atencion,
        direccion, imagenes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        community_id, user_id, titulo, descripcion, tipo, categoria,
        precio, moneda || 'Bs', precio_texto, telefono_contacto, horario_atencion,
        direccion, JSON.stringify(imagenes || [])
      ]
    );
    
    return result.insertId;
  }

  // Obtener servicio por ID
  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM v_services_full WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  // Obtener todos los servicios (feed general)
  static async findAll(filters = {}) {
    let query = 'SELECT * FROM v_services_full WHERE disponible = TRUE';
    const params = [];

    if (filters.tipo) {
      query += ' AND tipo = ?';
      params.push(filters.tipo);
    }

    if (filters.categoria) {
      query += ' AND categoria = ?';
      params.push(filters.categoria);
    }

    if (filters.community_id) {
      query += ' AND community_id = ?';
      params.push(filters.community_id);
    }

    if (filters.search) {
      query += ' AND (titulo LIKE ? OR descripcion LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm);
    }

    query += ' ORDER BY created_at DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(parseInt(filters.limit));
    }

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  // Actualizar servicio
  static async update(id, userId, data) {
    const fields = [];
    const values = [];
    
    // Solo el dueño puede actualizar
    if (data.titulo !== undefined) {
      fields.push('titulo = ?');
      values.push(data.titulo);
    }
    if (data.descripcion !== undefined) {
      fields.push('descripcion = ?');
      values.push(data.descripcion);
    }
    if (data.precio !== undefined) {
      fields.push('precio = ?');
      values.push(data.precio);
    }
    if (data.precio_texto !== undefined) {
      fields.push('precio_texto = ?');
      values.push(data.precio_texto);
    }
    if (data.disponible !== undefined) {
      fields.push('disponible = ?');
      values.push(data.disponible);
    }
    if (data.telefono_contacto !== undefined) {
      fields.push('telefono_contacto = ?');
      values.push(data.telefono_contacto);
    }
    if (data.horario_atencion !== undefined) {
      fields.push('horario_atencion = ?');
      values.push(data.horario_atencion);
    }
    if (data.direccion !== undefined) {
      fields.push('direccion = ?');
      values.push(data.direccion);
    }
    
    if (fields.length === 0) return false;
    
    values.push(id, userId);
    
    const [result] = await pool.execute(
      `UPDATE services SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`,
      values
    );
    
    return result.affectedRows > 0;
  }

  // Eliminar servicio
  static async delete(id, userId) {
    const [result] = await pool.execute(
      'DELETE FROM services WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  }

  // Incrementar contador de vistas
  static async incrementViews(id) {
    await pool.execute(
      'UPDATE services SET total_vistas = total_vistas + 1 WHERE id = ?',
      [id]
    );
  }

  // Incrementar contador de contactos
  static async incrementContacts(id) {
    await pool.execute(
      'UPDATE services SET total_contactos = total_contactos + 1 WHERE id = ?',
      [id]
    );
  }

  // Agregar reseña
  static async addReview(serviceId, userId, data) {
    const { calificacion, comentario } = data;
    
    try {
      const [result] = await pool.execute(
        'INSERT INTO service_reviews (service_id, user_id, calificacion, comentario) VALUES (?, ?, ?, ?)',
        [serviceId, userId, calificacion, comentario]
      );
      return result.insertId;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Ya has dejado una reseña para este servicio');
      }
      throw error;
    }
  }

  // Obtener reseñas de un servicio
  static async getReviews(serviceId) {
    const [rows] = await pool.execute(
      `SELECT sr.*, u.nombres, u.apellidos, u.usuario
       FROM service_reviews sr
       INNER JOIN users u ON sr.user_id = u.id
       WHERE sr.service_id = ?
       ORDER BY sr.created_at DESC`,
      [serviceId]
    );
    return rows;
  }
}

export default Service;
