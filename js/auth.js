const API_BASE_URL = 'http://34.233.25.135:7000';

function showError(message, elementId = 'errorMessage') {
    const errorDiv = document.getElementById(elementId);
    const errorText = document.getElementById('errorText');
    if (errorDiv && errorText) {
        errorText.textContent = message;
        errorDiv.style.display = 'flex';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }
}

function showLoading(show = true) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = show ? 'flex' : 'none';
    }
}

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
    
    // Auto remove after 8 seconds
    setTimeout(() => {
        notification.classList.remove('notification-show');
        notification.classList.add('notification-exit');
        setTimeout(() => notification.remove(), 300);
    }, 8000);
}

function saveToken(token) {
    localStorage.setItem('authToken', token);
}

function getToken() {
    return localStorage.getItem('authToken');
}

function removeToken() {
    localStorage.removeItem('authToken');
}

function saveUserData(userData) {
    localStorage.setItem('userData', JSON.stringify(userData));
}

function getUserData() {
    const data = localStorage.getItem('userData');
    return data ? JSON.parse(data) : null;
}

function redirectToDashboard(role) {
    // Redirigir según el rol del usuario
    console.log('Redirecting to dashboard for role:', role, 'type:', typeof role);
    
    let dashboardUrl = 'dashboard-staff.html'; // default para Staff (idRol = 2)
    
    // Manejar tanto número como string
    if (role === 1 || role === '1' || role === 'GERENTE' || role === 'Gerente' || role === 'gerente') {
        dashboardUrl = 'dashboard-gerente.html';
    } else if (role === 2 || role === '2' || role === 'Staff' || role === 'STAFF' || role === 'staff') {
        dashboardUrl = 'dashboard-staff.html';
    }
    
    console.log('Redirecting to:', dashboardUrl);
    window.location.replace(dashboardUrl);
}


if (document.getElementById('loginForm')) {
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        
        // Validaciones básicas
        if (!email || !password) {
            showError('Por favor, completa todos los campos');
            return;
        }
        
        if (!isValidEmail(email)) {
            showError('Por favor, ingresa un correo válido');
            return;
        }
        
        showLoading(true);
        
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Error al iniciar sesión');
            }
            
            // Guardar token y datos del usuario
            console.log('Login response:', data);
            saveToken(data.token);
            saveUserData(data.usuario);
            
            // Verificar que se guardó correctamente
            console.log('Token saved:', localStorage.getItem('authToken') ? 'Yes' : 'No');
            console.log('UserData saved:', localStorage.getItem('userData') ? 'Yes' : 'No');
            
            // Mostrar mensaje de éxito
            console.log('Login exitoso:', data.usuario);
            
            // Mostrar notificación de éxito
            showNotification('✅ INICIO DE SESIÓN CORRECTO - Bienvenido ' + data.usuario.nombre, 'success');
            
            // Redirigir según el rol después de un breve delay
            setTimeout(() => {
                // Intentar usar idRol primero, luego rol como fallback
                const roleToUse = data.usuario.idRol || data.usuario.rol;
                redirectToDashboard(roleToUse);
            }, 2500);
            
        } catch (error) {
            console.error('Error:', error);
            showError(error.message || 'Error al conectar con el servidor');
            showNotification('❌ ' + (error.message || 'Error al iniciar sesión'), 'error');
        } finally {
            showLoading(false);
        }
    });
}

// REGISTER FUNCTIONALITY

if (document.getElementById('registerForm')) {
    const registerForm = document.getElementById('registerForm');
    
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Obtener valores del formulario
        const formData = {
            idRol: parseInt(document.getElementById('idRol').value),
            nombre: document.getElementById('nombre').value.trim(),
            apellidoPaterno: document.getElementById('apellidoPaterno').value.trim(),
            apellidoMaterno: document.getElementById('apellidoMaterno').value.trim(),
            email: document.getElementById('email').value.trim(),
            telefono: document.getElementById('telefono').value.trim(),
            fechaNacimiento: document.getElementById('fechaNacimiento').value,
            password: document.getElementById('password').value
        };
        
        const confirmPassword = document.getElementById('confirmPassword').value;
        const termsAccepted = document.querySelector('input[name="terms"]').checked;
        
        // Validaciones
        if (!formData.idRol) {
            showError('Por favor, selecciona un tipo de usuario');
            return;
        }
        
        if (!formData.nombre || !isValidName(formData.nombre)) {
            showError('El nombre solo puede contener letras y espacios (mínimo 2 caracteres)');
            return;
        }
        
        if (!formData.apellidoPaterno || !isValidName(formData.apellidoPaterno)) {
            showError('El apellido paterno solo puede contener letras y espacios (mínimo 2 caracteres)');
            return;
        }
        
        if (!formData.apellidoMaterno || !isValidName(formData.apellidoMaterno)) {
            showError('El apellido materno solo puede contener letras y espacios (mínimo 2 caracteres)');
            return;
        }
        
        if (!isValidEmail(formData.email)) {
            showError('Por favor, ingresa un correo electrónico válido');
            return;
        }
        
        if (!isValidPhone(formData.telefono)) {
            showError('Por favor, ingresa un teléfono válido (10 dígitos)');
            return;
        }
        
        if (!formData.fechaNacimiento) {
            showError('Por favor, ingresa tu fecha de nacimiento');
            return;
        }
        
        if (!isValidAge(formData.fechaNacimiento)) {
            showError('Debes tener al menos 5 años de edad');
            return;
        }
        
        if (!isValidPassword(formData.password)) {
            showError('La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números');
            return;
        }
        
        if (formData.password !== confirmPassword) {
            showError('Las contraseñas no coinciden');
            return;
        }
        
        if (!termsAccepted) {
            showError('Debes aceptar los términos y condiciones');
            return;
        }
        
        showLoading(true);
        
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Error al registrar usuario');
            }
            
            // Guardar token y datos del usuario
            saveToken(data.token);
            saveUserData(data.usuario);
            
            // Mostrar mensaje de éxito
            console.log('Registro exitoso:', data.usuario);
            showNotification('REGISTRO EXITOSO - Bienvenido ' + data.usuario.nombre, 'success');
            
            // Redirigir según el rol
            setTimeout(() => {
                // Intentar usar idRol primero, luego rol como fallback
                const roleToUse = data.usuario.idRol || data.usuario.rol;
                redirectToDashboard(roleToUse);
            }, 2500);
            
        } catch (error) {
            console.error('Error:', error);
            showError(error.message || 'Error al conectar con el servidor');
            showNotification('❌ ' + (error.message || 'Error en el registro'), 'error');
        } finally {
            showLoading(false);
        }
    });
}

// VALIDATION HELPERS

function isValidEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

function isValidName(name) {
    const nameRegex = /^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s]+$/;
    return nameRegex.test(name) && name.trim().length >= 2;
}

function isValidPassword(password) {
    // Mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número
    return password.length >= 8 && 
           /[A-Z]/.test(password) && 
           /[a-z]/.test(password) && 
           /[0-9]/.test(password);
}

function isValidAge(fechaNacimiento) {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    const edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        return edad - 1 >= 11; // Mínimo 11 años
    }
    return edad >= 5;
}

// AUTH CHECK FOR PROTECTED PAGES

function checkAuth() {
    const token = getToken();
    const currentPage = window.location.pathname.split('/').pop();
    
    // Si está en una página de dashboard y no hay token, redirigir a login
    if ((currentPage.includes('dashboard')) && !token) {
        window.location.href = 'login.html';
        return false;
    }
    
    return true;
}

// LOGOUT FUNCTIONALITY

function logout() {
    removeToken();
    localStorage.removeItem('userData');
    window.location.href = 'login.html';
}

// Verificar autenticación al cargar páginas protegidas
if (window.location.pathname.includes('dashboard')) {
    checkAuth();
}

// EXPORT FOR USE IN OTHER FILES

window.authAPI = {
    getToken,
    getUserData,
    logout,
    checkAuth,
    redirectToDashboard,
    API_BASE_URL
};
