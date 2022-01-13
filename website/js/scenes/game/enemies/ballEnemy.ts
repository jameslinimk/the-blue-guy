import { Coordinates, distance, getAngle, project } from "../../../angles"
import { config } from "../../../config"
import { GameScene, random } from "../../game"
import { Enemy } from "./enemy"
import { Ray } from "./rangedEnemy"

function circleRect(R: number, Xc: number, Yc: number, X1: number, Y1: number, X2: number, Y2: number) {
    // Find the nearest point on the
    // rectangle to the center of
    // the circle
    const Xn = Math.max(X1, Math.min(Xc, X2))
    const Yn = Math.max(Y1, Math.min(Yc, Y2))

    // Find the distance between the
    // nearest point and the center
    // of the circle
    // Distance between 2 points,
    // (x1, y1) & (x2, y2) in
    // 2D Euclidean space is
    // ((x1-x2)**2 + (y1-y2)**2)**0.5
    const Dx = Xn - Xc
    const Dy = Yn - Yc
    return (Dx * Dx + Dy * Dy) <= R * R
}

class Ball {
    location: Coordinates
    angle: number
    length: number
    speed: number
    origin: Coordinates
    radius: number

    id: number
    game: GameScene
    inaccuracy: number

    constructor(x: number, y: number, angle: number, id: number, game: GameScene) {
        this.location = { x: x, y: y }
        this.origin = { x: x, y: y }
        this.radius = 20

        this.speed = 0.025

        this.inaccuracy = 20
        this.angle = ((angle * (180 / Math.PI)) + random(-this.inaccuracy, this.inaccuracy)) * (Math.PI / 180)

        this.length = 500

        this.id = id
        this.game = game
    }

    update(dt: number) {
        const location = project(this.location, this.angle, this.speed * dt)
        if (distance(this.origin, location) >= this.length) {
            const ray = new Ray(this.location.x, this.location.y, getAngle(this.location, this.game.player.location), 500, 1500, this.game.rayId, this.game, true)
            this.game.rays.push(ray)
            this.game.rayId += 1

            this.game.balls = this.game.balls.filter(ball => ball.id != this.id)
        } else {
            if (location.x > config.width || location.x < 0 || location.y > config.height || location.y < 0) {
                const ray = new Ray(this.location.x, this.location.y, getAngle(this.location, this.game.player.location), 500, 1500, this.game.rayId, this.game, true)
                this.game.rays.push(ray)
                this.game.rayId += 1

                this.game.balls = this.game.balls.filter(ball => ball.id != this.id)
            } else {
                this.location = location

                if (circleRect(this.radius, this.location.x, this.location.y, this.game.player.location.x - this.game.player.width / 2, this.game.player.location.y - this.game.player.height / 2, this.game.player.location.x + this.game.player.width / 2, this.game.player.location.y + this.game.player.height / 2)) {
                    this.game.player.lives -= 1
                }
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = "#FFFFFF"
        ctx.beginPath()
        ctx.arc(this.location.x, this.location.y, this.radius + 2, 0, 2 * Math.PI)
        ctx.fill()

        ctx.shadowBlur = 15
        ctx.shadowColor = "#FD0100"
        ctx.fillStyle = "#8d1b1f"
        ctx.beginPath()
        ctx.arc(this.location.x, this.location.y, this.radius, 0, 2 * Math.PI)
        ctx.fill()
        ctx.shadowBlur = 0
    }
}

class BallEnemy implements Enemy {
    location: Coordinates
    width: number
    height: number
    speed: number
    id: number
    health: number
    maxHealth: number

    range: number
    shotCooldown: number
    lastShot: number

    // balls: number[]
    game: GameScene

    constructor(x: number, y: number, id: number, game: GameScene) {
        this.location = { x: x, y: y }
        this.width = 30
        this.height = 30
        this.speed = 0.05
        this.id = id
        this.maxHealth = 50
        this.health = this.maxHealth

        this.range = 250
        this.shotCooldown = 10000
        this.lastShot = performance.now()

        // this.balls = []
        this.game = game
    }

    /** 
     * @returns killed?
     */
    hit(damage: number) {
        this.health -= damage
        if (this.health <= 0) {
            // this.game.balls = this.game.balls.filter(ball => !this.balls.includes(ball.id))
            this.game.roundManager.enemiesKilledThisRound += 1
            return true
        }
        return false
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = "#FFFF00"
        ctx.shadowBlur = 4
        ctx.shadowColor = "#000000"
        ctx.fillRect(Math.round(this.location.x - this.width / 2), Math.round(this.location.y - this.height / 2), this.width, this.height)
        ctx.shadowBlur = 0
    }

    update(dt: number): void {
        if (distance(this.location, this.game.player.location) > this.range) {
            const location = project(this.location, getAngle(this.location, this.game.player.location), this.speed * dt)
            this.location = location
        } else {
            // Shooting
            if (performance.now() >= this.lastShot + this.shotCooldown) {
                this.lastShot = performance.now()
                const ball = new Ball(this.location.x, this.location.y, getAngle(this.location, this.game.player.location), this.game.ballId, this.game)
                this.game.balls.push(ball)
                // this.balls.push(ball.id)
                this.game.ballId += 1
            }
        }
    }
}

export {
    Ball,
    BallEnemy
}
