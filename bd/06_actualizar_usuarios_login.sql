USE mini_erp_maquillaje;

ALTER TABLE usuarios
MODIFY rol ENUM('Administrador', 'Vendedor', 'Gerencia') DEFAULT 'Vendedor';

UPDATE usuarios
SET rol = 'Administrador'
WHERE id_usuario = 1;

UPDATE usuarios
SET rol = 'Vendedor'
WHERE id_usuario = 2;

INSERT INTO usuarios (nombre, correo, contrasena, rol, estado)
VALUES
('Gerencia General', 'gerencia@beautyerp.com', '123456', 'Gerencia', 'Activo');