import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { puedeGestionarUsuarios } from '../utils/permisos';

/*
  Página para administrar usuarios del sistema.
  Permite al administrador crear, editar, activar e inactivar usuarios.
*/
const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [mensaje, setMensaje] = useState('');

  const usuarioActual = JSON.parse(localStorage.getItem('usuario'));
  const puedeGestionar = puedeGestionarUsuarios(usuarioActual);

  const [formulario, setFormulario] = useState({
    nombre: '',
    correo: '',
    contrasena: '',
    rol: 'Vendedor',
    estado: 'Activo'
  });

  const obtenerUsuarios = async () => {
    try {
      const respuesta = await api.get('/usuarios');
      setUsuarios(respuesta.data);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      setMensaje('Error al cargar los usuarios');
    }
  };

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  const manejarCambio = (e) => {
    const { name, value } = e.target;

    setFormulario({
      ...formulario,
      [name]: value
    });
  };

  const limpiarFormulario = () => {
    setFormulario({
      nombre: '',
      correo: '',
      contrasena: '',
      rol: 'Vendedor',
      estado: 'Activo'
    });

    setUsuarioEditando(null);
  };

  const guardarUsuario = async (e) => {
    e.preventDefault();

    if (!puedeGestionar) {
      setMensaje('No tienes permisos para gestionar usuarios');
      return;
    }

    if (!formulario.nombre.trim() || !formulario.correo.trim()) {
      setMensaje('El nombre y el correo son obligatorios');
      return;
    }

    if (!usuarioEditando && !formulario.contrasena.trim()) {
      setMensaje('La contraseña es obligatoria para crear un usuario');
      return;
    }

    try {
      if (usuarioEditando) {
        await api.put(`/usuarios/${usuarioEditando}`, formulario);
        setMensaje('Usuario actualizado correctamente');
      } else {
        await api.post('/usuarios', formulario);
        setMensaje('Usuario creado correctamente');
      }

      limpiarFormulario();
      obtenerUsuarios();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      setMensaje(error.response?.data?.mensaje || 'Error al guardar el usuario');
    }
  };

  const cargarUsuarioParaEditar = (usuario) => {
    if (!puedeGestionar) {
      setMensaje('No tienes permisos para editar usuarios');
      return;
    }

    setUsuarioEditando(usuario.id_usuario);

    setFormulario({
      nombre: usuario.nombre || '',
      correo: usuario.correo || '',
      contrasena: '',
      rol: usuario.rol || 'Vendedor',
      estado: usuario.estado || 'Activo'
    });
  };

  const inactivarUsuario = async (usuario) => {
    if (!puedeGestionar) {
      setMensaje('No tienes permisos para inactivar usuarios');
      return;
    }

    if (usuario.id_usuario === usuarioActual.id_usuario) {
      setMensaje('No puedes inactivar tu propio usuario mientras estás en sesión');
      return;
    }

    const confirmar = window.confirm(
      `¿Seguro que deseas inactivar al usuario "${usuario.nombre}"?`
    );

    if (!confirmar) return;

    try {
      await api.put(`/usuarios/${usuario.id_usuario}/inactivar`);
      setMensaje('Usuario inactivado correctamente');
      obtenerUsuarios();
    } catch (error) {
      console.error('Error al inactivar usuario:', error);
      setMensaje('Error al inactivar el usuario');
    }
  };

  const activarUsuario = async (usuario) => {
    if (!puedeGestionar) {
      setMensaje('No tienes permisos para activar usuarios');
      return;
    }

    const confirmar = window.confirm(
      `¿Seguro que deseas activar al usuario "${usuario.nombre}"?`
    );

    if (!confirmar) return;

    try {
      await api.put(`/usuarios/${usuario.id_usuario}/activar`);
      setMensaje('Usuario activado correctamente');
      obtenerUsuarios();
    } catch (error) {
      console.error('Error al activar usuario:', error);
      setMensaje('Error al activar el usuario');
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="page-title">Usuarios</h2>
        <p className="page-subtitle">
          Administración de usuarios, roles y estado de acceso al sistema.
        </p>
      </div>

      {mensaje && (
        <div className="alert alert-info py-2">
          {mensaje}
        </div>
      )}

      {!puedeGestionar && (
        <div className="alert alert-light border py-2">
          Estás consultando este módulo en modo lectura.
        </div>
      )}

      <div className="row g-4">
        {puedeGestionar && (
          <div className="col-lg-4">
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <h5 className="fw-bold mb-3">
                  {usuarioEditando ? 'Editar usuario' : 'Nuevo usuario'}
                </h5>

                <form onSubmit={guardarUsuario}>
                  <div className="mb-3">
                    <label className="form-label">Nombre</label>
                    <input
                      type="text"
                      name="nombre"
                      className="form-control"
                      value={formulario.nombre}
                      onChange={manejarCambio}
                      placeholder="Nombre del usuario"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Correo</label>
                    <input
                      type="email"
                      name="correo"
                      className="form-control"
                      value={formulario.correo}
                      onChange={manejarCambio}
                      placeholder="usuario@beautyerp.com"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Contraseña</label>
                    <input
                      type="password"
                      name="contrasena"
                      className="form-control"
                      value={formulario.contrasena}
                      onChange={manejarCambio}
                      placeholder={
                        usuarioEditando
                          ? 'Dejar vacío para conservar la actual'
                          : 'Contraseña del usuario'
                      }
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Rol</label>
                    <select
                      name="rol"
                      className="form-select"
                      value={formulario.rol}
                      onChange={manejarCambio}
                    >
                      <option value="Administrador">Administrador</option>
                      <option value="Vendedor">Vendedor</option>
                      <option value="Gerencia">Gerencia</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Estado</label>
                    <select
                      name="estado"
                      className="form-select"
                      value={formulario.estado}
                      onChange={manejarCambio}
                    >
                      <option value="Activo">Activo</option>
                      <option value="Inactivo">Inactivo</option>
                    </select>
                  </div>

                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary">
                      {usuarioEditando ? 'Actualizar' : 'Guardar'}
                    </button>

                    {usuarioEditando && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={limpiarFormulario}
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <div className={puedeGestionar ? 'col-lg-8' : 'col-12'}>
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5 className="fw-bold mb-3">Listado de usuarios</h5>

              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Usuario</th>
                      <th>Correo</th>
                      <th>Rol</th>
                      <th>Estado</th>
                      {puedeGestionar && (
                        <th className="text-end acciones-tabla">Acciones</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map((usuario) => (
                      <tr key={usuario.id_usuario}>
                        <td>{usuario.id_usuario}</td>
                        <td className="fw-semibold">{usuario.nombre}</td>
                        <td>{usuario.correo}</td>
                        <td>
                          <span className="badge bg-dark">
                            {usuario.rol}
                          </span>
                        </td>
                        <td>
                          <span
                            className={
                              usuario.estado === 'Activo'
                                ? 'badge bg-success'
                                : 'badge bg-secondary'
                            }
                          >
                            {usuario.estado}
                          </span>
                        </td>

                        {puedeGestionar && (
                          <td className="text-end acciones-tabla">
                            <button
                              className="btn btn-sm btn-warning me-2"
                              onClick={() => cargarUsuarioParaEditar(usuario)}
                            >
                              Editar
                            </button>

                            {usuario.estado === 'Activo' && (
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => inactivarUsuario(usuario)}
                                disabled={usuario.id_usuario === usuarioActual.id_usuario}
                              >
                                Inactivar
                              </button>
                            )}

                            {usuario.estado === 'Inactivo' && (
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => activarUsuario(usuario)}
                              >
                                Activar
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}

                    {usuarios.length === 0 && (
                      <tr>
                        <td
                          colSpan={puedeGestionar ? 6 : 5}
                          className="text-muted"
                        >
                          No hay usuarios registrados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Usuarios;