import { Coordinates } from "./angles"

/**
 * - `x1`, `y1` top-left corner
 * - `x2`, `y2` button-right corner
 */
interface CollisionRect {
    x1: number
    y1: number
    x2: number
    y2: number
}

/**
 * `x` and `y` have to be the **center** of the rectangle
 */
function xywdToCollisionRect(x: number, y: number, width: number, height: number) {
    return <CollisionRect>{
        x1: x - width / 2,
        y1: y - height / 2,
        x2: x + width / 2,
        y2: y + height / 2
    }
}

function xywdToCollisionRectTopLeft(x: number, y: number, width: number, height: number) {
    return <CollisionRect>{
        x1: x,
        y1: y,
        x2: x + width,
        y2: y + height
    }
}

function contains(a: CollisionRect, b: CollisionRect) {
    return !(
        b.x1 < a.x1 ||
        b.y1 < a.y1 ||
        b.x2 > a.x2 ||
        b.y2 > a.y2
    )
}

function pointTouches(a: CollisionRect, b: Coordinates) {
    return (b.x > a.x1 && b.x < a.x2 && b.y > a.y1 && b.y < a.y2)
}

function overlaps(a: CollisionRect, b: CollisionRect) {
    // no horizontal overlap
    if (a.x1 >= b.x2 || b.x1 >= a.x2) return false

    // no vertical overlap
    if (a.y1 >= b.y2 || b.y1 >= a.y2) return false

    return true
}

function touches(a: CollisionRect, b: CollisionRect) {
    // has horizontal gap
    if (a.x1 > b.x2 || b.x1 > a.x2) return false

    // has vertical gap
    if (a.y1 > b.y2 || b.y1 > a.y2) return false

    return true
}

export {
    contains,
    pointTouches,
    overlaps,
    touches,
    CollisionRect,
    xywdToCollisionRect,
    xywdToCollisionRectTopLeft
}

