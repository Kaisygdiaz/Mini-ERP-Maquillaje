USE mini_erp_maquillaje;

INSERT INTO usuarios (nombre, correo, contrasena, rol, estado)
VALUES
('Administrador Principal', 'admin@beautyerp.com', '123456', 'Administrador', 'Activo'),
('Vendedora General', 'ventas@beautyerp.com', '123456', 'Vendedor', 'Activo');

INSERT INTO clientes (nombre, telefono, correo, direccion)
VALUES
('María López', '5555-1111', 'maria.lopez@email.com', 'Ciudad de Guatemala'),
('Andrea García', '5555-2222', 'andrea.garcia@email.com', 'Mixco'),
('Sofía Martínez', '5555-3333', 'sofia.martinez@email.com', 'Villa Nueva'),
('Camila Pérez', '5555-4444', 'camila.perez@email.com', 'Antigua Guatemala');

INSERT INTO categorias (nombre, descripcion, estado)
VALUES
('Maquillaje', 'Productos cosméticos como bases, labiales, rubores y sombras.', 'Activo'),
('Skincare', 'Productos para el cuidado facial como sérums, cremas y limpiadores.', 'Activo'),
('Cuidado Personal', 'Productos de uso diario para el cuidado corporal.', 'Activo'),
('Accesorios', 'Brochas, esponjas, organizadores y herramientas de belleza.', 'Activo');

INSERT INTO productos (
    id_categoria,
    nombre,
    marca,
    descripcion,
    precio_compra,
    precio_venta,
    stock_actual,
    stock_minimo,
    fecha_ingreso,
    estado
)
VALUES
(1, 'Base líquida tono natural', 'Maybelline', 'Base de maquillaje de cobertura media.', 55.00, 95.00, 25, 5, '2026-05-01', 'Activo'),
(1, 'Labial matte rojo', 'L’Oréal', 'Labial de larga duración acabado matte.', 35.00, 70.00, 40, 8, '2026-05-01', 'Activo'),
(1, 'Paleta de sombras nude', 'Beauty Pro', 'Paleta de sombras en tonos neutros.', 80.00, 150.00, 12, 4, '2026-05-02', 'Activo'),
(2, 'Sérum vitamina C', 'The Ordinary', 'Sérum facial antioxidante.', 65.00, 130.00, 18, 5, '2026-05-02', 'Activo'),
(2, 'Limpiador facial hidratante', 'CeraVe', 'Limpiador facial para piel normal a seca.', 60.00, 120.00, 30, 6, '2026-05-03', 'Activo'),
(2, 'Protector solar facial SPF 50', 'La Roche-Posay', 'Protector solar ligero para rostro.', 95.00, 180.00, 8, 5, '2026-05-03', 'Activo'),
(3, 'Crema corporal hidratante', 'Nivea', 'Crema corporal para uso diario.', 30.00, 65.00, 35, 7, '2026-05-04', 'Activo'),
(3, 'Jabón exfoliante corporal', 'Dove', 'Jabón exfoliante suave para la piel.', 18.00, 40.00, 50, 10, '2026-05-04', 'Activo'),
(4, 'Set de brochas profesionales', 'Real Techniques', 'Set de brochas para maquillaje.', 90.00, 170.00, 10, 3, '2026-05-05', 'Activo'),
(4, 'Esponja difuminadora', 'Beauty Blender', 'Esponja para aplicar base y corrector.', 25.00, 55.00, 45, 8, '2026-05-05', 'Activo');