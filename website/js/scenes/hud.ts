import { pointTouches, xywdToCollisionRectTopLeft } from "../collision"
import { config } from "../config"
import { Events, MouseDownEvent } from "../game"
import { CustomImage } from "../image"
import { volume } from "../sound"
import { clamp, GameScene } from "./game"
import { Ammo, Gun } from "./game/guns"

const margin = 16

interface SystemMessage {
    sentAt: number
    message: string
    id: number
}

class Hud {
    game: GameScene

    constructor(game: GameScene) {
        this.game = game
    }

    processInput(events: Events) {
        events.filter(event => event.eventType === "MouseDown" && (<MouseDownEvent>event).raw.button === 0).forEach(event => {
            if (pointTouches(xywdToCollisionRectTopLeft(config.width / 2 - 500 / 2 + 10 * 2 + this.game.ctx.measureText(`Volume: ${volume.volume * 100}/100`).width, config.height / 2 - 500 / 2 + 40, 32, 32), this.game.mouse)) {
                volume.volume += 0.1
            } else if (pointTouches(xywdToCollisionRectTopLeft(config.width / 2 - 500 / 2 + 10 * 3 + 32 + this.game.ctx.measureText(`Volume: ${volume.volume * 100}/100`).width, config.height / 2 - 500 / 2 + 40, 32, 32), this.game.mouse)) {
                volume.volume -= 0.1
            }
        })
    }

    private drawPauseMenu() {
        this.game.ctx.fillStyle = "#000000"
        this.game.ctx.fillRect(config.width / 2 - 500 / 2, config.height / 2 - 500 / 2, 500, 500)
        this.game.ctx.fillStyle = "#FFFFFF"
        this.game.ctx.font = "20px serif"
        this.game.ctx.fillText("Pause menu", config.width / 2 - this.game.ctx.measureText("Pause menu").width / 2, config.height / 2 - 500 / 2 + 30)
        this.game.ctx.drawImage(this.game.volUp.image, config.width / 2 - 500 / 2 + 10 * 2 + this.game.ctx.measureText(`Volume: ${volume.volume * 100}/100`).width, config.height / 2 - 500 / 2 + 40)
        this.game.ctx.drawImage(this.game.volDown.image, config.width / 2 - 500 / 2 + 10 * 3 + 32 + this.game.ctx.measureText(`Volume: ${volume.volume * 100}/100`).width, config.height / 2 - 500 / 2 + 40)
        this.game.ctx.fillText(`Volume: ${volume.volume * 100}/100`, config.width / 2 - 500 / 2 + 10, config.height / 2 - 500 / 2 + 40 + 32 / 2 + 5)
    }

    private drawInventoryGunSlot(number: number, gun: Gun | null) {
        const x = this.game.showInventoryX
        const y = margin * 3 + 16 + (64 * number) + (margin / 2 * number)
        this.game.ctx.drawImage(this.game.frameImage.image, x, y)
        if (gun) this.game.ctx.drawImage(gun.image.image, x, y)

        this.game.ctx.font = "20px serif"
        this.game.ctx.fillStyle = "#FFFFFF"
        this.game.ctx.fillText((number + 1).toString(), x - this.game.ctx.measureText((number + 1).toString()).width + 64 - margin / 2, y + 22)
    }

    private drawAmmoCounter(number: number, ammoType: Ammo, image: CustomImage) {
        this.game.ctx.drawImage(image.image, margin * number + 32 * (number - 1), config.height - (32 + margin))
        this.game.ctx.font = "20px serif"
        this.game.ctx.fillStyle = "#FFFFFF"
        this.game.ctx.fillText(this.game.player.ammo[ammoType].toString(), 32 * (number - 1) + (margin * number + 16) - (this.game.ctx.measureText(this.game.player.ammo[ammoType].toString()).width) / 2, config.height - (32 + margin * 1.5))

        if (this.game.player.gun.ammo === ammoType) {
            // Cooldown screen
            const cooldownPercent = (((clamp(this.game.getTicks() - this.game.lastShot, 0, this.game.player.gun.shootDelay)) - this.game.player.gun.shootDelay) * -1) / this.game.player.gun.shootDelay
            const length = 32 * cooldownPercent
            this.game.ctx.fillRect(32 * (number - 1) + (margin * number + 16) - length / 2, config.height - (margin), length, margin / 4)
        }
    }

    draw() {
        /* --------------------------------- Ammo ---------------------------------- */
        this.game.ctx.shadowBlur = 10
        this.game.ctx.shadowColor = "#000000"
        this.drawAmmoCounter(1, Ammo.small, this.game.smallAmmoImage)
        this.drawAmmoCounter(2, Ammo.medium, this.game.mediumAmmoImage)
        this.drawAmmoCounter(3, Ammo.large, this.game.largeAmmoImage)
        this.drawAmmoCounter(4, Ammo.shell, this.game.shellsAmmoImage)

        /* ---------------------------------- Lives --------------------------------- */
        this.game.ctx.shadowColor = "#FD0100"
        this.game.ctx.drawImage(this.game.healthImage.image, margin, margin)
        this.game.ctx.font = "20px serif"
        this.game.ctx.fillStyle = "#FFFFFF"
        this.game.ctx.shadowColor = "#000000"
        this.game.ctx.fillText(this.game.player.lives.toString(), margin * 2 + 32, margin + 16)

        /* ---------------------------------- Coins --------------------------------- */
        this.game.ctx.shadowColor = "#FFDF00"
        this.game.ctx.drawImage(this.game.coinsImage.image, margin, margin * 2 + 32)
        this.game.ctx.font = "20px serif"
        this.game.ctx.fillStyle = "#FFFFFF"
        this.game.ctx.shadowColor = "#000000"
        this.game.ctx.fillText(this.game.player.coins.toString(), margin * 2 + 32, margin * 2 + 32 + 16)

        /* ------------------------------ Gun selector ------------------------------ */
        this.game.ctx.shadowBlur = 2
        this.game.ctx.drawImage(this.game.frameImage.image, margin, config.height - (32 * 4 + margin))
        this.game.ctx.drawImage(this.game.player.gun.image.image, margin, config.height - (32 * 4 + margin))
        for (let i = 0; i < 9; i++) {
            const gun: Gun | null = this.game.player.gunInventory[i + 1]
            this.drawInventoryGunSlot(i, gun)
        }

        /* ------------------------------ Current round ----------------------------- */
        if (this.game.dungeonManager.currentRoomObject !== "0" && this.game.dungeonManager.currentRoomObject?.type === "dungeon" && this.game.dungeonManager.currentRoomObject.dungeonRounds.active) {
            this.game.ctx.shadowBlur = 10
            this.game.ctx.font = "20px serif"
            this.game.ctx.fillStyle = "#FFFFFF"
            this.game.ctx.fillText(`Round: ${this.game.dungeonManager.currentRoomObject.dungeonRounds.round + 1} / ${this.game.dungeonManager.currentRoomObject.dungeonRounds.rounds.length}`, config.width - this.game.ctx.measureText(`Round: ${this.game.dungeonManager.currentRoomObject.dungeonRounds.round + 1} / ${this.game.dungeonManager.currentRoomObject.dungeonRounds.rounds.length}`).width - margin, margin + 16)
        }

        /* ----------------------------- System messages ---------------------------- */
        this.game.ctx.font = "20px verdana"
        this.game.ctx.fillStyle = "#FF0000"
        this.game.ctx.shadowBlur = 10
        this.game.ctx.shadowColor = "#000000"

        const removedMessages = []
        for (let i = 0; i < this.game.systemMessages.length; i++) {
            const systemMessage = this.game.systemMessages[i]
            if (this.game.getTicks() >= systemMessage.sentAt + 2000) {
                removedMessages.push(systemMessage.id)
                continue
            }
            this.game.ctx.fillText(systemMessage.message, config.width / 2 - this.game.ctx.measureText(systemMessage.message).width / 2, margin * 2 + 20 * i)
        }
        if (removedMessages.length > 0) this.game.systemMessages = this.game.systemMessages.filter(msg => !removedMessages.includes(msg.id))
        this.game.ctx.shadowBlur = 0

        if (this.game.paused) this.drawPauseMenu()

        /* ------------------------------ Custom cursor ----------------------------- */
        this.game.ctx.shadowBlur = 4
        this.game.ctx.strokeStyle = "#000000"
        this.game.ctx.lineWidth = 3
        this.game.ctx.beginPath()
        this.game.ctx.arc(this.game.mouse.x, this.game.mouse.y, 5, 0, 2 * Math.PI)
        this.game.ctx.stroke()

        this.game.ctx.strokeStyle = "#FFFFFF"
        this.game.ctx.lineWidth = 2
        this.game.ctx.beginPath()
        this.game.ctx.arc(this.game.mouse.x, this.game.mouse.y, 5, 0, 2 * Math.PI)
        this.game.ctx.stroke()
    }
}

export {
    Hud,
    margin,
    SystemMessage
}

