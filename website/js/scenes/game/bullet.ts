import { Coordinates, distance, project } from "../../angles"
import { touches, xywdToCollisionRect } from "../../collision"
import { GameScene, random } from "../game"
import { RangedEnemy } from "./enemies/rangedEnemy"

class Bullet {
    location: Coordinates
    width: number
    height: number

    angle: number
    speed: number

    id: number

    damage: number
    origin: Coordinates
    range: number
    game: GameScene

    hitPlayer: boolean

    constructor(x: number, y: number, width: number, height: number, angle: number, speed: number, id: number, inaccuracy: number, damage: number, range: number, game: GameScene, hitPlayer = false) {
        this.location = { x: x, y: y }
        this.width = width
        this.height = height
        this.angle = ((angle * (180 / Math.PI)) + random(-inaccuracy, inaccuracy)) * (Math.PI / 180)
        this.speed = speed
        this.id = id
        this.damage = damage
        this.origin = this.location
        this.range = range
        this.game = game
        this.hitPlayer = hitPlayer
    }

    update(dt: number) {
        // Range check
        if (distance(this.origin, this.location) >= this.range) {
            this.game.bullets = this.game.bullets.filter(bullet => bullet.id != this.id)
        }

        const location = project(this.location, this.angle, this.speed * dt)
        this.location = location

        let hit: RangedEnemy | boolean = false
        for (const enemy of this.game.enemies) {
            const enemyCollisionRect = xywdToCollisionRect(enemy.location.x, enemy.location.y, enemy.width, enemy.height)
            const bulletCollisionRect = xywdToCollisionRect(this.location.x, this.location.y, this.width, this.height)
            if (!this.hitPlayer && touches(enemyCollisionRect, bulletCollisionRect)) {
                if (enemy.hit(this.damage)) {
                    this.game.enemies = this.game.enemies.filter(_enemy => _enemy.id != enemy.id)
                }
                hit = true
            }
            if (this.hitPlayer && touches(xywdToCollisionRect(this.game.player.location.x, this.game.player.location.y, this.game.player.width, this.game.player.height), bulletCollisionRect)) {
                this.game.player.lives -= this.damage
                hit = true
            }
        }
        if (hit) {
            this.game.bullets = this.game.bullets.filter(bullet => bullet.id != this.id)
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.shadowBlur = 5
        ctx.shadowColor = "#000000"
        ctx.fillStyle = (this.hitPlayer) ? "#8d1b1f" : "#0000FF"
        ctx.fillRect(this.location.x - this.width / 2, this.location.y - this.width / 2, this.width, this.height)
        ctx.shadowBlur = 0
    }
}

export {
    Bullet
}

