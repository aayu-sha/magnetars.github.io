class Portfolio3D {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.currentSection = 'home';
        this.isLoading = true;
        this.loadingProgress = 0;
        this.mouse = new THREE.Vector2();
        this.targetMouse = new THREE.Vector2(); // Smoothed mouse position
        this.visualizations = {};
        this.isMobile = this.detectMobile();
        this.scrollTimeout = null;
        this.resizeTimeout = null;
        this.ticking = false;
        
        this.init();
    }
    
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
               window.innerWidth <= 768 || 
               'ontouchstart' in window;
    }
    
    async init() {
        try {
            // Show loading screen immediately
            this.showLoadingScreen();
            await this.initLoading();
            this.initScene();
            this.initEventListeners();
            this.createVisualizations();
            this.animate();
            await this.finishLoading();
        } catch (error) {
            console.error('Portfolio initialization error:', error);
            this.handleError(error);
        }
    }
    
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
            loadingScreen.style.opacity = '1';
        }
    }
    
    async initLoading() {
        const loadingSteps = [
            'Loading 3D Engine...',
            'Creating Magnetar Visualization...',
            'Building Neural Networks...',
            'Generating Star Fields...',
            'Finalizing Experience...'
        ];
        
        for (let i = 0; i < loadingSteps.length; i++) {
            await this.updateLoadingProgress((i + 1) / loadingSteps.length, loadingSteps[i]);
            await new Promise(resolve => setTimeout(resolve, 300));
        }
    }
    
    updateLoadingProgress(progress, text) {
        this.loadingProgress = progress;
        const progressBar = document.getElementById('progressBar');
        const loadingText = document.getElementById('loadingText');
        
        if (progressBar) progressBar.style.width = `${progress * 100}%`;
        if (loadingText) loadingText.textContent = text;
        
        return Promise.resolve();
    }
    
    async finishLoading() {
        await new Promise(resolve => setTimeout(resolve, 500));
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                this.isLoading = false;
                this.triggerSectionAnimations();
            }, 1000);
        }
    }
    
    initScene() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true,
            powerPreference: 'high-performance' // Better GPU usage
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        const webglContainer = document.getElementById('webgl');
        if (webglContainer) {
            webglContainer.appendChild(this.renderer.domElement);
        }
        
        // Camera position
        this.camera.position.z = 100;
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
        directionalLight.position.set(1, 1, 1);
        this.scene.add(directionalLight);
    }
    
    createVisualizations() {
        if (!this.scene) return;
        try {
            this.visualizations.magnetar = this.createMagnetarVisualization();
            this.visualizations.neuralNetwork = this.createNeuralNetworkVisualization();
            this.visualizations.starField = this.createStarField();
        } catch (error) {
            console.warn('Visualization creation failed:', error);
        }
    }
    
    createMagnetarVisualization() {
        const group = new THREE.Group();
        const coreGeometry = new THREE.IcosahedronGeometry(20, this.isMobile ? 5 : 10);
        const coreMaterial = new THREE.MeshStandardMaterial({
            color: 0x62e7d8,
            metalness: 0.8,
            roughness: 0.2,
            emissive: 0x006060,
            emissiveIntensity: 0.5
        });
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        group.add(core);
        const fieldGroup = new THREE.Group();
        const fieldColors = [0x62e7d8, 0x00ffff, 0x4169e1];
        const fieldLineCount = this.isMobile ? 30 : 100;
        for (let i = 0; i < fieldLineCount; i++) {
            const lineGeometry = new THREE.BufferGeometry();
            const lineMaterial = new THREE.LineBasicMaterial({ 
                color: fieldColors[i % fieldColors.length], 
                transparent: true, 
                opacity: 0.3 
            });
            const positions = [];
            const radius = 90 + Math.random() * 10;
            const twists = 10 + Math.random() * 3;
            const pointCount = this.isMobile ? 50 : 100;
            for (let j = 0; j < pointCount; j++) {
                const t = j / (pointCount - 1);
                const angle = t * Math.PI * twists * 2;
                const x = radius * Math.cos(angle) * (1 - t);
                const y = radius * Math.sin(angle) * (1 - t);
                const z = t * 50 - 25 + Math.sin(t * Math.PI * 4) * 10;
                positions.push(x, y, z);
            }
            lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            const line = new THREE.Line(lineGeometry, lineMaterial);
            fieldGroup.add(line);
        }
        group.add(fieldGroup);
        this.scene.add(group);
        return { core, fieldGroup, group };
    }
    
    createNeuralNetworkVisualization() {
        const group = new THREE.Group();
        const layers = this.isMobile ? [3, 8, 5, 4, 5, 8, 3] : [5, 16, 9, 8, 8, 9, 16, 5];
        const nodeGeometry = new THREE.SphereGeometry(1, this.isMobile ? 8 : 16, this.isMobile ? 8 : 16);
        const nodeMaterial = new THREE.MeshStandardMaterial({
            color: 0x62e7d8,
            emissive: 0x006060,
            emissiveIntensity: 0.5
        });
        const nodes = [];
        const connections = [];
        for (let l = 0; l < layers.length; l++) {
            const layerNodes = [];
            const layerSize = layers[l];
            const xPos = (l - (layers.length - 1) / 2) * (this.isMobile ? 20 : 30);
            for (let i = 0; i < layerSize; i++) {
                const yPos = (i - (layerSize - 1) / 2) * (this.isMobile ? 8 : 10);
                const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
                node.position.set(xPos, yPos, 0);
                group.add(node);
                layerNodes.push(node);
                if (l > 0) {
                    const prevLayer = nodes[l - 1];
                    for (let j = 0; j < prevLayer.length; j++) {
                        const connectionGeometry = new THREE.BufferGeometry();
                        const lineMaterial = new THREE.LineBasicMaterial({
                            color: 0x4169e1,
                            transparent: true,
                            opacity: 0.2
                        });
                        const points = [
                            prevLayer[j].position.clone(),
                            node.position.clone()
                        ];
                        connectionGeometry.setFromPoints(points);
                        const line = new THREE.Line(connectionGeometry, lineMaterial);
                        group.add(line);
                        connections.push(line);
                    }
                }
            }
            nodes.push(layerNodes);
        }
        group.position.z = -50;
        group.visible = false;
        this.scene.add(group);
        return { group, nodes, connections };
    }
    
    createStarField() {
        const starGroup = new THREE.Group();
        const starGeometry = new THREE.BufferGeometry();
        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: this.isMobile ? 0.5 : 0.8,
            transparent: true,
            opacity: 0.7
        });
        const starVertices = [];
        const starCount = this.isMobile ? 5000 : 10000;
        for (let i = 0; i < starCount; i++) {
            const x = (Math.random() - 0.5) * 1000;
            const y = (Math.random() - 0.5) * 1000;
            const z = (Math.random() - 0.5) * 1000;
            starVertices.push(x, y, z);
        }
        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        const starField = new THREE.Points(starGeometry, starMaterial);
        starGroup.add(starField);
        this.scene.add(starGroup);
        return starGroup;
    }
    
    initEventListeners() {
        // Mouse movement - only for non-touch devices
        if (!this.isMobile) {
            window.addEventListener('mousemove', (e) => this.onMouseMove(e), false);
        }
        
        // Window resize
        window.addEventListener('resize', () => this.onWindowResize(), false);
        
        // Scroll events
        window.addEventListener('scroll', () => this.onScroll(), { passive: true });
        
        // Navigation
        this.initNavigation();
        
        // Custom cursor - only for non-mobile devices
        if (!this.isMobile) {
            this.initCustomCursor();
        }
        
        // Contact form
        this.initContactForm();
        
        // Intersection Observer for animations
        this.initIntersectionObserver();
    }
    
    initNavigation() {
        const menuToggle = document.getElementById('menuToggle');
        const navLinks = document.getElementById('navLinks');
        const navLinksItems = document.querySelectorAll('.nav-link');
        const progressDots = document.querySelectorAll('.progress-dot');
        
        // Mobile menu toggle
        if (menuToggle && navLinks) {
            menuToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
                menuToggle.setAttribute('aria-expanded', !isExpanded);
                navLinks.classList.toggle('active');
                menuToggle.classList.toggle('active');
                
                // Prevent body scroll when menu is open
                if (!isExpanded) {
                    document.body.style.overflow = 'hidden';
                } else {
                    document.body.style.overflow = '';
                }
            });
            
            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
                    navLinks.classList.remove('active');
                    menuToggle.classList.remove('active');
                    menuToggle.setAttribute('aria-expanded', 'false');
                    document.body.style.overflow = '';
                }
            });
        }
        
        // Navigation link clicks
        navLinksItems.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.navigateToSection(section);
                
                // Close mobile menu
                if (navLinks) {
                    navLinks.classList.remove('active');
                    document.body.style.overflow = '';
                }
                if (menuToggle) {
                    menuToggle.classList.remove('active');
                    menuToggle.setAttribute('aria-expanded', 'false');
                }
            });
        });
        
        // Progress dot clicks
        progressDots.forEach(dot => {
            dot.addEventListener('click', () => {
                const section = dot.getAttribute('data-section');
                this.navigateToSection(section);
            });
        });
    }
    
    initCustomCursor() {
        // Skip cursor initialization on touch devices
        if (this.isMobile) return;
        
        const cursor = document.getElementById('cursor');
        if (!cursor) return;
        
        document.addEventListener('mousemove', (e) => {
            if (window.gsap) {
                gsap.to(cursor, {
                    x: e.clientX - 8,
                    y: e.clientY - 8,
                    duration: 0.2,
                    ease: "power2.out"
                });
            }
        });
        
        // Hover effects
        const hoverElements = document.querySelectorAll('a, button, .project-item');
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
        });
    }
    
    initContactForm() {
        const form = document.getElementById('contactForm');
        const submitBtn = document.getElementById('submitBtn');
        const formStatus = document.getElementById('formStatus');
        
        if (!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!this.validateForm(form)) return;
            
            this.setFormLoading(true);
            
            try {
                // Simulate form submission
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                this.showFormStatus('Message sent successfully!', 'success');
                form.reset();
                
            } catch (error) {
                this.showFormStatus('Failed to send message. Please try again.', 'error');
            } finally {
                this.setFormLoading(false);
            }
        });
    }
    
    validateForm(form) {
        const fields = ['name', 'email', 'subject', 'message'];
        let isValid = true;
        
        fields.forEach(fieldName => {
            const field = form.querySelector(`[name="${fieldName}"]`);
            const errorElement = document.getElementById(`${fieldName}-error`);
            
            if (!field || !errorElement) return;
            
            const value = field.value.trim();
            let errorMessage = '';
            
            if (!value) {
                errorMessage = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
            } else if (fieldName === 'email' && !this.isValidEmail(value)) {
                errorMessage = 'Please enter a valid email address';
            }
            
            if (errorMessage) {
                errorElement.textContent = errorMessage;
                field.classList.add('error');
                isValid = false;
            } else {
                errorElement.textContent = '';
                field.classList.remove('error');
            }
        });
        
        return isValid;
    }
    
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    setFormLoading(loading) {
        const submitBtn = document.getElementById('submitBtn');
        if (!submitBtn) return;
        
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoader = submitBtn.querySelector('.btn-loader');
        
        if (loading) {
            submitBtn.disabled = true;
            submitBtn.classList.add('loading');
            if (btnText) btnText.style.opacity = '0';
            if (btnLoader) btnLoader.style.display = 'block';
        } else {
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
            if (btnText) btnText.style.opacity = '1';
            if (btnLoader) btnLoader.style.display = 'none';
        }
    }
    
    showFormStatus(message, type) {
        const formStatus = document.getElementById('formStatus');
        if (!formStatus) return;
        
        formStatus.textContent = message;
        formStatus.className = `form-status ${type}`;
        formStatus.style.display = 'block';
        
        setTimeout(() => {
            formStatus.style.display = 'none';
        }, 5000);
    }
    
    initIntersectionObserver() {
        const sections = document.querySelectorAll('.section');
        const fadeElements = document.querySelectorAll('.fade-up');
        
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const section = entry.target.id;
                    this.updateActiveSection(section);
                }
            });
        }, { threshold: 0.5 });
        
        const fadeObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, { threshold: 0.1 });
        
        sections.forEach(section => sectionObserver.observe(section));
        fadeElements.forEach(element => fadeObserver.observe(element));
    }
    
    onMouseMove(event) {
        // Smoothly interpolate mouse position for buttery smooth camera movement
        if (!this.isMobile) {
            this.targetMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.targetMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        }
    }
    
    onWindowResize() {
        if (!this.camera || !this.renderer) return;
        
        // Debounce resize to prevent jank
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            
            // Update mobile detection on resize
            this.isMobile = this.detectMobile();
        }, 100);
    }
    
    onScroll() {
        // Use requestAnimationFrame for smooth scroll handling
        if (!this.ticking) {
            window.requestAnimationFrame(() => {
                this.updateScrollProgress();
                this.ticking = false;
            });
            this.ticking = true;
        }
    }
    
    updateScrollProgress() {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = scrollTop / docHeight;
        
        // Update any scroll-based animations here
    }
    
    navigateToSection(section) {
        const element = document.getElementById(section);
        if (element) {
            element.scrollIntoView({ 
                behavior: 'smooth',
                block: 'center'
            });
        }
    }
    
    updateActiveSection(section) {
        if (section === this.currentSection) return;
        
        this.currentSection = section;
        
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.getAttribute('data-section') === section) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
        
        // Update progress dots
        document.querySelectorAll('.progress-dot').forEach(dot => {
            if (dot.getAttribute('data-section') === section) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
        
        // Update 3D visualizations
        this.updateVisualizations();
    }
    
    updateVisualizations() {
        if (!window.gsap) return;
        
        const { magnetar, neuralNetwork } = this.visualizations;
        
        if (this.currentSection === 'home' && magnetar) {
            // Show magnetar visualization
            gsap.to(magnetar.core.position, { x: 0, y: 0, z: 0, duration: 1.5, ease: "power2.inOut" });
            gsap.to(magnetar.fieldGroup.position, { x: 0, y: 0, z: 0, duration: 1.5, ease: "power2.inOut" });
            
            // Hide neural network
            if (neuralNetwork) {
                neuralNetwork.group.visible = false;
                gsap.to(neuralNetwork.group.position, { z: -200, duration: 1.5, ease: "power2.inOut" });
            }
        } 
        else if (this.currentSection === 'about' && neuralNetwork) {
            // Show neural network visualization
            neuralNetwork.group.visible = true;
            gsap.to(neuralNetwork.group.position, { z: -50, duration: 1.5, ease: "power2.inOut" });
            
            // Hide magnetar
            if (magnetar) {
                gsap.to(magnetar.core.position, { z: 200, duration: 1.5, ease: "power2.inOut" });
                gsap.to(magnetar.fieldGroup.position, { z: 200, duration: 1.5, ease: "power2.inOut" });
            }
        }
        else {
            // Hide both visualizations for other sections
            if (magnetar) {
                gsap.to(magnetar.core.position, { z: 200, duration: 1.5, ease: "power2.inOut" });
                gsap.to(magnetar.fieldGroup.position, { z: 200, duration: 1.5, ease: "power2.inOut" });
            }
            
            if (neuralNetwork) {
                gsap.to(neuralNetwork.group.position, { 
                    z: -200, 
                    duration: 1.5, 
                    ease: "power2.inOut",
                    onComplete: () => neuralNetwork.group.visible = false
                });
            }
        }
    }
    
    triggerSectionAnimations() {
        // Trigger initial animations after loading
        const activeSection = document.querySelector('.section.active .fade-up');
        if (activeSection) {
            activeSection.classList.add('active');
        }
    }
    
    animate() {
        if (!this.renderer || !this.scene || !this.camera) return;
        
        requestAnimationFrame(() => this.animate());
        
        const time = Date.now() * 0.001;
        
        // Smooth mouse interpolation for buttery camera movement
        if (!this.isMobile) {
            this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.05;
            this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.05;
        }
        
        // Animate visualizations
        const { magnetar, neuralNetwork, starField } = this.visualizations;
        
        if (magnetar && magnetar.core) {
            magnetar.core.rotation.x += 0.005;
            magnetar.core.rotation.y += 0.003;
            magnetar.fieldGroup.rotation.x += 0.005;
            magnetar.fieldGroup.rotation.y += 0.003;
        }
        
        if (neuralNetwork && this.currentSection === 'about') {
            neuralNetwork.group.rotation.y += 0.005;
            
            // Optimized pulse - only update visible nodes
            if (neuralNetwork.group.visible) {
                neuralNetwork.nodes.forEach((layer, i) => {
                    layer.forEach((node, j) => {
                        const scale = 0.9 + Math.sin(time * 2 + i + j) * 0.2;
                        node.scale.set(scale, scale, scale);
                    });
                });
            }
        }
        
        if (starField) {
            starField.rotation.y += 0.0001;
        }
        
        // Smooth camera movement based on mouse (only on non-mobile)
        if (this.camera && !this.isMobile) {
            const targetX = this.mouse.x * 20;
            const targetY = this.mouse.y * 20;
            
            this.camera.position.x += (targetX - this.camera.position.x) * 0.05;
            this.camera.position.y += (targetY - this.camera.position.y) * 0.05;
            this.camera.lookAt(this.scene.position);
        }
        
        this.renderer.render(this.scene, this.camera);
    }
    
    handleError(error) {
        console.error('Portfolio error:', error);
        const loadingScreen = document.getElementById('loadingScreen');
        const loadingText = document.getElementById('loadingText');
        
        if (loadingText) {
            loadingText.textContent = 'Error loading 3D content. Continuing with 2D version...';
        }
        
        setTimeout(() => {
            if (loadingScreen) {
                loadingScreen.classList.add('hidden');
                setTimeout(() => loadingScreen.style.display = 'none', 1000);
            }
        }, 2000);
    }
}

// Initialize the portfolio when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Portfolio3D();
});

// Add CSS for additional styles not in external stylesheet
const additionalStyles = `
    .skip-to-content {
        position: absolute;
        top: -40px;
        left: 6px;
        background: var(--primary);
        color: var(--bg-darker);
        padding: 8px;
        border-radius: 4px;
        text-decoration: none;
        z-index: 10000;
        transition: top 0.3s;
    }
    
    .skip-to-content:focus {
        top: 6px;
    }
    
    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
    }
    
    .form-group {
        position: relative;
    }
    
    .error-message {
        color: var(--secondary);
        font-size: 0.8rem;
        margin-top: 0.5rem;
        display: none;
    }
    
    .form-group input.error,
    .form-group textarea.error {
        border-color: var(--secondary);
        box-shadow: 0 0 10px rgba(255, 94, 148, 0.3);
    }
    
    .form-group input.error + .error-message,
    .form-group textarea.error + .error-message {
        display: block;
    }
    
    .submit-btn {
        position: relative;
        overflow: hidden;
    }
    
    .submit-btn.loading {
        pointer-events: none;
    }
    
    .btn-loader {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 20px;
        height: 20px;
        border: 2px solid transparent;
        border-top: 2px solid var(--bg-darker);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        display: none;
    }
    
    @keyframes spin {
        0% { transform: translate(-50%, -50%) rotate(0deg); }
        100% { transform: translate(-50%, -50%) rotate(360deg); }
    }
    
    .form-status {
        margin-top: 1rem;
        padding: 1rem;
        border-radius: 8px;
        display: none;
        text-align: center;
        font-weight: 500;
    }
    
    .form-status.success {
        background: rgba(0, 240, 255, 0.1);
        color: var(--primary);
        border: 1px solid var(--primary);
    }
    
    .form-status.error {
        background: rgba(255, 94, 148, 0.1);
        color: var(--secondary);
        border: 1px solid var(--secondary);
    }
    
    .footer-bottom {
        text-align: center;
        padding-top: 2rem;
        margin-top: 2rem;
        border-top: 1px solid rgba(0, 240, 255, 0.1);
        color: var(--text-dim);
        font-size: 0.9rem;
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);