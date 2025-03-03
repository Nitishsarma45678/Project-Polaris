class DashboardController {
    constructor() {
        this.history = [
            { type: 'text', content: 'Hello World', timestamp: new Date().toLocaleString() },
            { type: 'media', content: 'image.png', timestamp: new Date().toLocaleString() }
        ];
        this.initialize();
    }

    initialize() {
        this.cacheElements();
        this.setupEventListeners();
        this.loadTheme();
        this.loadSettings();
        this.renderHistory();
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
    }

    cacheElements() {
        this.sidebar = document.getElementById('sidebar');
        this.mainContent = document.querySelector('.main-content');
        this.themeToggle = document.getElementById('themeToggle');
        this.contextMenu = document.getElementById('contextMenu');
        this.uploadZone = document.getElementById('uploadZone');
        this.fileInput = document.getElementById('fileInput');
        this.wifiStatus = document.getElementById('wifiStatus');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.previewText = document.getElementById('previewText');
        this.previewImage = document.getElementById('previewImage');
        this.fileList = document.getElementById('fileList');
        this.brightness = document.getElementById('brightness');
        this.autoTheme = document.getElementById('autoTheme');
        this.saveSettings = document.getElementById('saveSettings');
        this.historyList = document.getElementById('historyList');
        this.profileSection = document.getElementById('profileSection');
    }

    setupEventListeners() {
        // Sidebar Toggle
        document.getElementById('sidebarToggle').addEventListener('click', () => {
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
        });

        // Send Button
        this.sendButton.addEventListener('click', () => {
            this.sendMessage();
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
        });
    }

    toggleSidebar() {
        this.sidebar.classList.toggle('collapsed');
        const toggleButton = document.getElementById('sidebarToggle');
        toggleButton.style.display = this.sidebar.classList.contains('collapsed') ? 'block' : 'none';
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
            setTimeout(() => {
                this.showSuccess('File uploaded (simulated)!');
                this.fileList.innerHTML = '';
                this.fileInput.value = '';
                this.addToHistory('media', file.name);
            }, 2000);
        }
    }

    sendMessage() {
        const message = this.messageInput.value.trim();
        if (message) {
            this.sendButton.disabled = true;
            this.sendButton.innerHTML = 'Sending...';
            setTimeout(() => {
                this.sendButton.disabled = false;
                this.sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>Send to Display';
                this.messageInput.value = '';
                this.previewText.textContent = 'Your message will appear here...';
                this.addToHistory('text', message);
                this.showSuccess('Message sent (simulated)!');
            }, 2000);
        }
    }

    addToHistory(type, content) {
        this.history.unshift({ type, content, timestamp: new Date().toLocaleString() });
        this.renderHistory();
    }

    renderHistory() {
        this.historyList.innerHTML = this.history.map(item => `
            <div class="history-item">
                <span>${item.type === 'text' ? 'Message' : 'File'}: ${item.content}</span>
                <span>${item.timestamp}</span>
            </div>
        `).join('');
    }

    updateClock() {
        document.getElementById('headerClock').textContent = new Date().toLocaleTimeString();
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