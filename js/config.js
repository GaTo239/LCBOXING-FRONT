const CONFIG = {
    // API Configuration
    API: {
        BASE_URL: 'http://34.233.25.135:7000',
        TIMEOUT: 10000, // 10 seconds
        ENDPOINTS: {
            // Authentication
            LOGIN: '/auth/login',
            REGISTER: '/auth/register',
            ME: '/auth/me',
            
            // Users
            USERS: '/api/usuarios',
            USER_BY_ID: (id) => `/api/usuarios/${id}`,
            
            // Athletes
            ATHLETES: '/api/atletas',
            ATHLETES_ACTIVE: '/api/atletas/activos',
            ATHLETE_BY_ID: (id) => `/api/atletas/${id}`,
            ATHLETE_MEDICAL: (id) => `/api/atletas/${id}/datos-medicos`,
            ATHLETE_CONTACTS: (id) => `/api/atletas/${id}/contactos`,
            
            // Memberships
            MEMBERSHIPS: '/api/membresias',
            MEMBERSHIP_BY_ID: (id) => `/api/membresias/${id}`,
            MEMBERSHIP_BY_ATHLETE: (id) => `/api/membresias/atleta/${id}`,
            MEMBERSHIP_EXPIRING: (days) => `/api/membresias/vencimientos/${days}`,
            
            // Payments
            PAYMENTS: '/api/pagos',
            PAYMENT_BY_ID: (id) => `/api/pagos/${id}`,
            PAYMENT_BY_MEMBERSHIP: (id) => `/api/pagos/membresia/${id}`,
            
            // Attendance
            ATTENDANCE_BY_DATE: (date) => `/api/asistencias/fecha/${date}`,
            ATTENDANCE_TODAY: '/api/asistencias/hoy',
            ATTENDANCE_BY_ATHLETE: (id) => `/api/asistencias/atleta/${id}`,
            ATTENDANCE_ENTRY: '/api/asistencias/entrada',
            ATTENDANCE_EXIT: (id) => `/api/asistencias/${id}/salida`
        }
    },
    
    // Application Settings
    APP: {
        NAME: 'LC Boxing',
        VERSION: '1.0.0',
        DESCRIPTION: 'Sistema de Gestión para Boxes de Boxeo'
    },
    
    // User Roles
    ROLES: {
        ADMIN: {
            id: 1,
            name: 'Administrador',
            dashboard: 'dashboard-gerente.html'
        },
        STAFF: {
            id: 2,
            name: 'Staff',
            dashboard: 'dashboard-staff.html'
        },
        MEMBER: {
            id: 3,
            name: 'Miembro',
            dashboard: 'dashboard-staff.html'
        }
    },
    
    // Colors
    COLORS: {
        PRIMARY_RED: '#BF092F',
        DARK_BLUE: '#132440',
        MEDIUM_BLUE: '#16476A',
        TEAL: '#3B9797',
        WHITE: '#ffffff',
        LIGHT_GRAY: '#f8f9fa',
        GRAY: '#6c757d',
        DARK: '#212529'
    },
    
    // Storage Keys
    STORAGE: {
        AUTH_TOKEN: 'authToken',
        USER_DATA: 'userData',
        THEME: 'theme'
    },
    
    // Validation Rules
    VALIDATION: {
        PASSWORD_MIN_LENGTH: 8,
        PHONE_LENGTH: 10,
        EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        PHONE_REGEX: /^[0-9]{10}$/
    },
    
    // Messages
    MESSAGES: {
        SUCCESS: {
            LOGIN: 'Inicio de sesión exitoso',
            REGISTER: 'Registro exitoso',
            SAVE: 'Guardado exitosamente',
            DELETE: 'Eliminado exitosamente',
            UPDATE: 'Actualizado exitosamente'
        },
        ERROR: {
            LOGIN_FAILED: 'Error al iniciar sesión',
            REGISTER_FAILED: 'Error al registrar usuario',
            NETWORK_ERROR: 'Error de conexión con el servidor',
            INVALID_EMAIL: 'Por favor, ingresa un correo válido',
            INVALID_PHONE: 'Por favor, ingresa un teléfono válido',
            PASSWORD_MISMATCH: 'Las contraseñas no coinciden',
            PASSWORD_MIN: 'La contraseña debe tener al menos 8 caracteres',
            REQUIRED_FIELDS: 'Por favor, completa todos los campos',
            UNAUTHORIZED: 'No tienes autorización para acceder',
            NOT_FOUND: 'Recurso no encontrado',
            SERVER_ERROR: 'Error interno del servidor'
        }
    }
};

// Freeze config to prevent modifications
Object.freeze(CONFIG);
Object.freeze(CONFIG.API);
Object.freeze(CONFIG.API.ENDPOINTS);
Object.freeze(CONFIG.APP);
Object.freeze(CONFIG.ROLES);
Object.freeze(CONFIG.COLORS);
Object.freeze(CONFIG.STORAGE);
Object.freeze(CONFIG.VALIDATION);
Object.freeze(CONFIG.MESSAGES);

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
