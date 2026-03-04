import { renderLoginPage } from './pages/loginPage.js';
import { renderDashboardPage } from './pages/dashboardPage.js';
import { authService } from './services/authService.js';
import { apiService } from './services/api.js';

const app = document.getElementById('app');

const renderApp = async () => {
  app.innerHTML = '';

  const logout = () => {
    authService.clearSession();
    renderApp();
  };

  if (!authService.isAuthenticated()) {
    app.appendChild(
      renderLoginPage({
        onLoginSuccess: renderApp
      })
    );
    return;
  }

  try {
    const user = await apiService.getCurrentUser();
    localStorage.setItem('currentUser', JSON.stringify(user));
    const dashboard = await renderDashboardPage({ onLogout: logout });
    app.appendChild(dashboard);
  } catch (error) {
    logout();
  }
};

renderApp();
