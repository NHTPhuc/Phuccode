import { apiService } from '../services/api.js';
import { authService } from '../services/authService.js';

export const renderLoginPage = ({ onLoginSuccess }) => {
  const page = document.createElement('div');
  page.className = 'login-page';
  page.innerHTML = `
    <div class="card login-box">
      <h1 style="margin-top:0;">TimeFlow Manager</h1>
      <p style="color:#6b7280;">Sign in to manage your work schedule.</p>
      <form id="login-form">
        <div style="margin-bottom:10px;">
          <label>Username</label>
          <input name="username" type="text" placeholder="admin" required />
        </div>
        <div>
          <label>Password</label>
          <input name="password" type="password" placeholder="admin123" required />
        </div>
        <button class="primary" type="submit" style="margin-top:14px;width:100%;">Login</button>
        <p class="error" id="login-error" hidden></p>
      </form>
      <p class="success">Demo account: admin / admin123</p>
    </div>
  `;

  const form = page.querySelector('#login-form');
  const error = page.querySelector('#login-error');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    error.hidden = true;

    const payload = Object.fromEntries(new FormData(form).entries());

    try {
      const data = await apiService.login(payload);
      authService.setSession(data.token, data.user);
      onLoginSuccess();
    } catch (loginError) {
      error.textContent = loginError.message;
      error.hidden = false;
    }
  });

  return page;
};
