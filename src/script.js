import * as THREE from 'three'
import {FontLoader} from 'three/examples/jsm/loaders/FontLoader.js'
import {TextGeometry} from 'three/examples/jsm/geometries/TextGeometry.js'
import {
  DirectionalLight,
  Object3D, PCFShadowMap, ShadowMaterial,
} from "three";


/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

const whiteBG = new THREE.Mesh(new THREE.PlaneGeometry(4, 3), new THREE.MeshBasicMaterial({color: 'white'}));
scene.add(whiteBG);
whiteBG.position.z = -1

const pivot = new Object3D();
scene.add(pivot)


/**
 * Light
 */
const light = new DirectionalLight(0xf00fff, 1);
light.position.set(1, 1, -1);
light.castShadow = true;
light.shadow.mapSize.setScalar(2048)
scene.add(light);


/**
 * Font
 */
const textMaterial = new THREE.MeshBasicMaterial({color: '#000'})

const fontLoader = new FontLoader();
let text;

fontLoader.load(
  'font/Anton_Regular.json',
  (font) => {
    const textGeometry = new TextGeometry(
      'HELLLLO',
      {
        font: font,
        size: 0.5,
        height: 0.001,
        curveSegments: 10,
        bevelEnabled: true,
        bevelThickness: 0,
        bevelSize: 0,
        bevelOffset: 0,
        bevelSegments: 0
      }
    )
    textGeometry.center()

    text = new THREE.Mesh(textGeometry, textMaterial)
    text.position.z = .1
    text.scale.y = 1.6
    text.scale.x = 0.94

    text.castShadow = true
    scene.add(text);
  })


/**
 * Video
 */
const bgPlane = new THREE.Mesh(new THREE.PlaneGeometry(2, 1), new THREE.MeshBasicMaterial({color: 'white'}));
bgPlane.rotation.x = -Math.PI * .5
pivot.add(bgPlane)

async function loadVideoAsync(videoUrl) {
  try {
    const response = await fetch(videoUrl);
    const data = await response.blob();
    const videoBlobUrl = URL.createObjectURL(data);

    const video = document.createElement('video');
    video.src = videoBlobUrl;
    video.muted = true;
    video.defaultMuted = true;
    video.autoplay = true;
    video.loop = true;
    video.load();
    video.play();

    // Используем видео как текстуру
    const texture = new THREE.VideoTexture(video);

    // Создаем материал с видеотекстурой
    bgPlane.material = new THREE.MeshBasicMaterial({map: texture});

  } catch (error) {
    console.error('Ошибка при загрузке видео:', error);
  }
}

// Вызываем функцию с URL видео
loadVideoAsync('/video/sea.mp4');


/**
 * Plane для тени
 */
const shadowPlane = new THREE.Mesh(
  new THREE.PlaneGeometry(2, 1),
  new ShadowMaterial({
    transparent: true,
    opacity: .7,
  })
);
shadowPlane.rotation.x = -Math.PI * .5
shadowPlane.position.y = 0.001
shadowPlane.receiveShadow = true
pivot.add(shadowPlane);


/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}
window.addEventListener('resize', () => {
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
camera.position.x = 0
camera.position.y = 0
camera.position.z = 2
scene.add(camera)


/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFShadowMap

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
  const elapsedTime = clock.getElapsedTime()
  const speed = (Math.abs(Math.sin(elapsedTime / 2)) * Math.PI * .5)

  if (text) {
    text.rotation.x = speed
  }
  pivot.rotation.x = speed

  light.position.x = Math.sin(elapsedTime)


  renderer.render(scene, camera)
  window.requestAnimationFrame(tick)
}

tick()
