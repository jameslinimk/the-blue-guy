import { Coordinates } from "../../angles"
import { config } from "../../config"
import { clamp, GameScene, random } from "../game"
import { Crate } from "./crate"
import { fullGenerate, Layout } from "./dungeonGenerator"
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
        if (this._layout === null || this.currentRoom === null) return null
        return this._layout[this.currentRoom.y][this.currentRoom.x]
    }

    constructor(game: GameScene) {
        fullGenerate(game, { layoutSize: 7, rooms: 20 }, [{ type: "shop", count: 5 }, { type: "chest", count: 3 }]).then(layout => {
            this._layout = layout
            this.currentRoom = { x: (layout.length - 1) / 2, y: (layout.length - 1) / 2 }
        })
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
        this.active = false

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

        this.lastEnemySpawn = this.game.getTicks()
        this.lastCrateSpawn = this.game.getTicks()
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

        if (this.game.getTicks() >= this.lastCrateSpawn + round.crateSpawnDelay && this.game.crates.length < round.maxCrates) {
            this.lastCrateSpawn = this.game.getTicks()
            this.game.crates.push(Crate.randomCrate(this.game.crateId, this.game, this.game.crateImage))
            this.game.crateId += 1
        }
    }
}

export {
    RoundManager,
    DungeonManager
}

