import { clamp } from "./scenes/game"

class SoundVolume {
    private _volume: number
    get volume() { return this._volume }
    set volume(newVolume: number) {
        newVolume = clamp(newVolume, 0, 1)
        this._volume = newVolume
    }

    constructor(volume = 1) {
        this._volume = volume
    }
}
const volume = new SoundVolume()

const volumeSlider = <HTMLInputElement>document.getElementById("volumeControl")
const changeVolume = () => volume.volume = parseInt(volumeSlider.value) / 100
volumeSlider.oninput = changeVolume
volumeSlider.onchange = changeVolume

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
        const clonedAudio = <any>this.sound.cloneNode()
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

