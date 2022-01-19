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

document.ontouchstart = (event) => {
    eventQueue.push(<TouchStartEvent>{
        eventType: "TouchStart",
        raw: event
    })
}

document.ontouchmove = (event) => {
    eventQueue.push(<TouchStartEvent>{
        eventType: "TouchMove",
        raw: event
    })
}

document.ontouchend = (event) => {
    eventQueue.push(<TouchStartEvent>{
        eventType: "TouchEnd",
        raw: event
    })
}

document.ontouchcancel = (event) => {
    eventQueue.push(<TouchStartEvent>{
        eventType: "TouchCancel",
        raw: event
    })
}

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
type Events = (KeyDownEvent | KeyUpEvent | MouseMoveEvent | MouseDownEvent | MouseUpEvent | TouchStartEvent | TouchMoveEvent | TouchEndEvent | TouchCancelEvent)[]
type EventType = "KeyDown" | "KeyUp" |
    "MouseMove" | "MouseDown" | "MouseUp" |
    "TouchStart" | "TouchMove" | "TouchEnd" | "TouchCancel"
interface Event {
    eventType: EventType,
    raw: KeyboardEvent | MouseEvent | TouchEvent
}

interface TouchStartEvent extends Event {
    raw: TouchEvent
}

interface TouchMoveEvent extends Event {
    raw: TouchEvent
}

interface TouchEndEvent extends Event {
    raw: TouchEvent
}

interface TouchCancelEvent extends Event {
    raw: TouchEvent
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
 * Detect weather the userAgent is mobile device or not. (This is not 100% accurate so use with caution)
 * @returns is userAgent mobile
 */
function detectMobile() {
    const a = (navigator.userAgent || navigator.vendor || (<any>window).opera)
    if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) {
        return true
    }
    return false
}

/**
 * Start the game
 */
async function play(startingScene: BaseScene, fps: number, canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d")
    ctx.imageSmoothingEnabled = false

    let t = performance.now()
    let timeLastFrame = t
    let scene = startingScene
    scene.ctx = ctx

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
        startingScene.draw()

        scene = startingScene.next // Set next scene
        if (!scene.ctx) scene.ctx = ctx

        await wait(1000 / fps)
    }
}

class BaseScene {
    next?: BaseScene
    ctx?: CanvasRenderingContext2D

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
    draw() {
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
    wait,
    detectMobile
}

