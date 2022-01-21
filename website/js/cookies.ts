import { Coordinates } from "./angles"
import { GameScene } from "./scenes/game"
import { Direction, Room, RoomType } from "./scenes/game/dungeonGenerator"
import { AmmoInventory, GunInventory } from "./scenes/game/player"
import { ShopItem, ShopRoom } from "./scenes/game/rooms/shop"
import { Round, RoundManager } from "./scenes/game/roundManager"

interface PlayerData {
    coins: number
    ammo: AmmoInventory,
    guns: GunInventory
}

interface Save {
    layout: SaveLayout
    location: Coordinates
    playerData: PlayerData
    saveTime: number
}

type SaveLayout = (SaveRoom | "0")[][]

// Saves don't work mid round
interface SaveRoundManager {
    rounds: Round[]
}

interface SaveShopRoom {
    items: ShopItem[]
}

interface SaveRoom {
    type: RoomType
    dungeonRounds?: SaveRoundManager
    shopRoom?: SaveShopRoom
    x: number
    y: number
    direction: Direction[]
    discovered: boolean
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

    private static dungeonRoundsToSave(roundManager?: RoundManager) {
        if (!roundManager) return null
        return <SaveRoundManager>{
            rounds: roundManager.rounds
        }
    }

    private static shopRoomToSave(shopRoom: ShopRoom) {
        if (!shopRoom) return null
        return <SaveShopRoom>{
            items: shopRoom.items
        }
    }

    private static roomToSave(room: Room | "0") {
        return (room === "0") ? room : <SaveRoom>{
            type: room.type,
            dungeonRounds: this.dungeonRoundsToSave(room.dungeonRounds),
            shopRoom: this.shopRoomToSave(room.shopRoom),
            direction: room.direction,
            discovered: room.discovered
        }
    }

    private static clone(items: any[]) {
        return items.map(item => Array.isArray(item) ? this.clone(item) : item)
    }

    static save(game: GameScene) {
        if (game.dungeonManager.currentRoomObject === null) return

        // Deep copy
        const layout = this.clone(game.dungeonManager.layout)
        for (let y = 0; y < layout.length; y++) {
            for (let x = 0; x < layout[y].length; x++) {
                layout[y][x] = this.roomToSave(layout[y][x])
            }
        }

        Cookie.set("save", JSON.stringify(<Save>{
            layout: layout,
            location: game.dungeonManager.currentRoom,
            playerData: {
                coins: game.player.coins,
                ammo: game.player.ammo,
                guns: game.player.gunInventory
            },
            saveTime: Date.now()
        }))
    }

    static load(game: GameScene) {
        if (!this.get("save")) return null

        const _save = JSON.parse(this.get("save"))

        // CHECKING SAVE
        if (Object.keys(_save).sort().join(",") !== ["layout", "location", "playerData", "saveTime"].sort().join(",")) Cookie.remove("save")
        if (Object.keys(_save.playerData).sort().join(",") !== ["coins", "ammo", "guns"].sort().join(",")) Cookie.remove("save")
        const save = <Save>_save

        // Confirming
        const confirm = prompt("A local save was found! Load by typing \"y\", else type anything")
        if (confirm.toLocaleLowerCase() !== "y") return

        // Confirmed
        game.dungeonManager.layout = save.layout.map(row => row.map(room => {
            if (room === "0") return room
            // TODO Work from here. (Check if shop or dungeon then convert and add default values)
        }))
    }
}

export {
    Cookie
}

