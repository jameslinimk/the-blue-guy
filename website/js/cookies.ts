class Cookie {
    static get(name: string) {
        name = `${encodeURIComponent(name)}=`

        const startIndex = document.cookie.indexOf(name)
        if (!(startIndex > -1)) return null
        let endIndex = document.cookie.indexOf(';', startIndex)
        if (!(endIndex > -1)) endIndex = document.cookie.length
        return decodeURIComponent(document.cookie.substring(startIndex + name.length, endIndex))
    }

    static set(name: string, value: string | number | boolean, expires?: Date) {
        if (typeof value !== "string") value = value.toString()
        let cookieText = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`
        if (expires) cookieText += `; expires=${expires.toUTCString()}`
        document.cookie = cookieText
    }

    static remove(name: string) {
        this.set(name, "", new Date(0))
    }
}

export {
    Cookie
}

