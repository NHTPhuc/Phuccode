export const authService = {
  setSession(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('currentUser', JSON.stringify(user));
  },
  clearSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
  },
  getToken() {
    return localStorage.getItem('token');
  },
  getStoredUser() {
    const raw = localStorage.getItem('currentUser');
    return raw ? JSON.parse(raw) : null;
  },
  isAuthenticated() {
    return Boolean(localStorage.getItem('token'));
  }
};
