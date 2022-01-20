import { Coordinates } from "../../../angles"
import { GameScene } from "../../game"
import { Crate } from "../crate"
import { Room } from "../dungeonGenerator"

abstract class Enemy {
    location: Coordinates
    maxHealth: number
    health: number
    id: number
    width: number
    height: number
    game: GameScene

    constructor(x: number, y: number, id: number, game: GameScene) {
        this.location = { x: x, y: y }
        this.id = id
        this.game = game
    }

    update(dt: number) { }
    draw() { }

    hit(damage: number) {
        this.health -= damage
        if (this.health <= 0) {
            // this.game.balls = this.game.balls.filter(ball => !this.balls.includes(ball.id))
            if (this.game.dungeonManager.currentRoomObject !== "0" && this.game.dungeonManager.currentRoomObject.type === "dungeon") {
                (<Room>this.game.dungeonManager.currentRoomObject).dungeonRounds.enemiesKilledThisRound += 1
                this.game.dungeonManager.currentRoomObject.dungeonRounds.crates.push(Crate.coin(this.location.x, this.location.y, this.game.dungeonManager.currentRoomObject.dungeonRounds.crateId, this.game))
                this.game.dungeonManager.currentRoomObject.dungeonRounds.crateId += 1
            }
            return true
        }
        return false
    }
}

type EnemyType = "ranged" | "ball" | "spiral"

export {
    Enemy,
    EnemyType
}

