// Key keeper

/**
 * Map of every keys `.key` ([docs](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/)) that is pressed
 *  - `true` if key is down, `false` if key is up
 */
type PressedKeys = Map<string, boolean>
const pressedKeys: PressedKeys = new Map()
let eventQueue: Events = []

// EVENTS
// Prevent multiple keydown:
const alreadyFired = new Map<string, boolean>()

document.onkeydown = (event) => {
    if (!alreadyFired.get(event.code)) {
        alreadyFired.set(event.code, true)

        pressedKeys.set(event.key, true)
        eventQueue.push(<KeyDownEvent>{
            eventType: "KeyDown",
            key: event.key,
            raw: event
        })
    }
}

document.onkeyup = (event) => {
    alreadyFired.set(event.code, false)

    pressedKeys.set(event.key, false)
    eventQueue.push(<KeyUpEvent>{
        eventType: "KeyUp",
        key: event.key,
        raw: event
    })
}

document.onmousemove = (event) => {
    eventQueue.push(<MouseMoveEvent>{
        eventType: "MouseMove",
        raw: event
    })
}

document.onmousedown = (event) => {
    pressedKeys.set((event.button === 0) ? "Mouse Left" : (event.button === 1) ? "Mouse Middle" : (event.button === 2) ? "Mouse Right" : "Mouse Unknown", true)

    eventQueue.push(<MouseDownEvent>{
        eventType: "MouseDown",
        raw: event
    })
}

document.onmouseup = (event) => {
    pressedKeys.set((event.button === 0) ? "Mouse Left" : (event.button === 1) ? "Mouse Middle" : (event.button === 2) ? "Mouse Right" : "Mouse Unknown", false)

    eventQueue.push(<MouseUpEvent>{
        eventType: "MouseUp",
        raw: event
    })
}

// Event types
type Events = (KeyDownEvent | KeyUpEvent | MouseMoveEvent | MouseDownEvent | MouseUpEvent)[]
type EventType = "KeyDown" | "KeyUp" |
    "MouseMove" | "MouseDown" | "MouseUp"
interface Event {
    eventType: EventType,
    raw: KeyboardEvent | MouseEvent
}

interface KeyDownEvent extends Event {
    key: string,
    pressed: true,
    raw: KeyboardEvent
}

interface KeyUpEvent extends Event {
    key: string,
    pressed: false
    raw: KeyboardEvent
}

interface MouseMoveEvent extends Event {
    raw: MouseEvent
}

interface MouseDownEvent extends Event {
    pressed: true,
    raw: MouseEvent
}

interface MouseUpEvent extends Event {
    pressed: false,
    raw: MouseEvent
}

/**
 * Resolve promise after `time`
 * @param time ms to wait
 */
const wait = (time: number) => new Promise<void>((resolve, _) => setTimeout(resolve, time))

/**
 * Start the game
 */
async function play(startingScene: BaseScene, fps: number, canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d")
    ctx.imageSmoothingEnabled = false

    let t = performance.now()
    let timeLastFrame = t
    let scene = startingScene
    startingScene.canvas = canvas

    while (scene !== null) {
        // Delta time
        t = performance.now()
        const deltaTime = t - timeLastFrame
        timeLastFrame = t

        // Processing new events
        const events = eventQueue
        eventQueue = [] // Clear event queue

        // Send data to the scene
        startingScene.processInput(events, pressedKeys, deltaTime)
        startingScene.update(deltaTime)
        ctx.clearRect(0, 0, canvas.width, canvas.height) // Clear screen
        startingScene.draw(ctx)

        scene = startingScene.next // Set next scene
        if (!scene.canvas) scene.canvas = canvas

        await wait(1000 / fps)
    }
}

class BaseScene {
    next?: BaseScene

    /**
     * Canvas will be automatically set by the {@link play} function
     */
    canvas?: HTMLCanvasElement

    constructor() {
        this.next = this
    }

    /**
     * Will switch to `nextScene` next frame
     * @param nextScene Scene to switch to
     */
    switchToScene(nextScene: BaseScene) {
        this.next = nextScene
    }

    /**
     * Will terminate the entire game, ending it
     */
    terminateGame() {
        this.next == null
    }

    /**
     * Called first every frame
     * @param events {@link Events} this frame
     * @param pressedKeys {@link PressedKeys} this frame
     */
    processInput(events: Events, pressedKeys: PressedKeys, dt: number) {
        throw new Error("processInput wasn't overridden")
    }

    /**
     * Will be called second after {@link BaseScene.processInput}
     * @param dt Deltatime (time in between each frame) Used to create consistency between difference frame rates
     */
    update(dt: number) {
        throw new Error("update wasn't overridden")
    }

    /**
     * Will be called last after {@link BaseScene.processInput} and {@link BaseScene.update}
     * @param ctx {@link CanvasRenderingContext2D} of game window
     */
    draw(ctx: CanvasRenderingContext2D) {
        throw new Error("draw wasn't overridden")
    }
}

export {
    BaseScene,
    Events,
    EventType,
    Event,
    KeyDownEvent,
    KeyUpEvent,
    PressedKeys,
    MouseDownEvent,
    MouseUpEvent,
    MouseMoveEvent,
    play,
    wait
}

