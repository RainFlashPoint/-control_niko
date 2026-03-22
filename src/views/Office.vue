<template>
  <div class="container">
    <div ref="canvasContainer" class="canvas"></div>
    
    <!-- 信息面板 -->
    <div class="info-panel">
      <div class="panel-header">
        <span class="logo">🎭</span>
        <span class="title">OpenClaw</span>
        <span class="live-dot"></span>
      </div>
      
      <div class="panel-content">
        <div class="section">
          <div class="section-title">👥 工作状态</div>
          <div class="role-cards">
            <div v-for="role in roles" :key="role.id" class="role-card" :class="role.status">
              <span class="avatar">{{ role.avatar }}</span>
              <div class="info">
                <span class="name">{{ role.name }}</span>
                <span class="task" v-if="role.currentTask">{{ role.currentTask }}</span>
                <span class="status-text" v-else>空闲中</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">⏰ 定时任务</div>
          <div class="task-list">
            <div v-for="task in cronJobs.slice(0, 4)" :key="task.id" class="task-item">
              <span>{{ task.name }}</span>
              <span class="schedule">{{ task.schedule }}</span>
            </div>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">⚡ 技能</div>
          <div class="skill-tags">
            <span v-for="skill in skills" :key="skill.name" class="skill-tag">{{ skill.name }}</span>
          </div>
        </div>
      </div>
      
      <div class="panel-footer">
        <span>{{ systemInfo.hostname }}</span>
        <span>{{ systemInfo.uptime }}</span>
      </div>
    </div>

    <!-- 底部状态 -->
    <div class="status-bar">
      <span>🏢 OpenClaw</span>
      <span class="time">{{ currentTime }}</span>
      <span :class="{ active: activeCount > 0 }">
        <span class="dot"></span>
        {{ activeCount }} 工作中
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'

const canvasContainer = ref(null)
const roles = ref([])
const cronJobs = ref([])
const skills = ref([])
const systemInfo = ref({ hostname: '-', uptime: '0s' })
const currentTime = ref('')
const activeCount = ref(0)

let scene, camera, renderer, characters = [], lights = []
let animationId = null

// 柔和配色
const COLORS = {
  sky: 0xE8F4F8,
  ground: 0x7CB342,
  building: 0xFFECB3,
  buildingDark: 0xFFD54F,
  windowOff: 0xB0BEC5,
  windowOn: 0x81C784,
  desk: 0x8D6E63,
  deskTop: 0xBCAAA4,
  chair: 0x5D4037,
  screen: 0x4FC3F7,
  screenOff: 0x263238,
  tree: 0x66BB6A,
  trunk: 0x8D6E63,
  character: [0xE57373, 0x64B5F6, 0x81C784]
}

function init() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(COLORS.sky)

  // 正交相机 - 等轴测视角
  const aspect = window.innerWidth / window.innerHeight
  const d = 25
  camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000)
  camera.position.set(30, 30, 30)
  camera.lookAt(0, 0, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  canvasContainer.value.appendChild(renderer.domElement)

  // 柔和灯光
  const ambient = new THREE.AmbientLight(0xffffff, 0.7)
  scene.add(ambient)

  const directional = new THREE.DirectionalLight(0xffffff, 0.5)
  directional.position.set(20, 40, 20)
  scene.add(directional)

  // 地面 - 草地
  const groundGeo = new THREE.PlaneGeometry(80, 80)
  const groundMat = new THREE.MeshLambertMaterial({ color: COLORS.ground })
  const ground = new THREE.Mesh(groundGeo, groundMat)
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -0.1
  scene.add(ground)

  // 道路
  const roadGeo = new THREE.PlaneGeometry(80, 8)
  const roadMat = new THREE.MeshLambertMaterial({ color: 0x90A4AE })
  const road = new THREE.Mesh(roadGeo, roadMat)
  road.rotation.x = -Math.PI / 2
  road.position.set(0, 0.01, 15)
  scene.add(road)

  // 办公楼
  createBuilding()

  // 工位
  createDesks()

  // 角色
  createCharacters()

  // 装饰
  createDecorations()

  animate()
  window.addEventListener('resize', onWindowResize)
}

function createBox(w, h, d, color, x, y, z) {
  const geo = new THREE.BoxGeometry(w, h, d)
  const mat = new THREE.MeshLambertMaterial({ color })
  const mesh = new THREE.Mesh(geo, mat)
  mesh.position.set(x, y, z)
  return mesh
}

function createBuilding() {
  // 主楼
  const building = createBox(30, 18, 12, COLORS.building, 0, 9, -8)
  scene.add(building)

  // 楼顶
  const roof = createBox(32, 1, 14, COLORS.buildingDark, 0, 18.5, -8)
  scene.add(roof)

  // 窗户 - 3行4列
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      const isOn = Math.random() > 0.3
      const win = createBox(4, 3.5, 0.2, isOn ? COLORS.windowOn : COLORS.windowOff, -10 + col * 6.5, 5 + row * 5, 0.1)
      scene.add(win)
    }
  }

  // 门
  const door = createBox(4, 6, 0.2, COLORS.buildingDark, 0, 3, -1.9)
  scene.add(door)

  // 公司标牌
  const sign = createBox(10, 2, 0.3, 0xFFFFFF, 0, 16, -1.8)
  scene.add(sign)
}

function createDesks() {
  const positions = [
    { x: -10, z: 2 },
    { x: 0, z: 2 },
    { x: 10, z: 2 }
  ]

  positions.forEach((pos, i) => {
    // 桌腿
    scene.add(createBox(0.5, 3, 0.5, COLORS.desk, pos.x - 2, 1.5, pos.z - 1))
    scene.add(createBox(0.5, 3, 0.5, COLORS.desk, pos.x + 2, 1.5, pos.z - 1))
    scene.add(createBox(0.5, 3, 0.5, COLORS.desk, pos.x - 2, 1.5, pos.z + 1))
    scene.add(createBox(0.5, 3, 0.5, COLORS.desk, pos.x + 2, 1.5, pos.z + 1))

    // 桌面
    scene.add(createBox(5, 0.4, 3, COLORS.deskTop, pos.x, 3.2, pos.z))

    // 显示器
    const screen = createBox(2.5, 1.8, 0.2, COLORS.screen, pos.x, 4.5, pos.z - 1.3)
    scene.add(screen)

    // 屏幕内容
    const screenContent = createBox(2, 1.4, 0.1, COLORS.screen, pos.x, 4.5, pos.z - 1.15)
    scene.add(screenContent)

    // 键盘
    scene.add(createBox(1.8, 0.2, 0.8, 0x424242, pos.x, 3.5, pos.z + 0.5))

    // 椅子
    const chairSeat = createBox(1.5, 0.3, 1.5, COLORS.chair, pos.x, 1.5, pos.z + 2)
    scene.add(chairSeat)
    const chairBack = createBox(1.5, 2, 0.3, COLORS.chair, pos.x, 2.5, pos.z + 2.7)
    scene.add(chairBack)
  })
}

function createCharacters() {
  const positions = [
    { x: -10, z: 5 },
    { x: 0, z: 5 },
    { x: 10, z: 5 }
  ]

  positions.forEach((pos, i) => {
    const group = new THREE.Group()

    // 身体 - 简约方块
    const body = createBox(1.2, 2, 0.8, COLORS.character[i], 0, 2.5, 0)
    group.add(body)

    // 头 - 方块
    const head = createBox(1, 1, 1, 0xFFE4C4, 0, 4.2, 0)
    group.add(head)

    // 眼睛 - 两个小点
    const eye1 = createBox(0.15, 0.15, 0.1, 0x333333, -0.25, 4.3, 0.5)
    group.add(eye1)
    const eye2 = createBox(0.15, 0.15, 0.1, 0x333333, 0.25, 4.3, 0.5)
    group.add(eye2)

    // 嘴巴
    const mouth = createBox(0.3, 0.1, 0.1, 0xFF6B6B, 0, 3.9, 0.5)
    group.add(mouth)

    // 光环
    const haloGeo = new THREE.TorusGeometry(0.8, 0.1, 8, 32)
    const haloMat = new THREE.MeshBasicMaterial({ color: 0xFFD700 })
    const halo = new THREE.Mesh(haloGeo, haloMat)
    halo.position.y = 5.3
    halo.rotation.x = Math.PI / 2
    halo.visible = false
    group.add(halo)

    group.position.set(pos.x, 0, pos.z)
    group.userData = {
      halo,
      baseZ: pos.z,
      walkZ: pos.z + 3,
      isWorking: false,
      index: i
    }

    scene.add(group)
    characters.push(group)
  })
}

function createDecorations() {
  // 树
  const treePositions = [
    { x: -20, z: -5 },
    { x: 20, z: -5 },
    { x: -25, z: 8 },
    { x: 25, z: 8 }
  ]

  treePositions.forEach(pos => {
    const trunk = createBox(0.8, 3, 0.8, COLORS.trunk, pos.x, 1.5, pos.z)
    scene.add(trunk)

    // 树叶 - 3层方块
    scene.add(createBox(2.5, 2, 2.5, COLORS.tree, pos.x, 3.5, pos.z))
    scene.add(createBox(2, 2, 2, COLORS.tree, pos.x, 5, pos.z))
    scene.add(createBox(1.5, 1.5, 1.5, COLORS.tree, pos.x, 6.2, pos.z))
  })

  // 打印机
  scene.add(createBox(1.5, 1.2, 1.5, 0xBDBDBD, 18, 0.6, 2))

  // 会议室（透明方块）
  const meeting = createBox(8, 4, 6, 0xE3F2FD, 18, 2, -5)
  meeting.material.transparent = true
  meeting.material.opacity = 0.6
  scene.add(meeting)

  // 老板屋
  const boss = createBox(10, 5, 8, 0xFFF9C4, -20, 2.5, -12)
  scene.add(boss)
  const bossRoof = createBox(11, 0.5, 9, 0xFFD54F, -20, 5.25, -12)
  scene.add(bossRoof)
}

function updateCharacters() {
  const time = Date.now() * 0.001

  characters.forEach((char, i) => {
    const role = roles.value[i]
    const isWorking = role?.status === 'working'
    char.userData.isWorking = isWorking
    char.userData.halo.visible = isWorking

    if (isWorking) {
      // 工作：轻微弹跳 + 走动
      char.position.y = Math.sin(time * 4 + i) * 0.1
      char.position.z = char.userData.walkZ + Math.sin(time * 0.8) * 1.5
    } else {
      // 空闲：呼吸
      char.scale.setScalar(1 + Math.sin(time + i) * 0.03)
      char.position.z = char.userData.baseZ
    }

    // 光环旋转
    if (char.userData.halo.visible) {
      char.userData.halo.rotation.z += 0.02
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
  const d = 25
  camera.left = -d * aspect
  camera.right = d * aspect
  camera.top = d
  camera.bottom = -d
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
      skills.value = statusRes.data.skills || []
      systemInfo.value = statusRes.data.systemInfo || {}
      activeCount.value = roles.value.filter(r => r.status === 'working').length
    }
  } catch (e) {
    console.error('获取数据失败:', e)
  }
}

function updateTime() {
  currentTime.value = new Date().toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  })
}

let dataTimer = null

onMounted(() => {
  init()
  updateTime()
  dataTimer = setInterval(() => {
    updateTime()
    fetchData()
  }, 3000)
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
body { overflow: hidden; font-family: 'Microsoft YaHei', sans-serif; }

.container { width: 100vw; height: 100vh; position: relative; }
.canvas { width: 100%; height: 100%; }

.info-panel {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 200px;
  background: rgba(255,255,255,0.95);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  z-index: 100;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.logo { font-size: 16px; }
.title { flex: 1; font-weight: bold; font-size: 12px; }
.live-dot { width: 6px; height: 6px; background: #5CB85C; border-radius: 50%; animation: pulse 1s infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

.panel-content { max-height: 250px; overflow-y: auto; }
.section { padding: 8px 10px; border-bottom: 1px solid #eee; }
.section:last-child { border-bottom: none; }
.section-title { font-size: 10px; color: #666; margin-bottom: 6px; font-weight: bold; }

.role-cards { display: flex; flex-direction: column; gap: 4px; }
.role-card { display: flex; align-items: center; gap: 5px; padding: 5px; background: #f9f9f9; border-radius: 6px; }
.role-card.working { background: #E8F5E9; }
.avatar { font-size: 14px; }
.info { flex: 1; display: flex; flex-direction: column; }
.info .name { font-size: 10px; font-weight: bold; }
.info .task, .info .status-text { font-size: 8px; color: #666; }
.info .task { color: #4CAF50; }

.task-list { display: flex; flex-direction: column; gap: 3px; }
.task-item { display: flex; justify-content: space-between; font-size: 9px; }
.schedule { color: #999; font-size: 8px; }

.skill-tags { display: flex; flex-wrap: wrap; gap: 3px; }
.skill-tag { font-size: 8px; padding: 2px 5px; background: #f5f5f5; border-radius: 6px; color: #666; }

.panel-footer { display: flex; justify-content: space-between; padding: 6px 10px; background: #f5f5f5; font-size: 8px; color: #999; }

.status-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 30px;
  background: rgba(255,255,255,0.9);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
  color: #333;
  font-size: 11px;
  z-index: 100;
}

.status-bar .dot { 
  display: inline-block; 
  width: 6px; height: 6px; 
  border-radius: 50%; 
  background: #999; 
  margin-right: 5px; 
}
.status-bar span:last-child .dot { 
  background: #5CB85C; 
  animation: pulse 1s infinite; 
}
</style>
