import { Coordinates } from "../angles"
import { CustomAnimation } from "../animations"
import { config } from "../config"
import { BaseScene, Events, KeyDownEvent, MouseDownEvent, MouseMoveEvent, PressedKeys } from "../game"
import { CustomImage } from "../image"
import { Sound } from "../sound"
import { Bullet } from "./game/bullet"
import { Crate } from "./game/crate"
import { fullGenerate } from "./game/dungeonGenerator"
import { Ball } from "./game/enemies/ballEnemy"
import { Enemy } from "./game/enemies/enemy"
import { Ray } from "./game/enemies/rangedEnemy"
import { Map } from "./game/map"
import { Player } from "./game/player"
import { DungeonManager } from "./game/roundManager"
import { drawHud, margin, SystemMessage } from "./hud"
import { shooting } from "./shooting"

function random(min: number, max: number) {
    return (Math.random() * (max - min)) + min
}

class GameScene extends BaseScene {
    /* ---------------------------------- Misc ---------------------------------- */
    player: Player
    mouse: Coordinates
    systemMessages: SystemMessage[]
    systemMessagesId: number

    /* --------------------------------- Bullets -------------------------------- */
    bullets: Bullet[]
    noAmmoSound: Sound
    bulletId: number
    lastShot: number

    /* --------------------------------- Enemies -------------------------------- */
    enemies: Enemy[]
    enemyId: number
    rays: Ray[]
    rayId: number
    balls: Ball[]
    ballId: number

    /* --------------------------------- Crates --------------------------------- */
    crates: Crate[]
    crateId: number
    cratePickupSound: Sound

    /* -------------------------------- Managers -------------------------------- */
    dungeonManager: DungeonManager
    map: Map

    /* --------------------------------- Images --------------------------------- */
    healthImage: CustomImage
    crateImage: CustomImage

    frameImage: CustomImage
    smallAmmoImage: CustomImage
    mediumAmmoImage: CustomImage
    largeAmmoImage: CustomImage
    shellsAmmoImage: CustomImage
    rangedEnemyImage: CustomImage

    /* -------------------------------- Inventory ------------------------------- */
    showInventory: boolean
    showInventoryX: number
    showInventoryAnimation: CustomAnimation
    hideInventoryAnimation: CustomAnimation

    /* --------------------------------- Pausing -------------------------------- */
    private _paused: boolean
    get paused() { return this._paused }
    set paused(paused: boolean) {
        if (this._paused === paused) return
        this._paused = paused

        if (paused) {
            // this.pausedAt = performance.now()
            return
        }
    }
    // TODO Make getTicks() pause when paused
    pausedAt: number

    constructor() {
        super()

        this.player = new Player(config.width / 2, config.height - 50, this)
        this.mouse = { x: 0, y: 0 }
        this.systemMessages = []
        this.systemMessagesId = 0

        this.bullets = []
        // this.bulletSound = new Sound("../../sounds/laserShoot.wav")
        this.noAmmoSound = new Sound("./sounds/noammo.mp3")
        this.bulletId = 0
        this.lastShot = 0

        this.enemies = []
        this.enemyId = 0
        this.rays = []
        this.rayId = 0
        this.balls = []
        this.ballId = 0

        this.crates = []
        this.crateId = 0
        this.cratePickupSound = new Sound("./sounds/pickupCoin.wav")

        this.dungeonManager = new DungeonManager(this)
        this.map = new Map(this)

        this.healthImage = new CustomImage("./images/health.png")
        this.crateImage = new CustomImage("./images/crate.png")

        this.frameImage = new CustomImage("./images/guns/frame.png")
        this.smallAmmoImage = new CustomImage("./images/smallammo.png")
        this.mediumAmmoImage = new CustomImage("./images/mediumammo.png")
        this.largeAmmoImage = new CustomImage("./images/largeammo.png")
        this.shellsAmmoImage = new CustomImage("./images/shellsammo.png")
        this.rangedEnemyImage = new CustomImage("./images/skins/rangedEnemy.png")

        this.showInventory = false
        this.showInventoryX = config.width - margin
        this.showInventoryAnimation = new CustomAnimation(250, 64, (movePerFrame) => {
            this.showInventoryX -= movePerFrame
        }, () => {
            this.showInventoryX = config.width - margin
        }, () => {
            this.showInventoryX = config.width - 64 - margin
        })

        this.hideInventoryAnimation = new CustomAnimation(250, 64, (movePerFrame) => {
            this.showInventoryX += movePerFrame
        }, () => {
            this.showInventoryX = config.width - 64 - margin
        }, () => {
            this.showInventoryX = config.width - margin
        })

        this._paused = false
        this.pausedAt = performance.now()
    }

    processInput(events: Events, pressedKeys: PressedKeys, dt: number) {
        this.player.processInput(events, pressedKeys, dt)
        this.map.processInput(events)

        /* -------------------------------------------------------------------------- */
        /*                                   Events                                   */
        /* -------------------------------------------------------------------------- */
        let shot = !this.paused && this.player.gun.holdable && pressedKeys.get("Mouse Left") && this.getTicks() >= this.lastShot + this.player.gun.shootDelay
        events.forEach(event => {
            switch (event.eventType) {
                case "MouseMove":
                    event = <MouseMoveEvent>event

                    // Set relative to canvas window
                    const rect = this.canvas?.getBoundingClientRect()
                    this.mouse = { x: event.raw.clientX - rect.left, y: event.raw.clientY - rect.top }
                    break

                case "MouseDown":
                    if (this.paused || shot) break

                    event = <MouseDownEvent>event
                    if (!shot && event.raw.button === 0 && this.getTicks() >= this.lastShot + this.player.gun.shootDelay) {
                        shot = true
                    }
                    break

                case "KeyDown":
                    event = <KeyDownEvent>event
                    switch (event.key.toLowerCase()) {
                        case "f":
                            this.canvas.requestFullscreen()
                            break
                        case "i":
                            if (this.paused) break

                            if (!this.showInventory) {
                                this.showInventoryAnimation.on = true
                                this.showInventory = true
                            } else {
                                this.hideInventoryAnimation.on = true
                                this.showInventory = false
                            }
                            break
                        case "m":
                            if (this.dungeonManager.currentRoomObject !== "0" && this.dungeonManager.currentRoomObject !== null && this.dungeonManager.currentRoomObject.type === "dungeon" && !this.dungeonManager.currentRoomObject.dungeonRounds?.cleared) {
                                this.systemMessages.push({
                                    sentAt: performance.now(),
                                    message: "You cannot access the navigator during combat!",
                                    id: this.systemMessagesId
                                })
                                this.systemMessagesId += 1
                                break
                            }
                            this.map.mapNavigator = !this.map.mapNavigator
                            break
                        case "g":
                            fullGenerate(this, { layoutSize: 7, rooms: 20 }, [{ type: "shop", count: 5 }]).then(layout => {
                                this.dungeonManager.layout = layout
                            })
                            break
                        case "p":
                            console.log("Pause")
                            this.paused = !this.paused
                            break
                    }
                    break
            }
        })

        // Shooting
        if (shot) shooting(this)
    }

    update(dt: number) {
        if (this.paused) return

        // Round
        this.dungeonManager.update()

        // Player
        this.player.update(dt)

        // Crates
        this.crates.forEach(crate => crate.check())

        // Enemies
        this.enemies.forEach(enemy => enemy.update(dt))

        // Bullets / rays
        this.bullets.forEach(bullet => bullet.update(dt))
        this.rays.forEach(ray => ray.update())
        this.balls.forEach(ball => ball.update(dt))

        // Animation
        this.showInventoryAnimation.update(dt)
        this.hideInventoryAnimation.update(dt)
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = "#5a6988"
        ctx.fillRect(0, 0, config.width, config.height)

        this.crates.forEach(crate => crate.draw(ctx))
        this.bullets.forEach(bullet => bullet.draw(ctx))
        this.rays.forEach(ray => ray.draw(ctx))
        this.balls.forEach(ball => ball.draw(ctx))
        this.enemies.forEach(enemy => enemy.draw(ctx))
        this.player.draw(ctx)
        drawHud(ctx, this)
        this.map.draw(ctx)
    }

    getTicks() {
        return performance.now()
    }
}

function clamp(number: number, min: number, max: number) {
    return Math.min(Math.max(number, min), max)
}

export {
    GameScene,
    random,
    clamp
}

