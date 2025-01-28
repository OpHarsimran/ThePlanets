import './style.css'
import * as THREE from 'three'
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import gsap from 'gsap';


// Setup scene, camera, and renderer
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
  25,
  window.innerWidth / window.innerHeight,
  0.1,
  100
)

const renderer = new THREE.WebGLRenderer({
  antialias: true,
})
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)




const radius = 1.2;
const segments = 64;
const rad = 4.5
const colors = ["red","green","blue","orange"];
const spheres = new THREE.Group();
const textureLoader = new THREE.TextureLoader()

const colorSpac =  (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace
}

const textures = [
    textureLoader.load('./csilla/color.png', colorSpac),  
    textureLoader.load('./earth/map.jpg',colorSpac),  
    textureLoader.load('./venus/map.jpg',colorSpac),  
    textureLoader.load('./volcanic/color.png',colorSpac)   
]

const starGeometry = new THREE.SphereGeometry(50, 64, 64) // Large radius to contain scene
const starTexture = textureLoader.load('./stars.jpg')
starTexture.colorSpace = THREE.SRGBColorSpace;
starTexture.mapping = THREE.EquirectangularReflectionMapping // This helps wrap the texture properly
const starMaterial = new THREE.MeshStandardMaterial({
    map: starTexture,
    opacity:0.1,
    side: THREE.BackSide // Render the inside of the sphere
})
const starSphere = new THREE.Mesh(starGeometry, starMaterial)
scene.add(starSphere)

const rgbeLoader = new RGBELoader()
rgbeLoader.load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/moonlit_golf_1k.hdr', function(texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
})
let speresMesh = [];

for(let i=0;i<4;i++){
const geometry = new THREE.SphereGeometry(radius, segments, segments)
const material = new THREE.MeshStandardMaterial({ map: textures[i],        
    metalness: 0.2,
    roughness: 0.8})
const sphere = new THREE.Mesh(geometry, material);
const angle = (i/4) * (Math.PI *2);
sphere.position.x = rad *Math.cos(angle);
sphere.position.z = rad *Math.sin(angle);
speresMesh.push(sphere)

spheres.add(sphere)
}
spheres.rotation.x = 0.1;
spheres.position.y = -0.8;

scene.add(spheres)

// Position camera
camera.position.z = 9


let lastCallTime = 0
const throttleDelay = 1500 // 2 seconds
let scrollCount = 0;
let currentPosition = 0; // Track actual position in percentage

window.addEventListener('wheel', (event) => {
    const now = Date.now()
    
    if (now - lastCallTime >= throttleDelay) {
        lastCallTime = now
        const direction = event.deltaY > 0 ? "down" : "up"
        console.log('Wheel:', direction)
        const heading = document.querySelectorAll('.heading');
        
        if (direction === "down") {
            scrollCount = (scrollCount + 1) % 4;
            currentPosition -= 100; // Move down by 100%
            
            gsap.to(heading, {
                duration: 1,
                y: `${currentPosition}%`,
                ease: "power2.inOut"
            })
            
            gsap.to(spheres.rotation, {
                duration: 1,
                y: `-=${Math.PI / 2}`,
                ease: "power2.inOut"
            })

            // Reset position when completing full rotation
            if (scrollCount === 0) {
                currentPosition = 0;
                gsap.to(heading, {
                    duration: 1,
                    y: '0%',
                    ease: "power2.inOut"
                })
            }
        } else if (direction === "up" && scrollCount > 0) {
            scrollCount = (scrollCount - 1 + 4) % 4;
            currentPosition += 100; 
            
            gsap.to(heading, {
                duration: 1,
                y: `${currentPosition}%`,
                ease: "power2.inOut"
            })
            
            gsap.to(spheres.rotation, {
                duration: 1,
                y: `+=${Math.PI / 2}`,
                ease: "power2.inOut"
            })

            // Reset position when completing full rotation
            if (scrollCount === 0) {
                currentPosition = 0;
                gsap.to(heading, {
                    duration: 1,
                    y: '0%',
                    ease: "power2.inOut"
                })
            }
        }
    }
}, { passive: true })


// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})


let clock = new THREE.Clock()
// Animation loop
function animate() {
  requestAnimationFrame(animate) 
  for(let i=0;i<4;i++){
    let sphere = speresMesh[i];
    sphere.rotation.y += clock.getElapsedTime() * 0.00002;
  }
 
  
  // Render scene
  renderer.render(scene, camera)
}

animate()