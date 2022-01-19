import { config } from "./config"
import { play } from "./game"
import { GameScene } from "./scenes/game"

const canvas = <HTMLCanvasElement>document.getElementById("game")
if (!canvas) throw new Error("Canvas \"game\" not found!")
canvas.width = config.width
canvas.height = config.height
if (config.fullscreen) {
    const resizeWindow = () => {
        canvas.style.width = `${Math.min(window.innerWidth, window.innerHeight) - 20}px`
        canvas.style.height = `${Math.min(window.innerWidth, window.innerHeight) - 20}px`

        const volumeSlider = <HTMLInputElement>document.getElementById("volumeControl")
        const rect = canvas.getBoundingClientRect()
        const scaleX = rect.width / canvas.width
        const scaleY = rect.height / canvas.height
        const style = window.getComputedStyle(volumeSlider)
        volumeSlider.style.transform = `scale(${scaleX}, ${scaleY})`
        volumeSlider.style.left = `${parseInt(style.getPropertyValue("left").split("px")[0]) * scaleX}`
        volumeSlider.style.top = `${parseInt(style.getPropertyValue("top").split("px")[0]) * scaleY}`
        console.log(scaleX, scaleY)
        // TODO If this doesn't work just make a custom slider in the drawPauseMenu function
    }

    resizeWindow()
    window.onresize = resizeWindow
}
// if (detectMobile()) alert("A mobile device has been (possibly) detected. This game requires a keyboard to move. Touch to shoot is available, but not recommended.")

play(new GameScene(), config.fps, canvas)
