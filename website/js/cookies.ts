import { Coordinates } from "./angles"
import { GameScene } from "./scenes/game"
import { Layout } from "./scenes/game/dungeonGenerator"
import { AmmoInventory, GunInventory } from "./scenes/game/player"

interface PlayerData {
    coins: number
    ammo: AmmoInventory,
    guns: GunInventory
}

interface Save {
    layout: Layout
    location: Coordinates
    playerData: PlayerData
    saveTime: number
}

class Cookie {
    /**
     * Checks wether or not the browser supports localStorage
     * @returns wether or not the browser supports localStorage
     */
    static check() {
        return typeof window.localStorage !== "undefined"
    }

    static get(name: string) {
        return window.localStorage.getItem(name)
    }

    static set(name: string, value: string) {
        window.localStorage.setItem(name, value)
    }

    static remove(name: string) {
        window.localStorage.removeItem(name)
    }

    static save(game: GameScene) {
        if (game.dungeonManager.currentRoomObject === null) return

        Cookie.set("save", JSON.stringify(<Save>{
            layout: game.dungeonManager.layout,
            location: game.dungeonManager.currentRoom,
            playerData: {
                coins: game.player.coins,
                ammo: game.player.ammo,
                guns: game.player.gunInventory
            },
            saveTime: Date.now()
        }))
    }

    // TODO Add loading feature
}

export {
    Cookie
}

