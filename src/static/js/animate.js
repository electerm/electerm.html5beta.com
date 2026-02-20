class TerminalBg {
  constructor (options = {}) {
    this.className = options.className || 'animate'
    this.color = options.color || '#666666'
    this.bgColor = options.bgColor || '#ffffff'
    this.fontSize = options.fontSize || 18
    this.speed = options.speed || 0.8
    this.lines = []
    this.canvas = null
    this.ctx = null
    this.animationId = null
    this.lastTime = 0
    this.frameInterval = 40
    this.init()
  }

  getTexts () {
    return [
      '终端/SSH/SFTP/Telnet/串口/RDP/VNC客户端',
      '全局热键切换窗口可见性',
      '多平台支持 Linux/Mac/Windows',
      '多语言支持',
      '双击直接编辑远程文件',
      '公钥+密码认证',
      '支持 Zmodem (rz/sz)',
      '支持 SSH 隧道',
      '支持 Trzsz (trz/tsz)',
      '透明窗口',
      '终端背景图片',
      '全局/会话代理',
      '快捷命令',
      'UI/终端主题',
      '同步书签到 GitHub/Gitee',
      'AI 助手集成',
      '支持 DeepSeek/OpenAI',
      '深度链接支持',
      '命令行使用',
      'SSH/SFTP 文件传输',
      '批量操作',
      '多终端同步输入',
      'VNC 远程桌面',
      'RDP 远程桌面',
      '串口终端',
      'Telnet 连接',
      'FTP 客户端',
      'Terminal/SSH/SFTP/Telnet/Serial/RDP/VNC client',
      'Global hotkey to toggle window',
      'Multi platform: Linux/Mac/Windows',
      'Multi-language support',
      'Double click to edit remote files',
      'Auth with publicKey + password',
      'Support Zmodem (rz/sz)',
      'Support SSH tunnel',
      'Support Trzsz (trz/tsz)',
      'Transparent window',
      'Terminal background image',
      'Global/session proxy',
      'Quick commands',
      'UI/terminal themes',
      'Sync to GitHub/Gitee gist',
      'AI assistant integration',
      'Support DeepSeek/OpenAI',
      'Deep link support',
      'Command line usage',
      'SSH/SFTP file transfer',
      'Batch operations',
      'Multi-terminal sync input',
      'VNC remote desktop',
      'RDP remote desktop',
      'Serial port terminal',
      'Telnet connection',
      'FTP client'
    ]
  }

  init () {
    let container = document.querySelector(`.${this.className}`)
    if (!container) {
      container = document.createElement('div')
      container.className = this.className
      document.body.insertBefore(container, document.body.firstChild)
    }
    container.style.cssText = 'position:fixed;left:0;right:0;top:0;bottom:0;z-index:-1;overflow:hidden;'
    this.container = container
    this.canvas = document.createElement('canvas')
    this.canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;'
    container.appendChild(this.canvas)
    this.ctx = this.canvas.getContext('2d')
    this.texts = this.getTexts()
    this.resize()
    window.addEventListener('resize', this.handleResize.bind(this))
    this.animate()
  }

  handleResize () {
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout)
    }
    this.resizeTimeout = setTimeout(() => {
      this.resize()
    }, 100)
  }

  resize () {
    const container = this.canvas.parentElement
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const rect = container.getBoundingClientRect()
    this.canvas.width = rect.width * dpr
    this.canvas.height = rect.height * dpr
    this.canvas.style.width = rect.width + 'px'
    this.canvas.style.height = rect.height + 'px'
    this.ctx.scale(dpr, dpr)
    this.width = rect.width
    this.height = rect.height
    this.initLines()
  }

  initLines () {
    const lineCount = Math.max(20, Math.floor(this.width / 80))
    const texts = this.texts
    this.lines = []
    const angle = Math.PI / 6
    for (let i = 0; i < lineCount; i++) {
      const progress = i / lineCount
      const startX = -this.width * 0.5 + progress * (this.width * 1.5)
      const startY = -this.height * 0.3 + progress * (this.height * 1.3) - Math.random() * 150
      this.lines.push({
        x: startX,
        y: startY,
        angle,
        speed: (0.3 + Math.random() * 0.4) * this.speed,
        text: texts[Math.floor(Math.random() * texts.length)],
        opacity: 0.08 + Math.random() * 0.1,
        fontSize: this.fontSize + Math.floor(Math.random() * 6)
      })
    }
  }

  animate (timestamp = 0) {
    this.animationId = requestAnimationFrame(this.animate.bind(this))
    const delta = timestamp - this.lastTime
    if (delta < this.frameInterval) return
    this.lastTime = timestamp - (delta % this.frameInterval)
    this.ctx.fillStyle = this.bgColor
    this.ctx.fillRect(0, 0, this.width, this.height)
    for (const line of this.lines) {
      const moveX = Math.cos(line.angle) * line.speed * 2
      const moveY = Math.sin(line.angle) * line.speed * 2
      line.x += moveX
      line.y += moveY
      if (line.y > this.height + 50 || line.x > this.width + 50) {
        line.x = -this.width * 0.5 + Math.random() * this.width * 0.3
        line.y = -100 - Math.random() * 100
        line.text = this.texts[Math.floor(Math.random() * this.texts.length)]
        line.opacity = 0.08 + Math.random() * 0.1
      }
      this.ctx.save()
      this.ctx.translate(line.x, line.y)
      this.ctx.rotate(line.angle)
      this.ctx.font = `${line.fontSize}px monospace`
      this.ctx.fillStyle = this.hexToRgba(this.color, line.opacity)
      this.ctx.fillText(line.text, 0, 0)
      this.ctx.restore()
    }
  }

  hexToRgba (hex, alpha) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (result) {
      return `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`
    }
    const rgbMatch = hex.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/)
    if (rgbMatch) {
      return `rgba(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}, ${alpha})`
    }
    return `rgba(102, 102, 102, ${alpha})`
  }

  destroy () {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }
    window.removeEventListener('resize', this.handleResize.bind(this))
    if (this.canvas && this.canvas.parentElement) {
      this.canvas.parentElement.removeChild(this.canvas)
    }
    if (this.container && this.container.parentElement) {
      this.container.parentElement.removeChild(this.container)
    }
  }
}

export default TerminalBg
