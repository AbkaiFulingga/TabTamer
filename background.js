const IDLE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const ALARM_NAME = "check_idle_tabs";

// 1. Setup alarm
chrome.alarms.create(ALARM_NAME, { periodInMinutes: 1 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) {
    freezeIdleTabs();
  }
});

// 2. Proactive freezing when system is idle (User walks away from computer or the window))
chrome.idle.onStateChanged.addListener((state) => {
  if (state === "idle" || state === "locked") {
    freezeIdleTabs();
  }
});

// 3. Activity tracking
const updateLastActive = async (tabId) => {
  const key = `tab_${tabId}`;
  await chrome.storage.local.set({ [key]: Date.now() });
};

chrome.tabs.onActivated.addListener(({ tabId }) => updateLastActive(tabId));
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'complete') updateLastActive(tabId);
});

// 4. Memory cleanup (Deletes data when tab is closed)
chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.storage.local.remove(`tab_${tabId}`);
});

// 5. The core freezing logic
async function freezeIdleTabs() {
  const tabs = await chrome.tabs.query({ 
    active: false, 
    pinned: false, 
    audible: false, 
    discarded: false 
  });

  const now = Date.now();
  const data = await chrome.storage.local.get(null);

  for (const tab of tabs) {
    const lastActive = data[`tab_${tab.id}`];
    
    if (!lastActive) {
      updateLastActive(tab.id);
      continue;
    }

    if ((now - lastActive) > IDLE_TIMEOUT_MS) {
      try {
        await chrome.tabs.discard(tab.id);
        console.log(`Discarded tab: ${tab.title}`);
      } catch (e) {
        // Silently fail if tab is no longer available
      }
    }
  }
}

// 6. Listen for manual "Clear Clutter" from Popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'clearClutter') {
    freezeIdleTabs().then(() => sendResponse({ success: true }));
    return true; // Required for async response
  }
});