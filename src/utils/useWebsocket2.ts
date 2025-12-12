// src/utils/websocket.js

import { ref, onMounted, onUnmounted } from 'vue'
const ws = ref()
export function useWebSocket(onMessageCallback: any, onErrorCallback?: any) {

	const isConnected = ref(false)
	const url = ref('')

	function setUrl (originUrl: string) {
		url.value = originUrl
	}

	function connect() {
		ws.value = new WebSocket(url.value)

		ws.value.onopen = () => {
			isConnected.value = true
			// sendMessage('推送消息')
		}

		ws.value.onmessage = (event:any) => {
			if (onMessageCallback) {
				onMessageCallback(event.data)
			}
		}

		ws.value.connect = (event: any) => {
			if (onMessageCallback) {
				onMessageCallback(event.data)
			}
		}

		ws.value.onclose = () => {
			isConnected.value = false
		}

		ws.value.onerror = (error: any) => {
			isConnected.value = false
			console.error('WebSocket 错误:', error)
			if (onErrorCallback) {
				onErrorCallback(error)
			}
		}
	}

	function sendMessage(message: any) {
		if (isConnected.value && ws.value.readyState === WebSocket.OPEN) {
			ws.value.send(message)
		} else {
			console.warn('WebSocket 未连接，消息暂未发送')
		}
	}

	function disconnect() {
		if (ws.value) {
			ws.value.close()
			ws.value = null
			isConnected.value = false
			console.log('断开连接')
		}
	}

	// 在组件卸载时自动断开连接
	onUnmounted(() => {
		disconnect()
	})

	return {
		ws,
		setUrl,
		connect,
		sendMessage,
		disconnect,
		isConnected
	}
}
