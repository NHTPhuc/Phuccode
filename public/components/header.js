export const renderHeader = ({ user, onLogout }) => {
  const wrapper = document.createElement('div');
  wrapper.className = 'app-header';
  wrapper.innerHTML = `
    <div>
      <h2 style="margin:0;">TimeFlow Manager</h2>
      <small>Welcome, ${user.name} (${user.role})</small>
    </div>
  `;

  const logoutButton = document.createElement('button');
  logoutButton.className = 'danger';
  logoutButton.textContent = 'Logout';
  logoutButton.addEventListener('click', onLogout);

  wrapper.appendChild(logoutButton);
  return wrapper;
};
