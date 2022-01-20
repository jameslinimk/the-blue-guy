import { pointTouches, xywdToCollisionRectTopLeft } from "../collision"
import { config } from "../config"
import { CustomImage } from "../image"
import { volume } from "../sound"
import { clamp, GameScene } from "./game"
import { Ammo, Gun } from "./game/guns"

const margin = 16

function drawAmmoCounter(number: number, ammoType: Ammo, image: CustomImage, ctx: CanvasRenderingContext2D, game: GameScene) {
    ctx.drawImage(image.image, margin * number + 32 * (number - 1), config.height - (32 + margin))
    ctx.font = "20px serif"
    ctx.fillStyle = "#FFFFFF"
    ctx.fillText(game.player.ammo[ammoType].toString(), 32 * (number - 1) + (margin * number + 16) - (ctx.measureText(game.player.ammo[ammoType].toString()).width) / 2, config.height - (32 + margin * 1.5))

    if (game.player.gun.ammo === ammoType) {
        // Cooldown screen
        const cooldownPercent = (((clamp(game.getTicks() - game.lastShot, 0, game.player.gun.shootDelay)) - game.player.gun.shootDelay) * -1) / game.player.gun.shootDelay
        const length = 32 * cooldownPercent
        ctx.fillRect(32 * (number - 1) + (margin * number + 16) - length / 2, config.height - (margin), length, margin / 4)
    }
}

function drawInventoryGunSlot(number: number, gun: Gun | null, ctx: CanvasRenderingContext2D, margin: number, game: GameScene) {
    const x = game.showInventoryX
    const y = margin * 3 + 16 + (64 * number) + (margin / 2 * number)
    ctx.drawImage(game.frameImage.image, x, y)
    if (gun) ctx.drawImage(gun.image.image, x, y)

    ctx.font = "20px serif"
    ctx.fillStyle = "#FFFFFF"
    ctx.fillText((number + 1).toString(), x - ctx.measureText((number + 1).toString()).width + 64 - margin / 2, y + 22)
}

interface SystemMessage {
    sentAt: number
    message: string
    id: number
}

function drawHud(game: GameScene) {
    /* --------------------------------- Ammo ---------------------------------- */
    game.ctx.shadowBlur = 10
    game.ctx.shadowColor = "#000000"
    drawAmmoCounter(1, Ammo.small, game.smallAmmoImage, game.ctx, game)
    drawAmmoCounter(2, Ammo.medium, game.mediumAmmoImage, game.ctx, game)
    drawAmmoCounter(3, Ammo.large, game.largeAmmoImage, game.ctx, game)
    drawAmmoCounter(4, Ammo.shell, game.shellsAmmoImage, game.ctx, game)

    /* ---------------------------------- Lives --------------------------------- */
    game.ctx.shadowColor = "#FD0100"
    game.ctx.drawImage(game.healthImage.image, margin, margin)
    game.ctx.font = "20px serif"
    game.ctx.fillStyle = "#FFFFFF"
    game.ctx.shadowColor = "#000000"
    game.ctx.fillText(game.player.lives.toString(), margin * 2 + 32, margin + 16)

    /* ---------------------------------- Coins --------------------------------- */
    game.ctx.shadowColor = "#FFDF00"
    game.ctx.drawImage(game.coinsImage.image, margin, margin * 2 + 32)
    game.ctx.font = "20px serif"
    game.ctx.fillStyle = "#FFFFFF"
    game.ctx.shadowColor = "#000000"
    game.ctx.fillText(game.player.coins.toString(), margin * 2 + 32, margin * 2 + 32 + 16)

    /* ------------------------------ Gun selector ------------------------------ */
    game.ctx.shadowBlur = 2
    game.ctx.drawImage(game.frameImage.image, margin, config.height - (32 * 4 + margin))
    game.ctx.drawImage(game.player.gun.image.image, margin, config.height - (32 * 4 + margin))
    for (let i = 0; i < 9; i++) {
        const gun: Gun | null = game.player.gunInventory[i + 1]
        drawInventoryGunSlot(i, gun, game.ctx, margin, game)
    }

    /* ------------------------------ Current round ----------------------------- */
    if (game.dungeonManager.currentRoomObject !== "0" && game.dungeonManager.currentRoomObject?.type === "dungeon" && game.dungeonManager.currentRoomObject.dungeonRounds.active) {
        game.ctx.shadowBlur = 10
        game.ctx.font = "20px serif"
        game.ctx.fillStyle = "#FFFFFF"
        game.ctx.fillText(`Round: ${game.dungeonManager.currentRoomObject.dungeonRounds.round + 1} / ${game.dungeonManager.currentRoomObject.dungeonRounds.rounds.length}`, config.width - game.ctx.measureText(`Round: ${game.dungeonManager.currentRoomObject.dungeonRounds.round + 1} / ${game.dungeonManager.currentRoomObject.dungeonRounds.rounds.length}`).width - margin, margin + 16)
    }

    /* ----------------------------- System messages ---------------------------- */
    game.ctx.font = "20px verdana"
    game.ctx.fillStyle = "#FF0000"
    game.ctx.shadowBlur = 10
    game.ctx.shadowColor = "#000000"

    const removedMessages = []
    for (let i = 0; i < game.systemMessages.length; i++) {
        const systemMessage = game.systemMessages[i]
        if (game.getTicks() >= systemMessage.sentAt + 2000) {
            removedMessages.push(systemMessage.id)
            continue
        }
        game.ctx.fillText(systemMessage.message, config.width / 2 - game.ctx.measureText(systemMessage.message).width / 2, margin * 2 + 20 * i)
    }
    if (removedMessages.length > 0) game.systemMessages = game.systemMessages.filter(msg => !removedMessages.includes(msg.id))
    game.ctx.shadowBlur = 0
}

function drawPauseMenu(game: GameScene) {
    game.ctx.fillStyle = "#000000"
    game.ctx.fillRect(config.width / 2 - 500 / 2, config.height / 2 - 500 / 2, 500, 500)
    game.ctx.fillStyle = "#FFFFFF"
    game.ctx.font = "20px serif"
    game.ctx.fillText("Pause menu", config.width / 2 - game.ctx.measureText("Pause menu").width / 2, config.height / 2 - 500 / 2 + 30)
    game.ctx.drawImage(game.volUp.image, config.width / 2 - 500 / 2 + 10 * 2 + game.ctx.measureText(`Volume: ${volume.volume * 100}/100`).width, config.height / 2 - 500 / 2 + 40)
    game.ctx.drawImage(game.volDown.image, config.width / 2 - 500 / 2 + 10 * 3 + 32 + game.ctx.measureText(`Volume: ${volume.volume * 100}/100`).width, config.height / 2 - 500 / 2 + 40)
    game.ctx.fillText(`Volume: ${volume.volume * 100}/100`, config.width / 2 - 500 / 2 + 10, config.height / 2 - 500 / 2 + 40 + 32 / 2 + 5)
}

function processClick(game: GameScene) {
    if (pointTouches(xywdToCollisionRectTopLeft(config.width / 2 - 500 / 2 + 10 * 2 + game.ctx.measureText(`Volume: ${volume.volume * 100}/100`).width, config.height / 2 - 500 / 2 + 40, 32, 32), game.mouse)) {
        volume.volume += 0.1
    } else if (pointTouches(xywdToCollisionRectTopLeft(config.width / 2 - 500 / 2 + 10 * 3 + 32 + game.ctx.measureText(`Volume: ${volume.volume * 100}/100`).width, config.height / 2 - 500 / 2 + 40, 32, 32), game.mouse)) {
        volume.volume -= 0.1
    }
}

export {
    drawHud,
    drawPauseMenu,
    processClick,
    margin,
    SystemMessage
}

