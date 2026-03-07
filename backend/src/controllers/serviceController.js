import Service from '../models/Service.js';
import Community from '../models/Community.js';

// @desc    Obtener todos los servicios (feed general)
// @route   GET /api/services
// @access  Public
export const getAllServices = async (req, res) => {
  try {
    const { tipo, categoria, community_id, search, limit } = req.query;
    
    const filters = {};
    if (tipo) filters.tipo = tipo;
    if (categoria) filters.categoria = categoria;
    if (community_id) filters.community_id = community_id;
    if (search) filters.search = search;
    if (limit) filters.limit = limit;

    const services = await Service.findAll(filters);

    res.json({
      success: true,
      count: services.length,
      services
    });
  } catch (error) {
    console.error('Error al obtener servicios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener servicios',
      error: error.message
    });
  }
};

// @desc    Obtener un servicio por ID
// @route   GET /api/services/:id
// @access  Public
export const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Servicio no encontrado'
      });
    }

    // Incrementar contador de vistas
    await Service.incrementViews(req.params.id);

    res.json({
      success: true,
      service
    });
  } catch (error) {
    console.error('Error al obtener servicio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener servicio',
      error: error.message
    });
  }
};

// @desc    Crear nuevo servicio
// @route   POST /api/services
// @access  Private
export const createService = async (req, res) => {
  try {
    const {
      community_id,
      titulo,
      descripcion,
      tipo,
      categoria,
      precio,
      moneda,
      precio_texto,
      telefono_contacto,
      horario_atencion,
      direccion,
      imagenes
    } = req.body;

    // Verificar que la comunidad existe
    const community = await Community.findById(community_id);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Comunidad no encontrada'
      });
    }

    // Verificar que el usuario es miembro de la comunidad
    const isMember = await Community.isMember(req.user.id, community_id);
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Debes ser miembro de la comunidad para publicar servicios'
      });
    }

    const serviceId = await Service.create({
      community_id,
      user_id: req.user.id,
      titulo,
      descripcion,
      tipo,
      categoria,
      precio,
      moneda,
      precio_texto,
      telefono_contacto,
      horario_atencion,
      direccion,
      imagenes
    });

    const service = await Service.findById(serviceId);

    res.status(201).json({
      success: true,
      message: 'Servicio creado exitosamente',
      service
    });
  } catch (error) {
    console.error('Error al crear servicio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear servicio',
      error: error.message
    });
  }
};

// @desc    Actualizar servicio
// @route   PUT /api/services/:id
// @access  Private
export const updateService = async (req, res) => {
  try {
    const {
      titulo,
      descripcion,
      precio,
      precio_texto,
      disponible,
      telefono_contacto,
      horario_atencion,
      direccion
    } = req.body;

    const updated = await Service.update(req.params.id, req.user.id, {
      titulo,
      descripcion,
      precio,
      precio_texto,
      disponible,
      telefono_contacto,
      horario_atencion,
      direccion
    });

    if (!updated) {
      return res.status(400).json({
        success: false,
        message: 'No se pudo actualizar el servicio. Puede que no seas el propietario.'
      });
    }

    const service = await Service.findById(req.params.id);

    res.json({
      success: true,
      message: 'Servicio actualizado exitosamente',
      service
    });
  } catch (error) {
    console.error('Error al actualizar servicio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar servicio',
      error: error.message
    });
  }
};

// @desc    Eliminar servicio
// @route   DELETE /api/services/:id
// @access  Private
export const deleteService = async (req, res) => {
  try {
    const deleted = await Service.delete(req.params.id, req.user.id);

    if (!deleted) {
      return res.status(400).json({
        success: false,
        message: 'No se pudo eliminar el servicio. Puede que no seas el propietario.'
      });
    }

    res.json({
      success: true,
      message: 'Servicio eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar servicio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar servicio',
      error: error.message
    });
  }
};

// @desc    Incrementar contador de contactos
// @route   POST /api/services/:id/contact
// @access  Public
export const contactService = async (req, res) => {
  try {
    await Service.incrementContacts(req.params.id);

    res.json({
      success: true,
      message: 'Contacto registrado'
    });
  } catch (error) {
    console.error('Error al registrar contacto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar contacto',
      error: error.message
    });
  }
};

// @desc    Agregar reseña a un servicio
// @route   POST /api/services/:id/reviews
// @access  Private
export const addReview = async (req, res) => {
  try {
    const { calificacion, comentario } = req.body;

    const reviewId = await Service.addReview(req.params.id, req.user.id, {
      calificacion,
      comentario
    });

    res.status(201).json({
      success: true,
      message: 'Reseña agregada exitosamente',
      reviewId
    });
  } catch (error) {
    if (error.message === 'Ya has dejado una reseña para este servicio') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    console.error('Error al agregar reseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error al agregar reseña',
      error: error.message
    });
  }
};

// @desc    Obtener reseñas de un servicio
// @route   GET /api/services/:id/reviews
// @access  Public
export const getReviews = async (req, res) => {
  try {
    const reviews = await Service.getReviews(req.params.id);

    res.json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    console.error('Error al obtener reseñas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reseñas',
      error: error.message
    });
  }
};
