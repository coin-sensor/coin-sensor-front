class NotificationSound {
  private audio: HTMLAudioElement | null = null

  constructor() {
    this.audio = new Audio('/sounds/mixkit-message-pop-alert-2354.mp3')
    this.audio.volume = 0.5
  }

  play() {
    if (this.audio) {
      this.audio.currentTime = 0
      this.audio.play().catch(console.error)
    }
  }
}

export const notificationSound = new NotificationSound()