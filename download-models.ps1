# Script para descargar modelos de face-api.js
$baseUrl = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights"
$modelsDir = "public/models"

Write-Host "Descargando modelos de face-api.js..." -ForegroundColor Cyan

# Tiny Face Detector
Write-Host "→ Descargando Tiny Face Detector..." -ForegroundColor Yellow
Invoke-WebRequest -Uri "$baseUrl/tiny_face_detector_model-weights_manifest.json" -OutFile "$modelsDir/tiny_face_detector_model-weights_manifest.json"
Invoke-WebRequest -Uri "$baseUrl/tiny_face_detector_model-shard1" -OutFile "$modelsDir/tiny_face_detector_model-shard1"

# Face Landmark 68
Write-Host "→ Descargando Face Landmark 68..." -ForegroundColor Yellow
Invoke-WebRequest -Uri "$baseUrl/face_landmark_68_model-weights_manifest.json" -OutFile "$modelsDir/face_landmark_68_model-weights_manifest.json"
Invoke-WebRequest -Uri "$baseUrl/face_landmark_68_model-shard1" -OutFile "$modelsDir/face_landmark_68_model-shard1"

# Face Recognition
Write-Host "→ Descargando Face Recognition..." -ForegroundColor Yellow
Invoke-WebRequest -Uri "$baseUrl/face_recognition_model-weights_manifest.json" -OutFile "$modelsDir/face_recognition_model-weights_manifest.json"
Invoke-WebRequest -Uri "$baseUrl/face_recognition_model-shard1" -OutFile "$modelsDir/face_recognition_model-shard1"
Invoke-WebRequest -Uri "$baseUrl/face_recognition_model-shard2" -OutFile "$modelsDir/face_recognition_model-shard2"

# Face Expression
Write-Host "→ Descargando Face Expression..." -ForegroundColor Yellow
Invoke-WebRequest -Uri "$baseUrl/face_expression_model-weights_manifest.json" -OutFile "$modelsDir/face_expression_model-weights_manifest.json"
Invoke-WebRequest -Uri "$baseUrl/face_expression_model-shard1" -OutFile "$modelsDir/face_expression_model-shard1"

Write-Host "OK Modelos descargados exitosamente!" -ForegroundColor Green
