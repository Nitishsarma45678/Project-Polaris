class DashboardController {
    constructor() {
        this.initialize();
    }

    initialize() {
        this.cacheElements();
        this.setupEventListeners();
        this.loadTheme();
        this.simulateStatusUpdates();
    }

    cacheElements() {
        this.sidebar = document.getElementById('sidebar');
        this.mainContent = document.querySelector('.main-content');
        this.themeToggle = document.getElementById('themeToggle');
        this.contextMenu = document.getElementById('contextMenu');
        this.uploadZone = document.getElementById('uploadZone');
        this.fileInput = document.getElementById('fileInput');
        this.wifiStatus = document.getElementById('wifiStatus');
    }

    setupEventListeners() {
        // Sidebar Toggle
        document.getElementById('sidebarToggle').addEventListener('click', () => {
            this.toggleSidebar();
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
    }

    toggleSidebar() {
        this.sidebar.classList.toggle('collapsed');
        this.mainContent.style.marginLeft = this.sidebar.classList.contains('collapsed') 
            ? '0' 
            : '280px';
    }

    showContextMenu(e) {
        e.stopPropagation();
        this.contextMenu.style.display = 'block';
        
        // Position menu at click location
        const yPos = e.clientY + window.scrollY;
        const xPos = e.clientX + window.scrollX;
        
        // Ensure menu stays within viewport
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
        
        // Update the toggle based on the new theme
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
            
            console.log('Valid file:', file.name);
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        document.querySelector('.content-section').prepend(errorDiv);
        
        setTimeout(() => errorDiv.remove(), 5000);
    }

    simulateStatusUpdates() {
        setInterval(() => {
            this.wifiStatus.textContent = Math.random() > 0.1 
                ? '2.4GHz' 
                : 'Disconnected';
            this.wifiStatus.style.color = Math.random() > 0.1 
                ? 'var(--success)' 
                : 'var(--error)';
        }, 5000);
    }
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    new DashboardController();
});
