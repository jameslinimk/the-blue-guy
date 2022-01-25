import { getAngle } from "../angles"
import { GameScene } from "./game"
import { Bullet } from "./game/bullet"
import { Room } from "./game/dungeonGenerator"

function shooting(game: GameScene) {
    if (game.player.ammo[game.player.gun.ammo] > 0) {
        if ((<Room>game.dungeonManager.currentRoomObject)?.type === "dungeon") game.player.ammo[game.player.gun.ammo] = game.player.ammo[game.player.gun.ammo] - 1

        const angle = getAngle(game.player.location, game.mouse)

        game.player.gun.sound.clonePlay()
        for (let i = 0; i < game.player.gun.bullets; i++) {
            game.bullets.push(new Bullet(game.player.location.x, game.player.location.y, 10, 10, angle, 1, game.bulletId, game.player.gun.inaccuracy, game.player.gun.damage, game.player.gun.range, game))
            game.bulletId += 1
        }

        game.lastShot = game.getTicks()
    } else {
        game.noAmmoSound.clonePlay()
        game.lastShot = game.getTicks()
    }
}

export {
    shooting
}

