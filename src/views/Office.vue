<template>
  <div class="container">
    <div ref="canvasContainer" class="canvas"></div>
    
    <!-- 信息面板 -->
    <div class="info-panel">
      <div class="panel-header">
        <span class="icon">🏢</span>
        <span class="title">OpenClaw</span>
      </div>
      
      <div class="panel-content">
        <div class="section">
          <div class="section-title">👥 工作状态</div>
          <div class="role-cards">
            <div v-for="role in roles" :key="role.id" class="role-card" :class="role.status">
              <div class="role-avatar">{{ role.avatar }}</div>
              <div class="role-info">
                <div class="role-name">{{ role.name }}</div>
                <div class="role-status" :class="role.status">
                  {{ role.status === 'working' ? '工作中' : '空闲' }}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">⏰ 定时任务</div>
          <div class="task-list">
            <div v-for="task in cronJobs.slice(0, 3)" :key="task.id" class="task-item">
              <span class="task-dot" :class="{ active: task.enabled }"></span>
              <span>{{ task.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'

const canvasContainer = ref(null)
const roles = ref([])
const cronJobs = ref([])
const activeCount = ref(0)

let scene, camera, renderer, characters = [], backGlows = []
let animationId = null

// 室内配色
const C = {
  wall: '#E8DCC4',
  wallDark: '#D4C4A8',
  floor: '#B8A080',
  floorLight: '#C9B896',
  desk: '#8B6914',
  deskTop: '#C4A35A',
  chair: '#3D5A80',
  chairSeat: '#4A6FA5',
  screen: '#1A1A2E',
  screenOn: '#00D9FF',
  window: '#87CEEB',
  curtain: '#E8B4B8',
  plant: '#4CAF50',
  plantDark: '#388E3C',
  pot: '#8D6E63',
  light: '#FFE082',
  person: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
  glow: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
  decor: '#E74C3C'
}

function init() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x87CEEB)

  // 等轴测
  const aspect = window.innerWidth / window.innerHeight
  const view = 25
  camera = new THREE.OrthographicCamera(-view * aspect, view * aspect, view, -view, 1, 1000)
  camera.position.set(30, 30, 30)
  camera.lookAt(0, 0, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  canvasContainer.value.appendChild(renderer.domElement)

  // 灯光
  scene.add(new THREE.AmbientLight(0xffffff, 0.7))
  const sun = new THREE.DirectionalLight(0xffffff, 0.5)
  sun.position.set(20, 40, 20)
  scene.add(sun)

  // 地板
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 40),
    new THREE.MeshLambertMaterial({ color: C.floor })
  )
  floor.rotation.x = -Math.PI / 2
  scene.add(floor)

  // 墙壁
  createWalls()

  // 窗户
  createWindows()

  // 工位
  createDesks()

  // 角色
  createCharacters()

  // 室内装饰
  createDecor()

  animate()
  window.addEventListener('resize', onWindowResize)
}

function box(w, h, d, color, x, y, z) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshLambertMaterial({ color })
  )
  mesh.position.set(x, y, z)
  return mesh
}

function createWalls() {
  // 后墙
  scene.add(box(60, 20, 0.5, C.wall, 0, 10, -15))
  // 左墙
  scene.add(box(0.5, 20, 40, C.wall, -30, 10, 5))
  // 右墙
  scene.add(box(0.5, 20, 40, C.wall, 30, 10, 5))
  
  // 地板边
  scene.add(box(60, 0.3, 0.5, C.wallDark, 0, 0.15, -14.75))
}

function createWindows() {
  // 大窗户
  for (let i = 0; i < 3; i++) {
    // 窗框
    scene.add(box(8, 10, 0.3, C.window, -15 + i * 15, 12, -14.7))
    // 窗户玻璃
    scene.add(box(7, 9, 0.1, C.window, -15 + i * 15, 12, -14.5))
    // 窗帘
    scene.add(box(0.2, 11, 1, C.curtain, -19 + i * 15, 12, -14))
    scene.add(box(0.2, 11, 1, C.curtain, -11 + i * 15, 12, -14))
  }
}

function createDesks() {
  const positions = [[-12, 2], [0, 2], [12, 2]]
  
  positions.forEach((pos, i) => {
    // 桌面
    scene.add(box(6, 0.3, 3, C.deskTop, pos[0], 4, pos[1]))
    // 桌腿
    scene.add(box(0.3, 4, 0.3, C.desk, pos[0] - 2.5, 2, pos[1] - 1))
    scene.add(box(0.3, 4, 0.3, C.desk, pos[0] + 2.5, 2, pos[1] - 1))
    scene.add(box(0.3, 4, 0.3, C.desk, pos[0] - 2.5, 2, pos[1] + 1))
    scene.add(box(0.3, 4, 0.3, C.desk, pos[0] + 2.5, 2, pos[1] + 1))

    // 显示器
    scene.add(box(2.5, 1.8, 0.2, 0x333333, pos[0], 5.5, pos[1] - 1.3))
    scene.add(box(2, 1.3, 0.1, C.screenOn, pos[0], 5.5, pos[1] - 1.2))
    // 显示器底座
    scene.add(box(1, 0.3, 0.8, 0x333333, pos[0], 4.3, pos[1] - 1.2))

    // 键盘
    scene.add(box(1.5, 0.15, 0.8, 0x555555, pos[0], 4.25, pos[1] + 0.5))

    // 椅子
    // 椅子座
    scene.add(box(1.2, 0.25, 1.2, C.chairSeat, pos[0], 1.8, pos[1] + 1.8))
    // 椅子背
    scene.add(box(1.2, 2, 0.2, C.chair, pos[0], 2.8, pos[1] + 2.3))
    // 椅子腿
    scene.add(box(0.15, 1.6, 0.15, 0x666666, pos[0] - 0.4, 0.8, pos[1] + 1.8))
    scene.add(box(0.15, 1.6, 0.15, 0x666666, pos[0] + 0.4, 0.8, pos[1] + 1.8))
  })
}

function createCharacters() {
  const positions = [[-12, 5], [0, 5], [12, 5]]
  
  positions.forEach((pos, i) => {
    const group = new THREE.Group()
    
    // 背景光晕
    const glowGeo = new THREE.CircleGeometry(2, 32)
    const glowMat = new THREE.MeshBasicMaterial({ 
      color: C.glow[i], 
      transparent: true, 
      opacity: 0.25 
    })
    const glow = new THREE.Mesh(glowGeo, glowMat)
    glow.position.set(0, 2.5, -0.6)
    glow.rotation.x = -Math.PI / 4
    glow.visible = false
    group.add(glow)
    backGlows.push(glow)

    // 身体
    group.add(box(0.9, 1.4, 0.7, C.person[i], 0, 1.7, 0))
    
    // 头
    group.add(box(0.75, 0.75, 0.75, 0xFFE4C4, 0, 3.15, 0))
    
    // 眼睛
    group.add(box(0.12, 0.12, 0.1, 0x333333, -0.2, 3.25, 0.38))
    group.add(box(0.12, 0.12, 0.1, 0x333333, 0.2, 3.25, 0.38))
    
    // 腮红
    group.add(box(0.15, 0.1, 0.1, 0xFFAAAA, -0.35, 3.0, 0.38))
    group.add(box(0.15, 0.1, 0.1, 0xFFAAAA, 0.35, 3.0, 0.38))
    
    // 微笑
    group.add(box(0.2, 0.08, 0.1, 0xFF6B6B, 0, 2.85, 0.38))

    // 光环
    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(0.7, 0.1, 8, 24),
      new THREE.MeshBasicMaterial({ color: 0xFFD700 })
    )
    halo.position.y = 4
    halo.rotation.x = Math.PI / 2
    halo.visible = false
    group.add(halo)

    group.position.set(pos[0], 0, pos[1])
    group.userData = { 
      baseZ: pos[1], 
      walkZ: pos[1] + 3,
      isWorking: false,
      halo,
      glow
    }
    
    scene.add(group)
    characters.push(group)
  })
}

function createDecor() {
  // 植物
  const plants = [[-25, -5], [25, -5], [-25, 15], [25, 15]]
  plants.forEach(p => {
    // 花盆
    scene.add(box(1.5, 1.5, 1.5, C.pot, p[0], 0.75, p[1]))
    // 叶子
    scene.add(box(1, 2, 1, C.plant, p[0], 2.5, p[1]))
    scene.add(box(0.8, 1.5, 0.8, C.plantDark, p[0], 3.5, p[1]))
  })

  // 打印机
  scene.add(box(1.5, 1.2, 1.2, 0xCCCCCC, 22, 0.6, 0))
  scene.add(box(1, 0.3, 0.8, 0x999999, 22, 1.35, 0))

  // 时钟
  scene.add(box(1.5, 1.5, 0.2, 0xFFFFFF, -22, 15, -14.5))
  scene.add(box(0.1, 0.8, 0.1, 0x333333, -22, 15, -14.3))

  // 装饰画
  scene.add(box(4, 3, 0.2, 0xE74C3C, 22, 12, -14.5))
  scene.add(box(3, 2, 0.1, 0xFFFFFF, 22, 12, -14.35))

  // 空调/暖气
  scene.add(box(3, 1, 1, 0xDDDDDD, 10, 18, -14.7))
  scene.add(box(3, 1, 1, 0xDDDDDD, -10, 18, -14.7))

  // 门
  scene.add(box(3, 8, 0.3, 0x8B4513, -28, 4, 0))
  scene.add(box(0.1, 6, 0.1, 0xFFD700, -26.5, 4, 0.2))
}

function updateCharacters() {
  const time = Date.now() * 0.001
  
  characters.forEach((char, i) => {
    const role = roles.value[i]
    const isWorking = role?.status === 'working'
    char.userData.isWorking = isWorking
    char.userData.halo.visible = isWorking
    char.userData.glow.visible = isWorking
    
    if (isWorking) {
      char.position.y = Math.sin(time * 5 + i) * 0.12
      char.position.z = char.userData.walkZ + Math.sin(time * 0.8) * 1.2
    } else {
      char.scale.setScalar(1 + Math.sin(time * 1.5 + i) * 0.025)
      char.position.z = char.userData.baseZ
      char.position.y = 0
    }
    
    if (char.userData.halo.visible) {
      char.userData.halo.rotation.z += 0.04
    }
  })
}

function animate() {
  animationId = requestAnimationFrame(animate)
  updateCharacters()
  renderer.render(scene, camera)
}

function onWindowResize() {
  const aspect = window.innerWidth / window.innerHeight
  const view = 25
  camera.left = -view * aspect
  camera.right = view * aspect
  camera.top = view
  camera.bottom = -view
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

async function fetchData() {
  try {
    const [rolesRes, statusRes] = await Promise.all([
      fetch('http://localhost:3001/api/roles').then(r => r.json()).catch(() => ({ code: 0, data: [] })),
      fetch('http://localhost:3001/api/status').then(r => r.json()).catch(() => ({ code: 0, data: {} }))
    ])
    
    if (rolesRes.code === 0) roles.value = rolesRes.data
    if (statusRes.code === 0) {
      cronJobs.value = statusRes.data.cronJobs || []
      activeCount.value = roles.value.filter(r => r.status === 'working').length
    }
  } catch (e) {
    console.error('获取数据失败:', e)
  }
}

let dataTimer = null

onMounted(() => {
  init()
  dataTimer = setInterval(fetchData, 3000)
  fetchData()
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
  if (dataTimer) clearInterval(dataTimer)
  window.removeEventListener('resize', onWindowResize)
})
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }

.container { width: 100vw; height: 100vh; position: relative; }
.canvas { width: 100%; height: 100%; }

.info-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 170px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.12);
  z-index: 100;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  font-size: 13px;
}

.panel-content { padding: 12px; }
.section { margin-bottom: 12px; }
.section:last-child { margin-bottom: 0; }
.section-title { font-size: 9px; color: #999; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }

.role-cards { display: flex; flex-direction: column; gap: 6px; }

.role-card { 
  display: flex; align-items: center; gap: 10px; 
  padding: 8px 10px; background: #FAFBFC; border-radius: 12px;
}

.role-card.working { background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%); }

.role-avatar {
  width: 32px; height: 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px;
}

.role-info { flex: 1; }
.role-name { font-size: 12px; font-weight: 600; color: #333; }
.role-status { font-size: 10px; color: #999; }
.role-status.working { color: #4CAF50; font-weight: 500; }

.task-list { display: flex; flex-direction: column; gap: 5px; }
.task-item { display: flex; align-items: center; gap: 6px; font-size: 11px; color: #666; padding: 4px 0; }
.task-dot { width: 6px; height: 6px; border-radius: 50%; background: #CCC; }
.task-dot.active { background: #4CAF50; }
</style>
