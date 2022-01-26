import { config } from "../../../config"
import { Events, KeyUpEvent } from "../../../game"
import { GameScene } from "../../game"
import { Pickup } from "../crate"
import { Ammo, Gun } from "../guns"

interface ShopItem {
    item: Pickup
    cost: number
}

class ShopRoom {
    items: ShopItem[]
    game: GameScene
    hoveredItem?: number
    totalWidth: number
    itemBoxLocations: number[]

    constructor(items: ShopItem[], game: GameScene) {
        this.items = items
        this.game = game

        this.totalWidth = -10
        for (let i = 0; i < this.items.length; i++) this.totalWidth += 50 + 10
        this.itemBoxLocations = []
        for (let i = 0; i < this.items.length; i++) this.itemBoxLocations[i] = (config.width / 2 + 50 * i + 10 * i) - this.totalWidth / 2
    }

    update() {
        // TODO Hovered item
    }

    processInput(events: Events) {
        events.filter(event => event.eventType === "KeyUp" && ((<KeyUpEvent>event).key === "e" || (<KeyUpEvent>event).key === "E")).forEach(event => {

        })
    }

    private getShopImage(index: number) {
        /* ---------------------------- Setting the image --------------------------- */
        let image: HTMLImageElement
        const item = this.items[index]
        if (item.item.type === "health") {
            image = this.game.healthImage.image
        } else if (item.item.type === "coins") {
            image = this.game.coinsImage.image
        } else if (typeof (<any>item.item.type).damage !== "undefined") {
            image = (<Gun>item.item.type).image.image
        } else {
            switch (<Ammo>item.item.type) {
                case Ammo.small:
                    image = this.game.smallAmmoImage.image
                    break
                case Ammo.medium:
                    image = this.game.mediumAmmoImage.image
                    break
                case Ammo.large:
                    image = this.game.largeAmmoImage.image
                    break
                case Ammo.shell:
                    image = this.game.shellsAmmoImage.image
                    break
            }
        }
        return image
    }

    draw() {
        let totalWidth = -10
        for (let i = 0; i < this.items.length; i++) totalWidth += 50 + 10
        console.log(`🎁 | totalWidth`, totalWidth)

        for (let i = 0; i < this.items.length; i++) {
            /* ---------------------------- Setting the image --------------------------- */
            const image = this.getShopImage(i)

            /* ------------------------------- Background ------------------------------- */
            this.game.ctx.fillStyle = "#049301"
            this.game.ctx.shadowBlur = 10
            this.game.ctx.shadowColor = "#000000"
            this.game.ctx.fillRect(this.itemBoxLocations[i], 200, 50, 50)
            this.game.ctx.shadowColor = "#FFFFFF"
            this.game.ctx.drawImage(image, this.itemBoxLocations[i] + (50 - 32) / 2, 200 + (50 - 32) / 2, 32, 32)
            this.game.ctx.shadowColor = "#000000"
            this.game.ctx.fillStyle = "#FFFFFF"
            this.game.ctx.font = "20px serif"
            this.game.ctx.fillText(`$${this.items[i].cost}`, this.itemBoxLocations[i] + (50 - this.game.ctx.measureText(`$${this.items[i].cost}`).width) / 2, 190)
            this.game.ctx.font = "15px serif"
            this.game.ctx.fillText(`x${this.items[i].item.amount}`, this.itemBoxLocations[i], 211)
        }

        /* -------------------------------- Shop guy -------------------------------- */
        this.game.ctx.drawImage(this.game.shopGuyImage.image, (config.width / 2 + 50 * this.items.length + 10 * this.items.length) - totalWidth / 2 + 32, 200 - 32)

        /* ------------------------------ Target dummy ------------------------------ */
        this.game.ctx.drawImage(this.game.dummyImage.image, config.width - 100, config.height - 100)
    }
}

export {
    ShopRoom,
    ShopItem
}

