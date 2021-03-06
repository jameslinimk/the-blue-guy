import { config } from "../../config"
import { Cookie } from "../../cookies"
import { Events, KeyDownEvent } from "../../game"
import { GameScene } from "../game"
import { Direction, Room, spaceCharacter } from "./dungeonGenerator"

class Map {
    game: GameScene
    // show: boolean
    private _mapNavigator: boolean
    get mapNavigator() { return this._mapNavigator }
    set mapNavigator(value: boolean) {
        if (this._mapNavigator === value) return
        this._mapNavigator = value
        this.game.paused = value
    }

    constructor(game: GameScene) {
        this.game = game
        // this.show = false
        this._mapNavigator = false
    }

    private drawRoom(room: Room, ctx: CanvasRenderingContext2D) {
        if (this.game.dungeonManager.layout === null) return

        ctx.fillStyle = (room.type === "chest") ? "#F39503" : (room.type === "shop") ? "#00FF00" : (room.type === "end") ? "#FFFF00" : "#FF0000"
        const roomSize = 32
        const roomMargin = 10
        const roomXOffset = (room.x - ((this.game.dungeonManager.layout.length - 1) / 2))
        const roomYOffset = (((this.game.dungeonManager.layout.length - 1) / 2) - room.y)
        const roomX = config.width / 2 + (roomXOffset * roomSize) + (roomXOffset * roomMargin)
        const roomY = config.height / 2 - (roomYOffset * roomSize) - (roomYOffset * roomMargin)

        ctx.fillRect(roomX - roomSize / 2,
            roomY - roomSize / 2,
            roomSize, roomSize)

        if (this.game.dungeonManager.currentRoom.x === room.x && this.game.dungeonManager.currentRoom.y === room.y) {
            ctx.shadowBlur = 4
            ctx.shadowColor = "#FFFFFF"
            ctx.strokeStyle = "#000000"
            ctx.lineWidth = 10
            ctx.beginPath()
            ctx.arc(roomX, roomY, 2, 0, 2 * Math.PI)
            ctx.stroke()
        }
        ctx.shadowBlur = 0

        // Tunnels
        ctx.fillStyle = "#00FFFF"
        const tunnelSize = roomMargin
        room.direction.forEach(direction => {
            switch (direction) {
                case Direction.up:
                    ctx.fillRect(roomX - tunnelSize, roomY - roomSize / 2 - tunnelSize, tunnelSize * 2, tunnelSize)
                    break
                case Direction.down:
                    ctx.fillRect(roomX - tunnelSize, roomY + roomSize / 2, tunnelSize * 2, tunnelSize)
                    break
                case Direction.left:
                    ctx.fillRect(roomX - roomSize / 2 - tunnelSize, roomY - tunnelSize / 2, tunnelSize, tunnelSize * 2)
                    break
                case Direction.right:
                    ctx.fillRect(roomX + roomSize / 2, roomY - tunnelSize / 2, tunnelSize, tunnelSize * 2)
                    break
            }
        })
    }

    private drawMap(ctx: CanvasRenderingContext2D) {
        if (this.game.dungeonManager.layout === null) return

        for (let y = 0; y < this.game.dungeonManager.layout.length; y++) {
            for (let x = 0; x < this.game.dungeonManager.layout[y].length; x++) {
                const room = this.game.dungeonManager.layout[y][x]
                if ((<any>room)?.discovered === false) continue
                if (room !== "0") {
                    this.drawRoom({ ...room, x: x, y: y }, ctx)
                }
            }
        }
    }

    draw() {
        if (this.game.dungeonManager.layout === null) return

        if (this.mapNavigator) {
            this.game.ctx.fillStyle = "#000000"
            this.game.ctx.fillRect(0, 0, config.width, config.height)
            this.drawMap(this.game.ctx)
        }
    }

    processInput(events: Events) {
        if (this.game.dungeonManager.layout === null || this.game.dungeonManager.currentRoom === null) return
        if ((<Room>this.game.dungeonManager.currentRoomObject)?.type === "dungeon" && !(<Room>this.game.dungeonManager.currentRoomObject)?.dungeonRounds?.cleared) return
        if (!this.mapNavigator) return

        let hspd = 0
        let vspd = 0
        const currentRoom = <Room>this.game.dungeonManager.currentRoomObject
        events.filter(event => event.eventType === "KeyDown").forEach(event => {
            event = <KeyDownEvent>event
            switch (event.key.toLowerCase()) {
                case "w":
                    if (!currentRoom.direction.includes(Direction.up)) break
                    vspd -= 1
                    break
                case "s":
                    if (!currentRoom.direction.includes(Direction.down)) break
                    vspd += 1
                    break
                case "a":
                    if (!currentRoom.direction.includes(Direction.left)) break
                    hspd -= 1
                    break
                case "d":
                    if (!currentRoom.direction.includes(Direction.right)) break
                    hspd += 1
                    break
            }
        })
        if (this.game.dungeonManager.layout[this.game.dungeonManager.currentRoom.y + vspd][this.game.dungeonManager.currentRoom.x] === spaceCharacter) vspd = 0
        if (this.game.dungeonManager.layout[this.game.dungeonManager.currentRoom.y][this.game.dungeonManager.currentRoom.x + hspd] === spaceCharacter) hspd = 0
        if (hspd === 0 && vspd === 0) return

        const room = (<Room>this.game.dungeonManager.layout[this.game.dungeonManager.currentRoom.y + vspd]?.[this.game.dungeonManager.currentRoom.x + hspd])
        if (room?.discovered === false) (<Room>this.game.dungeonManager.layout[this.game.dungeonManager.currentRoom.y + vspd][this.game.dungeonManager.currentRoom.x + hspd]).discovered = true

        if (room?.type === "dungeon" && room?.dungeonRounds?.cleared === false) {
            Cookie.save(this.game)
            setTimeout(() => {
                (<Room>this.game.dungeonManager.layout[this.game.dungeonManager.currentRoom.y][this.game.dungeonManager.currentRoom.x]).dungeonRounds.active = true
                this.game.player.location = this.game.player.spawnLocation
                this.mapNavigator = false
            }, 1000)
        }

        // Reset game
        this.game.bullets = []
        this.game.balls = []
        this.game.rays = []

        this.game.player.location = this.game.player.spawnLocation
        this.game.dungeonManager.currentRoom.x += hspd
        this.game.dungeonManager.currentRoom.y += vspd
    }
}

export {
    Map
}

