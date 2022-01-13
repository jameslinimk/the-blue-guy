interface Coordinates {
    x: number
    y: number
}

/**
 * Returns angle in radians from origin to destination. This is the angle that you would get if the points were on a cartesian grid. Arguments of (0,0), (1, -1) return .25 rather than 1.75pi(315 deg)
 */
function getAngle(origin: Coordinates, destination: Coordinates) {
    const xDist = destination.x - origin.x
    const yDist = destination.y - origin.y
    return Math.atan2(yDist, xDist) % (2 * Math.PI)
}

/**
 * Returns Coordinates of projected distance at angle
 */
function project(pos: Coordinates, angle: number, distance: number) {
    return <Coordinates>{
        x: pos.x + (Math.cos(angle) * distance),
        y: pos.y + (Math.sin(angle) * distance)
    }
}

/**
 * Returns distance between 2 Coordinates
 */
function distance(origin: Coordinates, destination: Coordinates) {
    return Math.sqrt((origin.x - destination.x) * (origin.x - destination.x) + (origin.y - destination.y) * (origin.y - destination.y))
}

export {
    Coordinates,
    getAngle,
    project,
    distance
}

