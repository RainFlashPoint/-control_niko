/**
 * OpenClaw 状态收集服务
 * 收集 workbase 状态、定时任务、token 等信息
 */

import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// 模拟角色数据（实际会从 OpenClaw 获取）
const roles = [
  {
    id: 'role-1',
    name: '糖糖',
    avatar: '🐱',
    status: 'idle', // idle | working | busy
    currentTask: null,
    location: 'desk', // desk | walking
    stats: {
      messagesToday: 12,
      tokensUsed: 45000,
      uptime: '2h 30m'
    }
  },
  {
    id: 'role-2',
    name: '助手B',
    avatar: '🧸',
    status: 'working',
    currentTask: '处理用户请求',
    location: 'walking',
    stats: {
      messagesToday: 8,
      tokensUsed: 32000,
      uptime: '1h 45m'
    }
  },
  {
    id: 'role-3',
    name: '助手C',
    avatar: '🤖',
    status: 'busy',
    currentTask: '数据分析中',
    location: 'walking',
    stats: {
      messagesToday: 25,
      tokensUsed: 89000,
      uptime: '3h 10m'
    }
  }
];

// 获取 OpenClaw 状态
async function getOpenClawStatus() {
  try {
    // 尝试通过 CLI 获取状态
    const { stdout } = await execAsync('openclaw status 2>/dev/null || echo "not running"');
    return {
      running: !stdout.includes('not running'),
      output: stdout.slice(0, 500)
    };
  } catch (e) {
    return { running: false, error: e.message };
  }
}

// 获取定时任务
async function getCronJobs() {
  return [
    { name: '每日简报', schedule: '8:50', nextRun: '2024-01-16T08:50:00', status: 'active' },
    { name: '健康检查', schedule: '每小时', nextRun: '2024-01-15T14:00:00', status: 'active' },
    { name: '数据同步', schedule: '每30分钟', nextRun: '2024-01-15T13:30:00', status: 'paused' }
  ];
}

// 获取技能列表
function getSkills() {
  return [
    { name: 'webapp-deploy', description: 'Web项目部署', status: 'active' },
    { name: 'github', description: 'GitHub操作', status: 'active' },
    { name: 'weather', description: '天气查询', status: 'active' },
    { name: 'coding-agent', description: '代码代理', status: 'active' }
  ];
}

// API: 获取所有角色状态
app.get('/api/roles', (req, res) => {
  // 模拟状态变化
  roles.forEach(role => {
    if (Math.random() > 0.7) {
      role.status = role.status === 'idle' ? 'working' : 'idle';
      role.location = role.status === 'idle' ? 'desk' : 'walking';
      role.currentTask = role.status === 'working' ? '处理任务中...' : null;
    }
  });
  
  res.json({ code: 0, data: roles });
});

// API: 更新角色状态（模拟）
app.post('/api/roles/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, location } = req.body;
  
  const role = roles.find(r => r.id === id);
  if (role) {
    role.status = status;
    role.location = location;
    res.json({ code: 0, message: '更新成功' });
  } else {
    res.json({ code: 1, message: '角色不存在' });
  }
});

// API: 获取 OpenClaw 整体状态
app.get('/api/status', async (req, res) => {
  const [clawStatus, cronJobs] = await Promise.all([
    getOpenClawStatus(),
    getCronJobs()
  ]);
  
  res.json({
    code: 0,
    data: {
      ...clawStatus,
      cronJobs,
      skills: getSkills(),
      totalRoles: roles.length,
      activeRoles: roles.filter(r => r.status !== 'idle').length
    }
  });
});

// API: 获取系统信息
app.get('/api/system', (req, res) => {
  res.json({
    code: 0,
    data: {
      hostname: 'RaikkonenBookPro',
      platform: 'Darwin',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    }
  });
});

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════╗
║   🎭 OpenClaw 状态收集服务               ║
║   端口: ${PORT}                            ║
║                                         ║
║   API 列表：                              ║
║   GET  /api/roles      角色状态           ║
║   GET  /api/status    整体状态           ║
║   GET  /api/system   系统信息           ║
╚═══════════════════════════════════════════╝
  `);
});
