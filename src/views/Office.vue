<template>
  <div class="office-container">
    <!-- 动漫办公室背景 -->
    <div class="office-bg">
      <div class="bg-wall"></div>
      <div class="bg-floor"></div>
      <div class="window">
        <div class="window-frame">
          <div class="window-pane"></div>
          <div class="window-pane"></div>
          <div class="window-pane"></div>
        </div>
      </div>
      <div class="desk desk-1">
        <div class="desk-top"></div>
        <div class="desk-leg"></div>
        <div class="desk-leg"></div>
        <div class="computer">
          <div class="monitor">
            <div class="screen">
              <div class="screen-content" :class="{ active: isWorking(0) }"></div>
            </div>
            <div class="stand"></div>
          </div>
          <div class="keyboard"></div>
        </div>
      </div>
      <div class="desk desk-2">
        <div class="desk-top"></div>
        <div class="desk-leg"></div>
        <div class="desk-leg"></div>
        <div class="computer">
          <div class="monitor">
            <div class="screen">
              <div class="screen-content" :class="{ active: isWorking(1) }"></div>
            </div>
            <div class="stand"></div>
          </div>
          <div class="keyboard"></div>
        </div>
      </div>
      <div class="desk desk-3">
        <div class="desk-top"></div>
        <div class="desk-leg"></div>
        <div class="desk-leg"></div>
        <div class="computer">
          <div class="monitor">
            <div class="screen">
              <div class="screen-content" :class="{ active: isWorking(2) }"></div>
            </div>
            <div class="stand"></div>
          </div>
          <div class="keyboard"></div>
        </div>
      </div>
      <div class="plant plant-1">🌿</div>
      <div class="plant plant-2">🌵</div>
      <div class="clock">🕐</div>
      <div class="calendar">📅</div>
    </div>

    <!-- 动漫角色 -->
    <div 
      v-for="(role, index) in roles" 
      :key="role.id"
      class="character"
      :class="[role.location, role.status]"
      :style="getCharacterStyle(index)"
    >
      <div class="character-body">
        <div class="character-head">
          <span class="avatar">{{ role.avatar }}</span>
        </div>
        <div class="character-torso">
          <div class="character-shirt" :class="getShirtColor(index)"></div>
        </div>
        <div class="character-legs">
          <div class="leg left" :class="{ walking: role.location === 'walking' }"></div>
          <div class="leg right" :class="{ walking: role.location === 'walking' }"></div>
        </div>
      </div>
      <div class="character-name">{{ role.name }}</div>
      <div class="character-status">
        <span :class="['status-badge', role.status]">
          {{ getStatusText(role.status) }}
        </span>
      </div>
      <div class="speech-bubble" v-if="role.currentTask">
        {{ role.currentTask }}
      </div>
    </div>

    <!-- 信息面板 -->
    <div class="info-panel">
      <div class="panel-header">
        <span class="panel-title">🎭 OpenClaw 控制台</span>
        <span class="time">{{ currentTime }}</span>
      </div>
      
      <div class="panel-section">
        <div class="section-title">📊 角色状态</div>
        <div class="role-list">
          <div v-for="role in roles" :key="role.id" class="role-item">
            <span class="role-avatar">{{ role.avatar }}</span>
            <span class="role-name">{{ role.name }}</span>
            <span :class="['role-status', role.status]">
              {{ getStatusText(role.status) }}
            </span>
          </div>
        </div>
      </div>

      <div class="panel-section">
        <div class="section-title">⏰ 定时任务</div>
        <div class="task-list">
          <div v-for="task in cronJobs" :key="task.name" class="task-item">
            <span class="task-name">{{ task.name }}</span>
            <span :class="['task-status', task.status]">{{ task.schedule }}</span>
          </div>
        </div>
      </div>

      <div class="panel-section">
        <div class="section-title">🛠️ 技能</div>
        <div class="skill-list">
          <span v-for="skill in skills" :key="skill.name" class="skill-tag">
            {{ skill.name }}
          </span>
        </div>
      </div>

      <div class="panel-section">
        <div class="section-title">💻 系统</div>
        <div class="system-info">
          <div>主机: {{ systemInfo.hostname }}</div>
          <div>运行: {{ systemInfo.uptime }}</div>
        </div>
      </div>
    </div>

    <!-- 状态指示器 -->
    <div class="status-bar">
      <div class="status-item">
        <span class="dot" :class="{ active: isAnyWorking }"></span>
        {{ activeCount }}/{{ roles.length }} 工作中
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const roles = ref([])
const cronJobs = ref([])
const skills = ref([])
const systemInfo = ref({ hostname: '-', uptime: '0s' })
const currentTime = ref('')
let timer = null

// 角色位置配置
const deskPositions = [
  { x: 15, y: 45 },
  { x: 45, y: 45 },
  { x: 75, y: 45 }
]

const walkingPositions = [
  { x: 30, y: 30 },
  { x: 50, y: 25 },
  { x: 70, y: 30 }
]

function getCharacterStyle(index) {
  const pos = roles.value[index]?.location === 'walking' 
    ? walkingPositions[index] 
    : deskPositions[index]
  return {
    left: `${pos.x}%`,
    top: `${pos.y}%`
  }
}

function getShirtColor(index) {
  const colors = ['shirt-blue', 'shirt-pink', 'shirt-green']
  return colors[index % colors.length]
}

function isWorking(index) {
  return roles.value[index]?.status === 'working' || roles.value[index]?.status === 'busy'
}

function getStatusText(status) {
  const map = { idle: '空闲', working: '工作中', busy: '忙碌中' }
  return map[status] || '未知'
}

const activeCount = computed(() => roles.value.filter(r => r.status !== 'idle').length)
const isAnyWorking = computed(() => activeCount.value > 0)

function updateTime() {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

async function fetchData() {
  try {
    const [rolesRes, statusRes] = await Promise.all([
      fetch('http://localhost:3001/api/roles').then(r => r.json()),
      fetch('http://localhost:3001/api/status').then(r => r.json())
    ])
    
    if (rolesRes.code === 0) roles.value = rolesRes.data
    if (statusRes.code === 0) {
      cronJobs.value = statusRes.data.cronJobs || []
      skills.value = statusRes.data.skills || []
    }
    
    const sysRes = await fetch('http://localhost:3001/api/system').then(r => r.json())
    if (sysRes.code === 0) {
      systemInfo.value = {
        hostname: sysRes.data.hostname,
        uptime: formatUptime(sysRes.data.uptime)
      }
    }
  } catch (e) {
    console.error('获取数据失败:', e)
  }
}

function formatUptime(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${h}h ${m}m`
}

onMounted(() => {
  updateTime()
  timer = setInterval(() => {
    updateTime()
    fetchData()
  }, 3000)
  fetchData()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Microsoft YaHei', sans-serif;
  overflow: hidden;
}

.office-container {
  width: 100vw;
  height: 100vh;
  position: relative;
  background: #1a1a2e;
  overflow: hidden;
}

/* 办公室背景 */
.office-bg {
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, #87CEEB 0%, #E0F6FF 50%, #DEB887 50%, #D2B48C 100%);
}

.bg-wall {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(180deg, #FFF5E6 0%, #FFE4C4 100%);
}

.bg-floor {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(180deg, #8B4513 0%, #654321 100%);
}

.window {
  position: absolute;
  top: 8%;
  left: 50%;
  transform: translateX(-50%);
  width: 300px;
  height: 180px;
}

.window-frame {
  width: 100%;
  height: 100%;
  background: #fff;
  border: 8px solid #8B4513;
  display: grid;
  grid-template-rows: 1fr 1fr;
  gap: 4px;
  padding: 4px;
}

.window-pane {
  background: linear-gradient(180deg, #87CEEB 0%, #B0E0E6 100%);
}

/* 桌子 */
.desk {
  position: absolute;
  top: 40%;
  width: 180px;
  height: 100px;
}

.desk-1 { left: 5%; }
.desk-2 { left: 38%; }
.desk-3 { left: 71%; }

.desk-top {
  width: 100%;
  height: 15px;
  background: linear-gradient(180deg, #DEB887 0%, #D2B48C 100%);
  border-radius: 3px;
  box-shadow: 0 3px 6px rgba(0,0,0,0.2);
}

.desk-leg {
  width: 10px;
  height: 60px;
  background: #8B4513;
  position: absolute;
  top: 15px;
}

.desk-leg:first-of-type { left: 15px; }
.desk-leg:last-of-type { right: 15px; }

/* 电脑 */
.computer {
  position: absolute;
  top: -50px;
  left: 30px;
}

.monitor {
  width: 80px;
  height: 60px;
  background: #333;
  border-radius: 5px;
  padding: 5px;
}

.screen {
  width: 100%;
  height: 100%;
  background: #1a1a2e;
  border-radius: 3px;
  overflow: hidden;
}

.screen-content {
  width: 100%;
  height: 100%;
  background: #2a2a4e;
}

.screen-content.active {
  animation: screenFlicker 0.5s infinite;
}

@keyframes screenFlicker {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.stand {
  width: 20px;
  height: 8px;
  background: #666;
  margin: 0 auto;
}

.keyboard {
  width: 70px;
  height: 8px;
  background: #444;
  border-radius: 2px;
  margin-top: 3px;
  margin-left: 5px;
}

/* 装饰 */
.plant {
  position: absolute;
  font-size: 40px;
}

.plant-1 { top: 35%; left: 28%; }
.plant-2 { top: 35%; right: 5%; }

.clock {
  position: absolute;
  top: 5%;
  right: 10%;
  font-size: 30px;
}

.calendar {
  position: absolute;
  top: 15%;
  right: 10%;
  font-size: 25px;
}

/* 角色 */
.character {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 2s ease-in-out;
  z-index: 10;
}

.character.walking {
  animation: walking 1s ease-in-out infinite;
}

@keyframes walking {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.character-body {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.character-head {
  width: 40px;
  height: 40px;
  background: #FFE4C4;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.avatar {
  font-size: 24px;
}

.character-torso {
  width: 30px;
  height: 35px;
  margin-top: -5px;
}

.character-shirt {
  width: 100%;
  height: 100%;
  border-radius: 5px 5px 0 0;
}

.shirt-blue { background: #4A90D9; }
.shirt-pink { background: #FF6B9D; }
.shirt-green { background: #5CB85C; }

.character-legs {
  display: flex;
  gap: 5px;
  margin-top: -3px;
}

.leg {
  width: 10px;
  height: 25px;
  background: #333;
  border-radius: 0 0 3px 3px;
}

.leg.walking {
  animation: legSwing 0.3s ease-in-out infinite alternate;
}

@keyframes legSwing {
  from { transform: rotate(-15deg); }
  to { transform: rotate(15deg); }
}

.character-name {
  font-size: 12px;
  color: #333;
  font-weight: bold;
  margin-top: 5px;
  text-shadow: 1px 1px 2px rgba(255,255,255,0.8);
}

.character-status {
  margin-top: 3px;
}

.status-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  color: #fff;
}

.status-badge.idle { background: #999; }
.status-badge.working { background: #5CB85C; }
.status-badge.busy { background: #FF6B6B; }

.speech-bubble {
  position: absolute;
  top: -30px;
  background: #fff;
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 10px;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.speech-bubble::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  border-width: 5px 5px 0;
  border-style: solid;
  border-color: #fff transparent transparent;
}

/* 信息面板 */
.info-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 280px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  z-index: 100;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 12px 12px 0 0;
}

.panel-title {
  font-weight: bold;
  font-size: 14px;
}

.time {
  font-size: 12px;
  opacity: 0.9;
}

.panel-section {
  padding: 12px 15px;
  border-bottom: 1px solid #eee;
}

.panel-section:last-child {
  border-bottom: none;
}

.section-title {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
  font-weight: bold;
}

.role-list, .task-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.role-item, .task-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.role-avatar {
  font-size: 14px;
}

.role-name {
  flex: 1;
}

.role-status, .task-status {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 8px;
}

.role-status.idle, .task-status.paused {
  background: #eee;
  color: #999;
}

.role-status.working, .task-status.active {
  background: #e6ffe6;
  color: #5CB85C;
}

.role-status.busy {
  background: #ffe6e6;
  color: #FF6B6B;
}

.skill-list {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.skill-tag {
  font-size: 10px;
  padding: 3px 8px;
  background: #f0f0f0;
  border-radius: 10px;
  color: #666;
}

.system-info {
  font-size: 11px;
  color: #666;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

/* 状态栏 */
.status-bar {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.9);
  padding: 10px 20px;
  border-radius: 20px;
  display: flex;
  gap: 20px;
  z-index: 100;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #666;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #999;
}

.dot.active {
  background: #5CB85C;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
