import { Cookie } from "./cookies"
import { clamp } from "./scenes/game"

class SoundVolume {
    private _volume: number
    get volume() { return this._volume }
    set volume(newVolume: number) {
        newVolume = Math.round(clamp(newVolume, 0, 1) * 10) / 10
        Cookie.set("volume", newVolume)
        this._volume = newVolume
    }

    constructor() {
        this._volume = (!Cookie.get("volume")) ? 1 : parseFloat(Cookie.get("volume"))
    }
}
const volume = new SoundVolume()

class Sound {
    sound: HTMLAudioElement

    constructor(source: string) {
        this.sound = document.createElement("audio")
        this.sound.src = source
        this.sound.setAttribute("preload", "auto")
        this.sound.setAttribute("controls", "none")
        this.sound.style.display = "none"
        this.sound.volume = volume.volume
        document.body.appendChild(this.sound)
    }

    clonePlay() {
        // Clone node to overlap sound
        this.sound.volume = volume.volume
        const clonedAudio = <HTMLAudioElement>this.sound.cloneNode()
        clonedAudio.volume = this.sound.volume
        clonedAudio.play()
    }

    play() {
        this.sound.volume = volume.volume
        this.sound.play()
    }

    stop() {
        this.sound.pause()
    }
}

export {
    Sound,
    volume
}

