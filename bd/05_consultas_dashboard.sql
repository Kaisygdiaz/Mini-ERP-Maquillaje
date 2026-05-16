USE mini_erp_maquillaje;

-- 1. Total de productos registrados
SELECT 
    COUNT(*) AS total_productos
FROM productos;

-- 2. Total de clientes registrados
SELECT 
    COUNT(*) AS total_clientes
FROM clientes;

-- 3. Inventario valorizado
SELECT 
    SUM(stock_actual * precio_compra) AS valor_inventario_compra,
    SUM(stock_actual * precio_venta) AS valor_inventario_venta
FROM productos
WHERE estado = 'Activo';

-- 4. Productos con bajo stock
SELECT 
    p.id_producto,
    p.nombre,
    c.nombre AS categoria,
    p.stock_actual,
    p.stock_minimo
FROM productos p
INNER JOIN categorias c ON p.id_categoria = c.id_categoria
WHERE p.stock_actual <= p.stock_minimo
ORDER BY p.stock_actual ASC;

-- 5. Productos agotados
SELECT 
    p.id_producto,
    p.nombre,
    c.nombre AS categoria,
    p.stock_actual
FROM productos p
INNER JOIN categorias c ON p.id_categoria = c.id_categoria
WHERE p.stock_actual = 0
ORDER BY p.nombre ASC;

-- 6. Productos por categoria
SELECT 
    c.nombre AS categoria,
    COUNT(p.id_producto) AS total_productos
FROM categorias c
LEFT JOIN productos p ON c.id_categoria = p.id_categoria
GROUP BY c.id_categoria, c.nombre
ORDER BY total_productos DESC;

-- 7. Margen estimado por producto
SELECT 
    p.id_producto,
    p.nombre,
    c.nombre AS categoria,
    p.precio_compra,
    p.precio_venta,
    (p.precio_venta - p.precio_compra) AS margen_unitario,
    ROUND(((p.precio_venta - p.precio_compra) / p.precio_compra) * 100, 2) AS porcentaje_margen
FROM productos p
INNER JOIN categorias c ON p.id_categoria = c.id_categoria
WHERE p.estado = 'Activo'
ORDER BY porcentaje_margen DESC;

-- 8. Productos sugeridos para promocion
-- Criterio: productos activos con stock alto y sin ventas registradas todavia.
SELECT 
    p.id_producto,
    p.nombre,
    c.nombre AS categoria,
    p.stock_actual,
    p.stock_minimo,
    p.precio_venta
FROM productos p
INNER JOIN categorias c ON p.id_categoria = c.id_categoria
LEFT JOIN detalle_ventas dv ON p.id_producto = dv.id_producto
WHERE p.estado = 'Activo'
  AND p.stock_actual > (p.stock_minimo * 3)
  AND dv.id_producto IS NULL
ORDER BY p.stock_actual DESC;

-- 9. Productos mas vendidos
SELECT 
    p.id_producto,
    p.nombre,
    c.nombre AS categoria,
    SUM(dv.cantidad) AS unidades_vendidas,
    SUM(dv.subtotal) AS total_generado
FROM detalle_ventas dv
INNER JOIN productos p ON dv.id_producto = p.id_producto
INNER JOIN categorias c ON p.id_categoria = c.id_categoria
INNER JOIN ventas v ON dv.id_venta = v.id_venta
WHERE v.estado = 'Completada'
GROUP BY p.id_producto, p.nombre, c.nombre
ORDER BY unidades_vendidas DESC;

-- 10. Ventas por categoria
SELECT 
    c.nombre AS categoria,
    SUM(dv.cantidad) AS unidades_vendidas,
    SUM(dv.subtotal) AS total_vendido
FROM detalle_ventas dv
INNER JOIN productos p ON dv.id_producto = p.id_producto
INNER JOIN categorias c ON p.id_categoria = c.id_categoria
INNER JOIN ventas v ON dv.id_venta = v.id_venta
WHERE v.estado = 'Completada'
GROUP BY c.id_categoria, c.nombre
ORDER BY total_vendido DESC;

-- 11. Ventas por mes
SELECT 
    YEAR(v.fecha_venta) AS anio,
    MONTH(v.fecha_venta) AS mes,
    COUNT(v.id_venta) AS total_ventas,
    SUM(v.total) AS ingresos
FROM ventas v
WHERE v.estado = 'Completada'
GROUP BY YEAR(v.fecha_venta), MONTH(v.fecha_venta)
ORDER BY anio DESC, mes DESC;

-- 12. Clientes con mayor compra
SELECT 
    cl.id_cliente,
    cl.nombre AS cliente,
    COUNT(v.id_venta) AS cantidad_compras,
    SUM(v.total) AS total_comprado
FROM ventas v
INNER JOIN clientes cl ON v.id_cliente = cl.id_cliente
WHERE v.estado = 'Completada'
GROUP BY cl.id_cliente, cl.nombre
ORDER BY total_comprado DESC;