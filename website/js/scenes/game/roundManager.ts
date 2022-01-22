import { Coordinates } from "../../angles"
import { config } from "../../config"
import { clamp, GameScene, random } from "../game"
import { Crate } from "./crate"
import { fullGenerate, Layout, Room } from "./dungeonGenerator"
import { BallEnemy } from "./enemies/ballEnemy"
import { EnemyType } from "./enemies/enemy"
import { RangedEnemy } from "./enemies/rangedEnemy"
import { SpiralEnemy } from "./enemies/spiralEnemy"

class DungeonManager {
    private _layout?: Layout
    get layout() { return this._layout }
    set layout(layout: Layout) {
        this.currentRoom = { x: (layout.length - 1) / 2, y: (layout.length - 1) / 2 }
        this._layout = layout
    }
    currentRoom?: Coordinates
    get currentRoomObject() {
        if (!this._layout || !this.currentRoom) return null
        return this._layout[this.currentRoom.y][this.currentRoom.x]
    }
    game: GameScene

    constructor(game: GameScene) {
        this.game = game
        fullGenerate(game, { layoutSize: 7, rooms: 20 }, [{ type: "shop", count: 5 }, { type: "chest", count: 3 }]).then(layout => {
            this._layout = layout
            this.currentRoom = { x: (layout.length - 1) / 2, y: (layout.length - 1) / 2 }
            setTimeout(() => {
                (<Room>this._layout[this.currentRoom.y][this.currentRoom.x]).dungeonRounds.active = true
            }, 1000)
        })
    }

    update(dt: number) {
        if (this.currentRoomObject !== "0" && this.currentRoomObject !== null) {
            switch (this.currentRoomObject.type) {
                case "dungeon":
                    this.currentRoomObject.dungeonRounds.update()
                    this.game.enemies.forEach(enemy => enemy.update(dt))
                    this.game.bullets.forEach(bullet => bullet.update(dt))
                    this.game.rays.forEach(ray => ray.update())
                    this.game.balls.forEach(ball => ball.update(dt))
                    break
                case "shop":
                    this.currentRoomObject.shopRoom.update()
                    this.game.bullets.forEach(bullet => bullet.update(dt))
                    break
            }
        }
    }

    draw() {
        if (this.currentRoomObject !== "0" && this.currentRoomObject !== null) {
            switch (this.currentRoomObject.type) {
                case "dungeon":
                    this.currentRoomObject.dungeonRounds.crates.forEach(crate => crate.draw())
                    this.game.bullets.forEach(bullet => bullet.draw())
                    this.game.rays.forEach(ray => ray.draw())
                    this.game.balls.forEach(ball => ball.draw())
                    this.game.enemies.forEach(enemy => enemy.draw())
                    break
                case "shop":
                    this.currentRoomObject.shopRoom.draw()
                    break
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
    cleared: boolean
    rounds: Round[]
    round: number
    enemiesKilledThisRound: number
    roundStart: number
    game: GameScene

    lastEnemySpawn: number
    lastCrateSpawn: number

    crates: Crate[]
    crateId: number

    constructor(game: GameScene) {
        this.active = false
        this.cleared = false

        this.crates = []
        this.crateId = 0

        this.rounds = []
        for (let i = 0; i < 1; i++) {
            this.rounds[i] = {
                enemies: 1,
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

        this.lastEnemySpawn = this.game.getTicks()
        this.lastCrateSpawn = this.game.getTicks()
    }

    update() {
        this.crates.forEach(crate => crate.check())

        if (!this.active) return

        if (this.enemiesKilledThisRound >= this.rounds[this.round].enemies) {
            this.round += 1
            this.enemiesKilledThisRound = 0
            this.game.enemies = []
        }

        if (this.round > this.rounds.length - 1) {
            this.active = false
            this.cleared = true
            return
        }

        const round = this.rounds[this.round]

        if (this.game.getTicks() >= this.lastEnemySpawn + round.enemySpawnDelay && this.game.enemies.length < round.maxEnemies) {
            this.lastEnemySpawn = this.game.getTicks()

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

        if (this.game.getTicks() >= this.lastCrateSpawn + round.crateSpawnDelay && this.crates.length < round.maxCrates) {
            this.lastCrateSpawn = this.game.getTicks()
            this.crates.push(Crate.randomCrate(this.crateId, this.game))
            this.crateId += 1
        }
    }
}

export {
    RoundManager,
    Round,
    DungeonManager
}

