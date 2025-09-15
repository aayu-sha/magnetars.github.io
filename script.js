class Portfolio3D {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.currentSection = 'home';
        this.isLoading = true;
        this.loadingProgress = 0;
        this.mouse = new THREE.Vector2();
        this.visualizations = {};
        
        this.init();
    }
    
    async init() {
        try {
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
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        
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
        // Mouse movement
        window.addEventListener('mousemove', (e) => this.onMouseMove(e), false);
        
        // Window resize
        window.addEventListener('resize', () => this.onWindowResize(), false);
        
        // Scroll events
        window.addEventListener('scroll', () => this.onScroll(), { passive: true });
        
        // Navigation
        this.initNavigation();
        
        // Custom cursor
        this.initCustomCursor();
        
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
            menuToggle.addEventListener('click', () => {
                const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
                menuToggle.setAttribute('aria-expanded', !isExpanded);
                navLinks.classList.toggle('active');
                menuToggle.classList.toggle('active');
            });
        }
        
        // Navigation link clicks
        navLinksItems.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.navigateToSection(section);
                
                // Close mobile menu
                if (navLinks) navLinks.classList.remove('active');
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
        if ('ontouchstart' in window) return; // Skip on touch devices
        
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
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }
    
    onWindowResize() {
        if (!this.camera || !this.renderer) return;
        
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    onScroll() {
        // Throttle scroll events
        if (!this.scrollTimeout) {
            this.scrollTimeout = setTimeout(() => {
                this.updateScrollProgress();
                this.scrollTimeout = null;
            }, 16);
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
            
            // Pulse nodes
            neuralNetwork.nodes.forEach((layer, i) => {
                layer.forEach((node, j) => {
                    const scale = 0.9 + Math.sin(time * 2 + i + j) * 0.2;
                    node.scale.set(scale, scale, scale);
                });
            });
        }
        
        if (starField) {
            starField.rotation.y += 0.0001;
        }
        
        // Subtle camera movement based on mouse
        if (this.camera) {
            this.camera.position.x += (this.mouse.x * 20 - this.camera.position.x) * 0.05;
            this.camera.position.y += (this.mouse.y * 20 - this.camera.position.y) * 0.05;
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
    
    @media (max-width: 768px) {
        .nav-links.active {
            display: flex;
        }
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

menuToggle.addEventListener("click", () => {
navLinks.classList.toggle("active");
});


const cursor = document.getElementById('cursor');
document.addEventListener('mousemove', (e) => {
    gsap.to(cursor, {
        x: e.clientX - 10,
        y: e.clientY - 10,
        duration: 0.2
    });
});

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('webgl').appendChild(renderer.domElement);

function toggleAbstract(event, id) {
    event.preventDefault();
    const content = document.getElementById(id);
    if (content.style.display === "none" || content.style.display === "") {
        content.style.display = "block";
    } else {
        content.style.display = "none";
    }
}

// Create Magnetar Visualization for Home section
function createMagnetarVisualization() {
    const group = new THREE.Group();

    // Core of the magnetar
    const coreGeometry = new THREE.IcosahedronGeometry(20, 10);
    const coreMaterial = new THREE.MeshStandardMaterial({
        color: 0x62e7d8,
        metalness: 8.0,
        roughness: 0.8,
        emissive: 0x006060,
        emissiveIntensity: 0.5
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    group.add(core);

    // Magnetic field lines
    const fieldGroup = new THREE.Group();
    const fieldColors = [0x62e7d8, 0x00ffff, 0x4169e1];

    for (let i = 0; i < 100; i++) {
        const lineGeometry = new THREE.BufferGeometry();
        const lineMaterial = new THREE.LineBasicMaterial({ 
            color: fieldColors[i % fieldColors.length], 
            transparent: true, 
            opacity: 0.3 
        });
        
        const positions = [];
        const radius = 90 + Math.random() * 10;
        const twists = 10 + Math.random() * 3;

        for (let j = 0; j < 100; j++) {
            const t = j / 99;
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
    scene.add(group);

    return { core, fieldGroup };
}

// Create Neural Network Visualization for About section
function createNeuralNetworkVisualization() {
    const group = new THREE.Group();
    
    // Nodes
    const layers = [5, 16, 9, 8, 8, 9, 16, 5];
    const nodeGeometry = new THREE.SphereGeometry(1, 16, 16);
    const nodeMaterial = new THREE.MeshStandardMaterial({
        color: 0x62e7d8,
        emissive: 0x006060,
        emissiveIntensity: 0.5
    });
    
    const nodes = [];
    const connections = [];
    
    // Create layers of nodes
    for (let l = 0; l < layers.length; l++) {
        const layerNodes = [];
        const layerSize = layers[l];
        const xPos = (l - (layers.length - 1) / 2) * 30;
        
        for (let i = 0; i < layerSize; i++) {
            const yPos = (i - (layerSize - 1) / 2) * 10;
            const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
            node.position.set(xPos, yPos, 0);
            group.add(node);
            layerNodes.push(node);
            
            // Create connections to previous layer
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
    scene.add(group);
    
    return { group, nodes, connections };
}


// Star field creation (background for all sections)
function createStarField() {
    const starGroup = new THREE.Group();
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.8,
        transparent: true,
        opacity: 0.7
    });

    const starVertices = [];
    for (let i = 0; i < 10000; i++) {
        const x = (Math.random() - 0.5) * 1000;
        const y = (Math.random() - 0.5) * 1000;
        const z = (Math.random() - 0.5) * 1000;
        starVertices.push(x, y, z);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const starField = new THREE.Points(starGeometry, starMaterial);
    starGroup.add(starField);
    scene.add(starGroup);

    return starGroup;
}

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// Create scene elements - only for home, about, and starfield
const { core, fieldGroup } = createMagnetarVisualization();
const neuralNetwork = createNeuralNetworkVisualization();
const starField = createStarField();

// Camera positioning
camera.position.z = 100;

// Mouse interaction
const mouse = new THREE.Vector2();
function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}
window.addEventListener('mousemove', onMouseMove, false);

// Scroll interaction
let currentSection = 'home';
const sections = ['home', 'about', 'work', 'publications', 'contact'];
const sectionElements = {};
const sectionVisualizationStates = {
    'home': { active: true },
    'about': { active: false }
};

// Get section elements
sections.forEach(section => {
    sectionElements[section] = document.getElementById(section);
});

// Update active section based on scroll position
function updateActiveSection() {
    const scrollPosition = window.scrollY;
    const windowHeight = window.innerHeight;
    
    let activeSection = currentSection;
    
    // Find the current section
    for (const section in sectionElements) {
        const element = sectionElements[section];
        const rect = element.getBoundingClientRect();
        
        // If the section is in the viewport
        if (rect.top < windowHeight / 2 && rect.bottom > windowHeight / 2) {
            activeSection = section;
            break;
        }
    }
    
    // Only update if the section has changed
    if (activeSection !== currentSection) {
        // Update current section
        currentSection = activeSection;
        
        // Update section classes
        sections.forEach(section => {
            if (section === currentSection) {
                sectionElements[section].classList.add('active');
            } else {
                sectionElements[section].classList.remove('active');
            }
        });
        
        // Update progress dots
        document.querySelectorAll('.progress-dot').forEach(dot => {
            if (dot.dataset.section === currentSection) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
        
        // Update visualizations
        updateVisualizations();
    }
}

// Function to navigate to a section when a dot is clicked
function navigateToSection(event) {
    const section = event.target.dataset.section;
    if (section && sectionElements[section]) {
        sectionElements[section].scrollIntoView({ behavior: "smooth" });
    }
}

// Add event listeners to progress dots
document.querySelectorAll('.progress-dot').forEach(dot => {
    dot.addEventListener('click', navigateToSection);
});


// Update 3D visualizations based on active section - simplified for home and about only
function updateVisualizations() {
    if (currentSection === 'home') {
        // Show home visualization
        gsap.to(core.position, { x: 0, y: 0, z: 0, duration: 1.5, ease: "power2.inOut" });
        gsap.to(fieldGroup.position, { x: 0, y: 0, z: 0, duration: 1.5, ease: "power2.inOut" });
        gsap.to(core.scale, { x: 1, y: 1, z: 1, duration: 1.5, ease: "power2.inOut" });
        gsap.to(fieldGroup.scale, { x: 1, y: 1, z: 1, duration: 1.5, ease: "power2.inOut" });
        
        // Hide about visualization
        neuralNetwork.group.visible = false;
        gsap.to(neuralNetwork.group.position, { z: -200, duration: 1.5, ease: "power2.inOut" });
        
        // Update states
        sectionVisualizationStates.home.active = true;
        sectionVisualizationStates.about.active = false;
    } 
    else if (currentSection === 'about') {
        // Show about visualization
        neuralNetwork.group.visible = true;
        gsap.to(neuralNetwork.group.position, { z: -50, duration: 1.5, ease: "power2.inOut" });
        
        // Hide home visualization
        gsap.to(core.position, { z: 200, duration: 1.5, ease: "power2.inOut" });
        gsap.to(fieldGroup.position, { z: 200, duration: 1.5, ease: "power2.inOut" });
        
        // Update states
        sectionVisualizationStates.home.active = false;
        sectionVisualizationStates.about.active = true;
    }
    else {
        // For all other sections, hide both home and about visualizations
        // Hide home visualization if active
        if (sectionVisualizationStates.home.active) {
            gsap.to(core.position, { z: 200, duration: 1.5, ease: "power2.inOut" });
            gsap.to(fieldGroup.position, { z: 200, duration: 1.5, ease: "power2.inOut" });
            sectionVisualizationStates.home.active = false;
        }
        
        // Hide about visualization if active
        if (sectionVisualizationStates.about.active) {
            gsap.to(neuralNetwork.group.position, { z: -200, duration: 1.5, ease: "power2.inOut", onComplete: () => {
                neuralNetwork.group.visible = false;
            }});
            sectionVisualizationStates.about.active = false;
        }
    }
}

// Animation loop
function animate() {
    const time = Date.now();
    requestAnimationFrame(animate);

    // Home section animations - always animate but only visible when in home section
    core.rotation.x += 0.005;
    core.rotation.y += 0.003;
    fieldGroup.rotation.x += 0.005;
    fieldGroup.rotation.y += 0.003;
    
    // About section animations - only animate when in about section
    if (sectionVisualizationStates.about.active) {
        neuralNetwork.group.rotation.y += 0.005;
        
        // Pulse the nodes
        neuralNetwork.nodes.forEach((layer, i) => {
            layer.forEach((node, j) => {
                const scale = 0.9 + Math.sin(time * 0.001 * 2 + i + j) * 0.2;
                node.scale.set(scale, scale, scale);
            });
        });
    }

    // Subtle camera movement based on mouse position
    camera.position.x += (mouse.x * 20 - camera.position.x) * 0.05;
    camera.position.y += (mouse.y * 20 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    // Rotate star field for all sections
    starField.rotation.y += 0.0001;

    renderer.render(scene, camera);
}

// Responsive design
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Initialize
window.addEventListener('scroll', updateActiveSection);
updateActiveSection();
animate();

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const visitRef = db.collection("visits").doc("counter");

visitRef.get().then((doc) => {
    if (doc.exists) {
        let currentCount = doc.data().count;
        document.getElementById("visitCount").innerText = currentCount;
        visitRef.update({ count: currentCount + 1 });
    } else {
        visitRef.set({ count: 1 });
        document.getElementById("visitCount").innerText = 1;
    }
});


function toggleAbstract(event, id) {
    event.preventDefault();
    const content = document.getElementById(id);
    if (content.style.display === "none" || content.style.display === "") {
        content.style.display = "block";
    } else {
        content.style.display = "none";
    }
}

