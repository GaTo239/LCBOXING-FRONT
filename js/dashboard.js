document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    initDashboard();
    startClock();
});

// Estado de paginación
const paginationState = {
    atletas: { page: 1, pageSize: 10, total: 0 },
    membresias: { page: 1, pageSize: 10, total: 0 },
    pagos: { page: 1, pageSize: 10, total: 0 },
    asistencias: { page: 1, pageSize: 10, total: 0 },
    usuarios: { page: 1, pageSize: 10, total: 0 }
};

function slicePage(items, section) {
    const state = paginationState[section];
    state.total = items.length;
    const start = (state.page - 1) * state.pageSize;
    const end = start + state.pageSize;
    return items.slice(start, end);
}

function renderPagination(section) {
    const state = paginationState[section];
    const totalPages = Math.max(1, Math.ceil(state.total / state.pageSize));
    const prevBtn = document.getElementById(section + 'Prev');
    const nextBtn = document.getElementById(section + 'Next');
    const infoEl = document.getElementById(section + 'PageInfo');
    if (prevBtn) prevBtn.disabled = state.page <= 1;
    if (nextBtn) nextBtn.disabled = state.page >= totalPages;
    if (infoEl) infoEl.textContent = `Página ${state.page} de ${totalPages}`;
}

function attachPaginationHandlers() {
    ['atletas','membresias','pagos','asistencias','usuarios'].forEach(section => {
        const prevBtn = document.getElementById(section + 'Prev');
        const nextBtn = document.getElementById(section + 'Next');
        if (prevBtn) prevBtn.addEventListener('click', () => {
            if (paginationState[section].page > 1) {
                paginationState[section].page--;
                reloadSection(section);
            }
        });
        if (nextBtn) nextBtn.addEventListener('click', () => {
            const state = paginationState[section];
            const totalPages = Math.max(1, Math.ceil(state.total / state.pageSize));
            if (state.page < totalPages) {
                state.page++;
                reloadSection(section);
            }
        });
    });
}

function reloadSection(section) {
    switch(section) {
        case 'atletas':
            loadAtletas(); break;
        case 'membresias':
            loadMembresias(); break;
        case 'pagos':
            loadPagos(); break;
        case 'asistencias':
            loadAsistencias(); break;
        case 'usuarios':
            loadUsuarios(); break;
    }
}

// Verificar autenticación
function checkAuth() {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (!token || !userData) {
        window.location.href = 'login.html';
        return;
    }
    
    try {
        const user = JSON.parse(userData);
        console.log('Usuario cargado:', user);
        console.log('Propiedades del usuario:', Object.keys(user));
        console.log('idRol:', user.idRol, 'Tipo:', typeof user.idRol);
        console.log('rol (texto):', user.rol);
        
        // Construir nombre completo
        const nombreCompleto = `${user.nombre || ''} ${user.apellidoPaterno || ''} ${user.apellidoMaterno || ''}`.trim() || user.nombreCompleto;
        
        // Determinar el rol - primero intenta con idRol, luego con rol (texto)
        let rolTexto = 'Usuario';
        if (user.idRol === 1 || user.idRol === '1') {
            rolTexto = 'Gerente';
        } else if (user.idRol === 2 || user.idRol === '2') {
            rolTexto = 'Staff';
        } else if (user.rol) {
            // Si no hay idRol pero hay rol como texto
            const rolUpper = user.rol.toUpperCase();
            if (rolUpper === 'GERENTE') {
                rolTexto = 'Gerente';
            } else if (rolUpper === 'STAFF') {
                rolTexto = 'Staff';
            } else {
                rolTexto = user.rol; // Usar el rol tal cual viene
            }
        }
        
        console.log('Rol determinado:', rolTexto, 'desde idRol:', user.idRol, 'o rol:', user.rol);
        
        // Actualizar elementos del DOM
        const userNameElement = document.getElementById('userName');
        const userRoleElement = document.getElementById('userRole');
        
        if (userNameElement) {
            userNameElement.textContent = nombreCompleto;
            console.log('Nombre actualizado en DOM:', nombreCompleto);
        }
        
        if (userRoleElement) {
            userRoleElement.textContent = rolTexto;
            console.log('Rol actualizado en DOM:', rolTexto);
        }
        
    } catch (e) {
        console.error('Error al parsear datos de usuario:', e);
        window.location.href = 'login.html';
    }
}

// Inicializar dashboard
function initDashboard() {
    setupNavigation();
    setupLogout();
    loadDashboardStats();
    showSection('dashboard');
    // Enganchar paginación
    attachPaginationHandlers();
}

// Navegación
function setupNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            showSection(section);
        });
    });
    
    const menuToggle = document.getElementById('menuToggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            document.querySelector('.sidebar').classList.toggle('active');
        });
    }
}

// Mostrar sección
function showSection(sectionId) {
    // Actualizar título
    const titles = {
        'dashboard': 'Dashboard',
        'atletas': 'Atletas',
        'membresias': 'Membresías',
        'pagos': 'Pagos',
        'asistencias': 'Asistencias',
        'usuarios': 'Usuarios',
        'reportes': 'Reportes'
    };
    
    document.getElementById('headerTitle').textContent = titles[sectionId] || 'Dashboard';
    
    // Ocultar todas las secciones
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Mostrar sección seleccionada
    const targetSection = document.getElementById(`section-${sectionId}`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Actualizar navegación activa
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const activeNav = document.querySelector(`[data-section="${sectionId}"]`);
    if (activeNav) {
        activeNav.classList.add('active');
    }
    
    // Cargar datos de la sección
    switch(sectionId) {
        case 'dashboard':
            loadDashboardStats();
            loadAlerts();
            loadAtletasEnBox();
            loadVencimientos();
            break;
        case 'atletas':
            paginationState.atletas.page = 1; // reset page on enter
            loadAtletas();
            break;
        case 'membresias':
            paginationState.membresias.page = 1;
            loadMembresias();
            break;
        case 'pagos':
            paginationState.pagos.page = 1;
            loadPagos();
            break;
        case 'asistencias':
            // Inicializar campo de fecha con fecha actual
            const filterFechaAsistencia = document.getElementById('filterFechaAsistencia');
            if (filterFechaAsistencia && !filterFechaAsistencia.value) {
                filterFechaAsistencia.value = new Date().toISOString().split('T')[0];
            }
            paginationState.asistencias.page = 1;
            loadAsistencias();
            break;
        case 'usuarios':
            paginationState.usuarios.page = 1;
            loadUsuarios();
            break;
        case 'reportes':
            loadReportes();
            break;
    }
}

// Cerrar sesión
function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            window.location.href = 'login.html';
        });
    }
}

// Reloj
function startClock() {
    function updateClock() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const clockElement = document.getElementById('clock');
        if (clockElement) {
            clockElement.textContent = `${hours}:${minutes}`;
        }
    }
    
    updateClock();
    setInterval(updateClock, 60000);
}

// ESTADÍSTICAS DEL DASHBOARD
async function loadDashboardStats() {
    try {
        // Atletas activos
        const atletas = await api.getActiveAthletes();
        const statAtletasActivos = document.getElementById('statAtletasActivos');
        if (statAtletasActivos) statAtletasActivos.textContent = atletas.length;
        
        // Membresías vigentes
        const membresias = await api.getMemberships();
        const vigentes = membresias.filter(m => m.idEstadoMembresia === 1 || m.nombreEstado === 'Activa');
        const statMembresiasVigentes = document.getElementById('statMembresiasVigentes');
        if (statMembresiasVigentes) statMembresiasVigentes.textContent = vigentes.length;
        
        // Asistencias hoy
        const today = new Date().toISOString().split('T')[0];
        const asistencias = await api.getAttendanceByDate(today);
        const statAsistenciasHoy = document.getElementById('statAsistenciasHoy');
        if (statAsistenciasHoy) statAsistenciasHoy.textContent = asistencias.length;
        
        // Ingresos hoy
        const pagos = await api.getPayments();
        const pagosHoy = pagos.filter(p => p.fechaPago === today);
        const ingresos = pagosHoy.reduce((sum, p) => sum + parseFloat(p.monto), 0);
        const statIngresosHoy = document.getElementById('statIngresosHoy');
        if (statIngresosHoy) statIngresosHoy.textContent = `$${ingresos.toFixed(2)}`;
        
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
    }
}

// ALERTAS
async function loadAlerts() {
    const alertsList = document.getElementById('alertsList');
    if (!alertsList) return;
    
    alertsList.innerHTML = '<div class="loading">Cargando alertas...</div>';
    
    try {
        const alerts = [];
        
        // Membresías próximas a vencer
        const vencimientos = await api.getExpiringMemberships(7);
        vencimientos.forEach(m => {
            // Convertir fechaVencimiento usando la función formatearFecha
            let fechaVencimiento = m.fechaVencimiento || m.fecha_vencimiento;
            fechaVencimiento = formatearFecha(fechaVencimiento);
            
            alerts.push({
                type: 'warning',
                message: `Membresía de ${m.nombreAtleta || 'Atleta'} vence el ${fechaVencimiento}`,
                icon: 'fa-exclamation-triangle'
            });
        });
        
        if (alerts.length === 0) {
            alertsList.innerHTML = '<p class="text-muted">No hay alertas pendientes</p>';
        } else {
            alertsList.innerHTML = alerts.map(alert => `
                <div class="alert alert-${alert.type}">
                    <i class="fas ${alert.icon}"></i>
                    <span>${alert.message}</span>
                </div>
            `).join('');
        }
        
    } catch (error) {
        alertsList.innerHTML = '<p class="text-danger">Error al cargar alertas</p>';
        console.error(error);
    }
}

// ATLETAS EN BOX
async function loadAtletasEnBox() {
    const tbody = document.querySelector('#atletasEnBoxTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="3" class="text-center">Cargando...</td></tr>';
    
    try {
        const today = new Date().toISOString().split('T')[0];
        const asistencias = await api.getAttendanceByDate(today);
        const enBox = asistencias.filter(a => !a.horaSalida);
        
        document.getElementById('atletasEnBoxCount').textContent = enBox.length;
        
        if (enBox.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center">No hay atletas en el box</td></tr>';
        } else {
            tbody.innerHTML = enBox.map(a => {
                const horaEntrada = a.horaEntrada || a.hora_entrada;
                const nombreAtleta = a.nombreAtleta || a.nombre_atleta || 'Atleta';
                
                // Calcular tiempo transcurrido
                const ahora = new Date();
                const [horas, minutos, segundos] = horaEntrada.split(':');
                const entrada = new Date();
                entrada.setHours(parseInt(horas), parseInt(minutos), parseInt(segundos || 0), 0);
                
                const diff = Math.floor((ahora - entrada) / 60000);
                const horasTranscurridas = Math.floor(diff / 60);
                const minutosTranscurridos = diff % 60;
                
                return `
                    <tr>
                        <td>${nombreAtleta}</td>
                        <td>${horaEntrada.slice(0, 5)}</td>
                        <td>${horasTranscurridas}h ${minutosTranscurridos}m</td>
                    </tr>
                `;
            }).join('');
        }
        
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="3" class="text-center text-danger">Error al cargar datos</td></tr>';
        console.error(error);
    }
}

// VENCIMIENTOS PRÓXIMOS
async function loadVencimientos() {
    const tbody = document.querySelector('#vencimientosTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="3" class="text-center">Cargando...</td></tr>';
    
    try {
        const vencimientos = await api.getExpiringMemberships(7);
        
        document.getElementById('vencimientosCount').textContent = vencimientos.length;
        
        if (vencimientos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center">No hay vencimientos próximos</td></tr>';
        } else {
            tbody.innerHTML = vencimientos.map(m => {
                // Convertir fechaVencimiento usando formatearFecha
                let fechaVencimiento = m.fechaVencimiento || m.fecha_vencimiento;
                const fechaFormateada = formatearFecha(fechaVencimiento);
                
                // Convertir a formato ISO para cálculo de días
                let fechaISO = fechaVencimiento;
                if (Array.isArray(fechaVencimiento)) {
                    fechaISO = `${fechaVencimiento[0]}-${String(fechaVencimiento[1]).padStart(2, '0')}-${String(fechaVencimiento[2]).padStart(2, '0')}`;
                } else if (typeof fechaVencimiento === 'number') {
                    fechaISO = new Date(fechaVencimiento).toISOString().split('T')[0];
                }
                
                const hoy = new Date();
                const fin = new Date(fechaISO);
                const dias = Math.ceil((fin - hoy) / (1000 * 60 * 60 * 24));
                
                return `
                    <tr>
                        <td>${m.nombreAtleta || 'Atleta'}</td>
                        <td>${fechaFormateada}</td>
                        <td><span class="badge ${dias <= 3 ? 'danger' : 'warning'}">${dias} días</span></td>
                    </tr>
                `;
            }).join('');
        }
        
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="3" class="text-center text-danger">Error al cargar datos</td></tr>';
        console.error(error);
    }
}

// ATLETAS
async function loadAtletas() {
    const tbody = document.querySelector('#atletasTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="6" class="text-center"><div class="loading"><i class="fas fa-spinner fa-spin"></i> Cargando atletas...</div></td></tr>';
    
    try {
        let atletas = await api.getAthletes();
        
        // Aplicar filtro de búsqueda
        const searchInput = document.getElementById('searchAtleta');
        if (searchInput && searchInput.value.trim()) {
            const searchTerm = searchInput.value.toLowerCase();
            atletas = atletas.filter(a => {
                const nombre = (a.nombreCompleto || `${a.nombre} ${a.apellidoPaterno}`).toLowerCase();
                const email = (a.email || '').toLowerCase();
                const telefono = (a.telefono || '').toLowerCase();
                return nombre.includes(searchTerm) || email.includes(searchTerm) || telefono.includes(searchTerm);
            });
        }
        
        // Slicing por página
        const sliced = slicePage(atletas, 'atletas');
        renderPagination('atletas');

        if (!sliced || sliced.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay atletas registrados</td></tr>';
        } else {
            tbody.innerHTML = sliced.map(a => {
                // Mapeo basado en tu JSON #1
                const id = a.idAtleta;
                const nombre = a.nombreCompleto || `${a.nombre} ${a.apellidoPaterno}`;
                const email = a.email || 'Sin email';
                const telefono = a.telefono || 'Sin teléfono';
                const fechaNac = formatearFecha(a.fechaNacimiento);

                return `
                <tr>
                    <td>${id}</td>
                    <td>${nombre}</td>
                    <td>${email}</td>
                    <td>${telefono}</td>
                    <td>${fechaNac}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="openAtletaModal(${id})"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-danger" onclick="deleteAtleta(${id})"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `;
            }).join('');
        }
    } catch (error) {
        console.error('Error cargando atletas:', error);
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error al cargar datos</td></tr>';
    }
}

async function deleteAtleta(id) {
    openConfirmModal('¿Está seguro de eliminar este atleta? Esta acción eliminará también todas sus membresías, pagos y asistencias.', async function() {
        try {
            await api.deleteAthlete(id);
            showNotification('ATLETA ELIMINADO CORRECTAMENTE', 'success');
            loadAtletas();
            loadDashboardStats();
        } catch (error) {
            console.error('Error al eliminar atleta:', error);
            showNotification('ERROR AL ELIMINAR ATLETA: ' + error.message, 'error');
        }
    });
}

// MEMBRESÍAS
async function loadMembresias() {
    const tbody = document.querySelector('#membresiasTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="8" class="text-center"><div class="loading"><i class="fas fa-spinner fa-spin"></i> Cargando...</div></td></tr>';
    
    try {
        let membresias = await api.getMemberships();
        
        // Aplicar filtro de estado
        const filterEstado = document.getElementById('filterEstadoMembresia');
        if (filterEstado && filterEstado.value) {
            const estadoId = parseInt(filterEstado.value);
            membresias = membresias.filter(m => {
                const idEstado = m.idEstadoMembresia || m.id_estado_membresia;
                return idEstado === estadoId;
            });
        }
        
        // Aplicar filtro de búsqueda
        const searchInput = document.getElementById('searchMembresia');
        if (searchInput && searchInput.value.trim()) {
            const searchTerm = searchInput.value.toLowerCase();
            membresias = membresias.filter(m => {
                const nombreAtleta = (m.nombreAtleta || '').toLowerCase();
                const tipo = (m.nombreTipo || '').toLowerCase();
                const estado = (m.nombreEstado || '').toLowerCase();
                return nombreAtleta.includes(searchTerm) || tipo.includes(searchTerm) || estado.includes(searchTerm);
            });
        }
        
        const sliced = slicePage(membresias, 'membresias');
        renderPagination('membresias');
        if (!sliced || sliced.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center">No hay membresías registradas</td></tr>';
        } else {
            tbody.innerHTML = sliced.map(m => {
                // Mapeo basado en tu JSON #2
                const id = m.idMembresia;
                const nombreAtleta = m.nombreAtleta || 'Desconocido';
                const tipo = m.nombreTipo || 'N/A';
                
                // Fechas vienen como números timestamp
                const inicio = formatearFecha(m.fechaInicio);
                const vencimiento = formatearFecha(m.fechaVencimiento);
                
                const precio = parseFloat(m.precioPagado || 0).toFixed(2);
                
                // Estado viene como "ACTIVA", "VENCIDA"
                const estado = m.nombreEstado || 'N/A';
                
                // Lógica de colores basada en tu texto exacto
                let badgeClass = 'secondary';
                if (estado === 'ACTIVA') badgeClass = 'success';
                else if (estado === 'VENCIDA') badgeClass = 'danger';
                else if (estado === 'SUSPENDIDA') badgeClass = 'warning';

                return `
                    <tr>
                        <td>${id}</td>
                        <td>${nombreAtleta}</td>
                        <td>${tipo}</td>
                        <td>${inicio}</td>
                        <td>${vencimiento}</td>
                        <td>$${precio}</td>
                        <td><span class="badge ${badgeClass}">${estado}</span></td>
                        <td>
                            <button class="btn btn-sm btn-primary" onclick="openMembresiaModal(${id})"><i class="fas fa-edit"></i></button>
                            <button class="btn btn-sm btn-danger" onclick="deleteMembresia(${id})"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `;
            }).join('');
        }
    } catch (error) {
        console.error('Error memb:', error);
        tbody.innerHTML = '<tr><td colspan="8" class="text-center text-danger">Error al cargar datos</td></tr>';
    }
}

async function deleteMembresia(id) {
    openConfirmModal('¿Está seguro de eliminar esta membresía? Esta acción no se puede deshacer.', async function() {
        try {
            await api.deleteMembership(id);
            showNotification('MEMBRESÍA ELIMINADA CORRECTAMENTE', 'success');
            loadMembresias();
            loadDashboardStats();
        } catch (error) {
            console.error('Error al eliminar membresía:', error);
            showNotification('ERROR AL ELIMINAR MEMBRESÍA: ' + error.message, 'error');
        }
    });
}

// PAGOS
async function loadPagos() {
    const tbody = document.querySelector('#pagosTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="7" class="text-center"><div class="loading">Cargando...</div></td></tr>';
    
    try {
        let pagos = await api.getPayments();
        
        // Aplicar filtro de fecha
        const filterFecha = document.getElementById('filterFechaPago');
        if (filterFecha && filterFecha.value) {
            const fechaSeleccionada = filterFecha.value; // Formato: YYYY-MM-DD
            pagos = pagos.filter(p => {
                let fechaPago = p.fechaPago || p.fecha_pago;
                // Convertir timestamp a formato YYYY-MM-DD
                if (typeof fechaPago === 'number') {
                    const date = new Date(fechaPago);
                    fechaPago = date.toISOString().split('T')[0];
                } else if (Array.isArray(fechaPago)) {
                    // [2025, 11, 20] -> "2025-11-20"
                    fechaPago = `${fechaPago[0]}-${String(fechaPago[1]).padStart(2, '0')}-${String(fechaPago[2]).padStart(2, '0')}`;
                }
                return fechaPago === fechaSeleccionada;
            });
        }
        
        // Aplicar filtro de búsqueda
        const searchInput = document.getElementById('searchPago');
        if (searchInput && searchInput.value.trim()) {
            const searchTerm = searchInput.value.toLowerCase();
            pagos = pagos.filter(p => {
                const nombreAtleta = (p.nombreAtleta || '').toLowerCase();
                const concepto = (p.concepto || '').toLowerCase();
                const metodo = (p.nombreMetodo || '').toLowerCase();
                const monto = String(p.monto || '');
                return nombreAtleta.includes(searchTerm) || concepto.includes(searchTerm) || 
                       metodo.includes(searchTerm) || monto.includes(searchTerm);
            });
        }
        
        const sliced = slicePage(pagos, 'pagos');
        renderPagination('pagos');
        if (!sliced || sliced.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">No hay pagos registrados</td></tr>';
        } else {
            tbody.innerHTML = sliced.map(p => {
                // Mapeo basado en tu JSON #3
                const id = p.idPago;
                const nombreAtleta = p.nombreAtleta || 'Desconocido';
                const concepto = p.concepto || 'Pago';
                const monto = parseFloat(p.monto || 0).toFixed(2);
                const metodo = p.nombreMetodo || 'N/A'; // Ej: "EFECTIVO"
                const fecha = formatearFecha(p.fechaPago); // Timestamp

                return `
                    <tr>
                        <td>${id}</td>
                        <td>${nombreAtleta}</td>
                        <td>${concepto}</td>
                        <td>$${monto}</td>
                        <td>${metodo}</td>
                        <td>${fecha}</td>
                        <td>
                            <button class="btn btn-sm btn-danger" onclick="deletePago(${id})"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `;
            }).join('');
        }
    } catch (error) {
        console.error(error);
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Error al cargar datos</td></tr>';
    }
}

async function deletePago(id) {
    openConfirmModal('¿Está seguro de eliminar este pago? Esta acción no se puede deshacer.', async function() {
        try {
            await api.deletePayment(id);
            showNotification('PAGO ELIMINADO CORRECTAMENTE', 'success');
            loadPagos();
            loadDashboardStats();
        } catch (error) {
            console.error('Error al eliminar pago:', error);
            showNotification('ERROR AL ELIMINAR PAGO: ' + error.message, 'error');
        }
    });
}

// ASISTENCIAS
async function loadAsistencias() {
    const tbody = document.querySelector('#asistenciasTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="8" class="text-center"><div class="loading">Cargando...</div></td></tr>';
    
    try {
        const filterDate = document.getElementById('filterFechaAsistencia').value || new Date().toISOString().split('T')[0];
        let asistencias = await api.getAttendanceByDate(filterDate);
        
        // Aplicar filtro de búsqueda
        const searchInput = document.getElementById('searchAsistencia');
        if (searchInput && searchInput.value.trim()) {
            const searchTerm = searchInput.value.toLowerCase();
            asistencias = asistencias.filter(a => {
                const nombreAtleta = (a.nombreAtleta || '').toLowerCase();
                const horaEntrada = (a.horaEntrada || '').toLowerCase();
                const horaSalida = (a.horaSalida || '').toLowerCase();
                return nombreAtleta.includes(searchTerm) || horaEntrada.includes(searchTerm) || 
                       horaSalida.includes(searchTerm);
            });
        }
        
        const sliced = slicePage(asistencias, 'asistencias');
        renderPagination('asistencias');
        if (!sliced || sliced.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center">No hay asistencias registradas</td></tr>';
        } else {
            tbody.innerHTML = sliced.map(a => {
                // Mapeo basado en tu JSON #4
                const id = a.idAsistencia;
                const nombreAtleta = a.nombreAtleta || 'Desconocido';
                
                // El JSON trae Array [2025, 11, 21], formatearFecha lo maneja
                const fecha = formatearFecha(a.fechaAsistencia);
                
                // Cortar los segundos de la hora (22:23:00 -> 22:23)
                const entrada = a.horaEntrada ? a.horaEntrada.substring(0, 5) : '-';
                const salida = a.horaSalida ? a.horaSalida.substring(0, 5) : null;
                
                // Calcular duración o usar la que viene si está bien
                let duracion = '-';
                if (salida) {
                     // Si el backend ya te da duracionMinutos (lo vi en tu JSON: 53), úsalo
                    if (a.duracionMinutos) {
                        const h = Math.floor(a.duracionMinutos / 60);
                        const m = a.duracionMinutos % 60;
                        duracion = `${h}h ${m}m`;
                    } else {
                        duracion = calcularDuracion(entrada, salida);
                    }
                }

                const estado = salida ? 'Completado' : 'En box';
                const badgeClass = salida ? 'success' : 'warning';

                return `
                    <tr>
                        <td>${id}</td>
                        <td>${nombreAtleta}</td>
                        <td>${fecha}</td>
                        <td>${entrada}</td>
                        <td>${salida || '-'}</td>
                        <td>${duracion}</td>
                        <td><span class="badge ${badgeClass}">${estado}</span></td>
                        <td>
                            ${!salida ? `
                                <button class="btn btn-sm btn-warning" onclick="openSalidaModal(${id}, '${nombreAtleta}', '${entrada}')">
                                    <i class="fas fa-sign-out-alt"></i> Salida
                                </button>
                            ` : ''}
                            <button class="btn btn-sm btn-danger" onclick="deleteAsistencia(${id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        }
    } catch (error) {
        console.error(error);
        tbody.innerHTML = '<tr><td colspan="8" class="text-center text-danger">Error al cargar datos</td></tr>';
    }
}

// Helper para duración si el backend no envía "duracionMinutos"
function calcularDuracion(entrada, salida) {
    const d1 = new Date(`2000-01-01T${entrada}:00`);
    const d2 = new Date(`2000-01-01T${salida}:00`);
    const diff = (d2 - d1) / 60000; // minutos
    const h = Math.floor(diff / 60);
    const m = Math.round(diff % 60);
    return `${h}h ${m}m`;
}

function calcularDuracion(entrada, salida) {
    const e = new Date(`2000-01-01T${entrada}`);
    const s = new Date(`2000-01-01T${salida}`);
    const diff = Math.floor((s - e) / 60000);
    const horas = Math.floor(diff / 60);
    const minutos = diff % 60;
    return `${horas}h ${minutos}m`;
}

// Helper: Convertir fecha de array a string
function formatearFecha(fecha) {
    console.log('Formateando fecha:', fecha, 'Tipo:', typeof fecha);
    
    if (!fecha) {
        return 'N/A';
    }
    
    if (Array.isArray(fecha)) {
        // Array [2025, 11, 20] -> "20/11/2025" formato DD/MM/YYYY
        const dia = String(fecha[2]).padStart(2, '0');
        const mes = String(fecha[1]).padStart(2, '0');
        const anio = fecha[0];
        const resultado = `${dia}/${mes}/${anio}`;
        console.log('Array convertido a:', resultado);
        return resultado;
    } 
    
    if (typeof fecha === 'number') {
        // Timestamp -> "DD/MM/YYYY"
        const date = new Date(fecha);
        const dia = String(date.getDate()).padStart(2, '0');
        const mes = String(date.getMonth() + 1).padStart(2, '0');
        const anio = date.getFullYear();
        const resultado = `${dia}/${mes}/${anio}`;
        console.log('Timestamp convertido a:', resultado);
        return resultado;
    } 
    
    if (typeof fecha === 'string') {
        // String "2025-11-20" -> "20/11/2025"
        if (fecha.includes('-')) {
            const partes = fecha.split('-');
            if (partes.length === 3) {
                const resultado = `${partes[2]}/${partes[1]}/${partes[0]}`;
                console.log('String convertido a:', resultado);
                return resultado;
            }
        }
        // Si ya está en formato DD/MM/YYYY, retornarlo tal cual
        if (fecha.includes('/')) {
            console.log('Fecha ya formateada:', fecha);
            return fecha;
        }
    }
    
    console.log('No se pudo formatear, retornando:', fecha);
    return fecha;
}

async function deleteAsistencia(id) {
    openConfirmModal('¿Está seguro de eliminar esta asistencia? Esta acción no se puede deshacer.', async function() {
        try {
            await api.deleteAttendance(id);
            showNotification('ASISTENCIA ELIMINADA CORRECTAMENTE', 'success');
            loadAsistencias();
            loadDashboardStats();
            loadAtletasEnBox();
        } catch (error) {
            console.error('Error al eliminar asistencia:', error);
            showNotification('ERROR AL ELIMINAR ASISTENCIA: ' + error.message, 'error');
        }
    });
}

// USUARIOS
async function loadUsuarios() {
    const tbody = document.querySelector('#usuariosTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="7" class="text-center"><div class="loading"><i class="fas fa-spinner fa-spin"></i> Cargando usuarios...</div></td></tr>';
    
    try {
        let usuarios = await api.getUsers();
        
        // Aplicar filtro de rol
        const filterRol = document.getElementById('filterRol')?.value;
        if (filterRol) {
            usuarios = usuarios.filter(u => {
                const idRol = u.idRol || u.id_rol || 2;
                return idRol === parseInt(filterRol);
            });
        }
        
        // Aplicar filtro de búsqueda
        const searchInput = document.getElementById('searchUsuario');
        if (searchInput && searchInput.value.trim()) {
            const searchTerm = searchInput.value.toLowerCase();
            usuarios = usuarios.filter(u => {
                const nombre = (u.nombre || '').toLowerCase();
                const apellidoPaterno = (u.apellidoPaterno || u.apellido_paterno || '').toLowerCase();
                const apellidoMaterno = (u.apellidoMaterno || u.apellido_materno || '').toLowerCase();
                const email = (u.email || '').toLowerCase();
                const telefono = (u.telefono || '').toLowerCase();
                const nombreCompleto = `${nombre} ${apellidoPaterno} ${apellidoMaterno}`;
                return nombreCompleto.includes(searchTerm) || email.includes(searchTerm) || 
                       telefono.includes(searchTerm);
            });
        }
        
        const sliced = slicePage(usuarios, 'usuarios');
        renderPagination('usuarios');
        if (sliced.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">No hay usuarios registrados</td></tr>';
        } else {
            tbody.innerHTML = sliced.map(u => {
                // Manejar diferentes formatos de respuesta del backend
                const id = u.idUsuario || u.id_usuario || u.id;
                const nombre = u.nombre || '';
                const apellidoPaterno = u.apellidoPaterno || u.apellido_paterno || '';
                const apellidoMaterno = u.apellidoMaterno || u.apellido_materno || '';
                const email = u.email || '';
                const telefono = u.telefono || 'Sin teléfono';
                const idRol = u.idRol || u.id_rol || 2;
                const activo = u.activo !== undefined ? u.activo : true;
                
                const rol = idRol === 1 ? 'Gerente' : 'Staff';
                const estado = activo ? 'Activo' : 'Inactivo';
                const canDelete = idRol !== 1; // No permitir eliminar Gerente
                return `
                    <tr>
                        <td>${id}</td>
                        <td>${nombre} ${apellidoPaterno} ${apellidoMaterno}</td>
                        <td>${email}</td>
                        <td><span class="badge ${idRol === 1 ? 'primary' : 'info'}">${rol}</span></td>
                        <td><span class="badge ${activo ? 'success' : 'secondary'}">${estado}</span></td>
                        <td>${telefono}</td>
                        <td>
                            ${canDelete ? `
                            <button class="btn-action danger" onclick="deleteUsuario(${id}, ${idRol})" title="Eliminar Usuario">
                                <i class="fas fa-trash"></i>
                            </button>` : '<span class="text-muted">No eliminable</span>'}
                        </td>
                    </tr>
                `;
            }).join('');
        }
        
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Error al cargar usuarios</td></tr>';
        console.error(error);
    }
}

async function deleteUsuario(id, idRol) {
    // Bloquear eliminación de Gerente por seguridad
    if (idRol === 1 || idRol === '1') {
        showNotification('No se puede eliminar al Gerente', 'warning');
        return;
    }
    openConfirmModal('¿Está seguro de eliminar este usuario Staff? Esta acción no se puede deshacer.', async function() {
        try {
            await api.deleteUser(id);
            showNotification('Usuario eliminado exitosamente', 'success');
            loadUsuarios();
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            showNotification('Error al eliminar usuario: ' + error.message, 'error');
        }
    });
}

// BÚSQUEDA Y FILTROS - Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Búsqueda en Atletas
    const searchAtleta = document.getElementById('searchAtleta');
    if (searchAtleta) {
        searchAtleta.addEventListener('input', function() {
            loadAtletas();
        });
    }

    // Búsqueda en Membresías
    const searchMembresias = document.getElementById('searchMembresia');
    if (searchMembresias) {
        searchMembresias.addEventListener('input', function() {
            loadMembresias();
        });
    }

    // Búsqueda en Pagos
    const searchPagos = document.getElementById('searchPago');
    if (searchPagos) {
        searchPagos.addEventListener('input', function() {
            loadPagos();
        });
    }

    // Búsqueda en Asistencias
    const searchAsistencias = document.getElementById('searchAsistencia');
    if (searchAsistencias) {
        searchAsistencias.addEventListener('input', function() {
            loadAsistencias();
        });
    }

    // Búsqueda en Usuarios
    const searchUsuarios = document.getElementById('searchUsuario');
    if (searchUsuarios) {
        searchUsuarios.addEventListener('input', function() {
            loadUsuarios();
        });
    }
    
    // Filtro de fecha en Pagos
    const filterFechaPago = document.getElementById('filterFechaPago');
    if (filterFechaPago) {
        filterFechaPago.addEventListener('change', function() {
            loadPagos();
        });
    }
    
    // Filtro de fecha en Asistencias
    const filterFechaAsistencia = document.getElementById('filterFechaAsistencia');
    if (filterFechaAsistencia) {
        filterFechaAsistencia.addEventListener('change', function() {
            loadAsistencias();
        });
    }
    
    // Filtro de estado en Membresías
    const filterEstadoMembresia = document.getElementById('filterEstadoMembresia');
    if (filterEstadoMembresia) {
        filterEstadoMembresia.addEventListener('change', function() {
            loadMembresias();
        });
    }
    
    // Filtro de rol en Usuarios
    const filterRol = document.getElementById('filterRol');
    if (filterRol) {
        filterRol.addEventListener('change', function() {
            loadUsuarios();
        });
    }
});

// Función para limpiar filtros
function clearFilters(section) {
    switch(section) {
        case 'atletas':
            const searchAtleta = document.getElementById('searchAtleta');
            if (searchAtleta) searchAtleta.value = '';
            loadAtletas();
            break;
        case 'membresias':
            const searchMembresia = document.getElementById('searchMembresia');
            const filterEstado = document.getElementById('filterEstadoMembresia');
            if (searchMembresia) searchMembresia.value = '';
            if (filterEstado) filterEstado.value = '';
            loadMembresias();
            break;
        case 'pagos':
            const searchPago = document.getElementById('searchPago');
            const filterFechaPago = document.getElementById('filterFechaPago');
            if (searchPago) searchPago.value = '';
            if (filterFechaPago) filterFechaPago.value = '';
            loadPagos();
            break;
        case 'asistencias':
            const searchAsistencia = document.getElementById('searchAsistencia');
            const filterFechaAsistencia = document.getElementById('filterFechaAsistencia');
            if (searchAsistencia) searchAsistencia.value = '';
            if (filterFechaAsistencia) filterFechaAsistencia.value = new Date().toISOString().split('T')[0];
            loadAsistencias();
            break;
        case 'usuarios':
            const searchUsuario = document.getElementById('searchUsuario');
            const filterRol = document.getElementById('filterRol');
            if (searchUsuario) searchUsuario.value = '';
            if (filterRol) filterRol.value = '';
            loadUsuarios();
            break;
    }
    showNotification('Filtros limpiados', 'success');
}

// REPORTES Y GRÁFICAS

// REPORTES Y GRÁFICAS (SIMPLIFICADO)
let chartInstances = {};

async function loadReportes() {
    console.log("Cargando reportes básicos...");
    
    try {
        const periodo = parseInt(document.getElementById('reportPeriodo')?.value || 30, 10);
        // Calcular rango de fechas
        const hoy = new Date();
        const inicio = new Date();
        inicio.setDate(hoy.getDate() - periodo + 1);
        const fmt = (d) => `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
        const rangoTexto = `${fmt(inicio)} — ${fmt(hoy)}`;
        const rangoEl = document.getElementById('ingresosFechaRango');
        if (rangoEl) rangoEl.textContent = rangoTexto;
        
        // 1. Cargar SOLO lo que sí funciona (Pagos y Membresías)
        const [pagos, membresias] = await Promise.all([
            api.getPayments(),
            api.getMemberships()
        ]);

        console.log(`Datos cargados: ${pagos.length} pagos, ${membresias.length} membresías`);
        
        // 2. Generar solo las 2 gráficas
        generarGraficaIngresos(pagos, periodo, inicio, hoy);
        generarGraficaMembresias(membresias);
        
    } catch (error) {
        console.error('Error al cargar reportes:', error);
        // No mostramos alert para no interrumpir, solo log
    }
}

// Función para descargar gráfica como imagen
function descargarGrafica(chartId, nombreArchivo) {
    const canvas = document.getElementById(chartId);
    if (!canvas) {
        showNotification('No se pudo encontrar la gráfica', 'error');
        return;
    }
    
    // Crear enlace de descarga
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${nombreArchivo}_${new Date().toISOString().split('T')[0]}.png`;
    link.href = url;
    link.click();
    
    showNotification('Gráfica descargada exitosamente', 'success');
}

// Descargar toda la sección de reportes como imagen (PNG)
async function descargarReporteImagen() {
    try {
        const section = document.getElementById('section-reportes');
        if (!section) {
            showNotification('No se encontró la sección de reportes', 'error');
            return;
        }
        const canvas = await html2canvas(section, { scale: 2 });
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `reporte_${new Date().toISOString().split('T')[0]}.png`;
        link.href = dataUrl;
        link.click();
        showNotification('Reporte descargado como imagen', 'success');
    } catch (e) {
        console.error(e);
        showNotification('Error al generar imagen del reporte', 'error');
    }
}

// Descargar reportes como PDF (una página con ambas gráficas)
async function descargarReportePDF() {
    try {
        // Generar imágenes de los canvas
        const ingresosCanvas = document.getElementById('ingresosChart');
        const membresiasCanvas = document.getElementById('membresiasChart');
        if (!ingresosCanvas || !membresiasCanvas) {
            showNotification('Las gráficas no están listas aún', 'warning');
            return;
        }

        const { jsPDF } = window.jspdf || {};
        if (!jsPDF) {
            showNotification('Biblioteca PDF no disponible', 'error');
            return;
        }

        const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

        // Título
        doc.setFontSize(16);
        doc.text('Reporte Básico - LC Boxing', 40, 40);
        const periodo = document.getElementById('reportPeriodo')?.value || 30;
        doc.setFontSize(10);
        doc.text(`Periodo: últimos ${periodo} días`, 40, 60);

        // Ingresos
        const ingresosDataUrl = ingresosCanvas.toDataURL('image/png', 1.0);
        doc.setFontSize(12);
        doc.text('Historial de Ingresos', 40, 90);
        doc.addImage(ingresosDataUrl, 'PNG', 40, 100, 500, 260);

        // Total ingresos
        const totalIngresos = document.getElementById('totalIngresos')?.textContent || '$0';
        doc.setFontSize(11);
        doc.text(`Total: ${totalIngresos}`, 560, 110);

        // Membresías
        const membresiasDataUrl = membresiasCanvas.toDataURL('image/png', 1.0);
        doc.setFontSize(12);
        doc.text('Distribución de Membresías', 40, 380);
        doc.addImage(membresiasDataUrl, 'PNG', 40, 390, 500, 260);

        // Total membresías
        const totalMembresias = document.getElementById('totalMembresias')?.textContent || '0';
        doc.setFontSize(11);
        doc.text(`Total: ${totalMembresias}`, 560, 400);

        // Guardar
        doc.save(`reporte_${new Date().toISOString().split('T')[0]}.pdf`);
        showNotification('Reporte descargado como PDF', 'success');
    } catch (e) {
        console.error(e);
        showNotification('Error al generar PDF del reporte', 'error');
    }
}

// GRÁFICA 1: INGRESOS (Line Chart)
function generarGraficaIngresos(pagos, periodo, fechaInicio, fechaFin) {
    const ctx = document.getElementById('ingresosChart');
    if (!ctx) return;
    
    // Calcular fecha límite
    const fechaLimite = new Date(fechaFin);
    fechaLimite.setDate(fechaLimite.getDate() - parseInt(periodo, 10));
    
    // Filtrar y Agrupar
    const ingresosPorDia = {};
    let total = 0;

    pagos.forEach(p => {
        // Usamos la función formatearFecha que arreglamos antes
        // Asegúrate que p.fechaPago sea el campo correcto del JSON (o p.fecha)
        const timestamp = p.fechaPago || p.fecha; 
        const fechaObj = new Date(timestamp);
        
        if (fechaObj >= fechaLimite) {
            // Formato para la etiqueta: DD/MM
            const dia = String(fechaObj.getDate()).padStart(2, '0');
            const mes = String(fechaObj.getMonth() + 1).padStart(2, '0');
            const label = `${dia}/${mes}`;
            
            const monto = parseFloat(p.monto || 0);
            
            if (!ingresosPorDia[label]) ingresosPorDia[label] = 0;
            ingresosPorDia[label] += monto;
            total += monto;
        }
    });

    // Ordenar cronológicamente (truco simple ordenando claves)
    // Nota: Esto asume que están en el mismo año. Para producción robusta usar librerías de fecha.
    const labels = Object.keys(ingresosPorDia).sort(); // Orden básico
    const data = labels.map(k => ingresosPorDia[k]);
    // Calcular media móvil de 7 días
    const windowSize = 7;
    const movingAvg = data.map((_, i) => {
        const start = Math.max(0, i - windowSize + 1);
        const slice = data.slice(start, i + 1);
        const sum = slice.reduce((s, v) => s + v, 0);
        return +(sum / slice.length).toFixed(2);
    });
    // Cumulativo
    let cum = 0;
    const cumulative = data.map(v => (cum += v));

    // Actualizar total en pantalla
    const totalElement = document.getElementById('totalIngresos');
    if(totalElement) totalElement.textContent = `$${total.toFixed(2)}`;

    // Destruir anterior si existe
    if (chartInstances.ingresos) chartInstances.ingresos.destroy();

    // Crear Chart
    chartInstances.ingresos = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Ingresos diarios ($)',
                    data: data,
                    borderColor: '#BF092F',
                    backgroundColor: 'rgba(191, 9, 47, 0.1)',
                    borderWidth: 3,
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Media móvil 7 días',
                    data: movingAvg,
                    borderColor: '#3B9797',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: true },
                tooltip: {
                    callbacks: {
                        afterBody: function(items) {
                            // mostrar acumulado para el punto
                            const idx = items[0].dataIndex;
                            const acc = cumulative[idx];
                            return `Acumulado: $${acc.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: { y: { beginAtZero: true } }
        }
    });
}

// GRÁFICA 2: MEMBRESÍAS (Doughnut Chart)
function generarGraficaMembresias(membresias) {
    const ctx = document.getElementById('membresiasChart');
    if (!ctx) return;

    // Agrupar por Tipo (Semanal, Mensual, etc.)
    const conteo = {};
    // Conteo por estado
    let activas = 0, vencidas = 0, suspendidas = 0;
    
    membresias.forEach(m => {
        const tipo = m.nombreTipo || m.tipoMembresia || 'Otro';
        if (!conteo[tipo]) conteo[tipo] = 0;
        conteo[tipo]++;
        const estado = (m.nombreEstado || '').toUpperCase();
        if (estado === 'ACTIVA') activas++;
        else if (estado === 'VENCIDA') vencidas++;
        else if (estado === 'SUSPENDIDA') suspendidas++;
    });

    const labels = Object.keys(conteo);
    const data = Object.values(conteo);

    // Actualizar total
    const totalElement = document.getElementById('totalMembresias');
    if(totalElement) totalElement.textContent = membresias.length;
    // Mostrar info de estados
    const infoEl = document.getElementById('membresiasInfo');
    if (infoEl) {
        const total = membresias.length || 1;
        const pct = (n) => Math.round((n/total)*100);
        infoEl.textContent = `Activas: ${activas} (${pct(activas)}%), Vencidas: ${vencidas} (${pct(vencidas)}%), Suspendidas: ${suspendidas} (${pct(suspendidas)}%)`;
    }

    // Destruir anterior
    if (chartInstances.membresias) chartInstances.membresias.destroy();

    // Crear Chart
    chartInstances.membresias = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#132440', // Azul oscuro
                    '#BF092F', // Rojo
                    '#3B9797', // Turquesa
                    '#ffc107', // Amarillo
                    '#6c757d'  // Gris
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right' },
                tooltip: {
                    callbacks: {
                        label: function(ctx) {
                            const val = ctx.parsed;
                            const total = data.reduce((s, v) => s + v, 0) || 1;
                            const pct = Math.round((val / total) * 100);
                            return `${ctx.label}: ${val} (${pct}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Listener para cambio de filtro
const selectPeriodo = document.getElementById('reportPeriodo');
if (selectPeriodo) {
    selectPeriodo.addEventListener('change', loadReportes);
}   