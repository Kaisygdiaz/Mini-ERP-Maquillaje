USE mini_erp_maquillaje;

ALTER TABLE clientes
ADD COLUMN estado ENUM('Activo', 'Inactivo') DEFAULT 'Activo'
AFTER direccion;

UPDATE clientes
SET estado = 'Activo'
WHERE estado IS NULL;