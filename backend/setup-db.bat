@echo off
echo ========================================
echo CONFIGURAR BASE DE DATOS WARMI NET
echo ========================================
echo.

cd /d C:\xampp\mysql\bin

echo [1/2] Creando base de datos warmi_net...
mysql.exe -u root -e "CREATE DATABASE IF NOT EXISTS warmi_net CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
if %errorlevel% equ 0 (
    echo [OK] Base de datos creada
) else (
    echo [ERROR] No se pudo crear la base de datos
    pause
    exit /b 1
)

echo.
echo [2/2] Importando estructura SQL...
set "SCRIPT_PATH=%~dp0sql\init.sql"
mysql.exe -u root warmi_net < "%SCRIPT_PATH%"
if %errorlevel% equ 0 (
    echo [OK] Estructura importada exitosamente
    echo.
    echo ========================================
    echo BASE DE DATOS LISTA!
    echo ========================================
    echo.
    echo Ahora puedes ejecutar: npm run dev
) else (
    echo [ERROR] No se pudo importar el SQL
    echo Verifica que existe el archivo: sql/init.sql
)

echo.
pause
