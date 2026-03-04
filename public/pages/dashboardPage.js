import { renderHeader } from '../components/header.js';
import { renderSummaryCards } from '../components/summaryCards.js';
import { renderTimeEntryForm } from '../components/timeEntryForm.js';
import { renderTimeEntryTable } from '../components/timeEntryTable.js';
import { apiService } from '../services/api.js';
import { authService } from '../services/authService.js';

export const renderDashboardPage = async ({ onLogout }) => {
  const wrapper = document.createElement('div');
  wrapper.className = 'container';

  const currentUser = authService.getStoredUser();
  const [summary, entries] = await Promise.all([apiService.getSummary(), apiService.getEntries()]);

  const header = renderHeader({
    user: currentUser,
    onLogout
  });

  let editId = null;

  const render = () => {
    wrapper.innerHTML = '';
    wrapper.appendChild(header);
    wrapper.appendChild(renderSummaryCards(summary));

    const editableEntry = entries.find((entry) => entry.id === editId) || null;
    const form = renderTimeEntryForm({
      mode: editableEntry ? 'edit' : 'create',
      initialValues: editableEntry,
      onSubmit: async (payload) => {
        if (editableEntry) {
          const updatedEntry = await apiService.updateEntry(editableEntry.id, payload);
          const index = entries.findIndex((entry) => entry.id === editableEntry.id);
          entries[index] = updatedEntry;
          editId = null;
        } else {
          const createdEntry = await apiService.createEntry(payload);
          entries.push(createdEntry);
        }

        const refreshedSummary = await apiService.getSummary();
        Object.assign(summary, refreshedSummary);
        render();
      }
    });

    const table = renderTimeEntryTable({
      entries,
      onEdit: (id) => {
        editId = id;
        render();
      },
      onDelete: async (id) => {
        await apiService.deleteEntry(id);
        const index = entries.findIndex((entry) => entry.id === id);
        if (index >= 0) {
          entries.splice(index, 1);
        }
        const refreshedSummary = await apiService.getSummary();
        Object.assign(summary, refreshedSummary);
        if (editId === id) {
          editId = null;
        }
        render();
      }
    });

    wrapper.appendChild(form);
    wrapper.appendChild(table);
  };

  render();
  return wrapper;
};
