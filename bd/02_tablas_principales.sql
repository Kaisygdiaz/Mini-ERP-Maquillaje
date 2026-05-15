USE mini_erp_maquillaje;

CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    rol ENUM('Administrador', 'Vendedor') DEFAULT 'Vendedor',
    estado ENUM('Activo', 'Inactivo') DEFAULT 'Activo',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clientes (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    correo VARCHAR(100),
    direccion VARCHAR(255),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categorias (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    estado ENUM('Activo', 'Inactivo') DEFAULT 'Activo'
);

CREATE TABLE IF NOT EXISTS productos (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    id_categoria INT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    marca VARCHAR(100),
    descripcion TEXT,
    precio_compra DECIMAL(10,2) NOT NULL,
    precio_venta DECIMAL(10,2) NOT NULL,
    stock_actual INT NOT NULL DEFAULT 0,
    stock_minimo INT NOT NULL DEFAULT 5,
    fecha_ingreso DATE,
    estado ENUM('Activo', 'Inactivo', 'Agotado') DEFAULT 'Activo',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_productos_categorias
        FOREIGN KEY (id_categoria)
        REFERENCES categorias(id_categoria)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);