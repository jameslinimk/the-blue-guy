import { Coordinates } from "../../angles"
import { config } from "../../config"
import { clamp, GameScene, random } from "../game"
import { Crate } from "./crate"
import { Direction, fullGenerate, Layout, Room } from "./dungeonGenerator"
import { BallEnemy } from "./enemies/ballEnemy"
import { EnemyType } from "./enemies/enemy"
import { RangedEnemy } from "./enemies/rangedEnemy"
import { SpiralEnemy } from "./enemies/spiralEnemy"

class DungeonManager {
    layout?: Layout
    currentRoom?: Coordinates

    constructor(game: GameScene) {
        fullGenerate(game, { layoutSize: 7, rooms: 20 }, [{ type: "shop", count: 5 }]).then(layout => {
            this.layout = layout
            this.currentRoom = { x: (layout.length - 1) / 2, y: (layout.length - 1) / 2 }
        })
    }

    private drawRoom(room: Room, ctx: CanvasRenderingContext2D) {
        if (this.layout === null) return

        ctx.fillStyle = (room.type === "chest") ? "#F39503" : (room.type === "shop") ? "#00FF00" : (room.type === "end") ? "#FFFF00" : "#FF0000"
        const roomSize = 64
        const roomMargin = 10
        const roomXOffset = (room.x - ((this.layout.length - 1) / 2))
        const roomYOffset = (((this.layout.length - 1) / 2) - room.y)
        const roomX = config.width / 2 + (roomXOffset * roomSize) + (roomXOffset * roomMargin)
        const roomY = config.height / 2 - (roomYOffset * roomSize) - (roomYOffset * roomMargin)

        ctx.fillRect(roomX - roomSize / 2,
            roomY - roomSize / 2,
            roomSize, roomSize)

        if (this.currentRoom.x === room.x && this.currentRoom.y === room.y) {
            ctx.shadowBlur = 4
            ctx.shadowColor = "#FFFFFF"
            ctx.strokeStyle = "#000000"
            ctx.lineWidth = 10
            ctx.beginPath()
            ctx.arc(roomX, roomY, 2, 0, 2 * Math.PI)
            ctx.stroke()
            ctx.shadowBlur = 0
        }

        // Tunnels
        ctx.fillStyle = "#000000"
        const tunnelSize = roomMargin
        room.direction.forEach(direction => {
            switch (direction) {
                case Direction.up:
                    // ctx.fillStyle = "#00FFFF"
                    ctx.fillRect(roomX - tunnelSize, roomY - roomSize / 2 - tunnelSize, tunnelSize * 2, tunnelSize)
                    break
                case Direction.down:
                    // ctx.fillStyle = "#FFFF00"
                    ctx.fillRect(roomX - tunnelSize, roomY + roomSize / 2, tunnelSize * 2, tunnelSize)
                    break
                case Direction.left:
                    // ctx.fillStyle = "#FF00FF"
                    ctx.fillRect(roomX - roomSize / 2 - tunnelSize, roomY - tunnelSize / 2, tunnelSize, tunnelSize * 2)
                    break
                case Direction.right:
                    // ctx.fillStyle = "#5920F0"
                    ctx.fillRect(roomX + roomSize / 2, roomY - tunnelSize / 2, tunnelSize, tunnelSize * 2)
                    break
            }
        })
    }

    drawMap(ctx: CanvasRenderingContext2D) {
        if (this.layout === null) return

        for (let y = 0; y < this.layout.length; y++) {
            for (let x = 0; x < this.layout[y].length; x++) {
                const room = this.layout[y][x]
                if (room !== "0") {
                    this.drawRoom({ ...room, x: x, y: y }, ctx)
                }
            }
        }
    }
}

interface Round {
    enemies: number
    enemySelection: EnemyType[]

    enemySpawnDelay: number
    maxEnemies: number
    crateSpawnDelay: number
    maxCrates: number
}

class RoundManager {
    active: boolean
    rounds: Round[]
    round: number
    enemiesKilledThisRound: number
    roundStart: number
    game: GameScene

    lastEnemySpawn: number
    lastCrateSpawn: number

    constructor(game: GameScene) {
        this.active = true

        this.rounds = []
        for (let i = 0; i < 10; i++) {
            this.rounds[i] = {
                enemies: 10,
                enemySelection: ["ranged", "ball", "spiral"],
                enemySpawnDelay: 500 + i * 100,
                maxEnemies: 5 + i,
                crateSpawnDelay: 5000,
                maxCrates: clamp(10 - i, 1, 10)
            }
        }

        this.enemiesKilledThisRound = 0
        this.round = 0
        this.game = game

        this.lastEnemySpawn = performance.now()
        this.lastCrateSpawn = performance.now()
    }

    update() {
        if (!this.active) return

        if (this.enemiesKilledThisRound >= this.rounds[this.round].enemies) {
            this.round += 1
            this.enemiesKilledThisRound = 0
            this.game.enemies = []
            this.game.crates = []
        }

        if (this.round > this.rounds.length - 1) {
            this.active = false
            return
        }

        const round = this.rounds[this.round]

        if (performance.now() >= this.lastEnemySpawn + round.enemySpawnDelay && this.game.enemies.length < round.maxEnemies) {
            this.lastEnemySpawn = performance.now()

            let x = 0
            let y = 0
            switch (Math.round(random(0, 3))) {
                // Up / down
                case 0:
                    x = random(10, config.width - 10)
                    y = -10
                    break
                case 1:
                    x = random(10, config.width - 10)
                    y = config.height + 10
                    break
                // Left / right
                case 2:
                    x = -10
                    y = random(10, config.height - 10)
                    break
                case 3:
                    x = config.width + 10
                    y = random(10, config.height - 10)
                    break
                default:
                    throw new Error("Testing error")
            }
            let enemy: any = null
            switch (round.enemySelection[Math.round(random(0, round.enemySelection.length - 1))]) {
                case "ball":
                    enemy = BallEnemy
                    break
                case "ranged":
                    enemy = RangedEnemy
                    break
                case "spiral":
                    enemy = SpiralEnemy
                    break
                // default:
                //     enemy = RangedEnemy
                //     break
            }
            this.game.enemies.push(new (enemy)(x, y, this.game.enemyId, this.game))
            this.game.enemyId += 1
        }

        if (performance.now() >= this.lastCrateSpawn + round.crateSpawnDelay && this.game.crates.length < round.maxCrates) {
            this.lastCrateSpawn = performance.now()
            this.game.crates.push(Crate.randomCrate(this.game.crateId, this.game, this.game.crateImage))
            this.game.crateId += 1
        }
    }
}

export {
    RoundManager,
    DungeonManager
}

