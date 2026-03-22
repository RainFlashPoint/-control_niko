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

// 配色 - 参考图风格
const C = {
  sky: 0x87CEEB,
  ground: 0x90C948,
  road: 0x7FB0B5,
  roadLine: 0xFFFFFF,
  buildings: ['#FF7B7B', '#7BDEFF', '#C4FF7B', '#FFE77B', '#C77BFF'],
  window: 0xFFEB99,
  windowOff: 0x5A6978,
  desk: 0xB08B69,
  deskTop: 0xE8D5C4,
  chair: 0x4A6572,
  screen: 0x90CAF9,
  screenOff: 0x263238,
  tree: 0x4CAF50,
  treeDark: 0x388E3C,
  trunk: 0x8D6E63,
  person: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
  glow: ['#FF6B6B', '#4ECDC4', '#45B7D1']
}

function init() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(C.sky)

  // 等轴测相机
  const aspect = window.innerWidth / window.innerHeight
  const view = 28
  camera = new THREE.OrthographicCamera(-view * aspect, view * aspect, view, -view, 1, 1000)
  camera.position.set(35, 35, 35)
  camera.lookAt(0, 0, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  canvasContainer.value.appendChild(renderer.domElement)

  // 柔和灯光
  const ambient = new THREE.AmbientLight(0xffffff, 0.8)
  scene.add(ambient)
  
  const sun = new THREE.DirectionalLight(0xffffff, 0.5)
  sun.position.set(30, 50, 30)
  scene.add(sun)

  // 地面 - 草地
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(150, 150),
    new THREE.MeshLambertMaterial({ color: C.ground })
  )
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -0.1
  scene.add(ground)

  // 道路
  const roadGroup = new THREE.Group()
  const road = new THREE.Mesh(
    new THREE.PlaneGeometry(150, 14),
    new THREE.MeshLambertMaterial({ color: C.road })
  )
  road.rotation.x = -Math.PI / 2
  roadGroup.add(road)
  
  // 道路线
  for (let i = -6; i <= 6; i++) {
    const line = new THREE.Mesh(
      new THREE.PlaneGeometry(4, 0.8),
      new THREE.MeshBasicMaterial({ color: C.roadLine })
    )
    line.rotation.x = -Math.PI / 2
    line.position.set(i * 10, 0.02, 0)
    roadGroup.add(line)
  }
  roadGroup.position.z = 18
  scene.add(roadGroup)

  // 建筑群
  createCity()

  // 工位
  createWorkDesks()

  // 角色
  createCharacters()

  // 装饰
  createDecorations()

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

function createCity() {
  // 主建筑
  scene.add(box(30, 18, 12, C.buildings[0], 0, 9, -12))
  // 副建筑1
  scene.add(box(18, 14, 10, C.buildings[1], -22, 7, -2))
  // 副建筑2
  scene.add(box(16, 16, 12, C.buildings[2], 22, 8, -8))
  // 副建筑3
  scene.add(box(12, 10, 8, C.buildings[3], -30, 5, 8))
  scene.add(box(12, 12, 8, C.buildings[4], 30, 6, 5))

  // 窗户 - 主楼
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 5; col++) {
      const on = Math.random() > 0.3
      scene.add(box(3, 3.5, 0.2, on ? C.window : C.windowOff, -10 + col * 5, 4 + row * 5, -5.9))
    }
  }
  
  // 窗户 - 副建筑
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 3; col++) {
      const on = Math.random() > 0.4
      scene.add(box(2.5, 2.5, 0.2, on ? C.window : C.windowOff, -28 + col * 6, 3 + row * 5, 3.1))
      scene.add(box(2.5, 2.5, 0.2, on ? C.window : C.windowOff, 17 + col * 6, 3 + row * 5, -1.9))
    }
  }
}

function createWorkDesks() {
  const positions = [[-10, 6], [0, 6], [10, 6]]
  
  positions.forEach((pos, i) => {
    // 桌面
    scene.add(box(4, 0.4, 2.5, C.deskTop, pos[0], 2.8, pos[1]))
    // 桌腿
    scene.add(box(0.3, 2.8, 0.3, C.desk, pos[0] - 1.5, 1.4, pos[1] - 0.8))
    scene.add(box(0.3, 2.8, 0.3, C.desk, pos[0] + 1.5, 1.4, pos[1] - 0.8))
    scene.add(box(0.3, 2.8, 0.3, C.desk, pos[0] - 1.5, 1.4, pos[1] + 0.8))
    scene.add(box(0.3, 2.8, 0.3, C.desk, pos[0] + 1.5, 1.4, pos[1] + 0.8))

    // 显示器
    scene.add(box(1.8, 1.3, 0.15, 0x333333, pos[0], 4, pos[1] - 1))
    scene.add(box(1.4, 0.9, 0.1, C.screen, pos[0], 4, pos[1] - 0.9))

    // 键盘
    scene.add(box(1.2, 0.15, 0.6, 0x555555, pos[0], 3.1, pos[1] + 0.5))

    // 椅子
    scene.add(box(1, 0.25, 1, C.chair, pos[0], 0.9, pos[1] + 1.2))
    scene.add(box(1, 1.3, 0.25, C.chair, pos[0], 1.8, pos[1] + 1.8))
  })
}

function createCharacters() {
  const positions = [[-10, 9], [0, 9], [10, 9]]
  
  positions.forEach((pos, i) => {
    const group = new THREE.Group()
    
    // 背景光晕
    const glowGeo = new THREE.CircleGeometry(2.5, 32)
    const glowMat = new THREE.MeshBasicMaterial({ 
      color: C.glow[i], 
      transparent: true, 
      opacity: 0.3 
    })
    const glow = new THREE.Mesh(glowGeo, glowMat)
    glow.position.set(0, 2.5, -0.8)
    glow.rotation.x = -Math.PI / 4
    glow.visible = false
    group.add(glow)
    backGlows.push(glow)

    // 身体
    const body = box(0.9, 1.4, 0.7, C.person[i], 0, 1.7, 0)
    group.add(body)
    
    // 头
    const head = box(0.75, 0.75, 0.75, 0xFFE4C4, 0, 3.15, 0)
    group.add(head)
    
    // 眼睛
    const eye1 = box(0.12, 0.12, 0.1, 0x333333, -0.2, 3.25, 0.38)
    group.add(eye1)
    const eye2 = box(0.12, 0.12, 0.1, 0x333333, 0.2, 3.25, 0.38)
    group.add(eye2)
    
    // 腮红
    const blush1 = box(0.15, 0.1, 0.1, 0xFFAAAA, -0.35, 3.0, 0.38)
    group.add(blush1)
    const blush2 = box(0.15, 0.1, 0.1, 0xFFAAAA, 0.35, 3.0, 0.38)
    group.add(blush2)
    
    // 微笑
    const mouth = box(0.2, 0.08, 0.1, 0xFF6B6B, 0, 2.85, 0.38)
    group.add(mouth)

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
      walkZ: pos[1] + 3.5,
      isWorking: false,
      halo,
      glow
    }
    
    scene.add(group)
    characters.push(group)
  })
}

function createDecorations() {
  // 树
  const trees = [
    [-35, -8], [35, -8], [-40, 5], [40, 5], 
    [-25, 20], [25, 20], [-15, 25], [15, 25]
  ]
  
  trees.forEach(t => {
    scene.add(box(1.2, 3.5, 1.2, C.trunk, t[0], 1.75, t[1]))
    scene.add(box(2.8, 2.8, 2.8, C.tree, t[0], 4.4, t[1]))
    scene.add(box(2.2, 2.2, 2.2, C.treeDark, t[0], 6.1, t[1]))
    scene.add(box(1.5, 1.5, 1.5, C.tree, t[0], 7.4, t[1]))
  })

  // 打印机
  scene.add(box(1, 0.8, 1, 0xCCCCCC, 20, 0.4, 6))
  
  // 会议室
  const glass = box(5, 2.5, 3, 0xE1F5FE, 20, 1.25, -6)
  glass.material.transparent = true
  glass.material.opacity = 0.5
  scene.add(glass)

  // 老板办公室
  scene.add(box(7, 3.5, 5, '#FFF59D', -28, 1.75, -10))
  scene.add(box(7.5, 0.4, 5.5, '#FFCA28', -28, 3.7, -10))
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
      // 工作动画 - 弹跳 + 走动
      char.position.y = Math.sin(time * 5 + i) * 0.12
      char.position.z = char.userData.walkZ + Math.sin(time * 0.8) * 1.5
    } else {
      // 空闲动画 - 呼吸
      char.scale.setScalar(1 + Math.sin(time * 1.5 + i) * 0.025)
      char.position.z = char.userData.baseZ
      char.position.y = 0
    }
    
    // 光环旋转
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
  const view = 28
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
body { 
  overflow: hidden; 
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
}

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

.panel-header .icon { font-size: 16px; }

.panel-content { padding: 12px; }

.section { margin-bottom: 12px; }
.section:last-child { margin-bottom: 0; }
.section-title { 
  font-size: 9px; 
  color: #999; 
  text-transform: uppercase; 
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.role-cards { display: flex; flex-direction: column; gap: 6px; }

.role-card { 
  display: flex; 
  align-items: center; 
  gap: 10px; 
  padding: 8px 10px; 
  background: #FAFBFC; 
  border-radius: 12px;
  transition: all 0.3s;
}

.role-card.working { 
  background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%);
}

.role-avatar {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.role-info { flex: 1; }

.role-name {
  font-size: 12px;
  font-weight: 600;
  color: #333;
}

.role-status {
  font-size: 10px;
  color: #999;
}

.role-status.working { color: #4CAF50; font-weight: 500; }

.task-list { display: flex; flex-direction: column; gap: 5px; }

.task-item { 
  display: flex; 
  align-items: center; 
  gap: 6px; 
  font-size: 11px; 
  color: #666;
  padding: 4px 0;
}

.task-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #CCC;
}

.task-dot.active { background: #4CAF50; }
</style>
