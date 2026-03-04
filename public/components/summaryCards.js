export const renderSummaryCards = (summary) => {
  const section = document.createElement('div');
  section.className = 'grid grid-4';

  const cards = [
    { title: 'Total Entries', value: summary.totalEntries },
    { title: 'Total Hours', value: summary.totalHours },
    { title: 'Approved', value: summary.approvedCount },
    { title: 'Pending', value: summary.pendingCount }
  ];

  cards.forEach((card) => {
    const cardElement = document.createElement('div');
    cardElement.className = 'card';
    cardElement.innerHTML = `
      <p style="margin:0;color:#6b7280;">${card.title}</p>
      <h3 style="margin:8px 0 0;">${card.value}</h3>
    `;
    section.appendChild(cardElement);
  });

  return section;
};
