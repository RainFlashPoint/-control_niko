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
      
      <!-- 工位 -->
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
        <div class="desk-name">工位 1</div>
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
        <div class="desk-name">工位 2</div>
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
        <div class="desk-name">工位 3</div>
      </div>
      
      <!-- 装饰 -->
      <div class="plant plant-1">🌿</div>
      <div class="plant plant-2">🌵</div>
      <div class="clock">🕐 {{ currentTime }}</div>
      <div class="calendar">📅 {{ currentDate }}</div>
      <div class="coffee-machine">☕</div>
      <div class="printer">🖨️</div>
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
          <div class="character-shirt" :class="role.shirtColor || 'shirt-blue'"></div>
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
        <div class="section-title">📊 角色状态 ({{ activeCount }}/{{ roles.length }})</div>
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
        <div class="section-title">⏰ 定时任务 ({{ cronJobs.length }})</div>
        <div class="task-list">
          <div v-for="task in cronJobs.slice(0, 5)" :key="task.id" class="task-item">
            <span class="task-name">{{ task.name }}</span>
            <span :class="['task-status', task.enabled ? 'active' : 'paused']">{{ task.schedule }}</span>
          </div>
        </div>
      </div>

      <div class="panel-section">
        <div class="section-title">🛠️ 技能 ({{ skills.length }})</div>
        <div class="skill-list">
          <span v-for="skill in skills" :key="skill.name" class="skill-tag">
            {{ skill.name }}
          </span>
        </div>
      </div>

      <div class="panel-section">
        <div class="section-title">💻 系统信息</div>
        <div class="system-info">
          <div>🖥️ 主机: {{ systemInfo.hostname }}</div>
          <div>⏱️ 运行: {{ systemInfo.uptime }}</div>
          <div>💾 内存: {{ systemInfo.memory }}</div>
        </div>
      </div>
    </div>

    <!-- 状态指示器 -->
    <div class="status-bar">
      <div class="status-item">
        <span class="dot" :class="{ active: isAnyWorking }"></span>
        {{ activeCount }}/{{ roles.length }} 工作中
      </div>
      <div class="status-item">
        <span class="dot pulse"></span>
        实时同步中
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const roles = ref([])
const cronJobs = ref([])
const skills = ref([])
const systemInfo = ref({ hostname: '-', uptime: '0s', memory: '-' })
const currentTime = ref('')
const currentDate = ref('')
let timer = null

// 角色位置配置
const deskPositions = [
  { x: 10, y: 50 },
  { x: 43, y: 50 },
  { x: 76, y: 50 }
]

const walkingPositions = [
  { x: 20, y: 35 },
  { x: 50, y: 30 },
  { x: 80, y: 35 }
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
  currentTime.value = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  currentDate.value = now.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
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
    }
  } catch (e) {
    console.error('获取数据失败:', e)
  }
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
  top: 5%;
  left: 50%;
  transform: translateX(-50%);
  width: 280px;
  height: 160px;
}

.window-frame {
  width: 100%;
  height: 100%;
  background: #fff;
  border: 10px solid #8B4513;
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
  top: 42%;
  width: 160px;
  height: 90px;
}

.desk-1 { left: 3%; }
.desk-2 { left: 38%; }
.desk-3 { left: 73%; }

.desk-name {
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  color: #8B4513;
  font-weight: bold;
}

.desk-top {
  width: 100%;
  height: 12px;
  background: linear-gradient(180deg, #DEB887 0%, #D2B48C 100%);
  border-radius: 3px;
  box-shadow: 0 3px 6px rgba(0,0,0,0.2);
}

.desk-leg {
  width: 8px;
  height: 55px;
  background: #8B4513;
  position: absolute;
  top: 12px;
}

.desk-leg:first-of-type { left: 12px; }
.desk-leg:last-of-type { right: 12px; }

/* 电脑 */
.computer {
  position: absolute;
  top: -45px;
  left: 25px;
}

.monitor {
  width: 70px;
  height: 52px;
  background: #333;
  border-radius: 5px;
  padding: 4px;
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
  width: 16px;
  height: 6px;
  background: #666;
  margin: 0 auto;
}

.keyboard {
  width: 60px;
  height: 6px;
  background: #444;
  border-radius: 2px;
  margin-top: 2px;
  margin-left: 5px;
}

/* 装饰 */
.plant {
  position: absolute;
  font-size: 36px;
}

.plant-1 { top: 38%; left: 25%; }
.plant-2 { top: 38%; right: 3%; }

.clock {
  position: absolute;
  top: 3%;
  right: 8%;
  font-size: 24px;
  color: #333;
}

.calendar {
  position: absolute;
  top: 12%;
  right: 8%;
  font-size: 20px;
  color: #333;
}

.coffee-machine {
  position: absolute;
  top: 42%;
  right: 12%;
  font-size: 28px;
}

.printer {
  position: absolute;
  top: 35%;
  right: 25%;
  font-size: 28px;
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
  width: 36px;
  height: 36px;
  background: #FFE4C4;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.avatar {
  font-size: 22px;
}

.character-torso {
  width: 26px;
  height: 30px;
  margin-top: -4px;
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
  gap: 4px;
  margin-top: -2px;
}

.leg {
  width: 9px;
  height: 22px;
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
  font-size: 11px;
  color: #333;
  font-weight: bold;
  margin-top: 4px;
  text-shadow: 1px 1px 2px rgba(255,255,255,0.8);
}

.character-status {
  margin-top: 2px;
}

.status-badge {
  font-size: 9px;
  padding: 2px 5px;
  border-radius: 8px;
  color: #fff;
}

.status-badge.idle { background: #999; }
.status-badge.working { background: #5CB85C; }
.status-badge.busy { background: #FF6B6B; }

.speech-bubble {
  position: absolute;
  top: -28px;
  background: #fff;
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 9px;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.speech-bubble::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  border-width: 4px 4px 0;
  border-style: solid;
  border-color: #fff transparent transparent;
}

/* 信息面板 */
.info-panel {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 260px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  z-index: 100;
  max-height: calc(100vh - 50px);
  overflow-y: auto;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 12px 12px 0 0;
}

.panel-title {
  font-weight: bold;
  font-size: 13px;
}

.time {
  font-size: 11px;
  opacity: 0.9;
}

.panel-section {
  padding: 10px 12px;
  border-bottom: 1px solid #eee;
}

.panel-section:last-child {
  border-bottom: none;
}

.section-title {
  font-size: 11px;
  color: #666;
  margin-bottom: 8px;
  font-weight: bold;
}

.role-list, .task-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.role-item, .task-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
}

.role-avatar {
  font-size: 12px;
}

.role-name {
  flex: 1;
}

.role-status, .task-status {
  font-size: 9px;
  padding: 2px 5px;
  border-radius: 6px;
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
  gap: 4px;
}

.skill-tag {
  font-size: 9px;
  padding: 2px 6px;
  background: #f0f0f0;
  border-radius: 8px;
  color: #666;
}

.system-info {
  font-size: 10px;
  color: #666;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

/* 状态栏 */
.status-bar {
  position: absolute;
  bottom: 15px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.9);
  padding: 8px 16px;
  border-radius: 20px;
  display: flex;
  gap: 16px;
  z-index: 100;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #666;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #999;
}

.dot.active {
  background: #5CB85C;
  animation: pulse 1s infinite;
}

.dot.pulse {
  background: #5CB85C;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>
