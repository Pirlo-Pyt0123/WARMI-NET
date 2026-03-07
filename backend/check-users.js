import User from './src/models/User.js';
import pool from './src/config/database.js';

async function checkUsers() {
  try {
    const [rows] = await pool.query('SELECT id, ci, nombres, apellidos, usuario FROM users LIMIT 5');
    console.log('\n📋 Usuarios en la base de datos:');
    console.log(rows);
    
    if (rows.length === 0) {
      console.log('\n⚠️  No hay usuarios registrados en la base de datos');
      console.log('💡  Puedes registrar un usuario desde el frontend');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkUsers();
