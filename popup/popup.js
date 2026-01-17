document.addEventListener('DOMContentLoaded', async () => {
  const tabsList = document.getElementById('tabs-list');
  const clearButton = document.getElementById('clear-clutter');
  const idleCountEl = document.querySelector('.idle-count');
  const memorySavedEl = document.querySelector('.memory-saved');

  // Fetch your current tabs and render
  const renderTabs = async () => {
    const tabs = await chrome.tabs.query({});
    const { lastActiveTimes = {} } = await chrome.storage.local.get('lastActiveTimes');
    const now = Date.now();
    let idleCount = 0;

    tabsList.innerHTML = '';
    
    tabs.forEach(tab => {
      const lastActive = lastActiveTimes[tab.id] || 0;
      const isIdle = (now - lastActive) > (5 * 60 * 1000);
      
      if (isIdle && !tab.active && !tab.pinned && !tab.audible) idleCount++;
      
      const tabEl = document.createElement('div');
      tabEl.className = `tab-item ${isIdle ? 'idle' : ''}`;
      tabEl.innerHTML = `
        <div>
          <div class="tab-title">${tab.title}</div>
          <div class="tab-url">${new URL(tab.url).hostname}</div>
        </div>
        ${isIdle ? '<span class="status-badge">💤</span>' : ''}
      `;
      tabsList.appendChild(tabEl);
    });

    idleCountEl.textContent = `(${idleCount} idle tabs)`;
    memorySavedEl.textContent = `▼ ${(idleCount * 20).toFixed(0)} MB`;
  };

  // Clear clutter handler
  clearButton.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'clearClutter' }, () => {
      renderTabs();
      
      // Visual feedback
      clearButton.textContent = 'Done!';
      setTimeout(() => {
        clearButton.textContent = 'Clear Clutter Now';
      }, 1500);
    });
  });

  // Initial render
  renderTabs();
  setInterval(renderTabs, 3000); // Auto-refresh for live demo
});