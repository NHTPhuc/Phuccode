const renderStatusBadge = (status) => {
  const className = status === 'Approved' ? 'badge badge-approved' : 'badge badge-pending';
  return `<span class="${className}">${status}</span>`;
};

export const renderTimeEntryTable = ({ entries, onEdit, onDelete }) => {
  const container = document.createElement('div');
  container.className = 'card table-wrap';
  container.innerHTML = `
    <h3 style="margin-top:0;">Time Entries</h3>
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Project</th>
          <th>Time</th>
          <th>Hours</th>
          <th>Status</th>
          <th>Note</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${entries
          .map(
            (entry) => `
            <tr>
              <td>${entry.date}</td>
              <td>${entry.project}</td>
              <td>${entry.startTime} - ${entry.endTime}</td>
              <td>${entry.durationHours}</td>
              <td>${renderStatusBadge(entry.status)}</td>
              <td>${entry.note || '-'}</td>
              <td>
                <div class="actions">
                  <button class="secondary" data-action="edit" data-id="${entry.id}">Edit</button>
                  <button class="danger" data-action="delete" data-id="${entry.id}">Delete</button>
                </div>
              </td>
            </tr>
          `
          )
          .join('')}
      </tbody>
    </table>
  `;

  container.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement)) {
      return;
    }

    const action = target.dataset.action;
    const id = Number(target.dataset.id);

    if (action === 'edit') {
      onEdit(id);
    }
    if (action === 'delete') {
      onDelete(id);
    }
  });

  return container;
};
