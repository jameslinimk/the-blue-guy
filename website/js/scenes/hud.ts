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
    ctx.shadowBlur = 10
    ctx.font = "20px serif"
    ctx.fillStyle = "#FFFFFF"
    ctx.fillText(`Round: ${game.roundManager.round}`, config.width - ctx.measureText(`Round: ${game.roundManager.round}`).width - margin, margin + 16)
    ctx.shadowBlur = 0
}

export {
    drawHud,
    margin
}

