// Enhanced JavaScript for Projects Page
class ProjectsEnhancer {
    constructor() {
        this.init();
    }

    init() {
        this.setupCursor();
        this.setupNavigation();
        this.setupModals();
        this.setupAnimations();
        this.setupImageModal();
        this.setupPerformanceOptimizations();
    }

    // Enhanced cursor tracking with particle effects
    setupCursor() {
        const cursor = document.getElementById('cursor');
        if (!cursor) return;

        let mouseX = 0, mouseY = 0;
        let cursorX = 0, cursorY = 0;

        // Smooth cursor movement
        const updateCursor = () => {
            cursorX += (mouseX - cursorX) * 0.1;
            cursorY += (mouseY - cursorY) * 0.1;
            
            cursor.style.left = cursorX + 'px';
            cursor.style.top = cursorY + 'px';
            
            requestAnimationFrame(updateCursor);
        };

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        // Cursor size effects on interactive elements
        const interactiveElements = document.querySelectorAll('button, a, .project-box, img[onclick]');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.style.transform = 'scale(1.5)';
                cursor.style.background = 'radial-gradient(circle, rgba(100, 181, 246, 0.8) 0%, rgba(100, 181, 246, 0.3) 70%, transparent 100%)';
            });
            
            el.addEventListener('mouseleave', () => {
                cursor.style.transform = 'scale(1)';
                cursor.style.background = 'radial-gradient(circle, rgba(64, 224, 255, 0.8) 0%, rgba(64, 224, 255, 0.2) 70%, transparent 100%)';
            });
        });

        updateCursor();
    }

    // Enhanced navigation with scroll effects
    setupNavigation() {
        const nav = document.querySelector('.nav');
        if (!nav) return;

        let lastScroll = 0;
        const scrollThreshold = 100;

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            // Add/remove scrolled class
            if (currentScroll > scrollThreshold) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }

            // Hide/show nav on scroll direction
            if (currentScroll > lastScroll && currentScroll > scrollThreshold) {
                nav.style.transform = 'translateY(-100%)';
            } else {
                nav.style.transform = 'translateY(0)';
            }
            
            lastScroll = currentScroll;
        }, { passive: true });

        // Enhanced nav link interactions
        const navLinks = document.querySelectorAll('.nav-links a');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Ripple effect
                const ripple = document.createElement('span');
                ripple.style.cssText = `
                    position: absolute;
                    border-radius: 50%;
                    transform: scale(0);
                    animation: ripple 0.6s linear;
                    background: rgba(255, 255, 255, 0.3);
                `;
                
                const rect = link.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
                ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
                
                link.appendChild(ripple);
                
                setTimeout(() => ripple.remove(), 600);
            });
        });
    }

    // Enhanced modal system with improved UX
    setupModals() {
        const modals = document.querySelectorAll('.modal');
        
        // Global modal functions
        window.openProjectModal = (modalId) => {
            const modal = document.getElementById(modalId);
            if (!modal) return;
            
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            
            // Animate modal appearance
            setTimeout(() => {
                modal.classList.add('show');
                this.animateModalContent(modal);
            }, 10);
        };

        window.closeProjectModal = (modalId) => {
            const modal = document.getElementById(modalId);
            if (!modal) return;
            
            modal.classList.remove('show');
            document.body.style.overflow = '';
            
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        };

        // Enhanced modal interactions
        modals.forEach(modal => {
            // Close on backdrop click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    const modalId = modal.id;
                    if (modalId === 'imageModal') {
                        this.closeImageModal();
                    } else {
                        window.closeProjectModal(modalId);
                    }
                }
            });

            // Close button enhancement
            const closeBtn = modal.querySelector('.close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    const modalId = modal.id;
                    if (modalId === 'imageModal') {
                        this.closeImageModal();
                    } else {
                        window.closeProjectModal(modalId);
                    }
                });
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const visibleModal = document.querySelector('.modal[style*="block"]');
                if (visibleModal) {
                    const modalId = visibleModal.id;
                    if (modalId === 'imageModal') {
                        this.closeImageModal();
                    } else {
                        window.closeProjectModal(modalId);
                    }
                }
            }
        });
    }

    // Animate modal content elements
    animateModalContent(modal) {
        const elements = modal.querySelectorAll('.model-block, .modal-content > *');
        
        if (window.gsap) {
            gsap.fromTo(elements, 
                { opacity: 0, y: 30, scale: 0.95 },
                { 
                    opacity: 1, 
                    y: 0, 
                    scale: 1,
                    duration: 0.6, 
                    stagger: 0.1, 
                    ease: 'power3.out' 
                }
            );
        } else {
            // Fallback animation
            elements.forEach((el, index) => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(30px) scale(0.95)';
                el.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                
                setTimeout(() => {
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0) scale(1)';
                }, index * 100);
            });
        }
    }

    // Enhanced image modal system
    setupImageModal() {
        window.openImageModal = (src, caption) => {
            const modal = document.getElementById('imageModal');
            const modalImage = document.getElementById('modalImage');
            const modalCaption = document.getElementById('modalCaption');
            
            if (!modal || !modalImage || !modalCaption) return;
            
            // Preload image for smooth loading
            const img = new Image();
            img.onload = () => {
                modalImage.src = src;
                modalCaption.textContent = caption;
                modal.style.display = 'block';
                document.body.style.overflow = 'hidden';
                
                setTimeout(() => {
                    modal.classList.add('show');
                    if (window.gsap) {
                        gsap.fromTo(modalImage, 
                            { opacity: 0, scale: 0.8, rotationY: 15 },
                            { opacity: 1, scale: 1, rotationY: 0, duration: 0.8, ease: 'power3.out' }
                        );
                    } else {
                        modalImage.style.opacity = '1';
                        modalImage.style.transform = 'scale(1)';
                    }
                }, 10);
            };
            img.src = src;
        };

        this.closeImageModal = () => {
            const modal = document.getElementById('imageModal');
            if (!modal) return;
            
            modal.classList.remove('show');
            document.body.style.overflow = '';
            
            setTimeout(() => {
                modal.style.display = 'none';
                const modalImage = document.getElementById('modalImage');
                if (modalImage) modalImage.src = '';
            }, 300);
        };

        window.closeImageModal = this.closeImageModal;

        // Add zoom functionality to modal images
        const modalImage = document.getElementById('modalImage');
        if (modalImage) {
            let isZoomed = false;
            
            modalImage.addEventListener('click', () => {
                if (!isZoomed) {
                    modalImage.style.transform = 'scale(1.5)';
                    modalImage.style.cursor = 'zoom-out';
                    isZoomed = true;
                } else {
                    modalImage.style.transform = 'scale(1)';
                    modalImage.style.cursor = 'zoom-in';
                    isZoomed = false;
                }
            });
        }
    }

    // Enhanced animations and interactions
    setupAnimations() {
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    
                    // Special animations for different elements
                    if (entry.target.classList.contains('project-box')) {
                        this.animateProjectBox(entry.target);
                    }
                    
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe elements for animation
        const elementsToAnimate = document.querySelectorAll('.project-box, .model-block, h1, h2');
        elementsToAnimate.forEach(el => observer.observe(el));

        // Enhanced project box interactions
        const projectBoxes = document.querySelectorAll('.project-box');
        projectBoxes.forEach(box => {
            // Parallax effect on mouse move
            box.addEventListener('mousemove', (e) => {
                const rect = box.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const deltaX = (e.clientX - centerX) / rect.width * 20;
                const deltaY = (e.clientY - centerY) / rect.height * 20;
                
                box.style.transform = `translateY(-8px) scale(1.02) rotateX(${deltaY * 0.5}deg) rotateY(${deltaX * 0.5}deg)`;
            });
            
            box.addEventListener('mouseleave', () => {
                box.style.transform = '';
            });

            // Ripple effect on click
            box.addEventListener('click', this.createRippleEffect.bind(this));
        });

        // Button enhancements
        const buttons = document.querySelectorAll('button, .back-link');
        buttons.forEach(btn => {
            btn.addEventListener('click', this.createRippleEffect.bind(this));
            
            // Magnetic effect
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const deltaX = (e.clientX - centerX) * 0.2;
                const deltaY = (e.clientY - centerY) * 0.2;
                
                btn.style.transform = `translateY(-3px) scale(1.05) translate(${deltaX}px, ${deltaY}px)`;
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = '';
            });
        });
    }

    // Animate project boxes with stagger effect
    animateProjectBox(box) {
        if (window.gsap) {
            const tl = gsap.timeline();
            tl.fromTo(box, 
                { opacity: 0, y: 50, rotationX: 15 },
                { opacity: 1, y: 0, rotationX: 0, duration: 0.8, ease: 'power3.out' }
            )
            .fromTo(box.querySelector('h2'), 
                { opacity: 0, x: -30 },
                { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out' }, '-=0.6'
            )
            .fromTo(box.querySelector('p'), 
                { opacity: 0, x: -20 },
                { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out' }, '-=0.4'
            )
            .fromTo(box.querySelector('button'), 
                { opacity: 0, scale: 0.8 },
                { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)' }, '-=0.3'
            );
        }
    }

    // Create ripple effect for interactive elements
    createRippleEffect(e) {
        const element = e.currentTarget;
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s linear;
            background: rgba(255, 255, 255, 0.3);
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            pointer-events: none;
            z-index: 1000;
        `;
        
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    }

    // Performance optimizations
    setupPerformanceOptimizations() {
        // Lazy loading for images
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));

        // Throttle scroll events
        let scrollTimeout;
        const throttledScroll = (callback) => {
            if (scrollTimeout) return;
            scrollTimeout = setTimeout(() => {
                callback();
                scrollTimeout = null;
            }, 16); // 60fps
        };

        // Optimize WebGL rendering if present
        const webglCanvas = document.getElementById('webgl');
        if (webglCanvas) {
            // Pause WebGL when not visible
            document.addEventListener('visibilitychange', () => {
                if (document.hidden && window.pauseWebGL) {
                    window.pauseWebGL();
                } else if (!document.hidden && window.resumeWebGL) {
                    window.resumeWebGL();
                }
            });
        }

        // Preload critical resources
        this.preloadCriticalResources();
    }

    // Preload critical resources
    preloadCriticalResources() {
        const criticalImages = [
            '../../Projects/ML/Retina/vae.png',
            '../../Projects/ML/Retina/TVD.png',
            '../../Projects/ML/Retina/SPP.png'
        ];
        
        criticalImages.forEach(src => {
            const img = new Image();
            img.src = src;
        });
    }

    // Add smooth scrolling for navigation links
    setupSmoothScrolling() {
        const navLinks = document.querySelectorAll('a[href^="#"]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const offsetTop = targetElement.offsetTop - 100; // Account for fixed nav
                    
                    if (window.gsap) {
                        gsap.to(window, {duration: 1.2, scrollTo: offsetTop, ease: "power2.inOut"});
                    } else {
                        window.scrollTo({
                            top: offsetTop,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });
    }

    // Add typing animation for text elements
    typeText(element, text, speed = 50) {
        element.textContent = '';
        let i = 0;
        const typeInterval = setInterval(() => {
            element.textContent += text.charAt(i);
            i++;
            if (i > text.length) {
                clearInterval(typeInterval);
            }
        }, speed);
    }

    // Add particle system for background
    createParticleSystem() {
        const canvas = document.createElement('canvas');
        canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -2;
            opacity: 0.3;
            pointer-events: none;
        `;
        document.body.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        const particles = [];
        const particleCount = 50;
        
        // Resize canvas
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        
        // Particle class
        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.size = Math.random() * 2 + 1;
                this.opacity = Math.random() * 0.5 + 0.2;
            }
            
            update() {
                this.x += this.vx;
                this.y += this.vy;
                
                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
            }
            
            draw() {
                ctx.globalAlpha = this.opacity;
                ctx.fillStyle = '#40e0ff';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Initialize particles
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
        
        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
}

// CSS animations keyframes (add to CSS)
const additionalCSS = `
@keyframes ripple {
    0% {
        transform: scale(0);
        opacity: 1;
    }
    100% {
        transform: scale(4);
        opacity: 0;
    }
}

.animate-in {
    animation: fadeInUp 0.8s ease-out forwards;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Additional utility animations */
.bounce-in {
    animation: bounceIn 0.8s ease-out;
}

@keyframes bounceIn {
    0% {
        opacity: 0;
        transform: scale(0.3);
    }
    50% {
        opacity: 1;
        transform: scale(1.1);
    }
    70% {
        transform: scale(0.9);
    }
    100% {
        opacity: 1;
        transform: scale(1);
    }
}

.slide-in-right {
    animation: slideInRight 0.6s ease-out;
}

@keyframes slideInRight {
    from {
        opacity: 0;
        transform: translateX(50px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

.glow-pulse {
    animation: glowPulse 2s ease-in-out infinite alternate;
}

@keyframes glowPulse {
    0% {
        text-shadow: 0 0 20px rgba(64, 224, 255, 0.3);
    }
    100% {
        text-shadow: 0 0 30px rgba(64, 224, 255, 0.6), 0 0 40px rgba(64, 224, 255, 0.3);
    }
}
`;

// Add additional CSS to document
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalCSS;
document.head.appendChild(styleSheet);

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ProjectsEnhancer();
    
    // Initialize GSAP animations if available
    if (window.gsap) {
        gsap.registerPlugin(ScrollToPlugin);
        
        // Enhanced project box animations
        gsap.from('.project-box', {
            opacity: 0,
            y: 50,
            rotationX: 15,
            duration: 1,
            stagger: 0.2,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.project-box',
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            }
        });
        
        // Text animations
        gsap.from('h1, h2', {
            opacity: 0,
            y: 30,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power2.out'
        });
    }
});

// Export for external use
window.ProjectsEnhancer = ProjectsEnhancer;