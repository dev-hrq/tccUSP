// Create admin user in admin database
db = db.getSiblingDB('admin');
db.createUser({
  user: 'admin',
  pwd: 'admin123',
  roles: [
    { role: 'root', db: 'admin' }
  ]
});

// Create application database and user
db = db.getSiblingDB('mensagens_futuras');
db.createUser({
  user: 'appuser',
  pwd: 'app123',
  roles: [
    { role: 'readWrite', db: 'mensagens_futuras' }
  ]
}); 