@echo off
echo ========================================
echo VERIFICACION DE CONEXION MYSQL - XAMPP
echo ========================================
echo.

echo [1/3] Verificando si MySQL esta corriendo...
netstat -ano | findstr :3306 >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] MySQL esta corriendo en puerto 3306
) else (
    echo [ERROR] MySQL NO esta corriendo
    echo Por favor, inicia MySQL en XAMPP Control Panel
    pause
    exit /b 1
)

echo.
echo [2/3] Intentando conectar a MySQL...
cd /d C:\xampp\mysql\bin
mysql.exe -u root -e "SELECT 'Conexion exitosa' as status;" 2>nul
if %errorlevel% equ 0 (
    echo [OK] Conexion a MySQL exitosa
) else (
    echo [ERROR] No se pudo conectar a MySQL
    echo Verifica que XAMPP este instalado en C:\xampp
    pause
    exit /b 1
)

echo.
echo [3/3] Verificando si existe la base de datos warmi_net...
mysql.exe -u root -e "USE warmi_net; SELECT 'DB existe' as status;" 2>nul
if %errorlevel% equ 0 (
    echo [OK] Base de datos warmi_net existe
    echo.
    echo ========================================
    echo TODO LISTO! Puedes iniciar el backend
    echo ========================================
) else (
    echo [INFO] Base de datos warmi_net NO existe
    echo.
    echo Opciones:
    echo 1. Crear manualmente en phpMyAdmin
    echo 2. O ejecutar este comando:
    echo.
    echo mysql -u root -e "CREATE DATABASE warmi_net;"
    echo mysql -u root warmi_net ^< sql/init.sql
)

echo.
pause
