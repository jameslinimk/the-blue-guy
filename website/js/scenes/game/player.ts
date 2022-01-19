import { Coordinates, project } from "../../angles"
import { CustomAnimation } from "../../animations"
import { config } from "../../config"
import { Events, KeyDownEvent, PressedKeys } from "../../game"
import { CustomImage } from "../../image"
import { Sound } from "../../sound"
import { GameScene } from "../game"
import { ak47, Ammo, Gun, guns } from "./guns"

const dashAngles = {
    wa: 225 * (Math.PI / 180),
    wd: 315 * (Math.PI / 180),
    sd: 45 * (Math.PI / 180),
    sa: 135 * (Math.PI / 180),
    w: 270 * (Math.PI / 180),
    s: 90 * (Math.PI / 180),
    a: 180 * (Math.PI / 180),
    d: 0 * (Math.PI / 180)
}

interface AmmoInventory {
    [Ammo.small]: number
    [Ammo.medium]: number
    [Ammo.large]: number
    [Ammo.shell]: number
}

interface GunInventory {
    1: Gun | null,
    2: Gun | null,
    3: Gun | null,
    4: Gun | null,
    5: Gun | null,
    6: Gun | null,
    7: Gun | null,
    8: Gun | null,
    9: Gun | null,
}

class Player {
    location: Coordinates
    width: number
    height: number
    speed: number
    hspd: number
    vspd: number
    image: CustomImage
    dashingImage: CustomImage

    coins: number

    dashing: boolean

    dashAngle: number
    dashDelay: number
    lastDash: number
    dashSound: Sound
    dashOrigin: Coordinates
    dashAnimation: CustomAnimation

    gun: Gun
    selectedGun: number
    gunInventory: GunInventory
    ammo: AmmoInventory

    private _lives: number
    get lives() { return this._lives }
    iFrames: number
    lastHit: number
    hitSound: Sound

    game: GameScene

    constructor(x: number, y: number, game: GameScene) {
        this.location = { x: x, y: y }
        this.width = 25
        this.height = 25
        this.speed = 0.25
        this.hspd = 0
        this.vspd = 0
        this.image = new CustomImage("./images/skins/player.png")
        this.dashingImage = new CustomImage("./images/skins/playerDashing.png")

        this.coins = 0

        this.dashing = false
        this.dashAngle = 0
        this.dashDelay = 750
        this.lastDash = 0
        this.dashSound = new Sound("./sounds/dash.mp3")
        this.dashOrigin = { x: 0, y: 0 }

        this.dashAnimation = new CustomAnimation(120, 200, (movePerFrame) => {
            const location = project(this.location, this.dashAngle, movePerFrame)
            this.location = location

            // Dash collision
            if (this.location.x > config.width || this.location.x < 0) {
                this.location.x = (this.location.x < config.width / 2) ? this.width / 2 : config.width - this.width / 2
                this.dashing = false
            }
            if (this.location.y > config.height || this.location.y < 0) {
                this.location.y = (this.location.y < config.height / 2) ? this.height / 2 : config.height - this.height / 2
                this.dashing = false
            }
            return this.dashing
        }, () => {
            this.dashSound.clonePlay()
            this.dashing = true
            this.lastDash = this.game.getTicks()
            this.dashOrigin = this.location
        }, () => {
            this.dashing = false
        })

        this.gun = ak47
        this.selectedGun = 1
        this.ammo = {
            [Ammo.small]: 100,
            [Ammo.medium]: 100,
            [Ammo.large]: 100,
            [Ammo.shell]: 100
        }
        this.gunInventory = {
            1: this.gun,
            2: null,
            3: null,
            4: null,
            5: null,
            6: null,
            7: null,
            8: null,
            9: null,
        }
        for (let i = 0; i < guns.length; i++) {
            this.gunInventory[i + 1] = guns[i]
        }

        this._lives = 999
        this.iFrames = 500
        this.lastHit = game.getTicks()
        this.hitSound = new Sound("./sounds/hitHurt.wav")

        this.game = game
    }

    set lives(newLives: number) {
        const damage = this._lives - newLives
        if (damage === 0) return

        // Heal
        if (damage < 0) {
            this._lives -= damage
            return
        }

        if (this.game.getTicks() >= this.lastHit + this.iFrames && !this.dashing) {
            this._lives -= damage
            this.hitSound.clonePlay()

            if (this.lives < 1) {
                this.game.terminateGame()
                alert("TODO // You died")
                location.reload()
                return
            }

            // iFrames
            this.lastHit = this.game.getTicks()
        }
    }

    draw() {
        if (this.dashing) {
            this.game.ctx.beginPath()
            this.game.ctx.moveTo(Math.round(this.location.x), Math.round(this.location.y))
            this.game.ctx.strokeStyle = "#0000FF"
            this.game.ctx.lineWidth = 10
            this.game.ctx.shadowColor = "#0000FF"
            this.game.ctx.shadowBlur = 2
            this.game.ctx.lineTo(Math.round(this.dashOrigin.x), Math.round(this.dashOrigin.y))
            this.game.ctx.stroke()
        }

        this.game.ctx.shadowColor = "#000000"
        this.game.ctx.shadowBlur = 5
        this.game.ctx.drawImage((!this.dashing) ? this.image.image : this.dashingImage.image, Math.round(this.location.x - this.width / 2), Math.round(this.location.y - this.height / 2))
        this.game.ctx.shadowBlur = 0
    }

    update(dt: number) {
        this.dashAnimation.update(dt)
    }

    processInput(events: Events, pressedKeys: PressedKeys, dt: number) {
        if (this.game.paused) return

        // Weapon switch
        events.filter(event => event.eventType === "KeyDown" && (event as KeyDownEvent).raw.code.startsWith("Digit")).forEach(event => {
            event = <KeyDownEvent>event
            const digit = parseInt(event.raw.code.split("Digit")[1])
            const gun: Gun = this.gunInventory[digit]
            if (gun) {
                this.gun = gun
                this.selectedGun = digit
            }
        })

        // Dashing
        events.filter(event => event.eventType === "KeyDown" && (event as KeyDownEvent).key.toLowerCase() === " ").forEach(() => {
            if (this.dashing) return
            if (!(this.game.getTicks() >= this.lastDash + this.dashDelay)) return

            if ((pressedKeys.get("w") || pressedKeys.get("W"))
                && (pressedKeys.get("a") || pressedKeys.get("A"))) {
                this.dashAngle = dashAngles.wa
            } else if ((pressedKeys.get("w") || pressedKeys.get("W"))
                && (pressedKeys.get("d") || pressedKeys.get("D"))) {
                this.dashAngle = dashAngles.wd
            } else if ((pressedKeys.get("s") || pressedKeys.get("S"))
                && (pressedKeys.get("d") || pressedKeys.get("D"))) {
                this.dashAngle = dashAngles.sd
            } else if ((pressedKeys.get("a") || pressedKeys.get("A"))
                && (pressedKeys.get("s") || pressedKeys.get("S"))) {
                this.dashAngle = dashAngles.sa
            } else if (pressedKeys.get("w") || pressedKeys.get("W")) {
                this.dashAngle = dashAngles.w
            } else if (pressedKeys.get("s") || pressedKeys.get("S")) {
                this.dashAngle = dashAngles.s
            } else if (pressedKeys.get("a") || pressedKeys.get("A")) {
                this.dashAngle = dashAngles.a
            } else if (pressedKeys.get("d") || pressedKeys.get("D")) {
                this.dashAngle = dashAngles.d
            } else {
                this.dashAngle = dashAngles.w
            }

            this.dashAnimation.on = true
        })
        if (this.dashing) return

        const speed = (pressedKeys.get("c") || pressedKeys.get("C")) ? (this.speed / 2) * dt : this.speed * dt

        // Horizontal movement
        this.hspd = 0
        if (pressedKeys.get("a") || pressedKeys.get("A")) this.hspd -= speed
        if (pressedKeys.get("d") || pressedKeys.get("D")) this.hspd += speed

        // Vertical movement
        this.vspd = 0
        if (pressedKeys.get("w") || pressedKeys.get("W")) this.vspd -= speed
        if (pressedKeys.get("s") || pressedKeys.get("S")) this.vspd += speed

        // Diagonal movement quick patch
        if (this.hspd !== 0 && this.vspd !== 0) {
            this.hspd *= 0.707
            this.vspd *= 0.707
        }

        // Apply
        this.location.y += this.vspd
        this.location.x += this.hspd

        // Wall collision
        if (this.hspd !== 0) {
            const tempPlayerLoc = this.hspd != 0 && this.location.x + this.hspd + ((this.hspd > 0) ? this.width / 2 : -this.width / 2)
            if (!(tempPlayerLoc > config.width || tempPlayerLoc < 0)) {
                this.location.x += this.hspd
            } else {
                this.location.x = (this.hspd > 0) ? config.width - this.width / 2 : 0 + this.width / 2
            }
        }
        if (this.vspd !== 0) {
            const tempPlayerLoc = this.vspd != 0 && this.location.y + this.vspd + ((this.vspd > 0) ? this.height / 2 : -this.height / 2)
            if (!(tempPlayerLoc > config.height || tempPlayerLoc < 0)) {
                this.location.y += this.vspd
            } else {
                this.location.y = (this.vspd > 0) ? config.height - this.height / 2 : 0 + this.height / 2
            }
        }
    }
}

export {
    Player
}

