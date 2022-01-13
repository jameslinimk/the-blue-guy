class CustomImage {
    image: HTMLImageElement

    constructor(source: string) {
        this.image = document.createElement("img")
        this.image.src = source
        this.image.style.display = "none"
        document.body.appendChild(this.image)
    }
}

export {
    CustomImage
}

