import { Coordinates } from "../../angles"
import { touches, xywdToCollisionRect } from "../../collision"
import { config } from "../../config"
import { CustomImage } from "../../image"
import { GameScene, random } from "../game"
import { Ammo, Gun } from "./guns"

function randomEnum<T>(anEnum: T): T[keyof T] {
    const enumValues = Object.keys(anEnum)
        .map(n => Number.parseInt(n))
        .filter(n => !Number.isNaN(n)) as unknown as T[keyof T][]
    const randomIndex = Math.floor(Math.random() * enumValues.length)
    const randomEnumValue = enumValues[randomIndex]
    return randomEnumValue
}

interface Pickup {
    type: Ammo | "health" | "coins" | Gun
    amount: number
}

class Crate {
    pickups: Pickup[]
    location: Coordinates
    id: number
    game: GameScene
    image: CustomImage

    constructor(x: number, y: number, pickups: Pickup[], id: number, game: GameScene, image: CustomImage) {
        this.location = { x: x, y: y }
        this.pickups = pickups
        this.id = id
        this.game = game
        this.image = image
    }

    check() {
        if (this.game.dungeonManager.currentRoomObject !== "0" && this.game.dungeonManager.currentRoomObject !== null && touches(xywdToCollisionRect(this.game.player.location.x, this.game.player.location.y, this.game.player.width, this.game.player.height), xywdToCollisionRect(this.location.x, this.location.y, 64, 64))) {
            this.game.dungeonManager.currentRoomObject.dungeonRounds.crates = this.game.dungeonManager.currentRoomObject.dungeonRounds.crates.filter(crate => crate.id != this.id)
            this.pickups.forEach(pickup => {
                this.game.cratePickupSound.clonePlay()
                const anyPickup = <any>pickup

                if (pickup.type === "health") {
                    this.game.player.lives += pickup.amount
                } else if (pickup.type === "coins") {
                    this.game.player.coins += pickup.amount
                } else if (typeof (<any>pickup.type).damage !== "undefined") {
                    let highestKey = 0
                    Object.keys(this.game.player.gunInventory).forEach(key => { if (parseInt(key) > highestKey) highestKey = parseInt(key) })
                    this.game.player.gunInventory[highestKey + 1] = anyPickup.type
                } else {
                    this.game.player.ammo[anyPickup.type] += anyPickup.amount
                }
            })
        }
    }

    draw() {
        this.game.ctx.drawImage(this.image.image, Math.round(this.location.x - this.image.image.width / 2), Math.round(this.location.y - this.image.image.width / 2))
    }

    /**
     * Only for **HEALTH** or **AMMO**
     */
    static randomCrate(id: number, game: GameScene) {
        const type = (Math.random() < 0.5) ? "health" : randomEnum(Ammo)

        return new this(random(0 + 32, config.width - 32), random(0 + 32, config.height - 32), [{
            type: type,
            amount: (type === "health") ? 1 : Math.round(random(10, 100))
        }], id, game, game.crateImage)
    }

    static coin(x: number, y: number, id: number, game: GameScene, amount = 1) {
        return new this(x, y, [{ type: "coins", amount: amount }], id, game, game.coinsImage)
    }
}

export {
    randomEnum,
    Crate,
    Pickup
}

