// Cursor tracking
const cursor = document.getElementById('cursor');
document.addEventListener('mousemove', (e) => {
    gsap.to(cursor, {
        x: e.clientX - 10,
        y: e.clientY - 10,
        duration: 0.2
    });
});

// Interactive elements cursor effect
const interactiveElements = document.querySelectorAll('a, .project-item, button, input, textarea');
interactiveElements.forEach(item => {
    item.addEventListener('mouseenter', () => {
        cursor.classList.add('hover');
    });
    item.addEventListener('mouseleave', () => {
        cursor.classList.remove('hover');
    });
});

// 3D Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('webgl').appendChild(renderer.domElement);

// Create Magnetar Visualization
function createMagnetarVisualization() {
    const group = new THREE.Group();

    // Core of the magnetar
    const coreGeometry = new THREE.IcosahedronGeometry(15, 4);
    const coreMaterial = new THREE.MeshStandardMaterial({
        color: 0x62e7d8,
        metalness: 0.8,
        roughness: 0.2,
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
        const radius = 20 + Math.random() * 10;
        const twists = 3 + Math.random() * 3;

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
    const layers = [5, 8, 8, 4];
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

// Create Data Visualization for Work section
function createDataVisualization() {
    const group = new THREE.Group();
    
    // Create a grid of data points
    const gridSize = 20;
    const pointGeometry = new THREE.SphereGeometry(0.5, 8, 8);
    const pointMaterial = new THREE.MeshStandardMaterial({
        color: 0x4169e1,
        emissive: 0x0000ff,
        emissiveIntensity: 0.3
    });
    
    const dataPoints = [];
    
    for (let x = -gridSize; x <= gridSize; x += 2) {
        for (let z = -gridSize; z <= gridSize; z += 2) {
            const point = new THREE.Mesh(pointGeometry, pointMaterial);
            
            // Create a wave pattern
            const distance = Math.sqrt(x*x + z*z);
            const y = Math.sin(distance * 0.3) * 5;
            
            point.position.set(x, y, z);
            group.add(point);
            dataPoints.push(point);
        }
    }
    
    group.rotation.x = -Math.PI / 4;
    group.position.z = -50;
    group.visible = false;
    scene.add(group);
    
    return { group, dataPoints };
}

// Create Publications Visualization
function createPublicationsVisualization() {
    const group = new THREE.Group();
    
    // Create floating papers/documents
    const papers = [];
    const paperCount = 20;
    
    const paperGeometry = new THREE.BoxGeometry(5, 7, 0.1);
    const paperMaterials = [
        new THREE.MeshStandardMaterial({ color: 0xffffff }),
        new THREE.MeshStandardMaterial({ color: 0xf5f5f5 }),
        new THREE.MeshStandardMaterial({ color: 0xf0f0f0 })
    ];
    
    // Central hub for connections
    const hubGeometry = new THREE.SphereGeometry(2, 16, 16);
    const hubMaterial = new THREE.MeshStandardMaterial({
        color: 0x62e7d8,
        emissive: 0x006060,
        emissiveIntensity: 0.7
    });
    const hub = new THREE.Mesh(hubGeometry, hubMaterial);
    group.add(hub);
    
    // Create papers with connections
    for (let i = 0; i < paperCount; i++) {
        const angle = (i / paperCount) * Math.PI * 2;
        const radius = 15 + Math.random() * 15;
        const height = (Math.random() - 0.5) * 20;
        
        const paper = new THREE.Mesh(
            paperGeometry, 
            paperMaterials[Math.floor(Math.random() * paperMaterials.length)]
        );
        
        paper.position.x = Math.cos(angle) * radius;
        paper.position.y = height;
        paper.position.z = Math.sin(angle) * radius;
        
        // Random rotation
        paper.rotation.x = Math.random() * 0.5;
        paper.rotation.y = Math.random() * Math.PI * 2;
        paper.rotation.z = Math.random() * 0.5;
        
        group.add(paper);
        papers.push({
            mesh: paper,
            initialPos: paper.position.clone(),
            rotationSpeed: (Math.random() - 0.5) * 0.01,
            floatSpeed: 0.5 + Math.random() * 0.5
        });
        
        // Connection to hub
        const connectionGeometry = new THREE.BufferGeometry();
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x62e7d8,
            transparent: true,
            opacity: 0.2
        });
        
        const points = [
            hub.position.clone(),
            paper.position.clone()
        ];
        
        connectionGeometry.setFromPoints(points);
        const line = new THREE.Line(connectionGeometry, lineMaterial);
        group.add(line);
    }
    
    group.position.z = -50;
    group.visible = false;
    scene.add(group);
    
    return { group, hub, papers };
}

// Create Communication Visualization for Contact section
function createCommunicationVisualization() {
    const group = new THREE.Group();
    
    // Central hub
    const hubGeometry = new THREE.SphereGeometry(5, 16, 16);
    const hubMaterial = new THREE.MeshStandardMaterial({
        color: 0x62e7d8,
        emissive: 0x006060,
        emissiveIntensity: 0.8
    });
    const hub = new THREE.Mesh(hubGeometry, hubMaterial);
    group.add(hub);
    
    // Satellites
    const satellites = [];
    const connections = [];
    const satelliteCount = 12;
    
    for (let i = 0; i < satelliteCount; i++) {
        const angle = (i / satelliteCount) * Math.PI * 2;
        const radius = 20 + Math.random() * 10;
        
        const satelliteGeometry = new THREE.SphereGeometry(1 + Math.random(), 8, 8);
        const satelliteMaterial = new THREE.MeshStandardMaterial({
            color: 0x4169e1,
            emissive: 0x0000ff,
            emissiveIntensity: 0.5
        });
        
        const satellite = new THREE.Mesh(satelliteGeometry, satelliteMaterial);
        satellite.position.x = Math.cos(angle) * radius;
        satellite.position.y = (Math.random() - 0.5) * 20;
        satellite.position.z = Math.sin(angle) * radius;
        
        group.add(satellite);
        satellites.push(satellite);
        
        // Connection to hub
        const connectionGeometry = new THREE.BufferGeometry();
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x62e7d8,
            transparent: true,
            opacity: 0.3
        });
        
        const points = [
            hub.position.clone(),
            satellite.position.clone()
        ];
        
        connectionGeometry.setFromPoints(points);
        const line = new THREE.Line(connectionGeometry, lineMaterial);
        group.add(line);
        connections.push({
            line,
            satellite,
            initialDistance: satellite.position.length()
        });
    }
    
    group.position.z = -50;
    group.visible = false;
    scene.add(group);
    
    return { group, hub, satellites, connections };
}

// Star field creation
function createStarField() {
    const starGroup = new THREE.Group();
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.5,
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

// Create scene elements
const { core, fieldGroup } = createMagnetarVisualization();
const neuralNetwork = createNeuralNetworkVisualization();
const dataViz = createDataVisualization();
const publicationsViz = createPublicationsVisualization();
const communication = createCommunicationVisualization();
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
    'home': { obj: { core, fieldGroup }, active: true },
    'about': { obj: neuralNetwork, active: false },
    'work': { obj: dataViz, active: false },
    'publications': { obj: publicationsViz, active: false },
    'contact': { obj: communication, active: false }
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

// Update 3D visualizations based on active section
function updateVisualizations() {
    // Hide all visualizations first
    for (const section in sectionVisualizationStates) {
        const state = sectionVisualizationStates[section];
        
        if (section === currentSection) {
            // Transition to this visualization
            if (!state.active) {
                if (section === 'home') {
                    gsap.to(core.position, { x: 0, y: 0, z: 0, duration: 1.5, ease: "power2.inOut" });
                    gsap.to(fieldGroup.position, { x: 0, y: 0, z: 0, duration: 1.5, ease: "power2.inOut" });
                } else {
                    const obj = state.obj.group;
                    obj.visible = true;
                    gsap.fromTo(obj.position, 
                        { z: -200 }, 
                        { z: -50, duration: 1.5, ease: "power2.inOut" }
                    );
                    
                    // Fade out home visualization
                    gsap.to(core.position, { z: 200, duration: 1.5, ease: "power2.inOut" });
                    gsap.to(fieldGroup.position, { z: 200, duration: 1.5, ease: "power2.inOut" });
                }
                state.active = true;
            }
        } else if (state.active) {
            // Transition this visualization out
            if (section === 'home') {
                gsap.to(core.position, { z: 200, duration: 1.5, ease: "power2.inOut" });
                gsap.to(fieldGroup.position, { z: 200, duration: 1.5, ease: "power2.inOut" });
            } else {
                const obj = state.obj.group;
                gsap.to(obj.position, { z: -200, duration: 1.5, ease: "power2.inOut", onComplete: () => {
                    obj.visible = false;
                }});
            }
            state.active = false;
        }
    }
}

// Scroll event listener
window.addEventListener('scroll', updateActiveSection);

// Progress dots navigation
document.querySelectorAll('.progress-dot').forEach(dot => {
    dot.addEventListener('click', () => {
        const section = dot.dataset.section;
        document.getElementById(section).scrollIntoView({ behavior: 'smooth' });
    });
    
    dot.addEventListener('mouseenter', () => {
        cursor.classList.add('hover');
    });
    
    dot.addEventListener('mouseleave', () => {
        cursor.classList.remove('hover');
    });
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Home section animations
    core.rotation.x += 0.005;
    core.rotation.y += 0.003;
    fieldGroup.rotation.x += 0.005;
    fieldGroup.rotation.y += 0.003;
    
    // About section animations
    if (sectionVisualizationStates.about.active) {
        neuralNetwork.group.rotation.y += 0.005;
        
        // Pulse the nodes
        neuralNetwork.nodes.forEach((layer, i) => {
            layer.forEach((node, j) => {
                const time = Date.now() * 0.001;
                const scale = 0.9 + Math.sin(time * 2 + i + j) * 0.2;
                node.scale.set(scale, scale, scale);
            });
        });
    }
    
    // Work section animations
    if (sectionVisualizationStates.work.active) {
        dataViz.group.rotation.y += 0.005;
        
        // Animate data points
        dataViz.dataPoints.forEach((point, i) => {
            const time = Date.now() * 0.001;
            const x = point.position.x;
            const z = point.position.z;
            const distance = Math.sqrt(x*x + z*z);
            const y = Math.sin(distance * 0.3 + time) * 5;
            point.position.y = y;
        });
    }
    
    // Publications section animations
    if (sectionVisualizationStates.publications.active) {
        publicationsViz.group.rotation.y += 0.002;
        
        // Animate papers
        publicationsViz.papers.forEach((paper, i) => {
            const time = Date.now() * 0.001;
            // Floating animation
            paper.mesh.position.y = paper.initialPos.y + Math.sin(time * paper.floatSpeed) * 2;
            // Slight rotation
            paper.mesh.rotation.y += paper.rotationSpeed;
        });
    }
    
    // Contact section animations
    if (sectionVisualizationStates.contact.active) {
        communication.group.rotation.y += 0.003;
        
        // Pulse the connections
        communication.connections.forEach((conn, i) => {
            const time = Date.now() * 0.001;
            const satellite = conn.satellite;
            
            // Make satellites orbit slightly
            const initialPos = satellite.position.clone().normalize();
            const angle = time * 0.3 + i * 0.5;
            const distance = conn.initialDistance + Math.sin(time + i) * 2;
            
            satellite.position.x = Math.cos(angle) * initialPos.x * distance;
            satellite.position.z = Math.sin(angle) * initialPos.z * distance;
            
            // Update connection line
            const points = [
                communication.hub.position.clone(),
                satellite.position.clone()
            ];
            
            conn.line.geometry.setFromPoints(points);
            conn.line.geometry.verticesNeedUpdate = true;
        });
    }

    // Subtle camera movement based on mouse
    camera.position.x += (mouse.x * 20 - camera.position.x) * 0.05;
    camera.position.y += (mouse.y * 20 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    // Rotate star field
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
updateActiveSection();
animate();