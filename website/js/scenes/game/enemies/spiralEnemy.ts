import { distance, getAngle, project } from "../../../angles"
import { GameScene } from "../../game"
import { Bullet } from "../bullet"
import { Enemy } from "./enemy"

class SpiralEnemy extends Enemy {
    currentShootAngle: number
    lastShot: number
    shootDelay: number
    station: boolean

    constructor(x: number, y: number, id: number, game: GameScene) {
        super(x, y, id, game)
        this.width = 30
        this.height = 30
        this.maxHealth = 200
        this.health = this.maxHealth
        this.currentShootAngle = 0
        this.lastShot = game.getTicks()
        this.shootDelay = 1000
        this.station = false
    }

    update(dt: number) {
        if (!this.station && distance(this.location, this.game.player.location) > 200) {
            const location = project(this.location, getAngle(this.location, this.game.player.location), 0.05 * dt)
            this.location = location
        } else {
            this.station = true
        }

        this.currentShootAngle += (50 * dt) % 360
        if (this.station && this.game.getTicks() >= this.lastShot + this.shootDelay) {
            this.lastShot = this.game.getTicks()

            const oppositeAngle = (this.currentShootAngle - 180) % 360

            this.game.bullets.push(new Bullet(this.location.x, this.location.y, 10, 10, this.currentShootAngle * (Math.PI / 180), 0.04, this.game.bulletId, 6, 1, 300, this.game, true))
            this.game.bulletId += 1
            this.game.bullets.push(new Bullet(this.location.x, this.location.y, 10, 10, oppositeAngle * (Math.PI / 180), 0.04, this.game.bulletId, 6, 1, 300, this.game, true))
            this.game.bulletId += 1
        }
    }

    draw() {
        this.game.ctx.fillStyle = (this.station) ? "#FFFF90" : "#00FFFF"
        this.game.ctx.shadowBlur = 4
        this.game.ctx.shadowColor = "#000000"
        this.game.ctx.fillRect(Math.round(this.location.x - this.width / 2), Math.round(this.location.y - this.height / 2), this.width, this.height)
        this.game.ctx.shadowBlur = 0
    }
}

export {
    SpiralEnemy
}

