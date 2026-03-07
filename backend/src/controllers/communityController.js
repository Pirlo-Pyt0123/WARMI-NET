import Community from '../models/Community.js';

// @desc    Obtener todas las comunidades
// @route   GET /api/communities
// @access  Public
export const getAllCommunities = async (req, res) => {
  try {
    const communities = await Community.findAll();

    res.json({
      success: true,
      count: communities.length,
      communities
    });
  } catch (error) {
    console.error('Error al obtener comunidades:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener comunidades',
      error: error.message
    });
  }
};

// @desc    Obtener una comunidad por ID
// @route   GET /api/communities/:id
// @access  Public
export const getCommunityById = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);

    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Comunidad no encontrada'
      });
    }

    res.json({
      success: true,
      community
    });
  } catch (error) {
    console.error('Error al obtener comunidad:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener comunidad',
      error: error.message
    });
  }
};

// @desc    Crear nueva comunidad
// @route   POST /api/communities
// @access  Private
export const createCommunity = async (req, res) => {
  try {
    const { nombre, descripcion, ubicacion } = req.body;

    // Verificar si ya existe
    const existing = await Community.findByName(nombre);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una comunidad con ese nombre'
      });
    }

    const communityId = await Community.create({
      nombre,
      descripcion,
      ubicacion,
      createdBy: req.user.id
    });

    // Automáticamente unir al creador como admin
    await Community.joinCommunity(req.user.id, communityId);

    const community = await Community.findById(communityId);

    res.status(201).json({
      success: true,
      message: 'Comunidad creada exitosamente',
      community
    });
  } catch (error) {
    console.error('Error al crear comunidad:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear comunidad',
      error: error.message
    });
  }
};

// @desc    Unirse a una comunidad
// @route   POST /api/communities/:id/join
// @access  Private
export const joinCommunity = async (req, res) => {
  try {
    const communityId = req.params.id;

    // Verificar que la comunidad existe
    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Comunidad no encontrada'
      });
    }

    // Unirse
    await Community.joinCommunity(req.user.id, communityId);

    res.json({
      success: true,
      message: `Te has unido a ${community.nombre}`
    });
  } catch (error) {
    if (error.message === 'Ya eres miembro de esta comunidad') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    console.error('Error al unirse a comunidad:', error);
    res.status(500).json({
      success: false,
      message: 'Error al unirse a comunidad',
      error: error.message
    });
  }
};

// @desc    Salir de una comunidad
// @route   POST /api/communities/:id/leave
// @access  Private
export const leaveCommunity = async (req, res) => {
  try {
    const communityId = req.params.id;

    const success = await Community.leaveCommunity(req.user.id, communityId);

    if (!success) {
      return res.status(400).json({
        success: false,
        message: 'No eres miembro de esta comunidad'
      });
    }

    res.json({
      success: true,
      message: 'Has salido de la comunidad'
    });
  } catch (error) {
    console.error('Error al salir de comunidad:', error);
    res.status(500).json({
      success: false,
      message: 'Error al salir de comunidad',
      error: error.message
    });
  }
};

// @desc    Obtener miembros de una comunidad
// @route   GET /api/communities/:id/members
// @access  Public
export const getCommunityMembers = async (req, res) => {
  try {
    const members = await Community.getMembers(req.params.id);

    res.json({
      success: true,
      count: members.length,
      members
    });
  } catch (error) {
    console.error('Error al obtener miembros:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener miembros',
      error: error.message
    });
  }
};

// @desc    Obtener servicios de una comunidad
// @route   GET /api/communities/:id/services
// @access  Public
export const getCommunityServices = async (req, res) => {
  try {
    const { tipo, disponible } = req.query;
    
    const filters = {};
    if (tipo) filters.tipo = tipo;
    if (disponible !== undefined) filters.disponible = disponible === 'true';

    const services = await Community.getServices(req.params.id, filters);

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

// @desc    Actualizar comunidad
// @route   PUT /api/communities/:id
// @access  Private (solo admin)
export const updateCommunity = async (req, res) => {
  try {
    const { descripcion, ubicacion, imagen_url } = req.body;

    const updated = await Community.update(req.params.id, {
      descripcion,
      ubicacion,
      imagen_url
    });

    if (!updated) {
      return res.status(400).json({
        success: false,
        message: 'No hay cambios para actualizar'
      });
    }

    const community = await Community.findById(req.params.id);

    res.json({
      success: true,
      message: 'Comunidad actualizada exitosamente',
      community
    });
  } catch (error) {
    console.error('Error al actualizar comunidad:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar comunidad',
      error: error.message
    });
  }
};
