import { Coordinates } from "../../../angles"

interface Enemy {
    location: Coordinates
    maxHealth: number
    health: number
    id: number
    width: number
    height: number
    update(dt: number): void
    hit(damage: number): boolean
    draw(ctx: CanvasRenderingContext2D): void
}

type EnemyType = "ranged" | "ball" | "spiral"

export {
    Enemy,
    EnemyType
}

