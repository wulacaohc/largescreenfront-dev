import { ref, onUnmounted } from 'vue'

export function useWebSocket() {
  const channels = ref({})
  const activeChannel = ref(null)

  const createChannel = (channelName, url, options = {}) => {
    if (channels.value[channelName]) {
      console.warn(`通道 ${channelName} 已存在`)
      return channels.value[channelName]
    }

    const {
      autoReconnect = true,
      reconnectInterval = 5000,
      maxReconnectAttempts = 5,
      autoConnect = false,
      protocols = []
    } = options

    const state = {
      data: ref(null),
      isConnected: ref(false),
      reconnectAttempts: ref(0),
      socket: null,
      reconnectTimer: null,
      channelName,
      url
    }

    const connect = () => {
      if (state.socket && (
        state.socket.readyState === WebSocket.OPEN || 
        state.socket.readyState === WebSocket.CONNECTING
      )) {
        console.warn(`WebSocket 通道 ${channelName} 已经连接或正在连接`)
        return
      }

      state.socket = new WebSocket(state.url, protocols)
      
      state.socket.onopen = () => {
        state.isConnected.value = true
        state.reconnectAttempts.value = 0
        console.log(`WebSocket 通道 ${channelName} 连接已建立`)
        options.onOpen?.()
      }
      
      state.socket.onmessage = (event) => {
        try {
          state.data.value = JSON.parse(event.data)
        } catch (e) {
          state.data.value = event.data
        }
        options.onMessage?.(state.data.value, event.data)
      }
      
      state.socket.onclose = () => {
        state.isConnected.value = false
        console.log(`WebSocket 通道 ${channelName} 连接已关闭`)
        if (autoReconnect && state.reconnectAttempts.value < maxReconnectAttempts) {
          reconnect()
        }
        options.onClose?.()
      }
      
      state.socket.onerror = (error) => {
        console.error(`WebSocket 通道 ${channelName} 错误:`, error)
        options.onError?.(error)
      }
    }

    const reconnect = () => {
      if (state.reconnectAttempts.value < maxReconnectAttempts) {
        state.reconnectAttempts.value++
        console.log(`通道 ${channelName} 尝试重新连接 (${state.reconnectAttempts.value}/${maxReconnectAttempts})`)
        state.reconnectTimer = setTimeout(() => {
          connect()
        }, reconnectInterval)
      } else {
        console.log(`通道 ${channelName} 达到最大重连次数`)
      }
    }

    const disconnect = () => {
      if (state.socket) {
        state.socket.close()
        if (state.reconnectTimer) {
          clearTimeout(state.reconnectTimer)
        }
      }
    }

    const send = (message) => {
      if (state.socket && state.socket.readyState === WebSocket.OPEN) {
        const payload = typeof message === 'object' 
          ? JSON.stringify(message) 
          : message
        state.socket.send(payload)
        return true
      }
      return false
    }

    const updateUrl = (newUrl) => {
      state.url = newUrl
      if (state.isConnected.value) {
        disconnect()
        connect()
      }
    }

    const connection = {
      data: state.data,
      isConnected: state.isConnected,
      reconnectAttempts: state.reconnectAttempts,
      connect,
      disconnect,
      send,
      updateUrl,
      get url() { return state.url },
      get name() { return channelName }
    }

    channels.value[channelName] = connection
    
    if (autoConnect) {
      connect()
    }

    return connection
  }

  const getChannel = (channelName) => {
    return channels.value[channelName] || null
  }

  const removeChannel = (channelName) => {
    if (channels.value[channelName]) {
      channels.value[channelName].disconnect()
      delete channels.value[channelName]
      if (activeChannel.value === channelName) {
        activeChannel.value = null
      }
    }
  }

  const setActiveChannel = (channelName) => {
    if (channels.value[channelName]) {
      activeChannel.value = channelName
    }
  }

  onUnmounted(() => {
    Object.values(channels.value).forEach(channel => {
      channel.disconnect()
    })
    channels.value = {}
  })

  return {
    channels,
    activeChannel,
    createChannel,
    getChannel,
    removeChannel,
    setActiveChannel
  }
}