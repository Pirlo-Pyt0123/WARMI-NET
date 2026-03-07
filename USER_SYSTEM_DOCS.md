# Sistema de Usuarios - Warmi Net

## 📋 Campos del Usuario

Warmi Net distingue entre tres conceptos importantes para identificar a los usuarios:

### 1. **CI (Carnet de Identidad)** 
- **Campo:** `ci`
- **Fuente:** Extraído del documento mediante OCR
- **Uso:** Identificación oficial del ciudadano
- **Ejemplo:** `12345678`
- **Validación:** Único en la base de datos

### 2. **Usuario (Username)**
- **Campo:** `usuario`
- **Fuente:** Generado automáticamente desde el nombre
- **Uso:** Identificador único para el perfil (@usuario)
- **Formato:** `[primera_letra_nombre][apellido][últimos_4_dígitos_ci]`
- **Ejemplos:** 
  - Juan Pérez (CI: 12345678) → `jperez5678`
  - María García López (CI: 87654321) → `mgarcia4321`
  - Ana Mamani (CI: 11223344) → `amamani3344`

### 3. **Nombre Completo**
- **Campo:** `nombre_completo` (generado en BD) o `nombres` + `apellidos`
- **Fuente:** Ingresado por el usuario en el formulario de registro
- **Uso:** Identificación visual en el perfil
- **Ejemplo:** `Juan Pérez`

---

## 🔄 Flujo de Registro

```
1. Escanear Documento (OCR)
   ↓
   Extrae: CI → 12345678

2. Completar Formulario
   ↓
   Usuario ingresa:
   - Nombres: Juan
   - Apellidos: Pérez
   - Edad: 25
   - PIN: 1234

3. Generación Automática de Username
   ↓
   Primera letra de "Juan" (j)
   + Primer apellido "Pérez" (perez)
   + Últimos 4 dígitos del CI (5678)
   = jperez5678

4. Guardar en Base de Datos
   ↓
   - ci: "12345678"
   - usuario: "jperez5678"
   - nombres: "Juan"
   - apellidos: "Pérez"
   - nombre_completo: "Juan Pérez" (generado)
```

---

## 🎨 Visualización en la UI

### En el Perfil (Dashboard)

```
┌─────────────────────────────────┐
│  [JP]  Juan Pérez              │  ← Nombre completo (prominente)
│        @jperez5678             │  ← Username (secundario)
│                                 │
│  CI: 12345678                  │  ← CI (información adicional)
│  Edad: 25 años                 │
└─────────────────────────────────┘
```

### En el Formulario de Registro

```
┌─────────────────────────────────┐
│ Número de Documento             │
│ [12345678        ] ✓            │
│ ✓ Extraído automáticamente      │
│                                 │
│ Usuario                         │
│ [jperez5678      ] ✓            │
│ ✓ Generado automáticamente:     │
│   @jperez5678                   │
│                                 │
│ Nombres *                       │
│ [Juan            ]              │
│                                 │
│ Apellidos *                     │
│ [Pérez           ]              │
└─────────────────────────────────┘
```

El username se actualiza en tiempo real mientras el usuario escribe su nombre y apellidos.

---

## 🔧 Implementación Técnica

### Frontend - RegisterForm.jsx

```javascript
const generarUsername = () => {
  const primeraLetraNombre = formData.nombres.trim().charAt(0).toLowerCase()
  const apellido = formData.apellidos.trim().split(' ')[0].toLowerCase()
  const ultimosDigitosCI = documentNumber.slice(-4)
  return `${primeraLetraNombre}${apellido}${ultimosDigitosCI}`
}
```

### Backend - User Model

```javascript
static async create(userData) {
  const { ci, nombres, apellidos, edad, usuario, pin, ... } = userData;
  
  // usuario ya viene generado desde el frontend
  // Ejemplo: usuario = "jperez5678"
  
  await pool.execute(
    `INSERT INTO users (ci, nombres, apellidos, edad, usuario, pin, ...) 
     VALUES (?, ?, ?, ?, ?, ?, ...)`,
    [ci, nombres, apellidos, edad, usuario, pin, ...]
  );
}
```

### Base de Datos - Schema

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ci VARCHAR(20) UNIQUE NOT NULL,              -- CI del documento
    nombres VARCHAR(100) NOT NULL,                -- "Juan"
    apellidos VARCHAR(100) NOT NULL,              -- "Pérez"
    nombre_completo VARCHAR(201) GENERATED ALWAYS -- "Juan Pérez" (auto)
        AS (CONCAT(nombres, ' ', apellidos)) STORED,
    usuario VARCHAR(50) UNIQUE NOT NULL,          -- "jperez5678"
    ...
);
```

---

## ✅ Ventajas de Este Sistema

1. **Username Único:** Combinar nombre + CI garantiza unicidad
2. **Fácil de Recordar:** Basado en el nombre real del usuario
3. **Identificación Clara:** El nombre completo se muestra prominentemente
4. **CI Preservado:** El número de documento original se mantiene intacto
5. **Preview en Tiempo Real:** El usuario ve su username mientras lo escribe

---

## 🔍 Ejemplos de Usernames Generados

| Nombres | Apellidos | CI | Username | 
|---------|-----------|-----|----------|
| Juan | Pérez | 12345678 | `jperez5678` |
| María | García López | 87654321 | `mgarcia4321` |
| Ana | Mamani | 11223344 | `amamani3344` |
| Carlos | Quispe Flores | 99887766 | `cquispe7766` |
| Rosa | Silva | 10203040 | `rsilva3040` |

---

## 🚨 Casos Especiales

### Nombres Compuestos
**Usuario:** Juan Carlos Pérez
- Se toma solo la primera letra del primer nombre: `j`
- Username: `jperez5678`

### Apellidos Compuestos
**Usuario:** María García López
- Se toma solo el primer apellido: `garcia`
- Username: `mgarcia4321`

### Caracteres Especiales
Los espacios y caracteres especiales se eliminan automáticamente:
- `García` → `garcia`
- `Pérez López` → `perez`

---

## 🔐 Login

Para iniciar sesión, el usuario puede usar:
- **CI + PIN:** `12345678` + `1234`

El sistema internamente:
1. Busca el usuario por CI
2. Valida el PIN
3. Devuelve los datos del usuario incluyendo el `usuario` generado

---

## 📝 Notas Importantes

- El **CI** es inmutable (no se puede cambiar)
- El **usuario** se genera una sola vez durante el registro
- El **nombre completo** se puede actualizar (futuro)
- El username sirve para menciones y perfil social (@usuario)
