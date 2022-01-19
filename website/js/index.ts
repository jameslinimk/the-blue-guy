import { config } from "./config"
import { play } from "./game"
import { GameScene } from "./scenes/game"

const canvas = <HTMLCanvasElement>document.getElementById("game")
if (!canvas) throw new Error("Canvas \"game\" not found!")
canvas.width = config.width
canvas.height = config.height
if (config.fullscreen) {
    const resizeWindow = () => {
        if (window.innerWidth === window.innerHeight) {
            canvas.style.width = "100%"
            canvas.style.height = "100%"
        } else {
            canvas.style.width = `${Math.min(window.innerWidth, window.innerHeight)}`
            canvas.style.height = `${Math.min(window.innerWidth, window.innerHeight)}`
            console.log("📓 ~ file: index.ts ~ line 17 ~ canvas.style.height", Math.min(window.innerWidth, window.innerHeight))
        }
    }

    resizeWindow()
    window.onresize = resizeWindow
}
// if (detectMobile()) alert("A mobile device has been detected. This game requires a keyboard to move. Touch to shoot is available, but not recommended.")

play(new GameScene(), config.fps, canvas)
