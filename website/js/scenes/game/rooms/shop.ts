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

    constructor(items: ShopItem[], game: GameScene) {
        this.items = items
        this.game = game
    }

    update() {

    }

    processInput(events: Events) {
        events.filter(event => event.eventType === "KeyUp" && ((<KeyUpEvent>event).key === "e" || (<KeyUpEvent>event).key === "E")).forEach(event => {

        })
    }

    draw() {
        let totalWidth = 0
        for (let i = 0; i < this.items.length; i++) totalWidth += 50 * i + 10 * i

        for (let i = 0; i < this.items.length; i++) {
            /* ---------------------------- Setting the image --------------------------- */
            let image: HTMLImageElement
            const item = this.items[i]
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

            /* ------------------------------- Background ------------------------------- */
            this.game.ctx.fillStyle = "#049301"
            this.game.ctx.fillRect((config.width / 2 + 50 * i + 10 * i) - totalWidth / 2, 200, 50, 50)
            // ctx.drawImage(this.game.frameImage.image, (config.width / 2 + 50 * i + 10 * i) - totalWidth / 2 + 16, 200 - 16, 32, 32)
            this.game.ctx.drawImage(image, (config.width / 2 + 50 * i + 10 * i) - totalWidth / 2, 200, 32, 32)
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

