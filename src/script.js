import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import * as dat from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()
const debugObject = {}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()

const asphaltColorTexture = textureLoader.load('/textures/Asphalt_005_SD/Asphalt_006_COLOR.jpg')
const asphaltAmbientOcclusionTexture = textureLoader.load('/textures/Asphalt_005_SD/Asphalt_006_OCC.jpg')
const asphaltNormalTexture = textureLoader.load('/textures/Asphalt_005_SD/Asphalt_006_NRM.jpg')
const asphaltRoughnessTexture = textureLoader.load('/textures/Asphalt_005_SD/Asphalt_006_ROUGH.jpg')

asphaltColorTexture.wrapS = THREE.RepeatWrapping
asphaltColorTexture.wrapT = THREE.RepeatWrapping
asphaltAmbientOcclusionTexture.wrapS = THREE.RepeatWrapping
asphaltAmbientOcclusionTexture.wrapT = THREE.RepeatWrapping
asphaltNormalTexture.wrapS = THREE.RepeatWrapping
asphaltNormalTexture.wrapT = THREE.RepeatWrapping
asphaltRoughnessTexture.wrapS = THREE.RepeatWrapping
asphaltRoughnessTexture.wrapT = THREE.RepeatWrapping
asphaltColorTexture.repeat.set(8,8)
asphaltAmbientOcclusionTexture.repeat.set(8,8)
asphaltNormalTexture.repeat.set(8,8)
asphaltRoughnessTexture.repeat.set(8,8)

/**
 * Update all materials
 */
const updateAllMaterials = () => {
    scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial){
           child.material.envMap = environmentMap
            child.material.envMapIntensity = debugObject.envMapIntensity
            child.castShadow = true
            child.receiveShadow = true
        }
    })
}

debugObject.envMapIntensity = 2.5
gui.add(debugObject, 'envMapIntensity').min(0).max(10).step(0.001).onChange(updateAllMaterials)

/**
 * Models
 */
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')

const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

let mixer = null

gltfLoader.load(
    '/models/plane.glb',
    (gltf) =>
    {
        console.log(gltf);
        gltf.scene.position.y += 10;
        scene.add(gltf.scene)
    }
)

gltfLoader.load(
    '/models/hangar.glb',
    (gltf) =>
    {
        console.log(gltf);
        gltf.scene.position.x += 10;
        gltf.scene.position.z += 10;
        scene.add(gltf.scene)
    }
)

gltfLoader.load(
    '/models/terminal.glb',
    (gltf) =>
    {
        console.log(gltf);
        gltf.scene.position.x -= 10;
        gltf.scene.position.z -= 5;
        scene.add(gltf.scene)
    }
)

gltfLoader.load(
    '/models/bus.glb',
    (gltf) =>
    {
        console.log(gltf);
        gltf.scene.position.x += 10;
        gltf.scene.position.y += 0.5;
        gltf.scene.position.z -= 10;
        scene.add(gltf.scene)
    }
)

gltfLoader.load(
    '/models/tower.glb',
    (gltf) =>
    {
        console.log(gltf);
        gltf.scene.position.x -= 10;
        gltf.scene.position.z += 10;
        scene.add(gltf.scene)
    }
)

const cubeTextureLoader = new THREE.CubeTextureLoader()
/**
 * Environment map
 */
const environmentMap =  cubeTextureLoader.load([
    '/textures/cubeMaps/px.png',
    '/textures/cubeMaps/nx.png',
    '/textures/cubeMaps/py.png',
    '/textures/cubeMaps/ny.png',
    '/textures/cubeMaps/pz.png',
    '/textures/cubeMaps/nz.png'
])
environmentMap.encoding = THREE.sRGBEncoding
scene.background = environmentMap
scene.environment = environmentMap

/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50),
    new THREE.MeshStandardMaterial({
        map: asphaltColorTexture,
        aoMap: asphaltAmbientOcclusionTexture,
        normalMap: asphaltNormalTexture,
        roughnessMap: asphaltRoughnessTexture
    })
)
floor.geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(floor.geometry.attributes.uv.array, 2))
floor.rotation.x = -Math.PI * 0.5
floor.position.y = 0
floor.receiveShadow = true
scene.add(floor)

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 3);
directionalLight.position.set(3, 1, -2.25);
directionalLight.castShadow = true;
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.mapSize.set(1024, 1024)
scene.add(directionalLight)

gui.add(directionalLight, 'intensity').min(0).max(10).step(0.001).name('lightIntensity')
gui.add(directionalLight.position,'x').min(-5).max(5).step(0.001).name('lightX')
gui.add(directionalLight.position,'y').min(-5).max(5).step(0.001).name('lightY')
gui.add(directionalLight.position,'z').min(-5).max(5).step(0.001).name('lightZ')

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(- 8, 4, 8)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 1, 0)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    if(mixer)
    {
        mixer.update(deltaTime)
    }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()