import { config } from "./config"
import { play } from "./game"
import { GameScene } from "./scenes/game"

const canvas = <HTMLCanvasElement>document.getElementById("game")
if (!canvas) throw new Error("Canvas \"game\" not found!")
if (canvas.width != config.width) throw new Error("Canvas \"game\" width doesn't match the config!")
if (canvas.height != config.height) throw new Error("Canvas \"game\" height doesn't match the config!")

play(new GameScene(), config.fps, canvas)
