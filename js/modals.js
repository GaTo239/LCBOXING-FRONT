document.addEventListener('DOMContentLoaded', function() {
    console.log('Iniciando carga de modales...');
    loadModalsHTML();
});

// Cargar el HTML de los modales
function loadModalsHTML() {
    const container = document.getElementById('modalsContainer');
    if (!container) {
        console.error('No se encontró el contenedor de modales (modalsContainer)');
        return;
    }
    
    fetch('modals/modals-content.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error HTTP: ' + response.status);
            }
            return response.text();
        })
        .then(html => {
            container.innerHTML = html;
            console.log('Modales cargados correctamente');
            
            // Verificar que el modal de confirmación existe
            const confirmModal = document.getElementById('confirmModal');
            if (confirmModal) {
                console.log('Modal de confirmación encontrado');
            } else {
                console.error('Modal de confirmación NO encontrado');
            }
            
            initializeModalForms();
        })
        .catch(error => {
            console.error('Error cargando modales:', error);
            // Intentar cargar desde ruta alternativa
            console.log('Intentando ruta alternativa...');
            fetch('./modals/modals-content.html')
                .then(response => response.text())
                .then(html => {
                    container.innerHTML = html;
                    console.log('Modales cargados desde ruta alternativa');
                    initializeModalForms();
                })
                .catch(err => console.error('Error en ruta alternativa:', err));
        });
}

// Inicializar formularios de modales
function initializeModalForms() {
    // Formulario Atleta
    const atletaForm = document.getElementById('atletaForm');
    if (atletaForm) {
        atletaForm.addEventListener('submit', handleAtletaSubmit);
    }
    
    // Formulario Membresía
    const membresiaForm = document.getElementById('membresiaForm');
    if (membresiaForm) {
        membresiaForm.addEventListener('submit', handleMembresiaSubmit);
    }
    
    // Formulario Pago
    const pagoForm = document.getElementById('pagoForm');
    if (pagoForm) {
        pagoForm.addEventListener('submit', handlePagoSubmit);
    }
    
    // Formulario Asistencia
    const asistenciaForm = document.getElementById('asistenciaForm');
    if (asistenciaForm) {
        asistenciaForm.addEventListener('submit', handleAsistenciaSubmit);
    }
    
    // Formulario Salida
    const salidaForm = document.getElementById('salidaForm');
    if (salidaForm) {
        salidaForm.addEventListener('submit', handleSalidaSubmit);
    }
    
    // Formulario Usuario
    const usuarioForm = document.getElementById('usuarioForm');
    if (usuarioForm) {
        usuarioForm.addEventListener('submit', handleUsuarioSubmit);
    }
}

// MODAL: ATLETA
let editingAtletaId = null;

function openAtletaModal(atletaId = null) {
    editingAtletaId = atletaId;
    const modal = document.getElementById('atletaModal');
    const title = document.getElementById('atletaModalTitle');
    const form = document.getElementById('atletaForm');
    
    form.reset();
    
    if (atletaId) {
        title.textContent = 'Editar Atleta';
        loadAtletaData(atletaId);
    } else {
        title.textContent = 'Nuevo Atleta';
    }
    
    modal.style.display = 'flex';
}

function closeAtletaModal() {
    document.getElementById('atletaModal').style.display = 'none';
    editingAtletaId = null;
}

async function loadAtletaData(atletaId) {
    try {
        const atleta = await api.getAthleteById(atletaId);
        
        document.getElementById('atletaId').value = atleta.idAtleta || atleta.id;
        document.getElementById('atletaNombre').value = atleta.nombre;
        document.getElementById('atletaApellidoPaterno').value = atleta.apellidoPaterno;
        document.getElementById('atletaApellidoMaterno').value = atleta.apellidoMaterno;
        
        // Convertir timestamp a formato yyyy-MM-dd si es necesario
        let fechaNacimiento = atleta.fechaNacimiento;
        if (typeof fechaNacimiento === 'number') {
            fechaNacimiento = new Date(fechaNacimiento).toISOString().split('T')[0];
        }
        document.getElementById('atletaFechaNacimiento').value = fechaNacimiento;
        
        document.getElementById('atletaGenero').value = atleta.genero;
        document.getElementById('atletaEmail').value = atleta.email;
        document.getElementById('atletaTelefono').value = atleta.telefono;
        document.getElementById('atletaNotas').value = atleta.notas || '';
        
        try {
            const datosMedicos = await api.getAthleteMedicalData(atleta.idAtleta || atleta.id);
            if (datosMedicos) {
                document.getElementById('atletaTipoSangre').value = datosMedicos.tipoSangre || '';
                document.getElementById('atletaAlergias').value = datosMedicos.alergias || '';
                document.getElementById('atletaPadecimientos').value = datosMedicos.condicionesMedicas || '';
            }
        } catch (e) {
            console.log('No hay datos médicos registrados');
        }
        
        try {
            const contactos = await api.getAthleteContacts(atleta.idAtleta || atleta.id);
            if (contactos && contactos.length > 0) {
                const contacto = contactos[0];
                document.getElementById('contactoNombre').value = contacto.nombreContacto || '';
                document.getElementById('contactoParentesco').value = contacto.relacion || '';
                document.getElementById('contactoTelefono').value = contacto.telefonoContacto || '';
            }
        } catch (e) {
            console.log('No hay contactos de emergencia registrados');
        }
        
    } catch (error) {
        showNotification('Error al cargar datos del atleta', 'error');
        console.error(error);
    }
}

async function handleAtletaSubmit(e) {
    e.preventDefault();
    
    const nombre = document.getElementById('atletaNombre').value.trim();
    const apellidoPaterno = document.getElementById('atletaApellidoPaterno').value.trim();
    const apellidoMaterno = document.getElementById('atletaApellidoMaterno').value.trim();
    const email = document.getElementById('atletaEmail').value.trim();
    const telefono = document.getElementById('atletaTelefono').value.trim();
    const fechaNacimiento = document.getElementById('atletaFechaNacimiento').value;
    
    // Validaciones
    const nameRegex = /^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s]+$/;
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phoneRegex = /^[0-9]{10}$/;
    
    if (!nombre || nombre.length < 2 || !nameRegex.test(nombre)) {
        showNotification('El nombre solo puede contener letras y espacios (mínimo 2 caracteres)', 'error');
        document.getElementById('atletaNombre').focus();
        return;
    }
    
    if (!apellidoPaterno || apellidoPaterno.length < 2 || !nameRegex.test(apellidoPaterno)) {
        showNotification('El apellido paterno solo puede contener letras y espacios (mínimo 2 caracteres)', 'error');
        document.getElementById('atletaApellidoPaterno').focus();
        return;
    }
    
    if (!apellidoMaterno || apellidoMaterno.length < 2 || !nameRegex.test(apellidoMaterno)) {
        showNotification(' apellido materno solo puede contener letras y espacios (mínimo 2 caracteres)', 'error');
        document.getElementById('atletaApellidoMaterno').focus();
        return;
    }
    
    if (!email || !emailRegex.test(email)) {
        showNotification('Por favor, ingresa un correo electrónico válido', 'error');
        document.getElementById('atletaEmail').focus();
        return;
    }
    
    if (!telefono || !phoneRegex.test(telefono.replace(/\s/g, ''))) {
        showNotification('Por favor, ingresa un teléfono válido de 10 dígitos', 'error');
        document.getElementById('atletaTelefono').focus();
        return;
    }
    
    if (!fechaNacimiento) {
        showNotification('Por favor, ingresa la fecha de nacimiento', 'error');
        document.getElementById('atletaFechaNacimiento').focus();
        return;
    }
    
    // Validar edad mínima (5 años)
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    const edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    let edadReal = edad;
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edadReal = edad - 1;
    }
    
    if (edadReal < 5) {
        showNotification('El atleta debe tener al menos 5 años de edad', 'error');
        return;
    }
    
    const atletaData = {
        nombre: nombre,
        apellidoPaterno: apellidoPaterno,
        apellidoMaterno: apellidoMaterno,
        fechaNacimiento: fechaNacimiento,
        genero: document.getElementById('atletaGenero').value,
        email: email,
        telefono: telefono,
        notas: document.getElementById('atletaNotas').value,
        activo: true
    };
    
    try {
        let atletaId;
        
        if (editingAtletaId) {
            await api.updateAthlete(editingAtletaId, atletaData);
            atletaId = editingAtletaId;
            showNotification('ATLETA ACTUALIZADO CORRECTAMENTE', 'success');
        } else {
            const response = await api.createAthlete(atletaData);
            atletaId = response.idAtleta || response.id;
            showNotification('SE HA REGISTRADO AL ATLETA CORRECTAMENTE', 'success');
        }
        
        // Guardar datos médicos solo si hay al menos un campo lleno
        const tipoSangre = document.getElementById('atletaTipoSangre').value;
        const alergias = document.getElementById('atletaAlergias').value;
        const condicionesMedicas = document.getElementById('atletaPadecimientos').value;
        
        if (tipoSangre || alergias || condicionesMedicas) {
            const datosMedicos = {
                tipoSangre: tipoSangre || null,
                alergias: alergias || null,
                condicionesMedicas: condicionesMedicas || null
            };
            
            try {
                await api.updateAthleteMedicalData(atletaId, datosMedicos);
            } catch (e) {
                console.error('Error al guardar datos médicos:', e);
            }
        }
        
        // Guardar contacto de emergencia solo si hay nombre
        const contactoNombre = document.getElementById('contactoNombre').value;
        if (contactoNombre) {
            const contactoData = {
                nombreContacto: contactoNombre,
                relacion: document.getElementById('contactoParentesco').value || null,
                telefonoContacto: document.getElementById('contactoTelefono').value || null
            };
            
            try {
                await api.addAthleteContact(atletaId, contactoData);
            } catch (e) {
                console.error('Error al guardar contacto de emergencia:', e);
            }
        }
        
        closeAtletaModal();
        if (typeof loadAtletas === 'function') loadAtletas();
        if (typeof loadDashboardStats === 'function') loadDashboardStats();
        
    } catch (error) {
        console.error('Error al guardar atleta:', error);
        showNotification('ERROR AL REGISTRAR ATLETA: ' + error.message, 'error');
    }
}

// MODAL: MEMBRESÍA
let editingMembresiaId = null;
let originalMembresiaPrecio = null; // Para detectar cambios de precio

function openMembresiaModal(membresiaId = null) {
    console.log('openMembresiaModal llamada con ID:', membresiaId);
    editingMembresiaId = membresiaId;
    originalMembresiaPrecio = null;
    
    const modal = document.getElementById('membresiaModal');
    const title = document.getElementById('membresiaModalTitle');
    const form = document.getElementById('membresiaForm');
    const devolucionAlert = document.getElementById('devolucionAlert');
    
    if (!modal || !title || !form) {
        console.error('Elementos del modal no encontrados');
        return;
    }
    
    form.reset();
    
    // Ocultar alerta de devolución inicialmente
    if (devolucionAlert) devolucionAlert.style.display = 'none';
    
    // Limpiar estilos de error
    const fieldsToReset = ['membresiaAtleta', 'membresiaTipo', 'membresiaCosto'];
    fieldsToReset.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.style.borderColor = '';
            // Agregar listener para limpiar el borde rojo al cambiar
            element.addEventListener('change', function() {
                this.style.borderColor = '';
            }, { once: true });
        }
    });
    
    loadAtletasSelect('membresiaAtleta');
    loadTiposMembresiaSelect();
    
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('membresiaFechaInicio').value = today;
    
    if (membresiaId) {
        title.textContent = 'Editar Membresía';
        loadMembresiaData(membresiaId);
        
        // Mostrar alerta de devolución al editar
        if (devolucionAlert) {
            devolucionAlert.style.display = 'block';
        }
        
        // Listener para detectar cambios en el costo
        const costoInput = document.getElementById('membresiaCosto');
        if (costoInput) {
            costoInput.addEventListener('input', function() {
                if (originalMembresiaPrecio !== null && devolucionAlert) {
                    const nuevoPrecio = parseFloat(this.value);
                    if (nuevoPrecio !== originalMembresiaPrecio && !isNaN(nuevoPrecio)) {
                        devolucionAlert.style.display = 'block';
                        devolucionAlert.innerHTML = `
                            <i class="fas fa-exclamation-triangle"></i>
                            <strong>Atención:</strong> Está modificando el costo de $${originalMembresiaPrecio.toFixed(2)} a $${nuevoPrecio.toFixed(2)}. 
                            Se registrará una devolución automáticamente.
                        `;
                    } else {
                        devolucionAlert.style.display = 'none';
                    }
                }
            });
        }
    } else {
        title.textContent = 'Nueva Membresía';
        document.getElementById('membresiaEstatus').value = '1';
    }
    
    modal.style.display = 'flex';
    console.log('Modal de membresía abierto');
}

function closeMembresiaModal() {
    document.getElementById('membresiaModal').style.display = 'none';
    editingMembresiaId = null;
}

async function loadMembresiaData(membresiaId) {
    try {
        const membresia = await api.getMembershipById(membresiaId);
        
        document.getElementById('membresiaId').value = membresia.idMembresia || membresia.id;
        document.getElementById('membresiaAtleta').value = membresia.idAtleta;
        document.getElementById('membresiaTipo').value = membresia.idTipoMembresia;
        
        // Convertir fechas al formato YYYY-MM-DD para input type="date"
        const convertirFechaParaInput = (fecha) => {
            if (!fecha) return '';
            
            // Si es array [2025, 11, 20]
            if (Array.isArray(fecha)) {
                const anio = fecha[0];
                const mes = String(fecha[1]).padStart(2, '0');
                const dia = String(fecha[2]).padStart(2, '0');
                return `${anio}-${mes}-${dia}`;
            }
            
            // Si es timestamp (número)
            if (typeof fecha === 'number') {
                const date = new Date(fecha);
                return date.toISOString().split('T')[0];
            }
            
            // Si ya es string en formato ISO (YYYY-MM-DD)
            if (typeof fecha === 'string' && fecha.includes('-')) {
                const partes = fecha.split('-');
                if (partes.length === 3) {
                    return `${partes[0]}-${String(partes[1]).padStart(2, '0')}-${String(partes[2]).padStart(2, '0')}`;
                }
            }
            
            return fecha;
        };
        
        document.getElementById('membresiaFechaInicio').value = convertirFechaParaInput(membresia.fechaInicio);
        document.getElementById('membresiaFechaFin').value = convertirFechaParaInput(membresia.fechaVencimiento);
        document.getElementById('membresiaCosto').value = membresia.precioPagado;
        document.getElementById('membresiaEstatus').value = membresia.idEstadoMembresia;
        document.getElementById('membresiaObservaciones').value = membresia.observaciones || '';
        
        // Guardar precio original para detectar cambios
        originalMembresiaPrecio = parseFloat(membresia.precioPagado);
        
    } catch (error) {
        showNotification('Error al cargar datos de la membresía', 'error');
        console.error(error);
    }
}

function calculateMembresiaEnd() {
    const tipo = document.getElementById('membresiaTipo').value;
    const fechaInicio = document.getElementById('membresiaFechaInicio').value;
    const costoInput = document.getElementById('membresiaCosto');

    if (!tipo || !fechaInicio) return;

    const fecha = new Date(fechaInicio + 'T00:00:00');

    switch(tipo) {
        case '1':
            fecha.setDate(fecha.getDate() + 1);
            costoInput.value = 80;
            break;
        case '2':
            fecha.setDate(fecha.getDate() + 7);
            costoInput.value = 300;
            break;
        case '3':
            fecha.setMonth(fecha.getMonth() + 1);
            costoInput.value = 500;
            break;
        case '4':
            fecha.setMonth(fecha.getMonth() + 3);
            costoInput.value = 2200;
            break;
        case '5':
            fecha.setMonth(fecha.getMonth() + 6);
            costoInput.value = 3000;
            break;
        case '6':
            fecha.setFullYear(fecha.getFullYear() + 1);
            costoInput.value = 3300;
            break;
    }

    document.getElementById('membresiaFechaFin').value = fecha.toISOString().split('T')[0];
}

async function handleMembresiaSubmit(e) {
    e.preventDefault();
    
    const atletaSelect = document.getElementById('membresiaAtleta');
    const atletaValue = atletaSelect.value;
    const atletaSelectedIndex = atletaSelect.selectedIndex;
    const atletaSelectedOption = atletaSelect.options[atletaSelectedIndex];
    
    console.log('DEBUG Select Atleta:', {
        value: atletaValue,
        valueType: typeof atletaValue,
        selectedIndex: atletaSelectedIndex,
        selectedText: atletaSelectedOption ? atletaSelectedOption.text : 'N/A',
        totalOptions: atletaSelect.options.length,
        allOptions: Array.from(atletaSelect.options).map(opt => ({value: opt.value, text: opt.text}))
    });
    
    const idAtleta = parseInt(atletaValue);
    const idTipoMembresia = parseInt(document.getElementById('membresiaTipo').value);
    const precioPagado = parseFloat(document.getElementById('membresiaCosto').value);
    const idEstadoMembresia = parseInt(document.getElementById('membresiaEstatus').value);
    
    console.log('Valores del formulario:', {
        idAtleta,
        idTipoMembresia,
        precioPagado,
        idEstadoMembresia
    });
    
    // Validar que todos los campos requeridos tengan valores válidos
    if (!idAtleta || isNaN(idAtleta)) {
        console.error('Validación fallida: atleta no válido');
        const atletaSelect = document.getElementById('membresiaAtleta');
        atletaSelect.style.borderColor = 'red';
        atletaSelect.focus();
        showNotification('Debe seleccionar un atleta de la lista', 'error');
        return;
    }
    
    if (!idTipoMembresia || isNaN(idTipoMembresia)) {
        const tipoSelect = document.getElementById('membresiaTipo');
        tipoSelect.style.borderColor = 'red';
        tipoSelect.focus();
        showNotification('Debe seleccionar un tipo de membresía', 'error');
        return;
    }
    
    if (isNaN(precioPagado) || precioPagado <= 0) {
        const costoInput = document.getElementById('membresiaCosto');
        costoInput.style.borderColor = 'red';
        costoInput.focus();
        showNotification('El costo debe ser mayor a 0', 'error');
        return;
    }
    
    // Limpiar estilos de error si la validación pasa
    document.getElementById('membresiaAtleta').style.borderColor = '';
    document.getElementById('membresiaTipo').style.borderColor = '';
    document.getElementById('membresiaCosto').style.borderColor = '';
    
    // Obtener el ID del usuario actual para idUsuarioRegistro
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const idUsuarioRegistro = userData.idUsuario || userData.id || 1; // Fallback a 1 si no se encuentra
    
    const membresiaData = {
        idAtleta: idAtleta,
        idTipoMembresia: idTipoMembresia,
        fechaInicio: document.getElementById('membresiaFechaInicio').value,
        fechaVencimiento: document.getElementById('membresiaFechaFin').value,
        precioPagado: precioPagado,
        idEstadoMembresia: idEstadoMembresia,
        idUsuarioRegistro: idUsuarioRegistro,
        observaciones: document.getElementById('membresiaObservaciones').value || null
    };
    
    console.log('Datos de membresía a enviar:', membresiaData);
    
    try {
        if (editingMembresiaId) {
            // Verificar si hubo cambio de precio para registrar devolución
            const nuevoPrecio = parseFloat(precioPagado);
            const hayDevolucion = originalMembresiaPrecio !== null && nuevoPrecio !== originalMembresiaPrecio;
            
            const result = await api.updateMembership(editingMembresiaId, membresiaData);
            console.log('Respuesta actualización:', result);
            
            // Registrar devolución si aplica
            if (hayDevolucion && originalMembresiaPrecio > nuevoPrecio) {
                const montoDevolucion = originalMembresiaPrecio - nuevoPrecio;
                const devolucionData = {
                    idMembresia: editingMembresiaId,
                    idMetodoPago: 1, // Efectivo por defecto
                    monto: -montoDevolucion, // Monto negativo para devolución
                    fechaPago: new Date().toISOString().split('T')[0],
                    concepto: `Devolución por cambio de membresía (de $${originalMembresiaPrecio.toFixed(2)} a $${nuevoPrecio.toFixed(2)})`,
                    notas: 'Devolución automática por modificación de membresía',
                    idUsuarioRegistro: idUsuarioRegistro
                };
                
                try {
                    await api.createPayment(devolucionData);
                    showNotification(`MEMBRESÍA ACTUALIZADA Y DEVOLUCIÓN DE $${montoDevolucion.toFixed(2)} REGISTRADA`, 'success');
                } catch (devError) {
                    console.error('Error al registrar devolución:', devError);
                    showNotification('Membresía actualizada pero error al registrar devolución', 'warning');
                }
            } else {
                showNotification('MEMBRESÍA ACTUALIZADA CORRECTAMENTE', 'success');
            }
        } else {
            const result = await api.createMembership(membresiaData);
            console.log('Respuesta creación:', result);
            showNotification('SE HA REGISTRADO LA MEMBRESÍA CORRECTAMENTE', 'success');
        }
        
        closeMembresiaModal();
        if (typeof loadMembresias === 'function') loadMembresias();
        if (typeof loadDashboardStats === 'function') loadDashboardStats();
        
    } catch (error) {
        console.error('Error completo al guardar membresía:', error);
        const errorMsg = error.message || 'Error desconocido';
        showNotification('ERROR AL REGISTRAR MEMBRESÍA: ' + errorMsg, 'error');
    }
}

// MODAL: PAGO
function openPagoModal() {
    const modal = document.getElementById('pagoModal');
    const form = document.getElementById('pagoForm');
    
    form.reset();
    loadAtletasSelect('pagoAtleta');
    
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('pagoFecha').value = today;
    
    modal.style.display = 'flex';
}

function closePagoModal() {
    document.getElementById('pagoModal').style.display = 'none';
}

async function loadAtletaMembresias() {
    const atletaId = document.getElementById('pagoAtleta').value;
    const select = document.getElementById('pagoMembresia');
    
    select.innerHTML = '<option value="">Cargando...</option>';
    
    if (!atletaId) {
        select.innerHTML = '<option value="">Primero seleccione un atleta...</option>';
        return;
    }
    
    try {
        const membresias = await api.getMembershipsByAthlete(atletaId);
        console.log('Membresías del atleta:', membresias);
        
        if (membresias.length === 0) {
            select.innerHTML = '<option value="">No hay membresías para este atleta</option>';
            return;
        }
        
        // Obtener todas las membresías que ya tienen pagos registrados
        const todosLosPagos = await api.getPayments();
        const membresiasPagadas = new Set(todosLosPagos.map(p => p.idMembresia));
        
        // Filtrar solo membresías que NO han sido pagadas
        const membresiasSinPagar = membresias.filter(m => {
            const idMemb = m.idMembresia || m.id;
            return !membresiasPagadas.has(idMemb);
        });
        
        console.log('Membresías sin pagar:', membresiasSinPagar.length);
        
        if (membresiasSinPagar.length === 0) {
            select.innerHTML = '<option value="">Todas las membresías ya están pagadas</option>';
            showNotification('Este atleta no tiene membresías pendientes de pago', 'info');
            return;
        }
        
        select.innerHTML = '<option value="">Seleccionar membresía...</option>';
        membresiasSinPagar.forEach(m => {
            const option = document.createElement('option');
            // Usar idMembresia en lugar de id
            option.value = m.idMembresia || m.id;
            // Adaptar a los nombres de campos que devuelve el backend
            const tipo = m.nombreTipo || m.tipoMembresia || 'Membresía';
            const precio = m.precioPagado || m.costo || 0;
            const inicio = m.fechaInicio || '';
            const fin = m.fechaVencimiento || m.fechaFin || '';
            option.textContent = `${tipo} - $${precio} (${inicio} a ${fin}) - PENDIENTE`;
            option.setAttribute('data-costo', precio);
            select.appendChild(option);
        });
        
        select.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            const costo = selectedOption.getAttribute('data-costo');
            if (costo) {
                document.getElementById('pagoMonto').value = costo;
            }
        }, { once: true });
        
    } catch (error) {
        select.innerHTML = '<option value="">Error al cargar membresías</option>';
        console.error('Error cargando membresías:', error);
    }
}

async function handlePagoSubmit(e) {
    e.preventDefault();
    
    const idMembresia = parseInt(document.getElementById('pagoMembresia').value);
    const monto = parseFloat(document.getElementById('pagoMonto').value);
    const metodoPagoText = document.getElementById('pagoMetodo').value;
    
    // Validar campos requeridos
    
    // Validaciones con focus
    if (!idMembresia || isNaN(idMembresia)) {
        showNotification('Debe seleccionar una membresía', 'error');
        document.getElementById('pagoMembresia').focus();
        return;
    }
    
    if (!monto || isNaN(monto) || monto <= 0) {
        showNotification('El monto debe ser mayor a 0', 'error');
        document.getElementById('pagoMonto').focus();
        return;
    }
    
    if (monto > 999999.99) {
        showNotification('El monto es demasiado grande', 'error');
        document.getElementById('pagoMonto').focus();
        return;
    }
    
    if (!metodoPagoText) {
        showNotification('Debe seleccionar un método de pago', 'error');
        document.getElementById('pagoMetodo').focus();
        return;
    }    // Mapear texto del método de pago a ID
    const metodoPagoMap = {
        'Efectivo': 1,
        'EFECTIVO': 1,
        'Tarjeta': 2,
        'TARJETA_DEBITO': 2,
        'TARJETA_CREDITO': 3,
        'Transferencia': 4,
        'TRANSFERENCIA': 4,
        'PAYPAL': 5,
        'Otro': 6,
        'OTRO': 6
    };
    
    const idMetodoPago = metodoPagoMap[metodoPagoText] || 1;
    
    // Obtener ID del usuario actual
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const idUsuarioRegistro = userData.idUsuario || userData.id || 1;
    
    const pagoData = {
        idMembresia: idMembresia,
        idMetodoPago: idMetodoPago,
        monto: monto,
        fechaPago: document.getElementById('pagoFecha').value,
        concepto: 'Pago de membresía',
        referencia: document.getElementById('pagoReferencia').value || null,
        notas: document.getElementById('pagoObservaciones').value || null,
        idUsuarioRegistro: idUsuarioRegistro
    };
    
    console.log('Datos de pago a enviar:', pagoData);
    
    try {
        await api.createPayment(pagoData);
        showNotification('SE HA REGISTRADO EL PAGO CORRECTAMENTE', 'success');
        
        closePagoModal();
        if (typeof loadPagos === 'function') loadPagos();
        if (typeof loadDashboardStats === 'function') loadDashboardStats();
        
    } catch (error) {
        console.error('Error al registrar pago:', error);
        showNotification('ERROR AL REGISTRAR PAGO: ' + error.message, 'error');
    }
}

// MODAL: ASISTENCIA
function openAsistenciaModal() {
    const modal = document.getElementById('asistenciaModal');
    const form = document.getElementById('asistenciaForm');
    
    // Resetear formulario completamente
    form.reset();
    
    // Limpiar alertas y errores anteriores
    const validacionAlert = document.getElementById('asistenciaValidacionAlert');
    const successAlert = document.getElementById('asistenciaSuccessAlert');
    const atletaError = document.getElementById('asistenciaAtletaError');
    const fechaError = document.getElementById('asistenciaFechaError');
    const horaError = document.getElementById('asistenciaHoraError');
    
    if (validacionAlert) validacionAlert.style.display = 'none';
    if (successAlert) successAlert.style.display = 'none';
    if (atletaError) atletaError.style.display = 'none';
    if (fechaError) fechaError.style.display = 'none';
    if (horaError) horaError.style.display = 'none';
    
    // Limpiar bordes rojos de validación
    document.getElementById('asistenciaAtleta').style.borderColor = '';
    document.getElementById('asistenciaFecha').style.borderColor = '';
    document.getElementById('asistenciaHoraEntrada').style.borderColor = '';
    
    // Limpiar observaciones
    document.getElementById('asistenciaObservaciones').value = '';
    
    // Recargar select de atletas
    loadAtletasSelect('asistenciaAtleta');
    
    // Establecer fecha y hora actuales
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toTimeString().slice(0, 5);
    
    document.getElementById('asistenciaFecha').value = today;
    document.getElementById('asistenciaHoraEntrada').value = now;
    
    modal.style.display = 'flex';
}

function closeAsistenciaModal() {
    document.getElementById('asistenciaModal').style.display = 'none';
}

async function handleAsistenciaSubmit(e) {
    e.preventDefault();
    
    // Limpiar alertas anteriores
    const validacionAlert = document.getElementById('asistenciaValidacionAlert');
    const successAlert = document.getElementById('asistenciaSuccessAlert');
    const atletaError = document.getElementById('asistenciaAtletaError');
    const fechaError = document.getElementById('asistenciaFechaError');
    const horaError = document.getElementById('asistenciaHoraError');
    
    if (validacionAlert) validacionAlert.style.display = 'none';
    if (successAlert) successAlert.style.display = 'none';
    if (atletaError) atletaError.style.display = 'none';
    if (fechaError) fechaError.style.display = 'none';
    if (horaError) horaError.style.display = 'none';
    
    const idAtleta = parseInt(document.getElementById('asistenciaAtleta').value);
    const fechaInput = document.getElementById('asistenciaFecha');
    const horaInput = document.getElementById('asistenciaHoraEntrada');
    
    // Función auxiliar para mostrar error
    const mostrarError = (mensaje, errorElement) => {
        if (validacionAlert) {
            validacionAlert.style.display = 'block';
            document.getElementById('asistenciaValidacionTexto').textContent = mensaje;
        }
        if (errorElement) errorElement.style.display = 'block';
        return false;
    };
    
    // Validar que se haya seleccionado un atleta
    if (!idAtleta || isNaN(idAtleta)) {
        mostrarError('Debe seleccionar un atleta de la lista', atletaError);
        document.getElementById('asistenciaAtleta').focus();
        return;
    }
    
    // Validar fecha
    const fechaAsistencia = fechaInput.value;
    if (!fechaAsistencia) {
        mostrarError('Debe ingresar una fecha válida', fechaError);
        fechaInput.focus();
        return;
    }
    
    // Validar que la fecha no sea futura
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaSeleccionada = new Date(fechaAsistencia + 'T00:00:00');
    
    if (fechaSeleccionada > hoy) {
        mostrarError('No puede registrar asistencia en una fecha futura', fechaError);
        fechaInput.style.borderColor = 'red';
        fechaInput.focus();
        return;
    }
    
    // Validar hora
    const horaEntrada = horaInput.value;
    if (!horaEntrada) {
        mostrarError('Debe ingresar una hora de entrada válida', horaError);
        horaInput.focus();
        return;
    }
    
    // Validar formato de hora (HH:mm)
    const horaRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!horaRegex.test(horaEntrada)) {
        mostrarError('Formato de hora inválido. Use HH:MM (ejemplo: 14:30)', horaError);
        horaInput.style.borderColor = 'red';
        horaInput.focus();
        return;
    }
    
    // Obtener ID del usuario actual
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const idUsuarioRegistroEntrada = userData.idUsuario || userData.id || 1;
    
    try {
        // VALIDAR QUE EL ATLETA NO TENGA YA UNA ENTRADA REGISTRADA HOY
        const asistenciasHoy = await api.getAttendanceByDate(fechaAsistencia);
        const yaRegistrado = asistenciasHoy.find(a => {
            const idAtletaAsistencia = a.idAtleta || a.id_atleta;
            return idAtletaAsistencia === idAtleta && !a.horaSalida;
        });
        
        if (yaRegistrado) {
            const nombreAtleta = yaRegistrado.nombreAtleta || 'El atleta';
            mostrarError(`${nombreAtleta} ya tiene una entrada registrada sin salida en esta fecha. Por favor, registre primero la salida antes de marcar una nueva entrada.`, atletaError);
            return;
        }
        
        // Primero obtener las membresías activas del atleta
        const membresias = await api.getMembershipsByAthlete(idAtleta);
        
        if (!membresias || membresias.length === 0) {
            mostrarError('El atleta no tiene membresías registradas', atletaError);
            return;
        }
        
        // Buscar membresía activa (estado = 1)
        const membresiaActiva = membresias.find(m => m.idEstadoMembresia === 1);
        
        if (!membresiaActiva) {
            mostrarError('El atleta no tiene una membresía ACTIVA. Por favor, active o renueve su membresía.', atletaError);
            return;
        }
        
        // VALIDAR QUE LA MEMBRESÍA ESTÉ PAGADA
        const idMembresia = membresiaActiva.idMembresia || membresiaActiva.id;
        const todosLosPagos = await api.getPayments();
        const membresiaPagada = todosLosPagos.find(p => p.idMembresia === idMembresia);
        
        if (!membresiaPagada) {
            mostrarError('No se puede registrar asistencia: La membresía NO está pagada. Por favor, registre el pago primero.', atletaError);
            return;
        }
        
        console.log('Membresía activa y pagada. Registrando asistencia...');
        
        // Obtener valores del formulario
        const asistenciaData = {
            idAtleta: idAtleta,
            idMembresia: membresiaActiva.idMembresia || membresiaActiva.id,
            fechaAsistencia: fechaAsistencia,
            horaEntrada: `${horaEntrada}:00`,
            idUsuarioRegistroEntrada: idUsuarioRegistroEntrada,
            observaciones: document.getElementById('asistenciaObservaciones').value || null
        };
        
        console.log('Datos de asistencia a enviar:', asistenciaData);
        
        await api.registerEntry(asistenciaData);
        
        // Mostrar mensaje de éxito con alerta verde
        if (successAlert) {
            successAlert.style.display = 'block';
            document.getElementById('asistenciaSuccessTexto').textContent = 'Entrada registrada exitosamente';
        }
        
        showNotification('✅ SE HA REGISTRADO LA ENTRADA CORRECTAMENTE', 'success');
        
        // Cerrar modal después de 4 segundos
        setTimeout(() => {
            closeAsistenciaModal();
            if (typeof loadAsistencias === 'function') loadAsistencias();
            if (typeof loadDashboardStats === 'function') loadDashboardStats();
        }, 4000);
        
    } catch (error) {
        mostrarError('ERROR AL REGISTRAR ENTRADA: ' + error.message);
        showNotification('ERROR AL REGISTRAR ENTRADA: ' + error.message, 'error');
        console.error('Error completo:', error);
    }
}

// MODAL: REGISTRAR SALIDA
let editingSalidaId = null;

function openSalidaModal(asistenciaId, atletaNombre, horaEntrada) {
    editingSalidaId = asistenciaId;
    const modal = document.getElementById('salidaModal');
    const form = document.getElementById('salidaForm');
    
    form.reset();
    
    document.getElementById('salidaAsistenciaId').value = asistenciaId;
    document.getElementById('salidaAtletaNombre').textContent = atletaNombre;
    document.getElementById('salidaHoraEntrada').textContent = horaEntrada;
    
    const now = new Date().toTimeString().slice(0, 5);
    document.getElementById('salidaHoraSalida').value = now;
    
    modal.style.display = 'flex';
}

function closeSalidaModal() {
    document.getElementById('salidaModal').style.display = 'none';
    editingSalidaId = null;
}

async function handleSalidaSubmit(e) {
    e.preventDefault();
    
    // Convertir hora al formato HH:mm:ss que java.sql.Time puede parsear
    const horaSalidaValue = document.getElementById('salidaHoraSalida').value;
    
    try {
        await api.updateAttendance(editingSalidaId, {
            horaSalida: `${horaSalidaValue}:00`
        });
        
        showNotification('SE HA REGISTRADO LA SALIDA CORRECTAMENTE', 'success');
        
        closeSalidaModal();
        if (typeof loadAsistencias === 'function') loadAsistencias();
        if (typeof loadDashboardStats === 'function') loadDashboardStats();
        if (typeof loadAtletasEnBox === 'function') loadAtletasEnBox();
        
    } catch (error) {
        console.error('Error al registrar salida:', error);
        showNotification('ERROR AL REGISTRAR SALIDA: ' + error.message, 'error');
    }
}

// MODAL: USUARIO
let editingUsuarioId = null;

function openUsuarioModal(usuarioId = null) {
    editingUsuarioId = usuarioId;
    const modal = document.getElementById('usuarioModal');
    const title = document.getElementById('usuarioModalTitle');
    const form = document.getElementById('usuarioForm');
    const passwordField = document.getElementById('usuarioPassword');
    const passwordRequired = document.getElementById('passwordRequired');
    
    form.reset();
    
    if (usuarioId) {
        title.textContent = 'Editar Usuario';
        passwordField.removeAttribute('required');
        if (passwordRequired) passwordRequired.style.display = 'none';
        loadUsuarioData(usuarioId);
    } else {
        title.textContent = 'Nuevo Usuario';
        passwordField.setAttribute('required', 'required');
        if (passwordRequired) passwordRequired.style.display = 'inline';
    }
    
    modal.style.display = 'flex';
}

function closeUsuarioModal() {
    document.getElementById('usuarioModal').style.display = 'none';
    editingUsuarioId = null;
}

async function loadUsuarioData(usuarioId) {
    try {
        const usuario = await api.getUserById(usuarioId);
        
        // Manejar diferentes formatos de respuesta del backend
        const id = usuario.idUsuario || usuario.id_usuario || usuario.id;
        const nombre = usuario.nombre || '';
        const apellidoPaterno = usuario.apellidoPaterno || usuario.apellido_paterno || '';
        const apellidoMaterno = usuario.apellidoMaterno || usuario.apellido_materno || '';
        const email = usuario.email || '';
        const telefono = usuario.telefono || '';
        const fechaNacimiento = usuario.fechaNacimiento || usuario.fecha_nacimiento || '';
        const idRol = usuario.idRol || usuario.id_rol || 2;
        
        document.getElementById('usuarioId').value = id;
        document.getElementById('usuarioNombre').value = nombre;
        document.getElementById('usuarioApellidoPaterno').value = apellidoPaterno;
        document.getElementById('usuarioApellidoMaterno').value = apellidoMaterno;
        document.getElementById('usuarioEmail').value = email;
        document.getElementById('usuarioTelefono').value = telefono;
        document.getElementById('usuarioFechaNacimiento').value = fechaNacimiento;
        document.getElementById('usuarioRol').value = idRol;
        
    } catch (error) {
        showNotification('Error al cargar datos del usuario', 'error');
        console.error(error);
    }
}

async function handleUsuarioSubmit(e) {
    e.preventDefault();
    
    const nombre = document.getElementById('usuarioNombre').value.trim();
    const apellidoPaterno = document.getElementById('usuarioApellidoPaterno').value.trim();
    const apellidoMaterno = document.getElementById('usuarioApellidoMaterno').value.trim();
    const email = document.getElementById('usuarioEmail').value.trim();
    const telefono = document.getElementById('usuarioTelefono').value.trim();
    const fechaNacimiento = document.getElementById('usuarioFechaNacimiento').value;
    const password = document.getElementById('usuarioPassword').value;
    
    // Validaciones
    const nameRegex = /^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s]+$/;
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phoneRegex = /^[0-9]{10}$/;
    
    if (!nombre || nombre.length < 2 || !nameRegex.test(nombre)) {
        showNotification('El nombre solo puede contener letras y espacios (mínimo 2 caracteres)', 'error');
        document.getElementById('usuarioNombre').focus();
        return;
    }
    
    if (!apellidoPaterno || apellidoPaterno.length < 2 || !nameRegex.test(apellidoPaterno)) {
        showNotification('El apellido paterno solo puede contener letras y espacios (mínimo 2 caracteres)', 'error');
        document.getElementById('usuarioApellidoPaterno').focus();
        return;
    }
    
    if (!apellidoMaterno || apellidoMaterno.length < 2 || !nameRegex.test(apellidoMaterno)) {
        showNotification('El apellido materno solo puede contener letras y espacios (mínimo 2 caracteres)', 'error');
        document.getElementById('usuarioApellidoMaterno').focus();
        return;
    }
    
    if (!email || !emailRegex.test(email)) {
        showNotification('Por favor, ingresa un correo electrónico válido', 'error');
        document.getElementById('usuarioEmail').focus();
        return;
    }
    
    if (!telefono || !phoneRegex.test(telefono.replace(/\s/g, ''))) {
        showNotification('Por favor, ingresa un teléfono válido de 10 dígitos', 'error');
        document.getElementById('usuarioTelefono').focus();
        return;
    }
    
    if (!fechaNacimiento) {
        showNotification('Por favor, ingresa la fecha de nacimiento', 'error');
        document.getElementById('usuarioFechaNacimiento').focus();
        return;
    }
    
    // Validar contraseña solo si se está creando un nuevo usuario o si se ingresó una contraseña
    if (!editingUsuarioId && !password) {
        showNotification('La contraseña es requerida para nuevos usuarios', 'error');
        document.getElementById('usuarioPassword').focus();
        return;
    }
    
    if (password && password.length > 0) {
        if (password.length < 8) {
            showNotification('La contraseña debe tener al menos 8 caracteres', 'error');
            document.getElementById('usuarioPassword').focus();
            return;
        }
        
        if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
            showNotification('La contraseña debe incluir mayúsculas, minúsculas y números', 'error');
            document.getElementById('usuarioPassword').focus();
            return;
        }
    }
    
    const usuarioData = {
        nombre: nombre,
        apellidoPaterno: apellidoPaterno,
        apellidoMaterno: apellidoMaterno,
        email: email,
        telefono: telefono,
        fechaNacimiento: fechaNacimiento,
        idRol: parseInt(document.getElementById('usuarioRol').value)
    };
    
    if (password) {
        usuarioData.password = password;
    }
    
    try {
        if (editingUsuarioId) {
            await api.updateUser(editingUsuarioId, usuarioData);
            showNotification('USUARIO ACTUALIZADO CORRECTAMENTE', 'success');
        } else {
            await api.register(usuarioData);
            showNotification('SE HA REGISTRADO EL USUARIO CORRECTAMENTE', 'success');
        }
        
        closeUsuarioModal();
        if (typeof loadUsuarios === 'function') loadUsuarios();
        
    } catch (error) {
        console.error('Error al guardar usuario:', error);
        showNotification('ERROR AL REGISTRAR USUARIO: ' + error.message, 'error');
    }
}

// MODAL: CONFIRMAR ELIMINACIÓN
let confirmCallback = null;

function openConfirmModal(message, callback) {
    console.log('Abriendo modal de confirmación:', message);
    confirmCallback = callback;
    
    const modal = document.getElementById('confirmModal');
    const messageElement = document.getElementById('confirmMessage');
    const confirmButton = document.getElementById('confirmButton');
    
    if (!modal || !messageElement || !confirmButton) {
        console.error('Elementos del modal de confirmación no encontrados');
        // Si no hay modal, ejecutar directamente el callback
        if (confirm(message)) {
            callback();
        }
        return;
    }
    
    messageElement.textContent = message;
    modal.style.display = 'flex';
    
    // Remover eventos anteriores y agregar nuevo
    const newButton = confirmButton.cloneNode(true);
    confirmButton.parentNode.replaceChild(newButton, confirmButton);
    
    newButton.onclick = function() {
        console.log('Confirmación aceptada');
        if (confirmCallback) confirmCallback();
        closeConfirmModal();
    };
}

function closeConfirmModal() {
    console.log('Cerrando modal de confirmación');
    const modal = document.getElementById('confirmModal');
    if (modal) {
        modal.style.display = 'none';
    }
    confirmCallback = null;
}

// FUNCIONES AUXILIARES

async function loadAtletasSelect(selectId) {
    const select = document.getElementById(selectId);
    if (!select) {
        console.error(`Select element not found: ${selectId}`);
        return;
    }
    
    select.innerHTML = '<option value="">Cargando...</option>';
    
    try {
        const atletas = await api.getActiveAthletes();
        console.log(`Atletas cargados para ${selectId}:`, atletas);
        
        // Debug: ver estructura del primer atleta
        if (atletas.length > 0) {
            console.log('Estructura del primer atleta:', atletas[0]);
            console.log('Claves disponibles:', Object.keys(atletas[0]));
        }
        
        select.innerHTML = '<option value="">Seleccionar atleta...</option>';
        atletas.forEach(atleta => {
            const option = document.createElement('option');
            // Intentar diferentes nombres de propiedad para el ID
            const atletaId = atleta.idAtleta || atleta.id || atleta.ID;
            option.value = atletaId;
            option.textContent = `${atleta.nombre} ${atleta.apellidoPaterno} ${atleta.apellidoMaterno}`;
            console.log(`Agregando opción: value=${option.value}, text=${option.textContent}`);
            select.appendChild(option);
        });
        
        console.log(`Select ${selectId} ahora tiene ${select.options.length} opciones`);
        
    } catch (error) {
        select.innerHTML = '<option value="">Error al cargar atletas</option>';
        console.error(`Error cargando atletas para ${selectId}:`, error);
    }
}

async function loadTiposMembresiaSelect() {
    const select = document.getElementById('membresiaTipo');
    if (!select) {
        console.error('Select de tipos de membresía no encontrado');
        return;
    }
    
    select.innerHTML = '<option value="">Cargando tipos...</option>';
    
    try {
        const tipos = await api.getMembershipTypes();
        console.log('Tipos de membresía desde backend:', tipos);
        
        select.innerHTML = '<option value="">Seleccionar tipo...</option>';
        tipos.forEach(tipo => {
            const option = document.createElement('option');
            const tipoId = tipo.idTipoMembresia || tipo.id;
            option.value = tipoId;
            option.textContent = tipo.nombre || tipo.nombreTipo || tipo.tipo;
            console.log(`Tipo membresía: id=${option.value}, nombre=${option.textContent}`);
            select.appendChild(option);
        });
        
        console.log(`Tipos de membresía cargados: ${select.options.length - 1}`);
        
    } catch (error) {
        console.error('Error cargando tipos de membresía:', error);
        // Fallback a tipos estáticos si el endpoint no existe
        console.log('Usando tipos de membresía estáticos como fallback');
        select.innerHTML = `
            <option value="">Seleccionar tipo...</option>
            <option value="1">Diaria</option>
            <option value="2">Semanal</option>
            <option value="3">Mensual</option>
            <option value="4">Trimestral</option>
            <option value="5">Semestral</option>
            <option value="6">Anual</option>
        `;
    }
}

window.addEventListener('click', function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});

// Notificaciones
function showNotification(message, type = 'info') {
    // Crear contenedor si no existe
    let container = document.querySelector('.notification-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'notification-container';
        document.body.appendChild(container);
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => notification.classList.add('notification-show'), 10);
    
    // Auto remove after 8 seconds (8000 ms)
    setTimeout(() => {
        notification.classList.remove('notification-show');
        notification.classList.add('notification-exit');
        setTimeout(() => notification.remove(), 300);
    }, 8000);
}