import { config } from "./config"
import { detectMobile, play } from "./game"
import { GameScene } from "./scenes/game"

const canvas = <HTMLCanvasElement>document.getElementById("game")
if (!canvas) throw new Error("Canvas \"game\" not found!")
if (canvas.width != config.width) throw new Error("Canvas \"game\" width doesn't match the config!")
if (canvas.height != config.height) throw new Error("Canvas \"game\" height doesn't match the config!")
console.log(detectMobile())
if (detectMobile()) alert("A mobile device has been detected. This game requires a keyboard to move. Touch to shoot is available, but not recommended.")

play(new GameScene(), config.fps, canvas)
