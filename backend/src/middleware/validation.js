import { body, validationResult } from 'express-validator';

// Middleware para manejar errores de validación
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: errors.array()
    });
  }
  next();
};

// Validaciones para registro
export const validateRegister = [
  body('ci').notEmpty().withMessage('CI es requerido')
    .isLength({ min: 5, max: 20 }).withMessage('CI debe tener entre 5 y 20 caracteres'),
  body('nombres').notEmpty().withMessage('Nombres es requerido')
    .isLength({ max: 100 }).withMessage('Nombres muy largo'),
  body('apellidos').notEmpty().withMessage('Apellidos es requerido')
    .isLength({ max: 100 }).withMessage('Apellidos muy largo'),
  body('edad').isInt({ min: 15, max: 120 }).withMessage('Edad debe ser entre 15 y 120'),
  body('usuario').notEmpty().withMessage('Usuario es requerido')
    .isLength({ min: 3, max: 50 }).withMessage('Usuario debe tener entre 3 y 50 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Usuario solo puede contener letras, números y guión bajo'),
  body('pin').notEmpty().withMessage('PIN es requerido')
    .isLength({ min: 4, max: 6 }).withMessage('PIN debe tener entre 4 y 6 dígitos'),
  body('faceDescriptor').optional().isArray().withMessage('Descriptor facial debe ser un array'),
  body('faceImageUrl').optional().isString().withMessage('URL de imagen facial inválida'),
  body('documentImageUrl').optional().isString().withMessage('URL de imagen de documento inválida'),
  handleValidationErrors
];

// Validaciones para login
export const validateLogin = [
  body('ci').notEmpty().withMessage('CI es requerido'),
  body('pin').notEmpty().withMessage('PIN es requerido'),
  handleValidationErrors
];

// Validaciones para crear comunidad
export const validateCommunity = [
  body('nombre').notEmpty().withMessage('Nombre es requerido')
    .isLength({ max: 100 }).withMessage('Nombre muy largo'),
  body('descripcion').optional().isLength({ max: 1000 }).withMessage('Descripción muy larga'),
  body('ubicacion').optional().isLength({ max: 200 }).withMessage('Ubicación muy larga'),
  handleValidationErrors
];

// Validaciones para crear servicio
export const validateService = [
  body('community_id').isInt().withMessage('ID de comunidad inválido'),
  body('titulo').notEmpty().withMessage('Título es requerido')
    .isLength({ max: 200 }).withMessage('Título muy largo'),
  body('descripcion').notEmpty().withMessage('Descripción es requerida'),
  body('tipo').isIn(['servicio', 'producto']).withMessage('Tipo debe ser "servicio" o "producto"'),
  body('precio').optional().isFloat({ min: 0 }).withMessage('Precio inválido'),
  body('precio_texto').optional().isLength({ max: 100 }).withMessage('Precio texto muy largo'),
  handleValidationErrors
];

// Validaciones para reseña
export const validateReview = [
  body('calificacion').isInt({ min: 1, max: 5 }).withMessage('Calificación debe ser entre 1 y 5'),
  body('comentario').optional().isLength({ max: 500 }).withMessage('Comentario muy largo'),
  handleValidationErrors
];
