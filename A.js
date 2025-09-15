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
        this.isMobile = window.innerWidth <= 768;
        this.isTablet = window.innerWidth <= 1024;
        this.isMenuOpen = false;
        this.init();
    }
    
    async init() {
        try {
            await this.initLoading();
            if (!this.isMobile) {
                this.initScene();
                this.createVisualizations();
            }
            this.initEventListeners();
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
        if (window.innerWidth < 480) return;
        try {
            this.scene = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            this.renderer = new THREE.WebGLRenderer({ 
                antialias: !this.isMobile, 
                alpha: true,
                powerPreference: this.isMobile ? 'low-power' : 'high-performance'
            });
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.isMobile ? 1.5 : 2));
            const webglContainer = document.getElementById('webgl');
            if (webglContainer) {
                webglContainer.appendChild(this.renderer.domElement);
            }
            this.camera.position.z = this.isMobile ? 150 : 100;
            const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
            this.scene.add(ambientLight);
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
            directionalLight.position.set(1, 1, 1);
            this.scene.add(directionalLight);
        } catch (error) {
            console.warn('3D scene initialization failed:', error);
        }
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
        if (!this.isMobile) {
            window.addEventListener('mousemove', (e) => this.onMouseMove(e), { passive: true });
        }
        window.addEventListener('resize', () => this.onWindowResize(), false);
        window.addEventListener('scroll', () => this.onScroll(), { passive: true });
        this.initNavigation();
        if (!this.isMobile) {
            this.initCustomCursor();
        }
        this.initContactForm();
        this.initIntersectionObserver();
        if (this.isMobile) {
            this.initTouchEvents();
        }
    }
    
    initNavigation() {
        const menuToggle = document.getElementById('menuToggle');
        const navLinks = document.getElementById('navLinks');
        const navLinksItems = document.querySelectorAll('.nav-link');
        const progressDots = document.querySelectorAll('.progress-dot');
        const menuOverlay = document.getElementById('menuOverlay');
        
        if (menuToggle && navLinks) {
            menuToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleMobileMenu();
            });
        }
        
        if (menuOverlay) {
            menuOverlay.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        }
        
        navLinksItems.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.navigateToSection(section);
                this.closeMobileMenu();
            });
        });
        
        progressDots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                e.preventDefault();
                const section = dot.getAttribute('data-section');
                this.navigateToSection(section);
            });
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen) {
                this.closeMobileMenu();
            }
        });
        
        document.addEventListener('touchmove', (e) => {
            if (this.isMenuOpen) {
                e.preventDefault();
            }
        }, { passive: false });
    }
    
    toggleMobileMenu() {
        const menuToggle = document.getElementById('menuToggle');
        const navLinks = document.getElementById('navLinks');
        const menuOverlay = document.getElementById('menuOverlay');
        
        this.isMenuOpen = !this.isMenuOpen;
        
        if (menuToggle) {
            menuToggle.classList.toggle('active');
            menuToggle.setAttribute('aria-expanded', this.isMenuOpen);
        }
        if (navLinks) {
            navLinks.classList.toggle('active');
        }
        if (menuOverlay) {
            menuOverlay.classList.toggle('active');
        }
        document.body.style.overflow = this.isMenuOpen ? 'hidden' : '';
    }
    
    closeMobileMenu() {
        if (!this.isMenuOpen) return;
        const menuToggle = document.getElementById('menuToggle');
        const navLinks = document.getElementById('navLinks');
        const menuOverlay = document.getElementById('menuOverlay');
        
        this.isMenuOpen = false;
        
        if (menuToggle) {
            menuToggle.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
        if (navLinks) {
            navLinks.classList.remove('active');
        }
        if (menuOverlay) {
            menuOverlay.classList.remove('active');
        }
        document.body.style.overflow = '';
    }
    
    initCustomCursor() {
        if ('ontouchstart' in window) return;
        const cursor = document.getElementById('cursor');
        if (!cursor) return;
        let mouseX = 0;
        let mouseY = 0;
        let cursorX = 0;
        let cursorY = 0;
        const updateCursor = () => {
            cursorX += (mouseX - cursorX) * 0.1;
            cursorY += (mouseY - cursorY) * 0.1;
            cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
            requestAnimationFrame(updateCursor);
        };
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX - 8;
            mouseY = e.clientY - 8;
        });
        updateCursor();
        const hoverElements = document.querySelectorAll('a, button, .project-item');
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
        });
    }
    
    initTouchEvents() {
        let touchStartY = 0;
        let touchStartTime = 0;
        document.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
            touchStartTime = Date.now();
        }, { passive: true });
        document.addEventListener('touchend', (e) => {
            const touchEndY = e.changedTouches[0].clientY;
            const touchEndTime = Date.now();
            const deltaY = touchEndY - touchStartY;
            const deltaTime = touchEndTime - touchStartTime;
            if (Math.abs(deltaY) > 50 && deltaTime < 300) {
            }
        }, { passive: true });
    }
    
    initContactForm() {
        const form = document.getElementById('contactForm');
        if (!form) return;
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!this.validateForm(form)) return;
            this.setFormLoading(true);
            try {
                await new Promise(resolve => setTimeout(resolve, 2000));
                this.showFormStatus('Message sent successfully!', 'success');
                form.reset();
            } catch (error) {
                this.showFormStatus('Failed to send message. Please try again.', 'error');
            } finally {
                this.setFormLoading(false);
            }
        });
        const fields = form.querySelectorAll('input, textarea');
        fields.forEach(field => {
            field.addEventListener('blur', () => {
                this.validateField(field);
            });
            field.addEventListener('input', () => {
                if (field.classList.contains('error')) {
                    this.validateField(field);
                }
            });
        });
    }
    
    validateForm(form) {
        const fields = ['name', 'email', 'subject', 'message'];
        let isValid = true;
        fields.forEach(fieldName => {
            const field = form.querySelector(`[name="${fieldName}"]`);
            if (field && !this.validateField(field)) {
                isValid = false;
            }
        });
        return isValid;
    }
    
    validateField(field) {
        const fieldName = field.name;
        const errorElement = document.getElementById(`${fieldName}-error`);
        if (!errorElement) return true;
        const value = field.value.trim();
        let errorMessage = '';
        if (!value) {
            errorMessage = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
        } else if (fieldName === 'email' && !this.isValidEmail(value)) {
            errorMessage = 'Please enter a valid email address';
        } else if (fieldName === 'message' && value.length < 10) {
            errorMessage = 'Message must be at least 10 characters long';
        }
        if (errorMessage) {
            errorElement.textContent = errorMessage;
            field.classList.add('error');
            return false;
        } else {
            errorElement.textContent = '';
            field.classList.remove('error');
            return true;
        }
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
            let maxRatio = 0;
            let activeEntry = null;
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
                    maxRatio = entry.intersectionRatio;
                    activeEntry = entry;
                }
            });
            if (activeEntry) {
                const section = activeEntry.target.id;
                document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
                activeEntry.target.classList.add('active');
                this.updateActiveSection(section);
            }
        }, { 
            threshold: this.isMobile ? 0.3 : 0.5,
            rootMargin: this.isMobile ? '-20% 0px -20% 0px' : '-30% 0px -30% 0px'
        });
        
        const fadeObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, { 
            threshold: 0.1,
            rootMargin: '0px 0px -10% 0px'
        });
        
        sections.forEach(section => sectionObserver.observe(section));
        fadeElements.forEach(element => fadeObserver.observe(element));
    }
    
    onMouseMove(event) {
        if (this.isMobile) return;
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }
    
    onWindowResize() {
        const wasMobile = this.isMobile;
        const wasTablet = this.isTablet;
        this.isMobile = window.innerWidth <= 768;
        this.isTablet = window.innerWidth <= 1024;
        
        if (wasMobile && !this.isMobile && this.isMenuOpen) {
            this.closeMobileMenu();
        }
        
        if (!this.camera || !this.renderer) return;
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.camera.position.z = this.isMobile ? 150 : 100;
    }
    
    onScroll() {
        if (!this.scrollTimeout) {
            this.scrollTimeout = setTimeout(() => {
                this.updateScrollProgress();
                this.updateNavigation();
                this.scrollTimeout = null;
            }, 16);
        }
    }
    
    updateScrollProgress() {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = scrollTop / docHeight;
    }
    
    updateNavigation() {
        const nav = document.querySelector('.nav');
        if (!nav) return;
        if (window.scrollY > 100) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    }
    
    navigateToSection(section) {
        const element = document.getElementById(section);
        if (element) {
            const headerHeight = this.isMobile ? 80 : 100;
            const targetPosition = element.offsetTop - headerHeight;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }
    
    updateActiveSection(section) {
        if (section === this.currentSection) return;
        this.currentSection = section;
        document.querySelectorAll('.nav-link').forEach(link => {
            const targetSection = link.getAttribute('data-section');
            if (targetSection === section) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
        document.querySelectorAll('.progress-dot').forEach(dot => {
            if (dot.getAttribute('data-section') === section) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
        if (!this.isMobile && !this.isTablet) {
            this.updateVisualizations();
        }
    }
    
    updateVisualizations() {
        if (!window.gsap || !this.visualizations) return;
        const { magnetar, neuralNetwork } = this.visualizations;
        if (this.currentSection === 'home' && magnetar) {
            gsap.to(magnetar.core.position, { 
                x: 0, y: 0, z: 0, 
                duration: 1.5, 
                ease: "power2.inOut" 
            });
            gsap.to(magnetar.fieldGroup.position, { 
                x: 0, y: 0, z: 0, 
                duration: 1.5, 
                ease: "power2.inOut" 
            });
            if (neuralNetwork) {
                neuralNetwork.group.visible = false;
                gsap.to(neuralNetwork.group.position, { 
                    z: -200, 
                    duration: 1.5, 
                    ease: "power2.inOut" 
                });
            }
        } else if (this.currentSection === 'about' && neuralNetwork) {
            neuralNetwork.group.visible = true;
            gsap.to(neuralNetwork.group.position, { 
                z: -50, 
                duration: 1.5, 
                ease: "power2.inOut" 
            });
            if (magnetar) {
                gsap.to(magnetar.core.position, { 
                    z: 200, 
                    duration: 1.5, 
                    ease: "power2.inOut" 
                });
                gsap.to(magnetar.fieldGroup.position, { 
                    z: 200, 
                    duration: 1.5, 
                    ease: "power2.inOut" 
                });
            }
        } else {
            if (magnetar) {
                gsap.to(magnetar.core.position, { 
                    z: 200, 
                    duration: 1.5, 
                    ease: "power2.inOut" 
                });
                gsap.to(magnetar.fieldGroup.position, { 
                    z: 200, 
                    duration: 1.5, 
                    ease: "power2.inOut" 
                });
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
        const activeSection = document.querySelector('.section.active .fade-up');
        if (activeSection) {
            activeSection.classList.add('active');
        }
        const fadeElements = document.querySelectorAll('.fade-up');
        fadeElements.forEach((element, index) => {
            setTimeout(() => {
                if (element.getBoundingClientRect().top < window.innerHeight) {
                    element.classList.add('active');
                }
            }, index * 100);
        });
    }
    
    animate() {
        if (!this.renderer || !this.scene || !this.camera) {
            requestAnimationFrame(() => this.animate());
            return;
        }
        requestAnimationFrame(() => this.animate());
        const time = Date.now() * 0.001;
        const animationSpeed = this.isMobile ? 0.002 : 0.005;
        const { magnetar, neuralNetwork, starField } = this.visualizations;
        if (magnetar && magnetar.core) {
            magnetar.core.rotation.x += animationSpeed;
            magnetar.core.rotation.y += animationSpeed * 0.6;
            magnetar.fieldGroup.rotation.x += animationSpeed;
            magnetar.fieldGroup.rotation.y += animationSpeed * 0.6;
        }
        if (neuralNetwork && this.currentSection === 'about') {
            neuralNetwork.group.rotation.y += animationSpeed;
            if (!this.isMobile || Math.floor(time * 10) % 3 === 0) {
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
        if (this.camera && !this.isMobile) {
            this.camera.position.x += (this.mouse.x * 20 - this.camera.position.x) * 0.05;
            this.camera.position.y += (this.mouse.y * 20 - this.camera.position.y) * 0.05;
            this.camera.lookAt(this.scene.position);
        }
        try {
            this.renderer.render(this.scene, this.camera);
        } catch (error) {
            console.warn('Render error:', error);
        }
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

const Utils = {
    debounce(func, wait, immediate) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    },
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },
    smoothScrollTo(element, offset = 0) {
        const targetPosition = element.offsetTop - offset;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        const duration = Math.min(Math.abs(distance) / 2, 800);
        let start = null;
        function step(timestamp) {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const progressPercentage = Math.min(progress / duration, 1);
            const easeInOutCubic = progressPercentage < 0.5 
                ? 4 * progressPercentage * progressPercentage * progressPercentage 
                : (progressPercentage - 1) * (2 * progressPercentage - 2) * (2 * progressPercentage - 2) + 1;
            window.scrollTo(0, startPosition + distance * easeInOutCubic);
            if (progress < duration) {
                window.requestAnimationFrame(step);
            }
        }
        window.requestAnimationFrame(step);
    }
};

const PerformanceMonitor = {
    init() {
        if ('PerformanceObserver' in window) {
            this.observeLCP();
            this.observeFID();
        }
        this.monitorFPS();
    },
    observeLCP() {
        const observer = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            console.log('LCP:', lastEntry.startTime);
        });
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
    },
    observeFID() {
        const observer = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach(entry => {
                console.log('FID:', entry.processingStart - entry.startTime);
            });
        });
        observer.observe({ entryTypes: ['first-input'] });
    },
    monitorFPS() {
        let lastTime = performance.now();
        let frames = 0;
        function updateFPS() {
            const now = performance.now();
            frames++;
            if (now >= lastTime + 1000) {
                const fps = Math.round((frames * 1000) / (now - lastTime));
                if (fps < 30) {
                    console.warn('Low FPS detected:', fps);
                }
                frames = 0;
                lastTime = now;
            }
            requestAnimationFrame(updateFPS);
        }
        updateFPS();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const portfolio = new Portfolio3D();
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        PerformanceMonitor.init();
    }
    const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');
    smoothScrollLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const offset = window.innerWidth <= 768 ? 80 : 100;
                Utils.smoothScrollTo(targetElement, offset);
            }
        });
    });
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    observer.unobserve(img);
                }
            });
        });
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => imageObserver.observe(img));
    }
    if ('ontouchstart' in window) {
        const touchElements = document.querySelectorAll('button, .project-item, .cta-button');
        touchElements.forEach(element => {
            element.addEventListener('touchstart', () => {
                element.style.transform = 'scale(0.95)';
            }, { passive: true });
            element.addEventListener('touchend', () => {
                element.style.transform = '';
            }, { passive: true });
        });
    }
    window.addEventListener('online', () => {
        console.log('Connection restored');
    });
    window.addEventListener('offline', () => {
        console.log('Connection lost');
    });
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.documentElement.style.setProperty('--animation-duration', '0.01s');
        console.log('Reduced motion preference detected');
    }
});