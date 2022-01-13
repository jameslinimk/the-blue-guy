import { Coordinates, distance, getAngle, project } from "../../../angles"
import { config } from "../../../config"
import { GameScene } from "../../game"
import { Player } from "../player"
import { Enemy } from "./enemy"

/**
 * @returns point of intersection
 */
function lineLine(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number) {
    const uA = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))
    const uB = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))

    if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
        return <Coordinates>{
            x: x1 + (uA * (x2 - x1)),
            y: y1 + (uA * (y2 - y1))
        }
    }
    return false
}

/**
 * Check if a rectangle touches a line
 * @param x1 One endpoint's x value of the line
 * @param y1 One endpoint's y value of the line
 * @param x2 Another endpoint's x value of the line
 * @param y2 Another endpoint's y value of the line
 * @param rx Rectangles top left x value
 * @param ry Rectangles top left y value
 * @param rw Rectangles width value
 * @param rh Rectangles height value
 * @returns True if line touches rectangle, false if not
 */
function lineRect(x1: number, y1: number, x2: number, y2: number, rx: number, ry: number, rw: number, rh: number) {
    const left = lineLine(x1, y1, x2, y2, rx, ry, rx, ry + rh)
    const right = lineLine(x1, y1, x2, y2, rx + rw, ry, rx + rw, ry + rh)
    const top = lineLine(x1, y1, x2, y2, rx, ry, rx + rw, ry)
    const bottom = lineLine(x1, y1, x2, y2, rx, ry + rh, rx + rw, ry + rh)

    if (left || right || top || bottom) return true
    return false
}

/**
 * Calculates the angle (in radians) between two vectors pointing outward from one center
 *
 * @param p0 first point
 * @param p1 second point
 * @param c center point
 */
function findAngle(p0: Coordinates, p1: Coordinates, c: Coordinates) {
    const p0c = Math.sqrt(Math.pow(c.x - p0.x, 2) +
        Math.pow(c.y - p0.y, 2)) // p0->c (b)
    const p1c = Math.sqrt(Math.pow(c.x - p1.x, 2) +
        Math.pow(c.y - p1.y, 2)) // p1->c (a)
    const p0p1 = Math.sqrt(Math.pow(p1.x - p0.x, 2) +
        Math.pow(p1.y - p0.y, 2)) // p0->p1 (c)
    return Math.acos((p1c * p1c + p0c * p0c - p0p1 * p0p1) / (2 * p1c * p0c))
}

class Ray {
    location: Coordinates
    angle: number
    destinationX: number
    destinationY: number

    windEndTime: number
    fireEndTime: number
    id: number
    state: "fire" | "wind" | "end"
    game: GameScene

    createBounce: boolean
    disableBall: boolean

    constructor(x: number, y: number, angle: number, windLength: number, fireLength: number, id: number, game: GameScene, createBounce: boolean = false, disableBall: boolean = false) {
        this.location = { x: x, y: y }
        this.angle = angle
        const destination = project(this.location, this.angle, config.width + config.height)
        this.destinationX = destination.x
        this.destinationY = destination.y

        this.state = "wind"
        this.windEndTime = performance.now() + windLength
        this.fireEndTime = performance.now() + windLength + fireLength

        this.id = id
        this.game = game

        this.createBounce = createBounce
        this.disableBall = disableBall

        // Create bouncing angle
        if (!createBounce) return

        let ray: Ray = null
        const rightIntersection = lineLine(this.location.x, this.location.y, this.destinationX, this.destinationY, config.width, 0, config.width, config.height)
        if (rightIntersection) {
            let bounceAngle = findAngle(this.location, rightIntersection, {
                x: config.width,
                y: rightIntersection.y + ((this.location.y > rightIntersection.y) ? -100 : 100)
            })
            bounceAngle = (
                ((this.location.y < rightIntersection.y) ? 90 + bounceAngle * (180 / Math.PI) : 270 - bounceAngle * (180 / Math.PI))
            ) * (Math.PI / 180)

            ray = new Ray(rightIntersection.x, rightIntersection.y, bounceAngle, 500, 1500, this.game.rayId, this.game, false, true)
        } else {
            const leftIntersection = lineLine(this.location.x, this.location.y, this.destinationX, this.destinationY, 0, 0, 0, config.height)
            if (leftIntersection) {
                let bounceAngle = findAngle(this.location, leftIntersection, {
                    x: 0,
                    y: leftIntersection.y + ((this.location.y > leftIntersection.y) ? -100 : 100)
                })
                bounceAngle = (
                    ((this.location.y < leftIntersection.y) ? 90 - bounceAngle * (180 / Math.PI) : 270 + bounceAngle * (180 / Math.PI))
                ) * (Math.PI / 180)

                ray = new Ray(leftIntersection.x, leftIntersection.y, bounceAngle, 500, 1500, this.game.rayId, this.game, false, true)
            } else {
                const topIntersection = lineLine(this.location.x, this.location.y, this.destinationX, this.destinationY, 0, 0, config.width, 0)
                if (topIntersection) {
                    let bounceAngle = findAngle(this.location, {
                        x: topIntersection.x,
                        y: 0
                    }, {
                        x: topIntersection.x + ((this.location.x > topIntersection.x) ? -100 : 100),
                        y: 0
                    })
                    bounceAngle = (360 - ((this.location.x > topIntersection.x) ? 180 + (bounceAngle * (180 / Math.PI)) : 360 - (bounceAngle * (180 / Math.PI)))) * (Math.PI / 180)
                    ray = new Ray(topIntersection.x, 0, bounceAngle, 500, 1500, this.game.rayId, this.game, false, true)
                } else {
                    const bottomIntersection = lineLine(this.location.x, this.location.y, this.destinationX, this.destinationY, 0, config.height, config.width, config.height)
                    if (bottomIntersection) {
                        let bounceAngle = findAngle(this.location, {
                            x: bottomIntersection.x,
                            y: config.height
                        }, {
                            x: bottomIntersection.x + ((this.location.x > bottomIntersection.x) ? -100 : 100),
                            y: config.height
                        })
                        bounceAngle = (360 - ((this.location.x > bottomIntersection.x) ? 180 - (bounceAngle * (180 / Math.PI)) : 360 + (bounceAngle * (180 / Math.PI)))) * (Math.PI / 180)
                        ray = new Ray(bottomIntersection.x, config.height, bounceAngle, 500, 1500, this.game.rayId, this.game, false, true)
                    }
                }
            }
        }

        if (ray) {
            this.game.rays.push(ray)
            this.game.rayId += 1
        }
    }

    update() {
        if (performance.now() >= this.windEndTime && performance.now() < this.fireEndTime) {
            this.state = "fire"
        } else if (performance.now() >= this.fireEndTime) {
            this.state = "end"
        } else {
            this.state = "wind"
        }

        if (this.state === "end") this.game.rays = this.game.rays.filter(ray => ray.id != this.id)
        else if (this.state === "fire") {
            if (lineRect(this.location.x, this.location.y, this.destinationX, this.destinationY, this.game.player.location.x - this.game.player.width / 2, this.game.player.location.y - this.game.player.height / 2, this.game.player.width, this.game.player.height)) {
                this.game.player.lives -= 1
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        switch (this.state) {
            case "wind":
                ctx.beginPath()
                ctx.moveTo(this.location.x, this.location.y)
                ctx.strokeStyle = "#808080"
                ctx.lineWidth = 2
                ctx.lineTo(this.destinationX, this.destinationY)
                ctx.stroke()

                if (!this.disableBall) {
                    ctx.fillStyle = "#8d1b1f"
                    ctx.beginPath()
                    ctx.arc(this.location.x, this.location.y, 10, 0, 2 * Math.PI)
                    ctx.fill()
                }
                break
            case "fire":
                ctx.beginPath()
                ctx.moveTo(this.location.x, this.location.y)
                ctx.shadowBlur = 15
                ctx.shadowColor = "#FD0100"
                ctx.strokeStyle = "#8d1b1f"
                ctx.lineWidth = 10
                ctx.lineTo(this.destinationX, this.destinationY)
                ctx.stroke()
                ctx.shadowBlur = 0

                if (!this.disableBall) {
                    ctx.fillStyle = "#8d1b1f"
                    ctx.beginPath()
                    ctx.arc(this.location.x, this.location.y, 10, 0, 2 * Math.PI)
                    ctx.fill()
                }
                break
            default:
                this.game.rays = this.game.rays.filter(ray => ray.id != this.id)
                break
        }
    }
}

class RangedEnemy implements Enemy {
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

    rays: number[]
    game: GameScene

    constructor(x: number, y: number, id: number, game: GameScene) {
        this.location = { x: x, y: y }
        this.width = 30
        this.height = 30
        this.speed = 0.05
        this.id = id
        this.maxHealth = 100
        this.health = this.maxHealth

        this.range = 500
        this.shotCooldown = 5000
        this.lastShot = performance.now()

        this.rays = []
        this.game = game
    }

    /** 
     * @returns killed?
     */
    hit(damage: number) {
        this.health -= damage
        if (this.health <= 0) {
            // this.game.rays = this.game.rays.filter(ray => !this.rays.includes(ray.id))
            this.game.roundManager.enemiesKilledThisRound += 1
            return true
        }
        return false
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.shadowBlur = 4
        ctx.shadowColor = "#000000"
        ctx.drawImage(this.game.rangedEnemyImage.image, Math.round(this.location.x - this.width / 2), Math.round(this.location.y - this.height / 2))
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

                // Lead player
                const ray = new Ray(this.location.x, this.location.y, (Math.random() > 0.5) ? leadPlayer(this.location.x, this.location.y, this.game.player) : getAngle(this.location, this.game.player.location), 500, 1500, this.game.rayId, this.game, true)
                this.game.rays.push(ray)
                this.rays.push(ray.id)
                this.game.rayId += 1
            }
        }
    }
}

function leadPlayer(x: number, y: number, player: Player) {
    let angle = getAngle({
        x: x,
        y: y
    }, {
        x: player.location.x,
        y: player.location.y
    })
    if (!(player.hspd == 0 && player.vspd == 0) && Math.random() > 0.5) {
        let hspd = player.hspd
        let vspd = player.vspd

        const distanceToPlayer = distance({
            x: x,
            y: y
        }, {
            x: player.location.x,
            y: player.location.y
        })
        hspd *= (distanceToPlayer / 5)
        vspd *= (distanceToPlayer / 5)

        const assumedNextPlayerPos = <Coordinates>{
            x: player.location.x + hspd,
            y: player.location.y + vspd
        }
        angle = getAngle({
            x: x,
            y: y
        }, assumedNextPlayerPos)
    }
    return angle
}

export {
    RangedEnemy,
    Ray,
    lineLine,
    lineRect,
    findAngle
}

