class APIHelper {
    constructor(baseURL = (typeof CONFIG !== 'undefined' ? CONFIG.API.BASE_URL : 'http://34.233.25.135:7000')) {
        this.baseURL = baseURL;
        this.timeout = 10000;
    }
    
    _getAuthHeaders() {
        const token = localStorage.getItem('authToken');
        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };
    }
    
    async _fetchWithTimeout(url, options) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        
        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            throw error;
        }
    }
    
    async _handleResponse(response) {
        const contentType = response.headers.get('content-type');
        let data;
        
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            const text = await response.text();
            data = { error: text };
        }
        
        if (!response.ok) {
            console.error('API Error Response:', {
                status: response.status,
                statusText: response.statusText,
                data: data
            });
            
            // Handle different error status codes
            switch (response.status) {
                case 401:
                    // Unauthorized - redirect to login
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('userData');
                    window.location.href = 'login.html';
                    throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
                case 403:
                    throw new Error('No tienes permisos para realizar esta acción');
                case 404:
                    throw new Error('Recurso no encontrado');
                case 400:
                    // Bad request - show specific error from backend
                    throw new Error(data.error || data.message || 'Datos inválidos');
                case 500:
                    throw new Error(data.error || data.message || 'Error interno del servidor');
                default:
                    throw new Error(data.error || data.message || 'Error en la petición');
            }
        }
        
        return data;
    }
    
    // PUBLIC HTTP METHODS
    
    async get(endpoint) {
        try {
            const response = await this._fetchWithTimeout(`${this.baseURL}${endpoint}`, {
                method: 'GET',
                headers: this._getAuthHeaders()
            });
            return await this._handleResponse(response);
        } catch (error) {
            console.error('GET Error:', error);
            throw error;
        }
    }
    
    async post(endpoint, data) {
        try {
            console.log(`POST ${endpoint}`, data);
            const response = await this._fetchWithTimeout(`${this.baseURL}${endpoint}`, {
                method: 'POST',
                headers: this._getAuthHeaders(),
                body: JSON.stringify(data)
            });
            return await this._handleResponse(response);
        } catch (error) {
            console.error('POST Error:', error);
            throw error;
        }
    }
    
    async put(endpoint, data) {
        try {
            const response = await this._fetchWithTimeout(`${this.baseURL}${endpoint}`, {
                method: 'PUT',
                headers: this._getAuthHeaders(),
                body: JSON.stringify(data)
            });
            return await this._handleResponse(response);
        } catch (error) {
            console.error('PUT Error:', error);
            throw error;
        }
    }
    
    async delete(endpoint) {
        try {
            const response = await this._fetchWithTimeout(`${this.baseURL}${endpoint}`, {
                method: 'DELETE',
                headers: this._getAuthHeaders()
            });
            return await this._handleResponse(response);
        } catch (error) {
            console.error('DELETE Error:', error);
            throw error;
        }
    }
    
    // AUTHENTICATION ENDPOINTS
    
    async login(email, password) {
        return await this.post('/auth/login', { email, password });
    }
    
    async register(userData) {
        return await this.post('/auth/register', userData);
    }
    
    async getCurrentUser() {
        return await this.get('/auth/me');
    }
    
    // USERS ENDPOINTS
    
    async getUsers() {
        return await this.get('/api/usuarios');
    }
    
    async getUserById(id) {
        return await this.get(`/api/usuarios/${id}`);
    }
    
    async updateUser(id, userData) {
        return await this.put(`/api/usuarios/${id}`, userData);
    }
    
    async deleteUser(id) {
        return await this.delete(`/api/usuarios/${id}`);
    }
    
    // ATHLETES ENDPOINTS
    
    async getAthletes() {
        return await this.get('/api/atletas');
    }
    
    async getActiveAthletes() {
        return await this.get('/api/atletas/activos');
    }
    
    async getAthleteById(id) {
        return await this.get(`/api/atletas/${id}`);
    }
    
    async createAthlete(athleteData) {
        return await this.post('/api/atletas', athleteData);
    }
    
    async updateAthlete(id, athleteData) {
        return await this.put(`/api/atletas/${id}`, athleteData);
    }
    
    async deleteAthlete(id) {
        return await this.delete(`/api/atletas/${id}`);
    }
    
    async getAthleteMedicalData(id) {
        return await this.get(`/api/atletas/${id}/datos-medicos`);
    }
    
    async updateAthleteMedicalData(id, medicalData) {
        return await this.post(`/api/atletas/${id}/datos-medicos`, medicalData);
    }
    
    async getAthleteContacts(id) {
        return await this.get(`/api/atletas/${id}/contactos`);
    }
    
    async addAthleteContact(id, contactData) {
        return await this.post(`/api/atletas/${id}/contactos`, contactData);
    }
    
    async deleteContact(id) {
        return await this.delete(`/api/contactos/${id}`);
    }
    
    // MEMBERSHIPS ENDPOINTS
    
    async getMemberships() {
        return await this.get('/api/membresias');
    }
    
    async getMembershipTypes() {
        return await this.get('/api/membresias/tipos');
    }
    
    async getMembershipById(id) {
        return await this.get(`/api/membresias/${id}`);
    }
    
    async getMembershipsByAthlete(athleteId) {
        return await this.get(`/api/membresias/atleta/${athleteId}`);
    }
    
    async getExpiringMemberships(days) {
        return await this.get(`/api/membresias/vencimientos/${days}`);
    }
    
    async createMembership(membershipData) {
        return await this.post('/api/membresias', membershipData);
    }
    
    async updateMembership(id, membershipData) {
        return await this.put(`/api/membresias/${id}`, membershipData);
    }
    
    async deleteMembership(id) {
        return await this.delete(`/api/membresias/${id}`);
    }
    
    // PAYMENTS ENDPOINTS
    
    async getPayments() {
        return await this.get('/api/pagos');
    }
    
    async getPaymentById(id) {
        return await this.get(`/api/pagos/${id}`);
    }
    
    async getPaymentsByMembership(membershipId) {
        return await this.get(`/api/pagos/membresia/${membershipId}`);
    }
    
    async createPayment(paymentData) {
        return await this.post('/api/pagos', paymentData);
    }
    
    async deletePayment(id) {
        return await this.delete(`/api/pagos/${id}`);
    }
    
    // ATTENDANCE ENDPOINTS
    
    async getAttendance() {
        return await this.get('/api/asistencias');
    }
    
    async getAttendanceByDate(date) {
        if (!date) {
            date = new Date().toISOString().split('T')[0];
        }
        console.log('Consultando asistencias para fecha:', date);
        const result = await this.get(`/api/asistencias/fecha/${date}`);
        console.log('Asistencias recibidas:', result);
        return result;
    }
    
    async getTodayAttendance() {
        const today = new Date().toISOString().split('T')[0];
        return await this.get(`/api/asistencias/fecha/${today}`);
    }
    
    async getTodayPayments() {
        const today = new Date().toISOString().split('T')[0];
        const allPayments = await this.get('/api/pagos');
        return allPayments.filter(p => p.fechaPago && p.fechaPago.startsWith(today));
    }
    
    async getAttendanceByAthlete(athleteId) {
        return await this.get(`/api/asistencias/atleta/${athleteId}`);
    }
    
    async getAttendanceById(id) {
        return await this.get(`/api/asistencias/${id}`);
    }
    
    async registerEntry(entryData) {
        return await this.post('/api/asistencias/entrada', entryData);
    }
    
    async updateAttendance(id, exitData) {
        return await this.put(`/api/asistencias/${id}/salida`, exitData);
    }
    
    async deleteAttendance(id) {
        return await this.delete(`/api/asistencias/${id}`);
    }
}

// Create singleton instance using CONFIG if available
const api = new APIHelper(typeof CONFIG !== 'undefined' ? CONFIG.API.BASE_URL : undefined);

// Export for use in other files
if (typeof window !== 'undefined') {
    window.api = api;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { APIHelper, api };
}
