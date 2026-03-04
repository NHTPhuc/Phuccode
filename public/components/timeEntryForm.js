export const renderTimeEntryForm = ({ onSubmit, initialValues, mode = 'create' }) => {
  const form = document.createElement('form');
  form.className = 'card';

  const values = initialValues || {
    date: '',
    startTime: '',
    endTime: '',
    project: '',
    status: 'Pending',
    note: ''
  };

  form.innerHTML = `
    <h3 style="margin-top:0;">${mode === 'create' ? 'Add Time Entry' : 'Edit Time Entry'}</h3>
    <div class="form-row">
      <div>
        <label>Date</label>
        <input name="date" type="date" value="${values.date}" required />
      </div>
      <div>
        <label>Start Time</label>
        <input name="startTime" type="time" value="${values.startTime}" required />
      </div>
      <div>
        <label>End Time</label>
        <input name="endTime" type="time" value="${values.endTime}" required />
      </div>
    </div>
    <div class="form-row">
      <div>
        <label>Project</label>
        <input name="project" type="text" value="${values.project}" placeholder="Project Name" required />
      </div>
      <div>
        <label>Status</label>
        <select name="status">
          <option ${values.status === 'Pending' ? 'selected' : ''}>Pending</option>
          <option ${values.status === 'Approved' ? 'selected' : ''}>Approved</option>
        </select>
      </div>
    </div>
    <div>
      <label>Note</label>
      <textarea name="note" rows="3" placeholder="Optional note">${values.note || ''}</textarea>
    </div>
    <div style="margin-top:12px;display:flex;gap:8px;">
      <button class="primary" type="submit">${mode === 'create' ? 'Create Entry' : 'Save Changes'}</button>
    </div>
  `;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(form).entries());
    onSubmit(payload);
  });

  return form;
};
