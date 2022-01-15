import { Coordinates } from "../../angles"
import { wait } from "../../game"
import { GameScene, random } from "../game"
import { pistol, the360 } from "./guns"
import { ShopRoom } from "./rooms/shop"
import { RoundManager } from "./roundManager"

const spaceCharacter = "0"
enum Direction {
    "up", "down", "left", "right"
}
type RoomType = "dungeon" | "shop" | "chest" | "end"
interface Room {
    type: RoomType
    dungeonRounds?: RoundManager
    shopRoom?: ShopRoom
    x: number
    y: number
    direction: Direction[]
    discovered: boolean
}
type Layout = (Room | "0")[][]

function generateRoom(layout: Layout, lastRoom: Coordinates, game: GameScene) {
    let returnRoom: Room = {
        x: lastRoom.x,
        y: lastRoom.y,
        direction: [],
        type: "dungeon",
        discovered: false
    }
    let found = false
    while (!found) {
        returnRoom = {
            x: lastRoom.x,
            y: lastRoom.y,
            direction: [],
            type: "dungeon",
            discovered: false
        }

        if (layout[returnRoom.y + 1]?.[returnRoom.x] !== spaceCharacter
            && layout[returnRoom.y - 1]?.[returnRoom.x] !== spaceCharacter
            && layout[returnRoom.y]?.[returnRoom.x + 1] !== spaceCharacter
            && layout[returnRoom.y]?.[returnRoom.x - 1] !== spaceCharacter) {
            throw new Error("Surrounded")
        }

        switch (Math.round(random(0, 3))) {
            case 0:
                returnRoom.y = lastRoom.y + 1
                returnRoom.direction = [Direction.down]
                break
            case 1:
                returnRoom.y = lastRoom.y - 1
                returnRoom.direction = [Direction.up]
                break
            case 2:
                returnRoom.x = lastRoom.x + 1
                returnRoom.direction = [Direction.right]
                break
            case 3:
                returnRoom.x = lastRoom.x - 1
                returnRoom.direction = [Direction.left]
                break
        }

        // Check if next move will surround
        const copyLayout = JSON.parse(JSON.stringify(layout))
        if (!copyLayout[returnRoom.y] || !copyLayout[returnRoom.y][returnRoom.x]) {
            continue
        }
        copyLayout[returnRoom.y][returnRoom.x] = parseChar(returnRoom.direction)
        if (copyLayout[returnRoom.y + 1]?.[returnRoom.x] !== spaceCharacter
            && copyLayout[returnRoom.y - 1]?.[returnRoom.x] !== spaceCharacter
            && copyLayout[returnRoom.y]?.[returnRoom.x + 1] !== spaceCharacter
            && copyLayout[returnRoom.y]?.[returnRoom.x - 1] !== spaceCharacter) {
            continue
        }

        if (layout[returnRoom.y]?.[returnRoom.x] === spaceCharacter) {
            found = true
            continue
        }
    }
    return returnRoom
}

function printLayout(layout: Layout) {
    console.log(
        (<any>layout).map(row => row.map(room => room =
            (room !== spaceCharacter) ?
                `\u001b[${(room.type === "shop") ? 32 : (room.type === "chest") ? 31 : 93}m${parseChar(room.direction)}\u001b[0m` :
                `\u001b[91m${room}|${room}\u001b[0m`
        ).join(" ")).join("\n")
    )
}

function parseChar(_direction: Direction[] | string) {
    if (typeof _direction === "string" || _direction.length === 1) {
        const direction = _direction[0]
        return ((direction === Direction.up) ? "^" : (direction === Direction.down) ? "_" : (direction === Direction.left) ? "<" : (direction === Direction.right) ? ">" : direction) + "|0"
    }
    return _direction.map(direction => (direction === Direction.up) ? "^" : (direction === Direction.down) ? "_" : (direction === Direction.left) ? "<" : (direction === Direction.right) ? ">" : direction).join("|")
}

function generate(game: GameScene, options: { layoutSize: number, rooms: number } = { layoutSize: 7, rooms: 20 }, startPoint?: Coordinates, preLayout: Layout = [], print = false) {
    return new Promise(async (resolve, reject) => {
        const layoutSize = options.layoutSize
        const layout: Layout = preLayout
        const rooms = options.rooms
        let lastRoom = (startPoint) ? startPoint : {
            x: (layoutSize - 1) / 2,
            y: (layoutSize - 1) / 2
        }
        for (let i = 0; i < layoutSize; i++) layout[i] = Array(layoutSize).fill(spaceCharacter)

        for (let i = 0; i < rooms; i++) {
            let newRoom: Room = null
            try {
                newRoom = generateRoom(layout, lastRoom, game)
            } catch {
                reject(layout)
            } finally {
                if (newRoom !== null) {
                    const below = <Room>layout[lastRoom.y + 1]?.[lastRoom.x]
                    const above = <Room>layout[lastRoom.y - 1]?.[lastRoom.x]
                    const left = <Room>layout[lastRoom.y]?.[lastRoom.x - 1]
                    const right = <Room>layout[lastRoom.y]?.[lastRoom.x + 1]
                    if (lastRoom.y === below?.y && lastRoom.x === below?.x) {
                        newRoom.direction.push(Direction.down)
                    } else if (lastRoom.y === above?.y && lastRoom.x === above?.x) {
                        newRoom.direction.push(Direction.up)
                    } else if (lastRoom.y === left?.y && lastRoom.x === left?.x) {
                        newRoom.direction.push(Direction.left)
                    } else if (lastRoom.y === right?.y && lastRoom.x === right?.x) {
                        newRoom.direction.push(Direction.right)
                    }

                    layout[lastRoom.y][lastRoom.x] = newRoom
                    if (i === rooms - 1) {
                        // TODO Backtracking for end room
                        const below = <Room>layout[newRoom.y + 1]?.[newRoom.x]
                        const above = <Room>layout[newRoom.y - 1]?.[newRoom.x]
                        const left = <Room>layout[newRoom.y]?.[newRoom.x - 1]
                        const right = <Room>layout[newRoom.y]?.[newRoom.x + 1]
                        const direction = []
                        if (newRoom.y === below?.y && newRoom.x === below?.x) {
                            direction.push(Direction.down)
                        } else if (newRoom.y === above?.y && newRoom.x === above?.x) {
                            direction.push(Direction.up)
                        } else if (newRoom.y === left?.y && newRoom.x === left?.x) {
                            direction.push(Direction.left)
                        } else if (newRoom.y === right?.y && newRoom.x === right?.x) {
                            direction.push(Direction.right)
                        }

                        layout[newRoom.y][newRoom.x] = {
                            type: "end",
                            x: newRoom.x,
                            y: newRoom.y,
                            direction: direction,
                            discovered: false
                        }
                    } else {
                        layout[newRoom.y][newRoom.x] = spaceCharacter
                    }
                    lastRoom = newRoom
                    if (print) {
                        console.clear()
                        printLayout(layout)
                        await wait(100)
                    }
                } else {
                    reject(layout)
                }
            }
        }
        resolve(layout)
    })
}

function check(game: GameScene, options: { layoutSize: number, rooms: number } = { layoutSize: 7, rooms: 20 }, print = false, startPoint?: Coordinates, preLayout: Layout = []) {
    return new Promise((resolve, _) => {
        generate(game, options, startPoint, preLayout, print).catch(() => check(game, options, print, startPoint, preLayout)).then(_layout => {
            if (_layout) {
                let layout = <Layout>_layout
                for (let y = 0; y < layout.length; y++) {
                    for (let x = 0; x < layout[y].length; x++) {
                        const room = layout[y][x]
                        if (room !== "0") {
                            layout[y][x] = { ...room, x: x, y: y }
                            break
                        }
                    }
                }
                resolve(layout)
            }
        })
    })
}

function appendSpecial(layout: Layout, roomType: RoomType) {
    let availableRooms: Room[] = []
    for (let y = 0; y < layout.length; y++) {
        for (let x = 0; x < layout[y].length; x++) {
            const room = layout[y][x]
            if (room !== "0" &&
                (
                    layout[y + 1]?.[x] === spaceCharacter ||
                    layout[y - 1]?.[x] === spaceCharacter ||
                    layout[y]?.[x + 1] === spaceCharacter ||
                    layout[y]?.[x - 1] === spaceCharacter
                )) {
                availableRooms.push({ ...room, x: x, y: y })
                continue
            }
        }
    }
    if (availableRooms.length === 0) return
    const availableDirections = []
    const room = availableRooms[Math.round(random(0, availableRooms.length - 1))]
    if (layout[room.y]?.[room.x - 1] === spaceCharacter) availableDirections.push(Direction.left)
    if (layout[room.y]?.[room.x + 1] === spaceCharacter) availableDirections.push(Direction.right)
    if (layout[room.y - 1]?.[room.x] === spaceCharacter) availableDirections.push(Direction.up)
    if (layout[room.y + 1]?.[room.x] === spaceCharacter) availableDirections.push(Direction.down)
    const direction = availableDirections[Math.round(random(0, availableDirections.length - 1))]

    layout[room.y][room.x] = { ...room, direction: [...room.direction, direction] }
    let specialRoom: Room = { ...room, discovered: false, direction: [], type: roomType }

    switch (direction) {
        case Direction.up:
            specialRoom.y = specialRoom.y - 1
            specialRoom.direction = [Direction.down]
            break
        case Direction.down:
            specialRoom.y = specialRoom.y + 1
            specialRoom.direction = [Direction.up]
            break
        case Direction.left:
            specialRoom.x = specialRoom.x - 1
            specialRoom.direction = [Direction.right]
            break
        case Direction.right:
            specialRoom.x = specialRoom.x + 1
            specialRoom.direction = [Direction.left]
            break
    }
    layout[specialRoom.y][specialRoom.x] = specialRoom
}

function fullGenerate(game: GameScene, options: { layoutSize: number, rooms: number } = { layoutSize: 7, rooms: 20 }, specialRooms: { type: RoomType, count: number }[] = [], print = false) {
    return new Promise<Layout>(async (resolve, _) => {
        check(game, options, print).then(_layout => {
            _layout[((<Layout>_layout).length - 1) / 2][((<Layout>_layout).length - 1) / 2].discovered = true // Set middle as discovered
            const layout: Layout = <Layout>_layout
            specialRooms.forEach(option => {
                for (let i = 0; i < option.count - 1; i++) {
                    appendSpecial(layout, option.type)
                }
            })
            for (let y = 0; y < layout.length; y++) {
                for (let x = 0; x < layout[y].length; x++) {
                    const room = layout[y][x]
                    if (room !== "0") {
                        switch (room.type) {
                            case "dungeon":
                                (<Room>layout[y][x]).dungeonRounds = new RoundManager(game)
                                break
                            case "shop":
                                (<Room>layout[y][x]).shopRoom = new ShopRoom([
                                    { item: { type: the360, amount: 1 }, cost: 5 },
                                    { item: { type: pistol, amount: 1 }, cost: 5 }
                                ], game)
                                break
                        }
                    }
                }
            }
            resolve(layout)
        })
    })
}

export {
    fullGenerate,
    printLayout,
    Direction,
    RoomType,
    spaceCharacter,
    Room,
    Layout
}

