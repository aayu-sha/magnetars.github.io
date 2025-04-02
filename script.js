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