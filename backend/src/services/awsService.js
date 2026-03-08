import {
  RekognitionClient,
  CompareFacesCommand,
  DetectFacesCommand
} from '@aws-sdk/client-rekognition';

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand
} from '@aws-sdk/client-s3';

import { v4 as uuidv4 } from 'uuid';

const isLocal = process.env.AWS_LOCAL === 'true';

// ─────────────────────────────────────────────
// S3 → LocalStack en desarrollo, AWS real en producción
// ─────────────────────────────────────────────
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },
  ...(isLocal && {
    endpoint: process.env.AWS_ENDPOINT,
    forcePathStyle: true   // Requerido para LocalStack
  })
});

// ─────────────────────────────────────────────
// Rekognition → Solo AWS real (producción)
// En desarrollo se usa mock (ver funciones abajo)
// ─────────────────────────────────────────────
const rekognition = isLocal ? null : new RekognitionClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const BUCKET = process.env.AWS_S3_BUCKET;

// ─────────────────────────────────────────────
// Subir imagen a S3 (LocalStack o AWS real)
// ─────────────────────────────────────────────
export const uploadImageToS3 = async (imageBuffer, folder = 'faces') => {
  const key = `${folder}/${uuidv4()}.jpg`;

  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: imageBuffer,
    ContentType: 'image/jpeg'
  }));

  console.log(`📦 Imagen subida a S3: ${key}`);
  return key;
};

// ─────────────────────────────────────────────
// Eliminar imagen de S3
// ─────────────────────────────────────────────
export const deleteImageFromS3 = async (key) => {
  if (!key) return;

  await s3.send(new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key
  }));

  console.log(`🗑️  Imagen eliminada de S3: ${key}`);
};

// ─────────────────────────────────────────────
// Detectar rostro en imagen
// MOCK en desarrollo | Rekognition real en producción
// ─────────────────────────────────────────────
export const detectFace = async (imageBuffer) => {
  if (isLocal) {
    console.log('🔧 [MOCK] detectFace — simulando detección exitosa');
    return { hasFace: true, faceCount: 1, confidence: 99.0 };
  }

  const command = new DetectFacesCommand({
    Image: { Bytes: imageBuffer },
    Attributes: ['DEFAULT']
  });

  const response = await rekognition.send(command);
  const faces = response.FaceDetails || [];

  return {
    hasFace: faces.length > 0,
    faceCount: faces.length,
    confidence: faces[0]?.Confidence || 0
  };
};

// ─────────────────────────────────────────────
// Comparar dos rostros usando sus keys en S3
// MOCK en desarrollo | Rekognition real en producción
// ─────────────────────────────────────────────
export const compareFaces = async (sourceKey, targetKey) => {
  if (isLocal) {
    console.log('🔧 [MOCK] compareFaces — simulando similitud 95%');
    return { match: true, similarity: 95.0 };
  }

  const command = new CompareFacesCommand({
    SourceImage: { S3Object: { Bucket: BUCKET, Name: sourceKey } },
    TargetImage: { S3Object: { Bucket: BUCKET, Name: targetKey } },
    SimilarityThreshold: 80
  });

  let response;
  try {
    response = await rekognition.send(command);
  } catch (err) {
    if (err.name === 'InvalidParameterException') {
      return { match: false, similarity: 0 };
    }
    throw err;
  }

  const matches = response.FaceMatches || [];
  if (matches.length === 0) return { match: false, similarity: 0 };

  const best = matches.reduce((a, b) => a.Similarity > b.Similarity ? a : b);
  const similarity = Math.round(best.Similarity * 100) / 100;

  return { match: similarity >= 90, similarity };
};