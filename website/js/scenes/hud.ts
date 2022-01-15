import { config } from "../config"
import { CustomImage } from "../image"
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

// function drawUpdate(dt: number, game: GameScene) {
//     // TODO Finish this up check back in with player.ts because this aint working!
//     const movePerFrame = ((game.showInventoryAnimationHideX - game.showInventoryAnimationShowX) / (game.showInventoryAnimationLength)) * dt
//     game.showInventoryAnimationFrame += 1 * dt

//     game.showInventoryAnimationX -= movePerFrame

//     console.log("MovePerFrame: ", movePerFrame, "X: ", game.showInventoryAnimationX)

//     if (game.showInventoryAnimationFrame >= game.showInventoryAnimationLength) {
//         game.showInventoryAnimationX = game.showInventoryAnimationShowX
//         game.showInventoryAnimation = false
//     }
// }

interface SystemMessage {
    sentAt: number
    message: string
    id: number
}

function drawHud(ctx: CanvasRenderingContext2D, game: GameScene) {
    /* --------------------------------- Ammo ---------------------------------- */
    ctx.shadowBlur = 10
    ctx.shadowColor = "#000000"
    drawAmmoCounter(1, Ammo.small, game.smallAmmoImage, ctx, game)
    drawAmmoCounter(2, Ammo.medium, game.mediumAmmoImage, ctx, game)
    drawAmmoCounter(3, Ammo.large, game.largeAmmoImage, ctx, game)
    drawAmmoCounter(4, Ammo.shell, game.shellsAmmoImage, ctx, game)

    /* ---------------------------------- Lives --------------------------------- */
    ctx.shadowColor = "#FD0100"
    ctx.drawImage(game.healthImage.image, margin, margin)
    ctx.font = "20px serif"
    ctx.fillStyle = "#FFFFFF"
    ctx.shadowColor = "#000000"
    ctx.fillText(game.player.lives.toString(), margin * 2 + 32, margin + 16)

    /* ---------------------------------- Coins --------------------------------- */
    ctx.shadowColor = "#FFDF00"
    ctx.drawImage(game.coinsImage.image, margin, margin * 2 + 32)
    ctx.font = "20px serif"
    ctx.fillStyle = "#FFFFFF"
    ctx.shadowColor = "#000000"
    ctx.fillText(game.player.coins.toString(), margin * 2 + 32, margin * 2 + 32 + 16)

    /* ------------------------------ Gun selector ------------------------------ */
    ctx.shadowBlur = 2
    ctx.drawImage(game.frameImage.image, margin, config.height - (32 * 4 + margin))
    ctx.drawImage(game.player.gun.image.image, margin, config.height - (32 * 4 + margin))
    for (let i = 0; i < 9; i++) {
        const gun: Gun | null = game.player.gunInventory[i + 1]
        drawInventoryGunSlot(i, gun, ctx, margin, game)
    }

    /* ------------------------------ Custom cursor ----------------------------- */
    ctx.shadowBlur = 4
    ctx.strokeStyle = "#000000"
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(game.mouse.x, game.mouse.y, 5, 0, 2 * Math.PI)
    ctx.stroke()

    ctx.strokeStyle = "#FFFFFF"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(game.mouse.x, game.mouse.y, 5, 0, 2 * Math.PI)
    ctx.stroke()

    /* ------------------------------ Current round ----------------------------- */
    if (game.dungeonManager.currentRoomObject !== "0" && game.dungeonManager.currentRoomObject?.type === "dungeon" && game.dungeonManager.currentRoomObject.dungeonRounds.active) {
        ctx.shadowBlur = 10
        ctx.font = "20px serif"
        ctx.fillStyle = "#FFFFFF"
        ctx.fillText(`Round: ${game.dungeonManager.currentRoomObject.dungeonRounds.round + 1} / ${game.dungeonManager.currentRoomObject.dungeonRounds.rounds.length}`, config.width - ctx.measureText(`Round: ${game.dungeonManager.currentRoomObject.dungeonRounds.round + 1} / ${game.dungeonManager.currentRoomObject.dungeonRounds.rounds.length}`).width - margin, margin + 16)
        ctx.shadowBlur = 0
    }

    /* ----------------------------- System messages ---------------------------- */
    ctx.font = "20px verdana"
    ctx.fillStyle = "#FF0000"
    ctx.shadowBlur = 10
    ctx.shadowColor = "#000000"

    const removedMessages = []
    for (let i = 0; i < game.systemMessages.length; i++) {
        const systemMessage = game.systemMessages[i]
        if (game.getTicks() >= systemMessage.sentAt + 2000) {
            removedMessages.push(systemMessage.id)
            continue
        }
        ctx.fillText(systemMessage.message, config.width / 2 - ctx.measureText(systemMessage.message).width / 2, margin * 2 + 20 * i)
    }
    if (removedMessages.length > 0) game.systemMessages = game.systemMessages.filter(msg => !removedMessages.includes(msg.id))
}

export {
    drawHud,
    margin,
    SystemMessage
}

