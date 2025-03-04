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

        this.initialize();
    }

    initialize() {
        this.cacheElements();
        this.setupEventListeners();
        this.loadTheme();
        this.loadSettings();
        this.renderHistory();
        this.renderSOSMessages();
        this.updateClock();
        this.simulateWifiStatus();
        this.simulateSOSMessages();
        setInterval(() => this.updateClock(), 1000);

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
        this.autoTheme = document.getElementById('autoTheme');
        this.saveSettings = document.getElementById('saveSettings');
        this.historyList = document.getElementById('historyList');
        this.sosList = document.getElementById('sosList');
        this.profileSection = document.getElementById('profileSection');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.clearButton = document.getElementById('clearButton');
        this.previewText = document.getElementById('previewText');
        this.previewImage = document.getElementById('previewImage');
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

        // Send Button
        this.sendButton.addEventListener('click', () => {
            this.sendMessage();
        });

        // Clear Button
        this.clearButton.addEventListener('click', () => {
            this.messageInput.value = '';
            this.previewText.textContent = 'Your message will appear here...';
            this.previewText.classList.remove('scrolling');
        });

        // Save Settings
        this.saveSettings.addEventListener('click', () => {
            const settings = {
                brightness: this.brightness.value,
                autoTheme: this.autoTheme.checked
            };
            localStorage.setItem('settings', JSON.stringify(settings));
            this.showSuccess('Settings saved (simulated)!');
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
            this.brightness.value = savedSettings.brightness;
            this.autoTheme.checked = savedSettings.autoTheme;
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
            this.sendButton.disabled = true;
            this.sendButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            setTimeout(() => {
                this.sendButton.disabled = false;
                this.sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>Send to Display';
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
        this.sosMessages.unshift({ message, timestamp: new Date().toLocaleString() });
        if (this.sosMessages.length > 50) {
            this.sosMessages.pop();
        }
        localStorage.setItem('sosMessages', JSON.stringify(this.sosMessages));
        this.renderSOSMessages();
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
        this.sosList.innerHTML = this.sosMessages.map(item => `
            <div class="sos-item">
                <span>${item.message}</span>
                <span>${item.timestamp}</span>
            </div>
        `).join('');
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
            'SOS: System Malfunction'
        ];
        setInterval(() => {
            const shouldSendSOS = Math.random() > 0.7; // 30% chance every 10 seconds
            if (shouldSendSOS) {
                const randomMessage = predefinedMessages[Math.floor(Math.random() * predefinedMessages.length)];
                this.addSOSMessage(randomMessage);
                this.showError(randomMessage + ' (simulated)');
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