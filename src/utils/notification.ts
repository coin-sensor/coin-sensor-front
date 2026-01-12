class NotificationSound {
  private audio: HTMLAudioElement | null = null
  private isUserInteracted = false

  constructor() {
    this.audio = new Audio('/sounds/mixkit-message-pop-alert-2354.mp3')
    this.audio.volume = 0.5
    
    // 사용자 상호작용 감지
    const enableAudio = () => {
      this.isUserInteracted = true

      document.removeEventListener('click', enableAudio)
      document.removeEventListener('keydown', enableAudio)
    }
    
    document.addEventListener('click', enableAudio)
    document.addEventListener('keydown', enableAudio)
  }

  play() {
    if (this.audio && this.isUserInteracted) {
      this.audio.currentTime = 0
      this.audio.play().catch(console.error)
    }
  }
}

export const notificationSound = new NotificationSound()