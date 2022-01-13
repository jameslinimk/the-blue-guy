import { Coordinates, distance, getAngle, project } from "../../../angles"
import { GameScene } from "../../game"
import { Bullet } from "../bullet"
import { Enemy } from "./enemy"

class SpiralEnemy implements Enemy {
    location: Coordinates
    maxHealth: number
    health: number
    id: number
    width: number
    height: number
    game: GameScene
    currentShootAngle: number
    lastShot: number
    shootDelay: number
    station: boolean

    constructor(x: number, y: number, id: number, game: GameScene) {
        this.location = { x: x, y: y }
        this.width = 30
        this.height = 30
        this.id = id
        this.maxHealth = 200
        this.health = this.maxHealth
        this.game = game
        this.currentShootAngle = 0
        this.lastShot = performance.now()
        this.shootDelay = 1000
        this.station = false
    }

    hit(damage: number) {
        this.health -= damage
        if (this.health <= 0) {
            // this.game.balls = this.game.balls.filter(ball => !this.balls.includes(ball.id))
            this.game.roundManager.enemiesKilledThisRound += 1
            return true
        }
        return false
    }

    update(dt: number) {
        if (!this.station && distance(this.location, this.game.player.location) > 200) {
            const location = project(this.location, getAngle(this.location, this.game.player.location), 0.05 * dt)
            this.location = location
        } else {
            this.station = true
        }

        this.currentShootAngle += (50 * dt) % 360
        if (this.station && performance.now() >= this.lastShot + this.shootDelay) {
            this.lastShot = performance.now()

            const oppositeAngle = (this.currentShootAngle - 180) % 360

            this.game.bullets.push(new Bullet(this.location.x, this.location.y, 10, 10, this.currentShootAngle * (Math.PI / 180), 0.04, this.game.bulletId, 6, 1, 300, this.game, true))
            this.game.bulletId += 1
            this.game.bullets.push(new Bullet(this.location.x, this.location.y, 10, 10, oppositeAngle * (Math.PI / 180), 0.04, this.game.bulletId, 6, 1, 300, this.game, true))
            this.game.bulletId += 1
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = (this.station) ? "#FFFF90" : "#00FFFF"
        ctx.shadowBlur = 4
        ctx.shadowColor = "#000000"
        ctx.fillRect(Math.round(this.location.x - this.width / 2), Math.round(this.location.y - this.height / 2), this.width, this.height)
        ctx.shadowBlur = 0
    }
}

export {
    SpiralEnemy
}

