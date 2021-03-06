import { config } from "./config"
import { Cookie } from "./cookies"
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
    }

    resizeWindow()
    window.onresize = resizeWindow
}
// if (detectMobile()) alert("A mobile device has been (possibly) detected. This game requires a keyboard to move. Touch to shoot is available, but not recommended.")
if (!Cookie.check()) alert("Your browser doesn't support local storage. Please use another browser, or else the game will break")

play(new GameScene(), config.fps, canvas)
