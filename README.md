**About**
TabTamer is a browser extension built on the Chrome Manifest V3 framework. Its primary function is to manage browser resources by automatically suspending tabs that have been inactive for a specified period. By leveraging native browser APIs, the extension reduces the memory and CPU footprint of the browser without requiring the user to manually close tabs they intend to revisit.

**TLDR**
The extension identifies tabs that are not currently in focus, are not playing audio, and are not pinned. After five minutes of inactivity, these tabs are "discarded." This state preserves the tab in the browser's tab strip but terminates its active process, effectively reclaiming the RAM previously occupied by the web page.

**Motivation and Goals**
The modern web environment has shifted significantly toward resource-intensive web applications. It is common for a single browser tab to consume several hundred megabytes of memory. For users who maintain dozens or even hundreds of tabs simultaneously, this leads to:

-System Slowdown: High RAM usage forces the operating system to use disk swapping, which significantly degrades performance (THANKS CHROME)
-Battery Drain: Background tabs often continue to execute JavaScript tasks, putting a constant load on the CPU and reducing the battery life of portable devices.
-Browser Instability: Excessive resource consumption can lead to browser crashes or "Aw, Snap!" errors.

**Technical Implementation**
In order to achieve maximum efficiency, the project was designed with the following technical principles:

-Ephemeral Background Processing: The extension utilizes a Service Worker rather than a persistent background page. This ensures that the extension itself consumes zero resources when it is not actively processing tab states.

-Native Discarding: Instead of replacing web pages with internal HTML stubs, the extension uses the native chrome.tabs.discard API. This is the most efficient method for memory recovery supported by the Chromium engine.

-Alarm-Based Scheduling: Rather than using continuous JavaScript loops, the extension relies on the chrome.alarms API. This allows the browser to wake the extension only when a check is required, further reducing CPU wakeups.

-Event-Driven UI: The popup interface is built to respond to browser events (tab updates and activations) rather than polling for data on a timer.

**Usage**
Once installed, the extension begins monitoring tab activity immediately. Users can open the popup to view a list of currently open tabs, see which tabs are considered idle, and view an estimate of the total memory saved by the taming process. No information is collected and sent to any third party whatsoever. 
