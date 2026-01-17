document.addEventListener('DOMContentLoaded', async () => {
  const tabsList = document.getElementById('tabs-list');
  const clearButton = document.getElementById('clear-clutter');
  const idleCountEl = document.querySelector('.idle-count');
  const memorySavedEl = document.querySelector('.memory-saved');

  const renderTabs = async () => {
    const tabs = await chrome.tabs.query({});
    const storageData = await chrome.storage.local.get(null);
    const now = Date.now();
    let idleCount = 0;
    let estimatedMemory = 0;

    tabsList.innerHTML = '';
    
    tabs.forEach(tab => {
      const lastActive = storageData[`tab_${tab.id}`] || now;
      const isDiscarded = tab.discarded; 
      const isIdleTime = (now - lastActive) > (5 * 60 * 1000);
      
      const showAsIdle = (isIdleTime || isDiscarded) && !tab.active && !tab.pinned && !tab.audible;
      
      if (showAsIdle) {
        idleCount++;
        estimatedMemory += tab.url.includes('youtube.com') ? 150 : 40;
      }
      
      const tabEl = document.createElement('div');
      tabEl.className = `tab-item ${showAsIdle ? 'idle' : ''}`;
      
      let hostname = "New Tab";
      try { hostname = new URL(tab.url).hostname; } catch(e){}

      tabEl.innerHTML = `
        <div>
          <div class="tab-title">${tab.title || 'Loading...'}</div>
          <div class="tab-url">${hostname}</div>
        </div>
        ${showAsIdle ? '<span class="status-badge">💤</span>' : ''}
      `;
      tabsList.appendChild(tabEl);
    });

    idleCountEl.textContent = `(${idleCount} idle tabs)`;
    memorySavedEl.textContent = `▼ ${estimatedMemory} MB`; 
  };

  clearButton.addEventListener('click', () => {
    clearButton.textContent = 'Freezing...';
    chrome.runtime.sendMessage({ action: 'clearClutter' }, (response) => {
      if (chrome.runtime.lastError) {
        console.warn("Background worker waking up...");
        // Small retry logic for fault proofing
        setTimeout(() => clearButton.click(), 500);
        return;
      }
      if (response?.success) {
        renderTabs();
        clearButton.textContent = 'Done!';
        setTimeout(() => { clearButton.textContent = '🧹 Clear Clutter Now'; }, 1500);
      }
    });
  });

  // Initial render
  renderTabs();

  // Event-driven UI updates
  chrome.tabs.onUpdated.addListener(renderTabs);
  chrome.tabs.onRemoved.addListener(renderTabs);
  chrome.tabs.onActivated.addListener(renderTabs);
});