class DashboardController {
    constructor() {
        try {
            this.history = JSON.parse(localStorage.getItem('history')) || [
                { type: 'text', content: 'Hello World', timestamp: new Date().toLocaleString() },
                { type: 'media', content: 'image.png', timestamp: new Date().toLocaleString() }
            ];
        } catch (e) {
            console.error('Failed to parse history from localStorage:', e);
            this.history = [
                { type: 'text', content: 'Hello World', timestamp: new Date().toLocaleString() },
                { type: 'media', content: 'image.png', timestamp: new Date().toLocaleString() }
            ];
        }

        try {
            this.sosMessages = JSON.parse(localStorage.getItem('sosMessages')) || [];
        } catch (e) {
            console.error('Failed to parse SOS messages from localStorage:', e);
            this.sosMessages = [];
        }

        try {
            this.scheduledMessages = JSON.parse(localStorage.getItem('scheduledMessages')) || [];
        } catch (e) {
            console.error('Failed to parse scheduled messages from localStorage:', e);
            this.scheduledMessages = [];
        }

        this.isScheduleMode = false; // Track whether we're in schedule mode

        this.initialize();
    }

    initialize() {
        this.cacheElements();
        this.setupEventListeners();
        this.loadTheme();
        this.loadSettings();
        this.loadPreviewSettings();
        this.renderHistory();
        this.renderSOSMessages();
        this.renderScheduledMessages();
        this.updateClock();
        this.simulateWifiStatus();
        this.simulateSOSMessages();
        this.simulateDeviceStatus();
        this.processScheduledMessages();
        setInterval(() => this.updateClock(), 1000);
        setInterval(() => this.processScheduledMessages(), 1000);

        setTimeout(() => {
            document.getElementById('loadingOverlay').style.display = 'none';
        }, 1000);
    }

    cacheElements() {
        this.sidebar = document.getElementById('sidebar');
        this.mainContent = document.querySelector('.main-content');
        this.sidebarToggle = document.getElementById('sidebarToggle');
        this.togglePlaceholder = document.getElementById('togglePlaceholder');
        this.themeToggle = document.getElementById('themeToggle');
        this.contextMenu = document.getElementById('contextMenu');
        this.uploadZone = document.getElementById('uploadZone');
        this.fileInput = document.getElementById('fileInput');
        this.wifiStatus = document.getElementById('wifiStatus');
        this.brightness = document.getElementById('brightness');
        this.brightnessValue = document.getElementById('brightnessValue');
        this.scrollSpeed = document.getElementById('scrollSpeed');
        this.scrollSpeedValue = document.getElementById('scrollSpeedValue');
        this.fontSizeSetting = document.getElementById('fontSizeSetting');
        this.messageDuration = document.getElementById('messageDuration');
        this.messageDurationValue = document.getElementById('messageDurationValue');
        this.themeSelector = document.getElementById('themeSelector');
        this.accentColor = document.getElementById('accentColor');
        this.autoTheme = document.getElementById('autoTheme');
        this.saveSettings = document.getElementById('saveSettings');
        this.historyList = document.getElementById('historyList');
        this.sosList = document.getElementById('sosList');
        this.sosPlaceholder = document.getElementById('sosPlaceholder');
        this.clearSOSButton = document.getElementById('clearSOSButton');
        this.toggleScheduleMode = document.getElementById('toggleScheduleMode');
        this.scheduleOptions = document.getElementById('scheduleOptions');
        this.scheduleTime = document.getElementById('scheduleTime');
        this.actionButton = document.getElementById('actionButton');
        this.scheduleList = document.getElementById('scheduleList');
        this.deviceBattery = document.getElementById('deviceBattery');
        this.deviceTemperature = document.getElementById('deviceTemperature');
        this.deviceUptime = document.getElementById('deviceUptime');
        this.textAlign = document.getElementById('textAlign');
        this.fontSize = document.getElementById('fontSize');
        this.backgroundColor = document.getElementById('backgroundColor');
        this.profileSection = document.getElementById('profileSection');
        this.messageInput = document.getElementById('messageInput');
        this.clearButton = document.getElementById('clearButton');
        this.previewText = document.getElementById('previewText');
        this.previewImage = document.getElementById('previewImage');
        this.previewContent = document.getElementById('previewContent');
        this.fileList = document.getElementById('fileList');
        this.uploadPreview = document.getElementById('uploadPreview');
        this.uploadPreviewImage = document.getElementById('uploadPreviewImage');
    }

    setupEventListeners() {
        // Sidebar Toggle
        this.sidebarToggle.addEventListener('click', () => {
            this.toggleSidebar();
        });

        // Sidebar Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
                item.classList.add('active');
                const section = item.getAttribute('data-section');
                this.showSection(section);
            });
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    item.click();
                }
            });
        });

        // Context Menu
        document.getElementById('contextMenuTrigger').addEventListener('click', (e) => {
            this.showContextMenu(e);
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.context-menu') && !e.target.closest('#contextMenuTrigger')) {
                this.hideContextMenu();
            }
        });

        // Theme Toggle
        this.themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });

        // File Handling
        this.setupFileHandling();

        // Message Input Preview
        this.messageInput.addEventListener('input', () => {
            this.previewText.textContent = this.messageInput.value || 'Your message will appear here...';
            this.previewImage.style.display = 'none';
            this.previewText.style.display = 'block';
            if (this.messageInput.value.length > 20) {
                this.previewText.classList.add('scrolling');
            } else {
                this.previewText.classList.remove('scrolling');
            }
        });

        // Toggle Schedule Mode
        this.toggleScheduleMode.addEventListener('click', () => {
            this.isScheduleMode = !this.isScheduleMode;
            if (this.isScheduleMode) {
                this.scheduleOptions.style.display = 'block';
                this.actionButton.innerHTML = '<i class="fas fa-calendar-plus"></i> Schedule';
                this.toggleScheduleMode.innerHTML = '<i class="fas fa-paper-plane"></i> Send Now';
            } else {
                this.scheduleOptions.style.display = 'none';
                this.actionButton.innerHTML = '<i class="fas fa-paper-plane"></i> Send to Display';
                this.toggleScheduleMode.innerHTML = '<i class="fas fa-clock"></i> Schedule';
                this.scheduleTime.value = '';
            }
        });

        // Action Button (Send or Schedule)
        this.actionButton.addEventListener('click', () => {
            if (this.isScheduleMode) {
                this.scheduleMessage();
            } else {
                this.sendMessage();
            }
        });

        // Clear Button
        this.clearButton.addEventListener('click', () => {
            this.messageInput.value = '';
            this.scheduleTime.value = '';
            this.previewText.textContent = 'Your message will appear here...';
            this.previewText.classList.remove('scrolling');
        });

        // Clear SOS Button
        this.clearSOSButton.addEventListener('click', () => {
            this.sosMessages = [];
            localStorage.setItem('sosMessages', JSON.stringify(this.sosMessages));
            this.renderSOSMessages();
        });

        // Preview Customization
        this.textAlign.addEventListener('change', () => {
            this.previewText.style.textAlign = this.textAlign.value;
            localStorage.setItem('previewTextAlign', this.textAlign.value);
        });

        this.fontSize.addEventListener('change', () => {
            this.previewText.style.fontSize = this.fontSize.value;
            localStorage.setItem('previewFontSize', this.fontSize.value);
        });

        this.backgroundColor.addEventListener('change', () => {
            this.previewContent.style.background = this.backgroundColor.value;
            localStorage.setItem('previewBackgroundColor', this.backgroundColor.value);
        });

        // Display Settings
        this.scrollSpeed.addEventListener('input', () => {
            this.scrollSpeedValue.textContent = `${this.scrollSpeed.value}s`;
            this.applyScrollSpeed();
        });

        this.fontSizeSetting.addEventListener('change', () => {
            this.previewText.style.fontSize = this.fontSizeSetting.value;
        });

        this.brightness.addEventListener('input', () => {
            this.brightnessValue.textContent = `${this.brightness.value}%`;
        });

        this.messageDuration.addEventListener('input', () => {
            this.messageDurationValue.textContent = `${this.messageDuration.value}s`;
        });

        // Theme Customization
        this.themeSelector.addEventListener('change', () => {
            const theme = this.themeSelector.value;
            if (theme === 'green') {
                document.documentElement.style.setProperty('--accent', '#10B981');
            } else if (theme === 'purple') {
                document.documentElement.style.setProperty('--accent', '#A855F7');
            } else {
                document.documentElement.style.setProperty('--accent', '#6366F1');
            }
        });

        this.accentColor.addEventListener('input', () => {
            document.documentElement.style.setProperty('--accent', this.accentColor.value);
        });

        // Save Settings
        this.saveSettings.addEventListener('click', () => {
            const settings = {
                scrollSpeed: this.scrollSpeed.value,
                fontSize: this.fontSizeSetting.value,
                brightness: this.brightness.value,
                messageDuration: this.messageDuration.value,
                theme: this.themeSelector.value,
                accentColor: this.accentColor.value,
                autoTheme: this.autoTheme.checked
            };
            localStorage.setItem('settings', JSON.stringify(settings));
            this.showSuccess('Settings saved!');
        });

        // Context Menu Actions
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', () => {
                const action = item.getAttribute('data-action');
                if (action === 'profile') {
                    this.showSection('profile');
                } else if (action === 'settings') {
                    this.showSection('settings');
                } else if (action === 'logout') {
                    localStorage.removeItem('user');
                    this.showSuccess('Logged out successfully (simulated).');
                }
            });
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    item.click();
                }
            });
        });
    }

    applyScrollSpeed() {
        const duration = this.scrollSpeed.value;
        this.previewText.style.animationDuration = `${duration}s`;
        document.documentElement.style.setProperty('--scroll-duration', `${duration}s`);
    }

    loadPreviewSettings() {
        const textAlign = localStorage.getItem('previewTextAlign') || 'center';
        const fontSize = localStorage.getItem('previewFontSize') || '1rem';
        const backgroundColor = localStorage.getItem('previewBackgroundColor') || '#1A1F36';

        this.textAlign.value = textAlign;
        this.fontSize.value = fontSize;
        this.backgroundColor.value = backgroundColor;

        this.previewText.style.textAlign = textAlign;
        this.previewText.style.fontSize = fontSize;
        this.previewContent.style.background = backgroundColor;
    }

    scheduleMessage() {
        const message = this.messageInput.value.trim();
        const time = this.scheduleTime.value;

        if (!message || !time) {
            this.showError('Please enter a message and select a time.');
            return;
        }

        const scheduleTime = new Date(time).getTime();
        const now = new Date().getTime();

        if (scheduleTime <= now) {
            this.showError('Please select a future time.');
            return;
        }

        const scheduledMessage = {
            message,
            time: scheduleTime,
            timestamp: new Date(scheduleTime).toLocaleString()
        };

        this.scheduledMessages.push(scheduledMessage);
        localStorage.setItem('scheduledMessages', JSON.stringify(this.scheduledMessages));
        this.renderScheduledMessages();
        this.showSuccess('Message scheduled!');

        this.messageInput.value = '';
        this.scheduleTime.value = '';
    }

    renderScheduledMessages() {
        this.scheduleList.innerHTML = this.scheduledMessages.map((item, index) => `
            <div class="schedule-item">
                <span>${item.message} - ${item.timestamp}</span>
                <button data-index="${index}" class="cancel-schedule"><i class="fas fa-trash"></i></button>
            </div>
        `).join('');

        // Add event listeners for cancel buttons
        this.scheduleList.querySelectorAll('.cancel-schedule').forEach(button => {
            button.addEventListener('click', () => {
                const index = button.getAttribute('data-index');
                this.scheduledMessages.splice(index, 1);
                localStorage.setItem('scheduledMessages', JSON.stringify(this.scheduledMessages));
                this.renderScheduledMessages();
            });
        });
    }

    processScheduledMessages() {
        const now = new Date().getTime();
        this.scheduledMessages = this.scheduledMessages.filter(item => {
            if (now >= item.time) {
                this.sendScheduledMessage(item.message);
                return false; // Remove the message after sending
            }
            return true;
        });
        localStorage.setItem('scheduledMessages', JSON.stringify(this.scheduledMessages));
        this.renderScheduledMessages();
    }

    sendScheduledMessage(message) {
        this.previewText.textContent = message;
        this.previewImage.style.display = 'none';
        this.previewText.style.display = 'block';
        if (message.length > 20) {
            this.previewText.classList.add('scrolling');
        } else {
            this.previewText.classList.remove('scrolling');
        }
        this.addToHistory('text', message);
        this.showSuccess(`Scheduled message sent: ${message}`);
    }

    simulateDeviceStatus() {
        setInterval(() => {
            const battery = Math.floor(Math.random() * 100);
            const temperature = Math.floor(Math.random() * 40);
            const uptimeMinutes = Math.floor(Math.random() * 120);
            const hours = Math.floor(uptimeMinutes / 60);
            const minutes = uptimeMinutes % 60;

            this.deviceBattery.textContent = `${battery}%`;
            this.deviceTemperature.textContent = `${temperature}°C`;
            this.deviceUptime.textContent = `${hours}h ${minutes}m`;
        }, 10000); // Update every 10 seconds
    }

    toggleSidebar() {
        this.sidebar.classList.toggle('collapsed');
        if (this.sidebar.classList.contains('collapsed')) {
            this.togglePlaceholder.appendChild(this.sidebarToggle);
            this.sidebarToggle.innerHTML = '<i class="fas fa-bars"></i>';
            this.mainContent.style.marginLeft = '0';
        } else {
            document.querySelector('.sidebar-header').appendChild(this.sidebarToggle);
            this.sidebarToggle.innerHTML = '<i class="fas fa-times"></i>';
            this.mainContent.style.marginLeft = '280px';
        }
    }

    showSection(section) {
        document.querySelectorAll('.content-section, .settings-panel, .history-panel, .profile-panel').forEach(el => {
            el.style.display = 'none';
        });
        document.getElementById(`${section}Section`).style.display = section === 'profile' ? 'block' : 'grid';
    }

    showContextMenu(e) {
        e.stopPropagation();
        this.contextMenu.style.display = 'block';
        const yPos = e.clientY + window.scrollY;
        const xPos = e.clientX + window.scrollX;
        const viewportWidth = window.innerWidth;
        const menuWidth = this.contextMenu.offsetWidth;
        this.contextMenu.style.top = `${yPos}px`;
        this.contextMenu.style.left = `${Math.min(xPos, viewportWidth - menuWidth - 10)}px`;
    }

    hideContextMenu() {
        this.contextMenu.style.display = 'none';
    }

    toggleTheme() {
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        const newTheme = isDark ? 'light' : 'dark';
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.themeToggle.innerHTML = newTheme === 'dark'
            ? '<i class="fas fa-moon"></i><span>Dark Mode</span>'
            : '<i class="fas fa-sun"></i><span>Light Mode</span>';
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.body.setAttribute('data-theme', savedTheme);
        this.themeToggle.innerHTML = savedTheme === 'dark'
            ? '<i class="fas fa-moon"></i><span>Dark Mode</span>'
            : '<i class="fas fa-sun"></i><span>Light Mode</span>';
    }

    loadSettings() {
        const savedSettings = JSON.parse(localStorage.getItem('settings'));
        if (savedSettings) {
            this.scrollSpeed.value = savedSettings.scrollSpeed || 5;
            this.scrollSpeedValue.textContent = `${this.scrollSpeed.value}s`;
            this.fontSizeSetting.value = savedSettings.fontSize || '1rem';
            this.brightness.value = savedSettings.brightness || 50;
            this.brightnessValue.textContent = `${this.brightness.value}%`;
            this.messageDuration.value = savedSettings.messageDuration || 30;
            this.messageDurationValue.textContent = `${this.messageDuration.value}s`;
            this.themeSelector.value = savedSettings.theme || 'default';
            this.accentColor.value = savedSettings.accentColor || '#6366F1';
            this.autoTheme.checked = savedSettings.autoTheme || false;

            // Apply settings
            this.applyScrollSpeed();
            this.previewText.style.fontSize = this.fontSizeSetting.value;
            document.documentElement.style.setProperty('--accent', this.accentColor.value);
        }
    }

    setupFileHandling() {
        const preventDefaults = (e) => {
            e.preventDefault();
            e.stopPropagation();
        };

        ['dragenter', 'dragover'].forEach(event => {
            this.uploadZone.addEventListener(event, (e) => {
                preventDefaults(e);
                this.uploadZone.classList.add('dragover');
            });
        });

        ['dragleave', 'drop'].forEach(event => {
            this.uploadZone.addEventListener(event, (e) => {
                preventDefaults(e);
                this.uploadZone.classList.remove('dragover');
            });
        });

        this.uploadZone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            this.handleFiles(files);
        });

        this.fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });
    }

    handleFiles(files) {
        if (files.length > 0) {
            const file = files[0];
            const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!validTypes.includes(file.type)) {
                this.showError('Invalid file type. Supported formats: JPEG, PNG, GIF');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                this.showError('File size exceeds 5MB limit');
                return;
            }
            this.fileList.innerHTML = `<div>${file.name}</div>`;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                this.uploadPreviewImage.src = e.target.result;
                this.uploadPreview.style.display = 'block';
                this.previewImage.src = e.target.result;
                this.previewImage.style.display = 'block';
                this.previewText.style.display = 'none';
            };
            reader.readAsDataURL(file);

            setTimeout(() => {
                this.showSuccess('File uploaded (simulated)!');
                this.fileList.innerHTML = '';
                this.fileInput.value = '';
                this.uploadPreview.style.display = 'none';
                this.previewImage.style.display = 'none';
                this.previewText.style.display = 'block';
                this.addToHistory('media', file.name);
            }, 2000);
        }
    }

    sendMessage() {
        const message = this.messageInput.value.trim();
        if (message) {
            this.actionButton.disabled = true;
            this.actionButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            setTimeout(() => {
                this.actionButton.disabled = false;
                this.actionButton.innerHTML = this.isScheduleMode
                    ? '<i class="fas fa-calendar-plus"></i> Schedule'
                    : '<i class="fas fa-paper-plane"></i> Send to Display';
                this.messageInput.value = '';
                this.previewText.textContent = 'Your message will appear here...';
                this.previewText.classList.remove('scrolling');
                this.addToHistory('text', message);
                this.showSuccess('Message sent (simulated)!');
            }, 2000);
        }
    }

    addToHistory(type, content) {
        this.history.unshift({ type, content, timestamp: new Date().toLocaleString() });
        if (this.history.length > 50) {
            this.history.pop();
        }
        localStorage.setItem('history', JSON.stringify(this.history));
        this.renderHistory();
    }

    addSOSMessage(message) {
        this.sosMessages.unshift({ message, timestamp: new Date().toLocaleString(), isNew: true });
        if (this.sosMessages.length > 50) {
            this.sosMessages.pop();
        }
        localStorage.setItem('sosMessages', JSON.stringify(this.sosMessages));
        this.renderSOSMessages();
        this.showError(message + ' (simulated)');
    }

    renderHistory() {
        this.historyList.innerHTML = this.history.map(item => `
            <div class="history-item">
                <span>${item.type === 'text' ? 'Message' : 'File'}: ${item.content}</span>
                <span>${item.timestamp}</span>
            </div>
        `).join('');
    }

    renderSOSMessages() {
        if (this.sosMessages.length === 0) {
            this.sosPlaceholder.style.display = 'block';
            this.sosList.innerHTML = '<p class="sos-placeholder" id="sosPlaceholder">No SOS alerts received.</p>';
        } else {
            this.sosPlaceholder.style.display = 'none';
            this.sosList.innerHTML = this.sosMessages.map(item => `
                <div class="sos-item ${item.isNew ? 'new' : ''}">
                    <span>${item.message}</span>
                    <span>${item.timestamp}</span>
                </div>
            `).join('');
            this.sosMessages.forEach(msg => msg.isNew = false);
            localStorage.setItem('sosMessages', JSON.stringify(this.sosMessages));
        }
    }

    updateClock() {
        document.getElementById('headerClock').textContent = new Date().toLocaleTimeString();
    }

    simulateWifiStatus() {
        setInterval(() => {
            const isConnected = Math.random() > 0.3;
            this.wifiStatus.textContent = isConnected ? '2.4GHz' : 'Disconnected';
            this.wifiStatus.classList.remove('connected', 'disconnected');
            this.wifiStatus.classList.add(isConnected ? 'connected' : 'disconnected');
        }, 5000);
    }

    simulateSOSMessages() {
        const predefinedMessages = [
            'Emergency: Fire Alert',
            'Help Needed: Medical Emergency',
            'Alert: Power Failure',
            'Warning: Unauthorized Access',
            'SOS: System Malfunction',
            'Lost: Locate Me, I am Lost'
        ];
        setInterval(() => {
            const shouldSendSOS = Math.random() > 0.7;
            if (shouldSendSOS) {
                const randomMessage = predefinedMessages[Math.floor(Math.random() * predefinedMessages.length)];
                this.addSOSMessage(randomMessage);
            }
        }, 10000);
    }

    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        document.querySelector('.content-section').prepend(successDiv);
        setTimeout(() => successDiv.remove(), 5000);
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        document.querySelector('.content-section').prepend(errorDiv);
        setTimeout(() => errorDiv.remove(), 5000);
    }
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    new DashboardController();
});