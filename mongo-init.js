db.auth('admin', 'admin123');

db = db.getSiblingDB('mensagens_futuras');

db.createUser({
  user: 'admin',
  pwd: 'admin123',
  roles: [
    {
      role: 'readWrite',
      db: 'mensagens_futuras'
    }
  ]
}); 