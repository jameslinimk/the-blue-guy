class CustomAnimation {
    private _on: boolean
    set on(value: boolean) {
        if (value === this._on) return

        if (value) {
            this.frame = 0
            this._on = true
            this.onStart()
            return
        }

        this._on = false
        this.onEnd()
    }
    get on() { return this._on }
    frame: number
    length: number
    distance: number
    onFrame: (movePerFrame: number) => boolean | void
    onStart: () => void
    onEnd: () => void

    constructor(length: number, distance: number, onFrame: (movePerFrame: number) => boolean | void, onStart = () => { }, onEnd = () => { }) {
        this._on = false
        this.frame = 0

        this.distance = distance
        this.length = length
        this.onFrame = onFrame
        this.onStart = onStart
        this.onEnd = onEnd
    }

    update(dt: number) {
        if (!this._on) return

        const movePerFrame = ((this.distance) / (this.length)) * dt
        if (this.onFrame(movePerFrame) === false) {
            this._on = false
            this.onEnd()
            return
        }
        this.frame += 1 * dt

        if (this.frame >= this.length) {
            this._on = false
            this.onEnd()
        }
    }
}

export {
    CustomAnimation
}

