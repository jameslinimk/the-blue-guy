import { CustomImage } from "../../image"
import { Sound } from "../../sound"

enum Ammo {
    small,
    medium,
    large,
    shell
}

interface Gun {
    damage: number
    inaccuracy: number
    range: number
    bullets: number
    shootDelay: number
    holdable: boolean
    ammo: Ammo
    image: CustomImage
    sound: Sound
}

const pistol = <Gun>{
    damage: 25,
    inaccuracy: 5,
    range: 500,
    bullets: 1,
    shootDelay: 500,
    holdable: false,
    ammo: Ammo.small,
    image: new CustomImage("./images/guns/pistol.png"),
    sound: new Sound("./sounds/laserShoot.wav")
}

const smg = <Gun>{
    damage: 2,
    inaccuracy: 5,
    range: 400,
    bullets: 1,
    shootDelay: 100,
    holdable: true,
    ammo: Ammo.small,
    image: new CustomImage("./images/guns/smg.png"),
    sound: new Sound("./sounds/gun/smg.mp3")
}

const ak47 = <Gun>{
    damage: 25,
    inaccuracy: 7,
    range: 600,
    bullets: 1,
    shootDelay: 200,
    holdable: true,
    ammo: Ammo.medium,
    image: new CustomImage("./images/guns/ak47.png"),
    sound: new Sound("./sounds/gun/ak47.mp3")
}

const sniper = <Gun>{
    damage: 150,
    inaccuracy: 1,
    range: 750,
    bullets: 1,
    shootDelay: 2000,
    holdable: false,
    ammo: Ammo.large,
    image: new CustomImage("./images/guns/sniper.png"),
    sound: new Sound("./sounds/laserShoot.wav")
}

const shotgun = <Gun>{
    damage: 15,
    inaccuracy: 25,
    range: 200,
    bullets: 10,
    shootDelay: 1000,
    holdable: true,
    ammo: Ammo.shell,
    image: new CustomImage("./images/guns/shotgun.png"),
    sound: new Sound("./sounds/laserShoot.wav")
}

const the360 = <Gun>{
    damage: 5,
    inaccuracy: 360,
    range: 100,
    bullets: 50,
    shootDelay: 500,
    holdable: true,
    ammo: Ammo.large,
    image: new CustomImage("./images/guns/the360.png"),
    sound: new Sound("./sounds/laserShoot.wav")
}

const guns = [pistol, smg, ak47, sniper, shotgun, the360]

export {
    Ammo,
    Gun,
    pistol,
    smg,
    ak47,
    sniper,
    shotgun,
    the360,
    guns
}

