(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.distance = exports.project = exports.getAngle = void 0;
/**
 * Returns angle in radians from origin to destination. This is the angle that you would get if the points were on a cartesian grid. Arguments of (0,0), (1, -1) return .25 rather than 1.75pi(315 deg)
 */
function getAngle(origin, destination) {
    const xDist = destination.x - origin.x;
    const yDist = destination.y - origin.y;
    return Math.atan2(yDist, xDist) % (2 * Math.PI);
}
exports.getAngle = getAngle;
/**
 * Returns Coordinates of projected distance at angle
 */
function project(pos, angle, distance) {
    return {
        x: pos.x + (Math.cos(angle) * distance),
        y: pos.y + (Math.sin(angle) * distance)
    };
}
exports.project = project;
/**
 * Returns distance between 2 Coordinates
 */
function distance(origin, destination) {
    return Math.sqrt((origin.x - destination.x) * (origin.x - destination.x) + (origin.y - destination.y) * (origin.y - destination.y));
}
exports.distance = distance;

},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomAnimation = void 0;
class CustomAnimation {
    _on;
    set on(value) {
        if (value === this._on)
            return;
        if (value) {
            this.frame = 0;
            this._on = true;
            this.onStart();
            return;
        }
        this._on = false;
        this.onEnd();
    }
    get on() { return this._on; }
    frame;
    length;
    distance;
    onFrame;
    onStart;
    onEnd;
    constructor(length, distance, onFrame, onStart = () => { }, onEnd = () => { }) {
        this._on = false;
        this.frame = 0;
        this.distance = distance;
        this.length = length;
        this.onFrame = onFrame;
        this.onStart = onStart;
        this.onEnd = onEnd;
    }
    update(dt) {
        if (!this._on)
            return;
        const movePerFrame = ((this.distance) / (this.length)) * dt;
        if (this.onFrame(movePerFrame) === false) {
            this._on = false;
            this.onEnd();
            return;
        }
        this.frame += 1 * dt;
        if (this.frame >= this.length) {
            this._on = false;
            this.onEnd();
        }
    }
}
exports.CustomAnimation = CustomAnimation;

},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.xywdToCollisionRect = exports.touches = exports.overlaps = exports.contains = void 0;
function xywdToCollisionRect(x, y, width, height) {
    return {
        x1: x - width / 2,
        y1: y - height / 2,
        x2: x + width / 2,
        y2: y + height / 2
    };
}
exports.xywdToCollisionRect = xywdToCollisionRect;
function contains(a, b) {
    return !(b.x1 < a.x1 ||
        b.y1 < a.y1 ||
        b.x2 > a.x2 ||
        b.y2 > a.y2);
}
exports.contains = contains;
function overlaps(a, b) {
    // no horizontal overlap
    if (a.x1 >= b.x2 || b.x1 >= a.x2)
        return false;
    // no vertical overlap
    if (a.y1 >= b.y2 || b.y1 >= a.y2)
        return false;
    return true;
}
exports.overlaps = overlaps;
function touches(a, b) {
    // has horizontal gap
    if (a.x1 > b.x2 || b.x1 > a.x2)
        return false;
    // has vertical gap
    if (a.y1 > b.y2 || b.y1 > a.y2)
        return false;
    return true;
}
exports.touches = touches;

},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const config = {
    fps: 60,
    height: 750,
    width: 750,
    fullscreen: true
};
exports.config = config;

},{}],5:[function(require,module,exports){
"use strict";
// Key keeper
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectMobile = exports.wait = exports.play = exports.BaseScene = void 0;
const config_1 = require("./config");
const pressedKeys = new Map();
let eventQueue = [];
// EVENTS
// Prevent multiple keydown:
const alreadyFired = new Map();
document.ontouchstart = (event) => {
    eventQueue.push({
        eventType: "TouchStart",
        raw: event
    });
};
document.ontouchmove = (event) => {
    eventQueue.push({
        eventType: "TouchMove",
        raw: event
    });
};
document.ontouchend = (event) => {
    eventQueue.push({
        eventType: "TouchEnd",
        raw: event
    });
};
document.ontouchcancel = (event) => {
    eventQueue.push({
        eventType: "TouchCancel",
        raw: event
    });
};
document.onkeydown = (event) => {
    if (!alreadyFired.get(event.code)) {
        alreadyFired.set(event.code, true);
        pressedKeys.set(event.key, true);
        eventQueue.push({
            eventType: "KeyDown",
            key: event.key,
            raw: event
        });
    }
};
document.onkeyup = (event) => {
    alreadyFired.set(event.code, false);
    pressedKeys.set(event.key, false);
    eventQueue.push({
        eventType: "KeyUp",
        key: event.key,
        raw: event
    });
};
document.onmousemove = (event) => {
    if (!getMousePos(event))
        return;
    eventQueue.push({
        eventType: "MouseMove",
        raw: event
    });
};
document.onmousedown = (event) => {
    if (!getMousePos(event))
        return;
    pressedKeys.set((event.button === 0) ? "Mouse Left" : (event.button === 1) ? "Mouse Middle" : (event.button === 2) ? "Mouse Right" : "Mouse Unknown", true);
    eventQueue.push({
        eventType: "MouseDown",
        raw: event
    });
};
document.onmouseup = (event) => {
    if (!getMousePos(event))
        return;
    pressedKeys.set((event.button === 0) ? "Mouse Left" : (event.button === 1) ? "Mouse Middle" : (event.button === 2) ? "Mouse Right" : "Mouse Unknown", false);
    eventQueue.push({
        eventType: "MouseUp",
        raw: event
    });
};
/**
 * Resolve promise after `time`
 * @param time ms to wait
 */
const wait = (time) => new Promise((resolve, _) => setTimeout(resolve, time));
exports.wait = wait;
/**
 * Detect weather the userAgent is mobile device or not. (This is not 100% accurate so use with caution)
 * @returns is userAgent mobile
 */
function detectMobile() {
    const a = (navigator.userAgent || navigator.vendor || window.opera);
    if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) {
        return true;
    }
    return false;
}
exports.detectMobile = detectMobile;
function getMousePos(event) {
    const rect = ctx.canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (ctx.canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (ctx.canvas.height / rect.height);
    if (x < 0 || x > config_1.config.width || y < 0 || y > config_1.config.height)
        return;
    return { x: x, y: y };
}
let ctx;
/**
 * Start the game
 */
async function play(startingScene, fps, canvas) {
    ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    let t = performance.now();
    let timeLastFrame = t;
    let scene = startingScene;
    scene.ctx = ctx;
    while (scene !== null) {
        // Delta time
        t = performance.now();
        const deltaTime = t - timeLastFrame;
        timeLastFrame = t;
        // Processing new events
        const events = eventQueue;
        eventQueue = []; // Clear event queue
        // Update mouse position
        events.filter(event => event.eventType === "MouseMove").forEach((event) => {
            event = event;
            scene.mouse = getMousePos(event.raw);
        });
        // Send data to the scene
        startingScene.processInput(events, pressedKeys, deltaTime);
        startingScene.update(deltaTime);
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear screen
        startingScene.draw();
        scene = startingScene.next; // Set next scene
        if (!scene.ctx)
            scene.ctx = ctx;
        await wait(1000 / fps);
    }
}
exports.play = play;
class BaseScene {
    next;
    ctx;
    mouse;
    constructor() {
        this.next = this;
        this.mouse = { x: 0, y: 0 };
    }
    /**
     * Will switch to `nextScene` next frame
     * @param nextScene Scene to switch to
     */
    switchToScene(nextScene) {
        this.next = nextScene;
    }
    /**
     * Will terminate the entire game, ending it
     */
    terminateGame() {
        this.next == null;
    }
    /**
     * Called first every frame
     * @param events {@link Events} this frame
     * @param pressedKeys {@link PressedKeys} this frame
     */
    processInput(events, pressedKeys, dt) {
        throw new Error("processInput wasn't overridden");
    }
    /**
     * Will be called second after {@link BaseScene.processInput}
     * @param dt Deltatime (time in between each frame) Used to create consistency between difference frame rates
     */
    update(dt) {
        throw new Error("update wasn't overridden");
    }
    /**
     * Will be called last after {@link BaseScene.processInput} and {@link BaseScene.update}
     * @param ctx {@link CanvasRenderingContext2D} of game window
     */
    draw() {
        throw new Error("draw wasn't overridden");
    }
}
exports.BaseScene = BaseScene;

},{"./config":4}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomImage = void 0;
class CustomImage {
    image;
    constructor(source) {
        this.image = document.createElement("img");
        this.image.src = source;
        this.image.style.display = "none";
        document.body.appendChild(this.image);
    }
}
exports.CustomImage = CustomImage;

},{}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const game_1 = require("./game");
const game_2 = require("./scenes/game");
const canvas = document.getElementById("game");
if (!canvas)
    throw new Error("Canvas \"game\" not found!");
canvas.width = config_1.config.width;
canvas.height = config_1.config.height;
if (config_1.config.fullscreen) {
    const resizeWindow = () => {
        canvas.style.width = `${Math.min(window.innerWidth, window.innerHeight) - 20}px`;
        canvas.style.height = `${Math.min(window.innerWidth, window.innerHeight) - 20}px`;
    };
    resizeWindow();
    window.onresize = resizeWindow;
}
// if (detectMobile()) alert("A mobile device has been (possibly) detected. This game requires a keyboard to move. Touch to shoot is available, but not recommended.")
(0, game_1.play)(new game_2.GameScene(), config_1.config.fps, canvas);

},{"./config":4,"./game":5,"./scenes/game":8}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clamp = exports.random = exports.GameScene = void 0;
const animations_1 = require("../animations");
const config_1 = require("../config");
const game_1 = require("../game");
const image_1 = require("../image");
const sound_1 = require("../sound");
const map_1 = require("./game/map");
const player_1 = require("./game/player");
const roundManager_1 = require("./game/roundManager");
const hud_1 = require("./hud");
const shooting_1 = require("./shooting");
function random(min, max) {
    return (Math.random() * (max - min)) + min;
}
exports.random = random;
function clamp(number, min, max) {
    return Math.min(Math.max(number, min), max);
}
exports.clamp = clamp;
class GameScene extends game_1.BaseScene {
    /* ---------------------------------- Misc ---------------------------------- */
    player;
    systemMessages;
    systemMessagesId;
    /* --------------------------------- Bullets -------------------------------- */
    bullets;
    noAmmoSound;
    bulletId;
    lastShot;
    /* --------------------------------- Enemies -------------------------------- */
    enemies;
    enemyId;
    rays;
    rayId;
    balls;
    ballId;
    /* --------------------------------- Crates --------------------------------- */
    cratePickupSound;
    /* -------------------------------- Managers -------------------------------- */
    dungeonManager;
    map;
    /* --------------------------------- Images --------------------------------- */
    healthImage;
    coinsImage;
    crateImage;
    frameImage;
    smallAmmoImage;
    mediumAmmoImage;
    largeAmmoImage;
    shellsAmmoImage;
    rangedEnemyImage;
    shopGuyImage;
    dummyImage;
    /* -------------------------------- Inventory ------------------------------- */
    showInventory;
    showInventoryX;
    showInventoryAnimation;
    hideInventoryAnimation;
    /* --------------------------------- Pausing -------------------------------- */
    _paused;
    get paused() { return this._paused; }
    set paused(paused) {
        if (this._paused === paused)
            return;
        this._paused = paused;
        if (paused) {
            // this.pausedAt = performance.now()
            return;
        }
    }
    // TODO Make getTicks() pause when paused
    pausedAt;
    constructor() {
        super();
        this.player = new player_1.Player(config_1.config.width / 2, config_1.config.height - 50, this);
        this.systemMessages = [];
        this.systemMessagesId = 0;
        this.bullets = [];
        // this.bulletSound = new Sound("../../sounds/laserShoot.wav")
        this.noAmmoSound = new sound_1.Sound("./sounds/noammo.mp3");
        this.bulletId = 0;
        this.lastShot = 0;
        this.enemies = [];
        this.enemyId = 0;
        this.rays = [];
        this.rayId = 0;
        this.balls = [];
        this.ballId = 0;
        this.cratePickupSound = new sound_1.Sound("./sounds/pickupCoin.wav");
        this.dungeonManager = new roundManager_1.DungeonManager(this);
        this.map = new map_1.Map(this);
        this.healthImage = new image_1.CustomImage("./images/health.png");
        this.crateImage = new image_1.CustomImage("./images/crate.png");
        this.coinsImage = new image_1.CustomImage("./images/coin.png");
        this.frameImage = new image_1.CustomImage("./images/guns/frame.png");
        this.smallAmmoImage = new image_1.CustomImage("./images/smallammo.png");
        this.mediumAmmoImage = new image_1.CustomImage("./images/mediumammo.png");
        this.largeAmmoImage = new image_1.CustomImage("./images/largeammo.png");
        this.shellsAmmoImage = new image_1.CustomImage("./images/shellsammo.png");
        this.rangedEnemyImage = new image_1.CustomImage("./images/skins/rangedEnemy.png");
        this.shopGuyImage = new image_1.CustomImage('./images/skins/shopGuy.png');
        this.dummyImage = new image_1.CustomImage('./images/skins/dummy.png');
        this.showInventory = false;
        this.showInventoryX = config_1.config.width - hud_1.margin;
        this.showInventoryAnimation = new animations_1.CustomAnimation(250, 64, (movePerFrame) => {
            this.showInventoryX -= movePerFrame;
        }, () => {
            this.showInventoryX = config_1.config.width - hud_1.margin;
        }, () => {
            this.showInventoryX = config_1.config.width - 64 - hud_1.margin;
        });
        this.hideInventoryAnimation = new animations_1.CustomAnimation(250, 64, (movePerFrame) => {
            this.showInventoryX += movePerFrame;
        }, () => {
            this.showInventoryX = config_1.config.width - 64 - hud_1.margin;
        }, () => {
            this.showInventoryX = config_1.config.width - hud_1.margin;
        });
        this._paused = false;
        this.pausedAt = performance.now();
    }
    processInput(events, pressedKeys, dt) {
        this.player.processInput(events, pressedKeys, dt);
        this.map.processInput(events);
        /* -------------------------------------------------------------------------- */
        /*                                   Events                                   */
        /* -------------------------------------------------------------------------- */
        let shot = !this.paused && this.player.gun.holdable && pressedKeys.get("Mouse Left") && this.getTicks() >= this.lastShot + this.player.gun.shootDelay;
        events.forEach(event => {
            switch (event.eventType) {
                case "MouseDown":
                    if (this.paused || shot)
                        break;
                    event = event;
                    if (!shot && event.raw.button === 0 && this.getTicks() >= this.lastShot + this.player.gun.shootDelay) {
                        shot = true;
                    }
                    break;
                case "KeyDown":
                    event = event;
                    switch (event.key.toLowerCase()) {
                        case "f":
                            this.ctx.canvas.requestFullscreen();
                            break;
                        case "i":
                            if (this.paused)
                                break;
                            if (!this.showInventory) {
                                this.showInventoryAnimation.on = true;
                                this.showInventory = true;
                            }
                            else {
                                this.hideInventoryAnimation.on = true;
                                this.showInventory = false;
                            }
                            break;
                        case "m":
                            if (this.dungeonManager.currentRoomObject !== "0" && this.dungeonManager.currentRoomObject !== null && this.dungeonManager.currentRoomObject.type === "dungeon" && !this.dungeonManager.currentRoomObject.dungeonRounds?.cleared) {
                                this.systemMessages.push({
                                    sentAt: performance.now(),
                                    message: "You cannot access the navigator during combat!",
                                    id: this.systemMessagesId
                                });
                                this.systemMessagesId += 1;
                                break;
                            }
                            this.map.mapNavigator = !this.map.mapNavigator;
                            break;
                        case "p":
                            console.log("Pause");
                            this.paused = !this.paused;
                            break;
                    }
                    break;
            }
        });
        // Shooting
        if (shot)
            (0, shooting_1.shooting)(this);
    }
    update(dt) {
        if (this.paused)
            return;
        /* -------------------------------- Universal ------------------------------- */
        this.dungeonManager.update(dt);
        this.player.update(dt);
        this.showInventoryAnimation.update(dt);
        this.hideInventoryAnimation.update(dt);
    }
    draw() {
        // Background
        this.ctx.fillStyle = "#5a6988";
        this.ctx.fillRect(0, 0, config_1.config.width, config_1.config.height);
        /* --------------------------------- Dungeon -------------------------------- */
        this.dungeonManager.draw();
        /* -------------------------------- Universal ------------------------------- */
        this.player.draw();
        (0, hud_1.drawHud)(this.ctx, this);
        this.map.draw();
    }
    getTicks() {
        return performance.now();
    }
}
exports.GameScene = GameScene;

},{"../animations":2,"../config":4,"../game":5,"../image":6,"../sound":22,"./game/map":16,"./game/player":17,"./game/roundManager":19,"./hud":20,"./shooting":21}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bullet = void 0;
const angles_1 = require("../../angles");
const collision_1 = require("../../collision");
const game_1 = require("../game");
class Bullet {
    location;
    width;
    height;
    angle;
    speed;
    id;
    damage;
    origin;
    range;
    game;
    hitPlayer;
    constructor(x, y, width, height, angle, speed, id, inaccuracy, damage, range, game, hitPlayer = false) {
        this.location = { x: x, y: y };
        this.width = width;
        this.height = height;
        this.angle = ((angle * (180 / Math.PI)) + (0, game_1.random)(-inaccuracy, inaccuracy)) * (Math.PI / 180);
        this.speed = speed;
        this.id = id;
        this.damage = damage;
        this.origin = this.location;
        this.range = range;
        this.game = game;
        this.hitPlayer = hitPlayer;
    }
    update(dt) {
        // Range check
        if ((0, angles_1.distance)(this.origin, this.location) >= this.range) {
            this.game.bullets = this.game.bullets.filter(bullet => bullet.id != this.id);
        }
        const location = (0, angles_1.project)(this.location, this.angle, this.speed * dt);
        this.location = location;
        let hit = false;
        for (const enemy of this.game.enemies) {
            const enemyCollisionRect = (0, collision_1.xywdToCollisionRect)(enemy.location.x, enemy.location.y, enemy.width, enemy.height);
            const bulletCollisionRect = (0, collision_1.xywdToCollisionRect)(this.location.x, this.location.y, this.width, this.height);
            if (!this.hitPlayer && (0, collision_1.touches)(enemyCollisionRect, bulletCollisionRect)) {
                if (enemy.hit(this.damage)) {
                    this.game.enemies = this.game.enemies.filter(_enemy => _enemy.id != enemy.id);
                }
                hit = true;
            }
            if (this.hitPlayer && (0, collision_1.touches)((0, collision_1.xywdToCollisionRect)(this.game.player.location.x, this.game.player.location.y, this.game.player.width, this.game.player.height), bulletCollisionRect)) {
                this.game.player.lives -= this.damage;
                hit = true;
            }
        }
        if (hit) {
            this.game.bullets = this.game.bullets.filter(bullet => bullet.id != this.id);
        }
    }
    draw() {
        this.game.ctx.shadowBlur = 5;
        this.game.ctx.shadowColor = "#000000";
        this.game.ctx.fillStyle = (this.hitPlayer) ? "#8d1b1f" : "#0000FF";
        this.game.ctx.fillRect(Math.round(this.location.x - this.width / 2), Math.round(this.location.y - this.width / 2), this.width, this.height);
        this.game.ctx.shadowBlur = 0;
    }
}
exports.Bullet = Bullet;

},{"../../angles":1,"../../collision":3,"../game":8}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Crate = exports.randomEnum = void 0;
const collision_1 = require("../../collision");
const config_1 = require("../../config");
const game_1 = require("../game");
const guns_1 = require("./guns");
function randomEnum(anEnum) {
    const enumValues = Object.keys(anEnum)
        .map(n => Number.parseInt(n))
        .filter(n => !Number.isNaN(n));
    const randomIndex = Math.floor(Math.random() * enumValues.length);
    const randomEnumValue = enumValues[randomIndex];
    return randomEnumValue;
}
exports.randomEnum = randomEnum;
class Crate {
    pickups;
    location;
    id;
    game;
    image;
    constructor(x, y, pickups, id, game, image) {
        this.location = { x: x, y: y };
        this.pickups = pickups;
        this.id = id;
        this.game = game;
        this.image = image;
    }
    check() {
        if (this.game.dungeonManager.currentRoomObject !== "0" && this.game.dungeonManager.currentRoomObject !== null && (0, collision_1.touches)((0, collision_1.xywdToCollisionRect)(this.game.player.location.x, this.game.player.location.y, this.game.player.width, this.game.player.height), (0, collision_1.xywdToCollisionRect)(this.location.x, this.location.y, 64, 64))) {
            this.game.dungeonManager.currentRoomObject.dungeonRounds.crates = this.game.dungeonManager.currentRoomObject.dungeonRounds.crates.filter(crate => crate.id != this.id);
            this.pickups.forEach(pickup => {
                this.game.cratePickupSound.clonePlay();
                const anyPickup = pickup;
                if (pickup.type === "health") {
                    this.game.player.lives += pickup.amount;
                }
                else if (pickup.type === "coins") {
                    this.game.player.coins += pickup.amount;
                }
                else if (typeof pickup.type.damage !== "undefined") {
                    let highestKey = 0;
                    Object.keys(this.game.player.gunInventory).forEach(key => { if (parseInt(key) > highestKey)
                        highestKey = parseInt(key); });
                    this.game.player.gunInventory[highestKey + 1] = anyPickup.type;
                }
                else {
                    this.game.player.ammo[anyPickup.type] += anyPickup.amount;
                }
            });
        }
    }
    draw() {
        this.game.ctx.drawImage(this.image.image, Math.round(this.location.x - this.image.image.width / 2), Math.round(this.location.y - this.image.image.width / 2));
    }
    /**
     * Only for **HEALTH** or **AMMO**
     */
    static randomCrate(id, game) {
        const type = (Math.random() < 0.5) ? "health" : randomEnum(guns_1.Ammo);
        return new this((0, game_1.random)(0 + 32, config_1.config.width - 32), (0, game_1.random)(0 + 32, config_1.config.height - 32), [{
                type: type,
                amount: (type === "health") ? 1 : Math.round((0, game_1.random)(10, 100))
            }], id, game, game.crateImage);
    }
    static coin(x, y, id, game, amount = 1) {
        return new this(x, y, [{ type: "coins", amount: amount }], id, game, game.coinsImage);
    }
}
exports.Crate = Crate;

},{"../../collision":3,"../../config":4,"../game":8,"./guns":15}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.spaceCharacter = exports.Direction = exports.printLayout = exports.fullGenerate = void 0;
const game_1 = require("../../game");
const game_2 = require("../game");
const guns_1 = require("./guns");
const shop_1 = require("./rooms/shop");
const roundManager_1 = require("./roundManager");
const spaceCharacter = "0";
exports.spaceCharacter = spaceCharacter;
var Direction;
(function (Direction) {
    Direction[Direction["up"] = 0] = "up";
    Direction[Direction["down"] = 1] = "down";
    Direction[Direction["left"] = 2] = "left";
    Direction[Direction["right"] = 3] = "right";
})(Direction || (Direction = {}));
exports.Direction = Direction;
function generateRoom(layout, lastRoom, game) {
    let returnRoom = {
        x: lastRoom.x,
        y: lastRoom.y,
        direction: [],
        type: "dungeon",
        discovered: false
    };
    let found = false;
    while (!found) {
        returnRoom = {
            x: lastRoom.x,
            y: lastRoom.y,
            direction: [],
            type: "dungeon",
            discovered: false
        };
        if (layout[returnRoom.y + 1]?.[returnRoom.x] !== spaceCharacter
            && layout[returnRoom.y - 1]?.[returnRoom.x] !== spaceCharacter
            && layout[returnRoom.y]?.[returnRoom.x + 1] !== spaceCharacter
            && layout[returnRoom.y]?.[returnRoom.x - 1] !== spaceCharacter) {
            throw new Error("Surrounded");
        }
        switch (Math.round((0, game_2.random)(0, 3))) {
            case 0:
                returnRoom.y = lastRoom.y + 1;
                returnRoom.direction = [Direction.down];
                break;
            case 1:
                returnRoom.y = lastRoom.y - 1;
                returnRoom.direction = [Direction.up];
                break;
            case 2:
                returnRoom.x = lastRoom.x + 1;
                returnRoom.direction = [Direction.right];
                break;
            case 3:
                returnRoom.x = lastRoom.x - 1;
                returnRoom.direction = [Direction.left];
                break;
        }
        // Check if next move will surround
        const copyLayout = JSON.parse(JSON.stringify(layout));
        if (!copyLayout[returnRoom.y] || !copyLayout[returnRoom.y][returnRoom.x]) {
            continue;
        }
        copyLayout[returnRoom.y][returnRoom.x] = parseChar(returnRoom.direction);
        if (copyLayout[returnRoom.y + 1]?.[returnRoom.x] !== spaceCharacter
            && copyLayout[returnRoom.y - 1]?.[returnRoom.x] !== spaceCharacter
            && copyLayout[returnRoom.y]?.[returnRoom.x + 1] !== spaceCharacter
            && copyLayout[returnRoom.y]?.[returnRoom.x - 1] !== spaceCharacter) {
            continue;
        }
        if (layout[returnRoom.y]?.[returnRoom.x] === spaceCharacter) {
            found = true;
            continue;
        }
    }
    return returnRoom;
}
function printLayout(layout) {
    console.log(layout.map(row => row.map(room => room =
        (room !== spaceCharacter) ?
            `\u001b[${(room.type === "shop") ? 32 : (room.type === "chest") ? 31 : 93}m${parseChar(room.direction)}\u001b[0m` :
            `\u001b[91m${room}|${room}\u001b[0m`).join(" ")).join("\n"));
}
exports.printLayout = printLayout;
function parseChar(_direction) {
    if (typeof _direction === "string" || _direction.length === 1) {
        const direction = _direction[0];
        return ((direction === Direction.up) ? "^" : (direction === Direction.down) ? "_" : (direction === Direction.left) ? "<" : (direction === Direction.right) ? ">" : direction) + "|0";
    }
    return _direction.map(direction => (direction === Direction.up) ? "^" : (direction === Direction.down) ? "_" : (direction === Direction.left) ? "<" : (direction === Direction.right) ? ">" : direction).join("|");
}
function generate(game, options = { layoutSize: 7, rooms: 20 }, startPoint, preLayout = [], print = false) {
    return new Promise(async (resolve, reject) => {
        const layoutSize = options.layoutSize;
        const layout = preLayout;
        const rooms = options.rooms;
        let lastRoom = (startPoint) ? startPoint : {
            x: (layoutSize - 1) / 2,
            y: (layoutSize - 1) / 2
        };
        for (let i = 0; i < layoutSize; i++)
            layout[i] = Array(layoutSize).fill(spaceCharacter);
        for (let i = 0; i < rooms; i++) {
            let newRoom = null;
            try {
                newRoom = generateRoom(layout, lastRoom, game);
            }
            catch {
                reject(layout);
            }
            finally {
                if (newRoom !== null) {
                    const below = layout[lastRoom.y + 1]?.[lastRoom.x];
                    const above = layout[lastRoom.y - 1]?.[lastRoom.x];
                    const left = layout[lastRoom.y]?.[lastRoom.x - 1];
                    const right = layout[lastRoom.y]?.[lastRoom.x + 1];
                    if (lastRoom.y === below?.y && lastRoom.x === below?.x) {
                        newRoom.direction.push(Direction.down);
                    }
                    else if (lastRoom.y === above?.y && lastRoom.x === above?.x) {
                        newRoom.direction.push(Direction.up);
                    }
                    else if (lastRoom.y === left?.y && lastRoom.x === left?.x) {
                        newRoom.direction.push(Direction.left);
                    }
                    else if (lastRoom.y === right?.y && lastRoom.x === right?.x) {
                        newRoom.direction.push(Direction.right);
                    }
                    layout[lastRoom.y][lastRoom.x] = newRoom;
                    if (i === rooms - 1) {
                        // TODO Backtracking for end room
                        const below = layout[newRoom.y + 1]?.[newRoom.x];
                        const above = layout[newRoom.y - 1]?.[newRoom.x];
                        const left = layout[newRoom.y]?.[newRoom.x - 1];
                        const right = layout[newRoom.y]?.[newRoom.x + 1];
                        const direction = [];
                        if (newRoom.y === below?.y && newRoom.x === below?.x) {
                            direction.push(Direction.down);
                        }
                        else if (newRoom.y === above?.y && newRoom.x === above?.x) {
                            direction.push(Direction.up);
                        }
                        else if (newRoom.y === left?.y && newRoom.x === left?.x) {
                            direction.push(Direction.left);
                        }
                        else if (newRoom.y === right?.y && newRoom.x === right?.x) {
                            direction.push(Direction.right);
                        }
                        layout[newRoom.y][newRoom.x] = {
                            type: "end",
                            x: newRoom.x,
                            y: newRoom.y,
                            direction: direction,
                            discovered: false
                        };
                    }
                    else {
                        layout[newRoom.y][newRoom.x] = spaceCharacter;
                    }
                    lastRoom = newRoom;
                    if (print) {
                        console.clear();
                        printLayout(layout);
                        await (0, game_1.wait)(100);
                    }
                }
                else {
                    reject(layout);
                }
            }
        }
        resolve(layout);
    });
}
function check(game, options = { layoutSize: 7, rooms: 20 }, print = false, startPoint, preLayout = []) {
    return new Promise((resolve, _) => {
        generate(game, options, startPoint, preLayout, print).catch(() => check(game, options, print, startPoint, preLayout)).then(_layout => {
            if (_layout) {
                let layout = _layout;
                for (let y = 0; y < layout.length; y++) {
                    for (let x = 0; x < layout[y].length; x++) {
                        const room = layout[y][x];
                        if (room !== "0") {
                            layout[y][x] = { ...room, x: x, y: y };
                            break;
                        }
                    }
                }
                resolve(layout);
            }
        });
    });
}
function appendSpecial(layout, roomType) {
    let availableRooms = [];
    for (let y = 0; y < layout.length; y++) {
        for (let x = 0; x < layout[y].length; x++) {
            const room = layout[y][x];
            if (room !== "0" &&
                (layout[y + 1]?.[x] === spaceCharacter ||
                    layout[y - 1]?.[x] === spaceCharacter ||
                    layout[y]?.[x + 1] === spaceCharacter ||
                    layout[y]?.[x - 1] === spaceCharacter)) {
                availableRooms.push({ ...room, x: x, y: y });
                continue;
            }
        }
    }
    if (availableRooms.length === 0)
        return;
    const availableDirections = [];
    const room = availableRooms[Math.round((0, game_2.random)(0, availableRooms.length - 1))];
    if (layout[room.y]?.[room.x - 1] === spaceCharacter)
        availableDirections.push(Direction.left);
    if (layout[room.y]?.[room.x + 1] === spaceCharacter)
        availableDirections.push(Direction.right);
    if (layout[room.y - 1]?.[room.x] === spaceCharacter)
        availableDirections.push(Direction.up);
    if (layout[room.y + 1]?.[room.x] === spaceCharacter)
        availableDirections.push(Direction.down);
    const direction = availableDirections[Math.round((0, game_2.random)(0, availableDirections.length - 1))];
    layout[room.y][room.x] = { ...room, direction: [...room.direction, direction] };
    let specialRoom = { ...room, discovered: false, direction: [], type: roomType };
    switch (direction) {
        case Direction.up:
            specialRoom.y = specialRoom.y - 1;
            specialRoom.direction = [Direction.down];
            break;
        case Direction.down:
            specialRoom.y = specialRoom.y + 1;
            specialRoom.direction = [Direction.up];
            break;
        case Direction.left:
            specialRoom.x = specialRoom.x - 1;
            specialRoom.direction = [Direction.right];
            break;
        case Direction.right:
            specialRoom.x = specialRoom.x + 1;
            specialRoom.direction = [Direction.left];
            break;
    }
    layout[specialRoom.y][specialRoom.x] = specialRoom;
}
function fullGenerate(game, options = { layoutSize: 7, rooms: 20 }, specialRooms = [], print = false) {
    return new Promise(async (resolve, _) => {
        check(game, options, print).then(_layout => {
            _layout[(_layout.length - 1) / 2][(_layout.length - 1) / 2].discovered = true; // Set middle as discovered
            const layout = _layout;
            specialRooms.forEach(option => {
                for (let i = 0; i < option.count - 1; i++) {
                    appendSpecial(layout, option.type);
                }
            });
            for (let y = 0; y < layout.length; y++) {
                for (let x = 0; x < layout[y].length; x++) {
                    const room = layout[y][x];
                    if (room !== "0") {
                        switch (room.type) {
                            case "dungeon":
                                layout[y][x].dungeonRounds = new roundManager_1.RoundManager(game);
                                break;
                            case "shop":
                                layout[y][x].shopRoom = new shop_1.ShopRoom([
                                    { item: { type: guns_1.the360, amount: 1 }, cost: 5 },
                                    { item: { type: guns_1.pistol, amount: 1 }, cost: 5 }
                                ], game);
                                break;
                        }
                    }
                }
            }
            resolve(layout);
        });
    });
}
exports.fullGenerate = fullGenerate;

},{"../../game":5,"../game":8,"./guns":15,"./rooms/shop":18,"./roundManager":19}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BallEnemy = exports.Ball = void 0;
const angles_1 = require("../../../angles");
const config_1 = require("../../../config");
const game_1 = require("../../game");
const crate_1 = require("../crate");
const rangedEnemy_1 = require("./rangedEnemy");
function circleRect(R, Xc, Yc, X1, Y1, X2, Y2) {
    // Find the nearest point on the
    // rectangle to the center of
    // the circle
    const Xn = Math.max(X1, Math.min(Xc, X2));
    const Yn = Math.max(Y1, Math.min(Yc, Y2));
    // Find the distance between the
    // nearest point and the center
    // of the circle
    // Distance between 2 points,
    // (x1, y1) & (x2, y2) in
    // 2D Euclidean space is
    // ((x1-x2)**2 + (y1-y2)**2)**0.5
    const Dx = Xn - Xc;
    const Dy = Yn - Yc;
    return (Dx * Dx + Dy * Dy) <= R * R;
}
class Ball {
    location;
    angle;
    length;
    speed;
    origin;
    radius;
    id;
    game;
    inaccuracy;
    constructor(x, y, angle, id, game) {
        this.location = { x: x, y: y };
        this.origin = { x: x, y: y };
        this.radius = 20;
        this.speed = 0.025;
        this.inaccuracy = 20;
        this.angle = ((angle * (180 / Math.PI)) + (0, game_1.random)(-this.inaccuracy, this.inaccuracy)) * (Math.PI / 180);
        this.length = 500;
        this.id = id;
        this.game = game;
    }
    update(dt) {
        const location = (0, angles_1.project)(this.location, this.angle, this.speed * dt);
        if ((0, angles_1.distance)(this.origin, location) >= this.length) {
            const ray = new rangedEnemy_1.Ray(this.location.x, this.location.y, (0, angles_1.getAngle)(this.location, this.game.player.location), 500, 1500, this.game.rayId, this.game, true);
            this.game.rays.push(ray);
            this.game.rayId += 1;
            this.game.balls = this.game.balls.filter(ball => ball.id != this.id);
        }
        else {
            if (location.x > config_1.config.width || location.x < 0 || location.y > config_1.config.height || location.y < 0) {
                const ray = new rangedEnemy_1.Ray(this.location.x, this.location.y, (0, angles_1.getAngle)(this.location, this.game.player.location), 500, 1500, this.game.rayId, this.game, true);
                this.game.rays.push(ray);
                this.game.rayId += 1;
                this.game.balls = this.game.balls.filter(ball => ball.id != this.id);
            }
            else {
                this.location = location;
                if (circleRect(this.radius, this.location.x, this.location.y, this.game.player.location.x - this.game.player.width / 2, this.game.player.location.y - this.game.player.height / 2, this.game.player.location.x + this.game.player.width / 2, this.game.player.location.y + this.game.player.height / 2)) {
                    this.game.player.lives -= 1;
                }
            }
        }
    }
    draw() {
        this.game.ctx.fillStyle = "#FFFFFF";
        this.game.ctx.beginPath();
        this.game.ctx.arc(this.location.x, this.location.y, this.radius + 2, 0, 2 * Math.PI);
        this.game.ctx.fill();
        this.game.ctx.shadowBlur = 15;
        this.game.ctx.shadowColor = "#FD0100";
        this.game.ctx.fillStyle = "#8d1b1f";
        this.game.ctx.beginPath();
        this.game.ctx.arc(this.location.x, this.location.y, this.radius, 0, 2 * Math.PI);
        this.game.ctx.fill();
        this.game.ctx.shadowBlur = 0;
    }
}
exports.Ball = Ball;
class BallEnemy {
    location;
    width;
    height;
    speed;
    id;
    health;
    maxHealth;
    range;
    shotCooldown;
    lastShot;
    // balls: number[]
    game;
    constructor(x, y, id, game) {
        this.location = { x: x, y: y };
        this.width = 30;
        this.height = 30;
        this.speed = 0.05;
        this.id = id;
        this.maxHealth = 50;
        this.health = this.maxHealth;
        this.range = 250;
        this.shotCooldown = 10000;
        this.lastShot = game.getTicks();
        // this.balls = []
        this.game = game;
    }
    /**
     * @returns killed?
     */
    hit(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            // this.game.balls = this.game.balls.filter(ball => !this.balls.includes(ball.id))
            if (this.game.dungeonManager.currentRoomObject !== "0" && this.game.dungeonManager.currentRoomObject.type === "dungeon") {
                this.game.dungeonManager.currentRoomObject.dungeonRounds.enemiesKilledThisRound += 1;
                this.game.dungeonManager.currentRoomObject.dungeonRounds.crates.push(crate_1.Crate.coin(this.location.x, this.location.y, this.game.dungeonManager.currentRoomObject.dungeonRounds.crateId, this.game));
                this.game.dungeonManager.currentRoomObject.dungeonRounds.crateId += 1;
            }
            return true;
        }
        return false;
    }
    draw() {
        this.game.ctx.fillStyle = "#FFFF00";
        this.game.ctx.shadowBlur = 4;
        this.game.ctx.shadowColor = "#000000";
        this.game.ctx.fillRect(Math.round(this.location.x - this.width / 2), Math.round(this.location.y - this.height / 2), this.width, this.height);
        this.game.ctx.shadowBlur = 0;
    }
    update(dt) {
        if ((0, angles_1.distance)(this.location, this.game.player.location) > this.range) {
            const location = (0, angles_1.project)(this.location, (0, angles_1.getAngle)(this.location, this.game.player.location), this.speed * dt);
            this.location = location;
        }
        else {
            // Shooting
            if (this.game.getTicks() >= this.lastShot + this.shotCooldown) {
                this.lastShot = this.game.getTicks();
                const ball = new Ball(this.location.x, this.location.y, (0, angles_1.getAngle)(this.location, this.game.player.location), this.game.ballId, this.game);
                this.game.balls.push(ball);
                // this.balls.push(ball.id)
                this.game.ballId += 1;
            }
        }
    }
}
exports.BallEnemy = BallEnemy;

},{"../../../angles":1,"../../../config":4,"../../game":8,"../crate":10,"./rangedEnemy":13}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findAngle = exports.lineRect = exports.lineLine = exports.Ray = exports.RangedEnemy = void 0;
const angles_1 = require("../../../angles");
const config_1 = require("../../../config");
const crate_1 = require("../crate");
/**
 * @returns point of intersection
 */
function lineLine(x1, y1, x2, y2, x3, y3, x4, y4) {
    const uA = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
    const uB = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
    if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
        return {
            x: x1 + (uA * (x2 - x1)),
            y: y1 + (uA * (y2 - y1))
        };
    }
    return false;
}
exports.lineLine = lineLine;
/**
 * Check if a rectangle touches a line
 * @param x1 One endpoint's x value of the line
 * @param y1 One endpoint's y value of the line
 * @param x2 Another endpoint's x value of the line
 * @param y2 Another endpoint's y value of the line
 * @param rx Rectangles top left x value
 * @param ry Rectangles top left y value
 * @param rw Rectangles width value
 * @param rh Rectangles height value
 * @returns True if line touches rectangle, false if not
 */
function lineRect(x1, y1, x2, y2, rx, ry, rw, rh) {
    const left = lineLine(x1, y1, x2, y2, rx, ry, rx, ry + rh);
    const right = lineLine(x1, y1, x2, y2, rx + rw, ry, rx + rw, ry + rh);
    const top = lineLine(x1, y1, x2, y2, rx, ry, rx + rw, ry);
    const bottom = lineLine(x1, y1, x2, y2, rx, ry + rh, rx + rw, ry + rh);
    if (left || right || top || bottom)
        return true;
    return false;
}
exports.lineRect = lineRect;
/**
 * Calculates the angle (in radians) between two vectors pointing outward from one center
 *
 * @param p0 first point
 * @param p1 second point
 * @param c center point
 */
function findAngle(p0, p1, c) {
    const p0c = Math.sqrt(Math.pow(c.x - p0.x, 2) +
        Math.pow(c.y - p0.y, 2)); // p0->c (b)
    const p1c = Math.sqrt(Math.pow(c.x - p1.x, 2) +
        Math.pow(c.y - p1.y, 2)); // p1->c (a)
    const p0p1 = Math.sqrt(Math.pow(p1.x - p0.x, 2) +
        Math.pow(p1.y - p0.y, 2)); // p0->p1 (c)
    return Math.acos((p1c * p1c + p0c * p0c - p0p1 * p0p1) / (2 * p1c * p0c));
}
exports.findAngle = findAngle;
class Ray {
    location;
    angle;
    destinationX;
    destinationY;
    windEndTime;
    fireEndTime;
    id;
    state;
    game;
    createBounce;
    disableBall;
    constructor(x, y, angle, windLength, fireLength, id, game, createBounce = false, disableBall = false) {
        this.location = { x: x, y: y };
        this.angle = angle;
        const destination = (0, angles_1.project)(this.location, this.angle, config_1.config.width + config_1.config.height);
        this.destinationX = destination.x;
        this.destinationY = destination.y;
        this.state = "wind";
        this.windEndTime = game.getTicks() + windLength;
        this.fireEndTime = game.getTicks() + windLength + fireLength;
        this.id = id;
        this.game = game;
        this.createBounce = createBounce;
        this.disableBall = disableBall;
        // Create bouncing angle
        if (!createBounce)
            return;
        let ray = null;
        const rightIntersection = lineLine(this.location.x, this.location.y, this.destinationX, this.destinationY, config_1.config.width, 0, config_1.config.width, config_1.config.height);
        if (rightIntersection) {
            let bounceAngle = findAngle(this.location, rightIntersection, {
                x: config_1.config.width,
                y: rightIntersection.y + ((this.location.y > rightIntersection.y) ? -100 : 100)
            });
            bounceAngle = (((this.location.y < rightIntersection.y) ? 90 + bounceAngle * (180 / Math.PI) : 270 - bounceAngle * (180 / Math.PI))) * (Math.PI / 180);
            ray = new Ray(rightIntersection.x, rightIntersection.y, bounceAngle, 500, 1500, this.game.rayId, this.game, false, true);
        }
        else {
            const leftIntersection = lineLine(this.location.x, this.location.y, this.destinationX, this.destinationY, 0, 0, 0, config_1.config.height);
            if (leftIntersection) {
                let bounceAngle = findAngle(this.location, leftIntersection, {
                    x: 0,
                    y: leftIntersection.y + ((this.location.y > leftIntersection.y) ? -100 : 100)
                });
                bounceAngle = (((this.location.y < leftIntersection.y) ? 90 - bounceAngle * (180 / Math.PI) : 270 + bounceAngle * (180 / Math.PI))) * (Math.PI / 180);
                ray = new Ray(leftIntersection.x, leftIntersection.y, bounceAngle, 500, 1500, this.game.rayId, this.game, false, true);
            }
            else {
                const topIntersection = lineLine(this.location.x, this.location.y, this.destinationX, this.destinationY, 0, 0, config_1.config.width, 0);
                if (topIntersection) {
                    let bounceAngle = findAngle(this.location, {
                        x: topIntersection.x,
                        y: 0
                    }, {
                        x: topIntersection.x + ((this.location.x > topIntersection.x) ? -100 : 100),
                        y: 0
                    });
                    bounceAngle = (360 - ((this.location.x > topIntersection.x) ? 180 + (bounceAngle * (180 / Math.PI)) : 360 - (bounceAngle * (180 / Math.PI)))) * (Math.PI / 180);
                    ray = new Ray(topIntersection.x, 0, bounceAngle, 500, 1500, this.game.rayId, this.game, false, true);
                }
                else {
                    const bottomIntersection = lineLine(this.location.x, this.location.y, this.destinationX, this.destinationY, 0, config_1.config.height, config_1.config.width, config_1.config.height);
                    if (bottomIntersection) {
                        let bounceAngle = findAngle(this.location, {
                            x: bottomIntersection.x,
                            y: config_1.config.height
                        }, {
                            x: bottomIntersection.x + ((this.location.x > bottomIntersection.x) ? -100 : 100),
                            y: config_1.config.height
                        });
                        bounceAngle = (360 - ((this.location.x > bottomIntersection.x) ? 180 - (bounceAngle * (180 / Math.PI)) : 360 + (bounceAngle * (180 / Math.PI)))) * (Math.PI / 180);
                        ray = new Ray(bottomIntersection.x, config_1.config.height, bounceAngle, 500, 1500, this.game.rayId, this.game, false, true);
                    }
                }
            }
        }
        if (ray) {
            this.game.rays.push(ray);
            this.game.rayId += 1;
        }
    }
    update() {
        if (this.game.getTicks() >= this.windEndTime && this.game.getTicks() < this.fireEndTime) {
            this.state = "fire";
        }
        else if (this.game.getTicks() >= this.fireEndTime) {
            this.state = "end";
        }
        else {
            this.state = "wind";
        }
        if (this.state === "end")
            this.game.rays = this.game.rays.filter(ray => ray.id != this.id);
        else if (this.state === "fire") {
            if (lineRect(this.location.x, this.location.y, this.destinationX, this.destinationY, this.game.player.location.x - this.game.player.width / 2, this.game.player.location.y - this.game.player.height / 2, this.game.player.width, this.game.player.height)) {
                this.game.player.lives -= 1;
            }
        }
    }
    draw() {
        switch (this.state) {
            case "wind":
                this.game.ctx.beginPath();
                this.game.ctx.moveTo(this.location.x, this.location.y);
                this.game.ctx.strokeStyle = "#808080";
                this.game.ctx.lineWidth = 2;
                this.game.ctx.lineTo(this.destinationX, this.destinationY);
                this.game.ctx.stroke();
                if (!this.disableBall) {
                    this.game.ctx.fillStyle = "#8d1b1f";
                    this.game.ctx.beginPath();
                    this.game.ctx.arc(this.location.x, this.location.y, 10, 0, 2 * Math.PI);
                    this.game.ctx.fill();
                }
                break;
            case "fire":
                this.game.ctx.beginPath();
                this.game.ctx.moveTo(this.location.x, this.location.y);
                this.game.ctx.shadowBlur = 15;
                this.game.ctx.shadowColor = "#FD0100";
                this.game.ctx.strokeStyle = "#8d1b1f";
                this.game.ctx.lineWidth = 10;
                this.game.ctx.lineTo(this.destinationX, this.destinationY);
                this.game.ctx.stroke();
                this.game.ctx.shadowBlur = 0;
                if (!this.disableBall) {
                    this.game.ctx.fillStyle = "#8d1b1f";
                    this.game.ctx.beginPath();
                    this.game.ctx.arc(this.location.x, this.location.y, 10, 0, 2 * Math.PI);
                    this.game.ctx.fill();
                }
                break;
            default:
                this.game.rays = this.game.rays.filter(ray => ray.id != this.id);
                break;
        }
    }
}
exports.Ray = Ray;
class RangedEnemy {
    location;
    width;
    height;
    speed;
    id;
    health;
    maxHealth;
    range;
    shotCooldown;
    lastShot;
    rays;
    game;
    constructor(x, y, id, game) {
        this.location = { x: x, y: y };
        this.width = 30;
        this.height = 30;
        this.speed = 0.05;
        this.id = id;
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.range = 500;
        this.shotCooldown = 5000;
        this.lastShot = game.getTicks();
        this.rays = [];
        this.game = game;
    }
    /**
     * @returns killed?
     */
    hit(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            // this.game.rays = this.game.rays.filter(ray => !this.rays.includes(ray.id))
            if (this.game.dungeonManager.currentRoomObject !== "0" && this.game.dungeonManager.currentRoomObject.type === "dungeon") {
                this.game.dungeonManager.currentRoomObject.dungeonRounds.enemiesKilledThisRound += 1;
                this.game.dungeonManager.currentRoomObject.dungeonRounds.crates.push(crate_1.Crate.coin(this.location.x, this.location.y, this.game.dungeonManager.currentRoomObject.dungeonRounds.crateId, this.game));
                this.game.dungeonManager.currentRoomObject.dungeonRounds.crateId += 1;
            }
            return true;
        }
        return false;
    }
    draw() {
        this.game.ctx.shadowBlur = 4;
        this.game.ctx.shadowColor = "#000000";
        this.game.ctx.drawImage(this.game.rangedEnemyImage.image, Math.round(this.location.x - this.width / 2), Math.round(this.location.y - this.height / 2));
        this.game.ctx.shadowBlur = 0;
    }
    update(dt) {
        if ((0, angles_1.distance)(this.location, this.game.player.location) > this.range) {
            const location = (0, angles_1.project)(this.location, (0, angles_1.getAngle)(this.location, this.game.player.location), this.speed * dt);
            this.location = location;
        }
        else {
            // Shooting
            if (this.game.getTicks() >= this.lastShot + this.shotCooldown) {
                this.lastShot = this.game.getTicks();
                // Lead player
                const ray = new Ray(this.location.x, this.location.y, (Math.random() > 0.5) ? leadPlayer(this.location.x, this.location.y, this.game.player) : (0, angles_1.getAngle)(this.location, this.game.player.location), 500, 1500, this.game.rayId, this.game, true);
                this.game.rays.push(ray);
                this.rays.push(ray.id);
                this.game.rayId += 1;
            }
        }
    }
}
exports.RangedEnemy = RangedEnemy;
function leadPlayer(x, y, player) {
    let angle = (0, angles_1.getAngle)({
        x: x,
        y: y
    }, {
        x: player.location.x,
        y: player.location.y
    });
    if (!(player.hspd == 0 && player.vspd == 0) && Math.random() > 0.5) {
        let hspd = player.hspd;
        let vspd = player.vspd;
        const distanceToPlayer = (0, angles_1.distance)({
            x: x,
            y: y
        }, {
            x: player.location.x,
            y: player.location.y
        });
        hspd *= (distanceToPlayer / 5);
        vspd *= (distanceToPlayer / 5);
        const assumedNextPlayerPos = {
            x: player.location.x + hspd,
            y: player.location.y + vspd
        };
        angle = (0, angles_1.getAngle)({
            x: x,
            y: y
        }, assumedNextPlayerPos);
    }
    return angle;
}

},{"../../../angles":1,"../../../config":4,"../crate":10}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpiralEnemy = void 0;
const angles_1 = require("../../../angles");
const bullet_1 = require("../bullet");
const crate_1 = require("../crate");
class SpiralEnemy {
    location;
    maxHealth;
    health;
    id;
    width;
    height;
    game;
    currentShootAngle;
    lastShot;
    shootDelay;
    station;
    constructor(x, y, id, game) {
        this.location = { x: x, y: y };
        this.width = 30;
        this.height = 30;
        this.id = id;
        this.maxHealth = 200;
        this.health = this.maxHealth;
        this.game = game;
        this.currentShootAngle = 0;
        this.lastShot = game.getTicks();
        this.shootDelay = 1000;
        this.station = false;
    }
    hit(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            // this.game.balls = this.game.balls.filter(ball => !this.balls.includes(ball.id))
            if (this.game.dungeonManager.currentRoomObject !== "0" && this.game.dungeonManager.currentRoomObject.type === "dungeon") {
                this.game.dungeonManager.currentRoomObject.dungeonRounds.enemiesKilledThisRound += 1;
                this.game.dungeonManager.currentRoomObject.dungeonRounds.crates.push(crate_1.Crate.coin(this.location.x, this.location.y, this.game.dungeonManager.currentRoomObject.dungeonRounds.crateId, this.game));
                this.game.dungeonManager.currentRoomObject.dungeonRounds.crateId += 1;
            }
            return true;
        }
        return false;
    }
    update(dt) {
        if (!this.station && (0, angles_1.distance)(this.location, this.game.player.location) > 200) {
            const location = (0, angles_1.project)(this.location, (0, angles_1.getAngle)(this.location, this.game.player.location), 0.05 * dt);
            this.location = location;
        }
        else {
            this.station = true;
        }
        this.currentShootAngle += (50 * dt) % 360;
        if (this.station && this.game.getTicks() >= this.lastShot + this.shootDelay) {
            this.lastShot = this.game.getTicks();
            const oppositeAngle = (this.currentShootAngle - 180) % 360;
            this.game.bullets.push(new bullet_1.Bullet(this.location.x, this.location.y, 10, 10, this.currentShootAngle * (Math.PI / 180), 0.04, this.game.bulletId, 6, 1, 300, this.game, true));
            this.game.bulletId += 1;
            this.game.bullets.push(new bullet_1.Bullet(this.location.x, this.location.y, 10, 10, oppositeAngle * (Math.PI / 180), 0.04, this.game.bulletId, 6, 1, 300, this.game, true));
            this.game.bulletId += 1;
        }
    }
    draw() {
        this.game.ctx.fillStyle = (this.station) ? "#FFFF90" : "#00FFFF";
        this.game.ctx.shadowBlur = 4;
        this.game.ctx.shadowColor = "#000000";
        this.game.ctx.fillRect(Math.round(this.location.x - this.width / 2), Math.round(this.location.y - this.height / 2), this.width, this.height);
        this.game.ctx.shadowBlur = 0;
    }
}
exports.SpiralEnemy = SpiralEnemy;

},{"../../../angles":1,"../bullet":9,"../crate":10}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.guns = exports.the360 = exports.shotgun = exports.sniper = exports.ak47 = exports.smg = exports.pistol = exports.Ammo = void 0;
const image_1 = require("../../image");
const sound_1 = require("../../sound");
var Ammo;
(function (Ammo) {
    Ammo[Ammo["small"] = 0] = "small";
    Ammo[Ammo["medium"] = 1] = "medium";
    Ammo[Ammo["large"] = 2] = "large";
    Ammo[Ammo["shell"] = 3] = "shell";
})(Ammo || (Ammo = {}));
exports.Ammo = Ammo;
const pistol = {
    damage: 25,
    inaccuracy: 5,
    range: 500,
    bullets: 1,
    shootDelay: 500,
    holdable: false,
    ammo: Ammo.small,
    image: new image_1.CustomImage("./images/guns/pistol.png"),
    sound: new sound_1.Sound("./sounds/laserShoot.wav")
};
exports.pistol = pistol;
const smg = {
    damage: 2,
    inaccuracy: 5,
    range: 400,
    bullets: 1,
    shootDelay: 100,
    holdable: true,
    ammo: Ammo.small,
    image: new image_1.CustomImage("./images/guns/smg.png"),
    sound: new sound_1.Sound("./sounds/gun/smg.mp3")
};
exports.smg = smg;
const ak47 = {
    damage: 25,
    inaccuracy: 7,
    range: 600,
    bullets: 1,
    shootDelay: 200,
    holdable: true,
    ammo: Ammo.medium,
    image: new image_1.CustomImage("./images/guns/ak47.png"),
    sound: new sound_1.Sound("./sounds/gun/ak47.mp3")
};
exports.ak47 = ak47;
const sniper = {
    damage: 150,
    inaccuracy: 1,
    range: 750,
    bullets: 1,
    shootDelay: 2000,
    holdable: false,
    ammo: Ammo.large,
    image: new image_1.CustomImage("./images/guns/sniper.png"),
    sound: new sound_1.Sound("./sounds/laserShoot.wav")
};
exports.sniper = sniper;
const shotgun = {
    damage: 15,
    inaccuracy: 25,
    range: 200,
    bullets: 10,
    shootDelay: 1000,
    holdable: true,
    ammo: Ammo.shell,
    image: new image_1.CustomImage("./images/guns/shotgun.png"),
    sound: new sound_1.Sound("./sounds/laserShoot.wav")
};
exports.shotgun = shotgun;
const the360 = {
    damage: 5,
    inaccuracy: 360,
    range: 100,
    bullets: 50,
    shootDelay: 500,
    holdable: true,
    ammo: Ammo.large,
    image: new image_1.CustomImage("./images/guns/the360.png"),
    sound: new sound_1.Sound("./sounds/laserShoot.wav")
};
exports.the360 = the360;
const guns = [pistol, smg, ak47, sniper, shotgun, the360];
exports.guns = guns;

},{"../../image":6,"../../sound":22}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Map = void 0;
const config_1 = require("../../config");
const dungeonGenerator_1 = require("./dungeonGenerator");
class Map {
    game;
    // show: boolean
    _mapNavigator;
    get mapNavigator() { return this._mapNavigator; }
    set mapNavigator(value) {
        if (this._mapNavigator === value)
            return;
        this._mapNavigator = value;
        this.game.paused = value;
    }
    constructor(game) {
        this.game = game;
        // this.show = false
        this._mapNavigator = false;
    }
    drawRoom(room, ctx) {
        if (this.game.dungeonManager.layout === null)
            return;
        ctx.fillStyle = (room.type === "chest") ? "#F39503" : (room.type === "shop") ? "#00FF00" : (room.type === "end") ? "#FFFF00" : "#FF0000";
        const roomSize = 32;
        const roomMargin = 10;
        const roomXOffset = (room.x - ((this.game.dungeonManager.layout.length - 1) / 2));
        const roomYOffset = (((this.game.dungeonManager.layout.length - 1) / 2) - room.y);
        const roomX = config_1.config.width / 2 + (roomXOffset * roomSize) + (roomXOffset * roomMargin);
        const roomY = config_1.config.height / 2 - (roomYOffset * roomSize) - (roomYOffset * roomMargin);
        ctx.fillRect(roomX - roomSize / 2, roomY - roomSize / 2, roomSize, roomSize);
        if (this.game.dungeonManager.currentRoom.x === room.x && this.game.dungeonManager.currentRoom.y === room.y) {
            ctx.shadowBlur = 4;
            ctx.shadowColor = "#FFFFFF";
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 10;
            ctx.beginPath();
            ctx.arc(roomX, roomY, 2, 0, 2 * Math.PI);
            ctx.stroke();
        }
        ctx.shadowBlur = 0;
        // Tunnels
        ctx.fillStyle = "#00FFFF";
        const tunnelSize = roomMargin;
        room.direction.forEach(direction => {
            switch (direction) {
                case dungeonGenerator_1.Direction.up:
                    ctx.fillRect(roomX - tunnelSize, roomY - roomSize / 2 - tunnelSize, tunnelSize * 2, tunnelSize);
                    break;
                case dungeonGenerator_1.Direction.down:
                    ctx.fillRect(roomX - tunnelSize, roomY + roomSize / 2, tunnelSize * 2, tunnelSize);
                    break;
                case dungeonGenerator_1.Direction.left:
                    ctx.fillRect(roomX - roomSize / 2 - tunnelSize, roomY - tunnelSize / 2, tunnelSize, tunnelSize * 2);
                    break;
                case dungeonGenerator_1.Direction.right:
                    ctx.fillRect(roomX + roomSize / 2, roomY - tunnelSize / 2, tunnelSize, tunnelSize * 2);
                    break;
            }
        });
    }
    drawMap(ctx) {
        if (this.game.dungeonManager.layout === null)
            return;
        for (let y = 0; y < this.game.dungeonManager.layout.length; y++) {
            for (let x = 0; x < this.game.dungeonManager.layout[y].length; x++) {
                const room = this.game.dungeonManager.layout[y][x];
                if (room?.discovered === false)
                    continue;
                if (room !== "0") {
                    this.drawRoom({ ...room, x: x, y: y }, ctx);
                }
            }
        }
    }
    draw() {
        if (this.game.dungeonManager.layout === null)
            return;
        if (this.mapNavigator) {
            this.game.ctx.fillStyle = "#000000";
            this.game.ctx.fillRect(0, 0, config_1.config.width, config_1.config.height);
            this.drawMap(this.game.ctx);
        }
    }
    processInput(events) {
        if (this.game.dungeonManager.layout === null || this.game.dungeonManager.currentRoom === null)
            return;
        if (this.game.dungeonManager.currentRoomObject?.type === "dungeon" && !this.game.dungeonManager.currentRoomObject?.dungeonRounds?.cleared)
            return;
        if (!this.mapNavigator)
            return;
        let hspd = 0;
        let vspd = 0;
        const currentRoom = this.game.dungeonManager.currentRoomObject;
        events.filter(event => event.eventType === "KeyDown").forEach(event => {
            event = event;
            switch (event.key.toLowerCase()) {
                case "w":
                    if (!currentRoom.direction.includes(dungeonGenerator_1.Direction.up))
                        break;
                    vspd -= 1;
                    break;
                case "s":
                    if (!currentRoom.direction.includes(dungeonGenerator_1.Direction.down))
                        break;
                    vspd += 1;
                    break;
                case "a":
                    if (!currentRoom.direction.includes(dungeonGenerator_1.Direction.left))
                        break;
                    hspd -= 1;
                    break;
                case "d":
                    if (!currentRoom.direction.includes(dungeonGenerator_1.Direction.right))
                        break;
                    hspd += 1;
                    break;
            }
        });
        if (this.game.dungeonManager.layout[this.game.dungeonManager.currentRoom.y + vspd][this.game.dungeonManager.currentRoom.x] === dungeonGenerator_1.spaceCharacter)
            vspd = 0;
        if (this.game.dungeonManager.layout[this.game.dungeonManager.currentRoom.y][this.game.dungeonManager.currentRoom.x + hspd] === dungeonGenerator_1.spaceCharacter)
            hspd = 0;
        if (hspd === 0 && vspd === 0)
            return;
        const room = this.game.dungeonManager.layout[this.game.dungeonManager.currentRoom.y + vspd]?.[this.game.dungeonManager.currentRoom.x + hspd];
        if (room?.discovered === false)
            this.game.dungeonManager.layout[this.game.dungeonManager.currentRoom.y + vspd][this.game.dungeonManager.currentRoom.x + hspd].discovered = true;
        if (room?.type === "dungeon" && room?.dungeonRounds?.cleared === false) {
            setTimeout(() => {
                this.game.dungeonManager.layout[this.game.dungeonManager.currentRoom.y][this.game.dungeonManager.currentRoom.x].dungeonRounds.active = true;
                this.mapNavigator = false;
            }, 1000);
        }
        // Reset game
        this.game.bullets = [];
        this.game.balls = [];
        this.game.rays = [];
        this.game.dungeonManager.currentRoom.x += hspd;
        this.game.dungeonManager.currentRoom.y += vspd;
    }
}
exports.Map = Map;

},{"../../config":4,"./dungeonGenerator":11}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
const angles_1 = require("../../angles");
const animations_1 = require("../../animations");
const config_1 = require("../../config");
const image_1 = require("../../image");
const sound_1 = require("../../sound");
const guns_1 = require("./guns");
const dashAngles = {
    wa: 225 * (Math.PI / 180),
    wd: 315 * (Math.PI / 180),
    sd: 45 * (Math.PI / 180),
    sa: 135 * (Math.PI / 180),
    w: 270 * (Math.PI / 180),
    s: 90 * (Math.PI / 180),
    a: 180 * (Math.PI / 180),
    d: 0 * (Math.PI / 180)
};
class Player {
    location;
    width;
    height;
    speed;
    hspd;
    vspd;
    image;
    dashingImage;
    coins;
    dashing;
    dashAngle;
    dashDelay;
    lastDash;
    dashSound;
    dashOrigin;
    dashAnimation;
    gun;
    selectedGun;
    gunInventory;
    ammo;
    _lives;
    get lives() { return this._lives; }
    iFrames;
    lastHit;
    hitSound;
    game;
    constructor(x, y, game) {
        this.location = { x: x, y: y };
        this.width = 25;
        this.height = 25;
        this.speed = 0.25;
        this.hspd = 0;
        this.vspd = 0;
        this.image = new image_1.CustomImage("./images/skins/player.png");
        this.dashingImage = new image_1.CustomImage("./images/skins/playerDashing.png");
        this.coins = 0;
        this.dashing = false;
        this.dashAngle = 0;
        this.dashDelay = 750;
        this.lastDash = 0;
        this.dashSound = new sound_1.Sound("./sounds/dash.mp3");
        this.dashOrigin = { x: 0, y: 0 };
        this.dashAnimation = new animations_1.CustomAnimation(120, 200, (movePerFrame) => {
            const location = (0, angles_1.project)(this.location, this.dashAngle, movePerFrame);
            this.location = location;
            // Dash collision
            if (this.location.x > config_1.config.width || this.location.x < 0) {
                this.location.x = (this.location.x < config_1.config.width / 2) ? this.width / 2 : config_1.config.width - this.width / 2;
                this.dashing = false;
            }
            if (this.location.y > config_1.config.height || this.location.y < 0) {
                this.location.y = (this.location.y < config_1.config.height / 2) ? this.height / 2 : config_1.config.height - this.height / 2;
                this.dashing = false;
            }
            return this.dashing;
        }, () => {
            this.dashSound.clonePlay();
            this.dashing = true;
            this.lastDash = this.game.getTicks();
            this.dashOrigin = this.location;
        }, () => {
            this.dashing = false;
        });
        this.gun = guns_1.ak47;
        this.selectedGun = 1;
        this.ammo = {
            [guns_1.Ammo.small]: 100,
            [guns_1.Ammo.medium]: 100,
            [guns_1.Ammo.large]: 100,
            [guns_1.Ammo.shell]: 100
        };
        this.gunInventory = {
            1: this.gun,
            2: null,
            3: null,
            4: null,
            5: null,
            6: null,
            7: null,
            8: null,
            9: null,
        };
        for (let i = 0; i < guns_1.guns.length; i++) {
            this.gunInventory[i + 1] = guns_1.guns[i];
        }
        this._lives = 999;
        this.iFrames = 500;
        this.lastHit = game.getTicks();
        this.hitSound = new sound_1.Sound("./sounds/hitHurt.wav");
        this.game = game;
    }
    set lives(newLives) {
        const damage = this._lives - newLives;
        if (damage === 0)
            return;
        // Heal
        if (damage < 0) {
            this._lives -= damage;
            return;
        }
        if (this.game.getTicks() >= this.lastHit + this.iFrames && !this.dashing) {
            this._lives -= damage;
            this.hitSound.clonePlay();
            if (this.lives < 1) {
                this.game.terminateGame();
                alert("TODO // You died");
                location.reload();
                return;
            }
            // iFrames
            this.lastHit = this.game.getTicks();
        }
    }
    draw() {
        if (this.dashing) {
            this.game.ctx.beginPath();
            this.game.ctx.moveTo(Math.round(this.location.x), Math.round(this.location.y));
            this.game.ctx.strokeStyle = "#0000FF";
            this.game.ctx.lineWidth = 10;
            this.game.ctx.shadowColor = "#0000FF";
            this.game.ctx.shadowBlur = 2;
            this.game.ctx.lineTo(Math.round(this.dashOrigin.x), Math.round(this.dashOrigin.y));
            this.game.ctx.stroke();
        }
        this.game.ctx.shadowColor = "#000000";
        this.game.ctx.shadowBlur = 5;
        this.game.ctx.drawImage((!this.dashing) ? this.image.image : this.dashingImage.image, Math.round(this.location.x - this.width / 2), Math.round(this.location.y - this.height / 2));
        this.game.ctx.shadowBlur = 0;
    }
    update(dt) {
        this.dashAnimation.update(dt);
    }
    processInput(events, pressedKeys, dt) {
        if (this.game.paused)
            return;
        // Weapon switch
        events.filter(event => event.eventType === "KeyDown" && event.raw.code.startsWith("Digit")).forEach(event => {
            event = event;
            const digit = parseInt(event.raw.code.split("Digit")[1]);
            const gun = this.gunInventory[digit];
            if (gun) {
                this.gun = gun;
                this.selectedGun = digit;
            }
        });
        // Dashing
        events.filter(event => event.eventType === "KeyDown" && event.key.toLowerCase() === " ").forEach(() => {
            if (this.dashing)
                return;
            if (!(this.game.getTicks() >= this.lastDash + this.dashDelay))
                return;
            if ((pressedKeys.get("w") || pressedKeys.get("W"))
                && (pressedKeys.get("a") || pressedKeys.get("A"))) {
                this.dashAngle = dashAngles.wa;
            }
            else if ((pressedKeys.get("w") || pressedKeys.get("W"))
                && (pressedKeys.get("d") || pressedKeys.get("D"))) {
                this.dashAngle = dashAngles.wd;
            }
            else if ((pressedKeys.get("s") || pressedKeys.get("S"))
                && (pressedKeys.get("d") || pressedKeys.get("D"))) {
                this.dashAngle = dashAngles.sd;
            }
            else if ((pressedKeys.get("a") || pressedKeys.get("A"))
                && (pressedKeys.get("s") || pressedKeys.get("S"))) {
                this.dashAngle = dashAngles.sa;
            }
            else if (pressedKeys.get("w") || pressedKeys.get("W")) {
                this.dashAngle = dashAngles.w;
            }
            else if (pressedKeys.get("s") || pressedKeys.get("S")) {
                this.dashAngle = dashAngles.s;
            }
            else if (pressedKeys.get("a") || pressedKeys.get("A")) {
                this.dashAngle = dashAngles.a;
            }
            else if (pressedKeys.get("d") || pressedKeys.get("D")) {
                this.dashAngle = dashAngles.d;
            }
            else {
                this.dashAngle = dashAngles.w;
            }
            this.dashAnimation.on = true;
        });
        if (this.dashing)
            return;
        const speed = (pressedKeys.get("c") || pressedKeys.get("C")) ? (this.speed / 2) * dt : this.speed * dt;
        // Horizontal movement
        this.hspd = 0;
        if (pressedKeys.get("a") || pressedKeys.get("A"))
            this.hspd -= speed;
        if (pressedKeys.get("d") || pressedKeys.get("D"))
            this.hspd += speed;
        // Vertical movement
        this.vspd = 0;
        if (pressedKeys.get("w") || pressedKeys.get("W"))
            this.vspd -= speed;
        if (pressedKeys.get("s") || pressedKeys.get("S"))
            this.vspd += speed;
        // Diagonal movement quick patch
        if (this.hspd !== 0 && this.vspd !== 0) {
            this.hspd *= 0.707;
            this.vspd *= 0.707;
        }
        // Apply
        this.location.y += this.vspd;
        this.location.x += this.hspd;
        // Wall collision
        if (this.hspd !== 0) {
            const tempPlayerLoc = this.hspd != 0 && this.location.x + this.hspd + ((this.hspd > 0) ? this.width / 2 : -this.width / 2);
            if (!(tempPlayerLoc > config_1.config.width || tempPlayerLoc < 0)) {
                this.location.x += this.hspd;
            }
            else {
                this.location.x = (this.hspd > 0) ? config_1.config.width - this.width / 2 : 0 + this.width / 2;
            }
        }
        if (this.vspd !== 0) {
            const tempPlayerLoc = this.vspd != 0 && this.location.y + this.vspd + ((this.vspd > 0) ? this.height / 2 : -this.height / 2);
            if (!(tempPlayerLoc > config_1.config.height || tempPlayerLoc < 0)) {
                this.location.y += this.vspd;
            }
            else {
                this.location.y = (this.vspd > 0) ? config_1.config.height - this.height / 2 : 0 + this.height / 2;
            }
        }
    }
}
exports.Player = Player;

},{"../../angles":1,"../../animations":2,"../../config":4,"../../image":6,"../../sound":22,"./guns":15}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopRoom = void 0;
const config_1 = require("../../../config");
const guns_1 = require("../guns");
class ShopRoom {
    items;
    game;
    hoveredItem;
    constructor(items, game) {
        this.items = items;
        this.game = game;
    }
    update() {
    }
    processInput(events) {
        events.filter(event => event.eventType === "KeyUp" && (event.key === "e" || event.key === "E")).forEach(event => {
        });
    }
    draw() {
        let totalWidth = 0;
        for (let i = 0; i < this.items.length; i++)
            totalWidth += 50 * i + 10 * i;
        for (let i = 0; i < this.items.length; i++) {
            /* ---------------------------- Setting the image --------------------------- */
            let image;
            const item = this.items[i];
            if (item.item.type === "health") {
                image = this.game.healthImage.image;
            }
            else if (item.item.type === "coins") {
                image = this.game.coinsImage.image;
            }
            else if (typeof item.item.type.damage !== "undefined") {
                image = item.item.type.image.image;
            }
            else {
                switch (item.item.type) {
                    case guns_1.Ammo.small:
                        image = this.game.smallAmmoImage.image;
                        break;
                    case guns_1.Ammo.medium:
                        image = this.game.mediumAmmoImage.image;
                        break;
                    case guns_1.Ammo.large:
                        image = this.game.largeAmmoImage.image;
                        break;
                    case guns_1.Ammo.shell:
                        image = this.game.shellsAmmoImage.image;
                        break;
                }
            }
            /* ------------------------------- Background ------------------------------- */
            this.game.ctx.fillStyle = "#049301";
            this.game.ctx.fillRect((config_1.config.width / 2 + 50 * i + 10 * i) - totalWidth / 2, 200, 50, 50);
            // ctx.drawImage(this.game.frameImage.image, (config.width / 2 + 50 * i + 10 * i) - totalWidth / 2 + 16, 200 - 16, 32, 32)
            this.game.ctx.drawImage(image, (config_1.config.width / 2 + 50 * i + 10 * i) - totalWidth / 2, 200, 32, 32);
        }
        /* -------------------------------- Shop guy -------------------------------- */
        this.game.ctx.drawImage(this.game.shopGuyImage.image, (config_1.config.width / 2 + 50 * this.items.length + 10 * this.items.length) - totalWidth / 2 + 32, 200 - 32);
        /* ------------------------------ Target dummy ------------------------------ */
        this.game.ctx.drawImage(this.game.dummyImage.image, config_1.config.width - 100, config_1.config.height - 100);
    }
}
exports.ShopRoom = ShopRoom;

},{"../../../config":4,"../guns":15}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DungeonManager = exports.RoundManager = void 0;
const config_1 = require("../../config");
const game_1 = require("../game");
const crate_1 = require("./crate");
const dungeonGenerator_1 = require("./dungeonGenerator");
const ballEnemy_1 = require("./enemies/ballEnemy");
const rangedEnemy_1 = require("./enemies/rangedEnemy");
const spiralEnemy_1 = require("./enemies/spiralEnemy");
class DungeonManager {
    _layout;
    get layout() { return this._layout; }
    set layout(layout) {
        this.currentRoom = { x: (layout.length - 1) / 2, y: (layout.length - 1) / 2 };
        this._layout = layout;
    }
    currentRoom;
    get currentRoomObject() {
        if (this._layout === undefined || this.currentRoom === undefined)
            return null;
        return this._layout[this.currentRoom.y][this.currentRoom.x];
    }
    game;
    constructor(game) {
        this.game = game;
        (0, dungeonGenerator_1.fullGenerate)(game, { layoutSize: 7, rooms: 20 }, [{ type: "shop", count: 5 }, { type: "chest", count: 3 }]).then(layout => {
            this._layout = layout;
            this.currentRoom = { x: (layout.length - 1) / 2, y: (layout.length - 1) / 2 };
            setTimeout(() => {
                this._layout[this.currentRoom.y][this.currentRoom.x].dungeonRounds.active = true;
            }, 1000);
        });
    }
    update(dt) {
        if (this.currentRoomObject !== "0" && this.currentRoomObject !== null) {
            switch (this.currentRoomObject.type) {
                case "dungeon":
                    this.currentRoomObject.dungeonRounds.update();
                    this.game.enemies.forEach(enemy => enemy.update(dt));
                    this.game.bullets.forEach(bullet => bullet.update(dt));
                    this.game.rays.forEach(ray => ray.update());
                    this.game.balls.forEach(ball => ball.update(dt));
                    break;
                case "shop":
                    this.currentRoomObject.shopRoom.update();
                    this.game.bullets.forEach(bullet => bullet.update(dt));
                    break;
            }
        }
    }
    draw() {
        if (this.currentRoomObject !== "0" && this.currentRoomObject !== null) {
            switch (this.currentRoomObject.type) {
                case "dungeon":
                    this.currentRoomObject.dungeonRounds.crates.forEach(crate => crate.draw());
                    this.game.bullets.forEach(bullet => bullet.draw());
                    this.game.rays.forEach(ray => ray.draw());
                    this.game.balls.forEach(ball => ball.draw());
                    this.game.enemies.forEach(enemy => enemy.draw());
                    break;
                case "shop":
                    this.currentRoomObject.shopRoom.draw();
                    break;
            }
        }
    }
}
exports.DungeonManager = DungeonManager;
class RoundManager {
    active;
    cleared;
    rounds;
    round;
    enemiesKilledThisRound;
    roundStart;
    game;
    lastEnemySpawn;
    lastCrateSpawn;
    crates;
    crateId;
    constructor(game) {
        this.active = false;
        this.cleared = false;
        this.crates = [];
        this.crateId = 0;
        this.rounds = [];
        for (let i = 0; i < 1; i++) {
            this.rounds[i] = {
                enemies: 1,
                enemySelection: ["ranged", "ball", "spiral"],
                enemySpawnDelay: 500 + i * 100,
                maxEnemies: 5 + i,
                crateSpawnDelay: 5000,
                maxCrates: (0, game_1.clamp)(10 - i, 1, 10)
            };
        }
        this.enemiesKilledThisRound = 0;
        this.round = 0;
        this.game = game;
        this.lastEnemySpawn = this.game.getTicks();
        this.lastCrateSpawn = this.game.getTicks();
    }
    update() {
        this.crates.forEach(crate => crate.check());
        if (!this.active)
            return;
        if (this.enemiesKilledThisRound >= this.rounds[this.round].enemies) {
            this.round += 1;
            this.enemiesKilledThisRound = 0;
            this.game.enemies = [];
        }
        if (this.round > this.rounds.length - 1) {
            this.active = false;
            this.cleared = true;
            return;
        }
        const round = this.rounds[this.round];
        if (this.game.getTicks() >= this.lastEnemySpawn + round.enemySpawnDelay && this.game.enemies.length < round.maxEnemies) {
            this.lastEnemySpawn = this.game.getTicks();
            let x = 0;
            let y = 0;
            switch (Math.round((0, game_1.random)(0, 3))) {
                // Up / down
                case 0:
                    x = (0, game_1.random)(10, config_1.config.width - 10);
                    y = -10;
                    break;
                case 1:
                    x = (0, game_1.random)(10, config_1.config.width - 10);
                    y = config_1.config.height + 10;
                    break;
                // Left / right
                case 2:
                    x = -10;
                    y = (0, game_1.random)(10, config_1.config.height - 10);
                    break;
                case 3:
                    x = config_1.config.width + 10;
                    y = (0, game_1.random)(10, config_1.config.height - 10);
                    break;
                default:
                    throw new Error("Testing error");
            }
            let enemy = null;
            switch (round.enemySelection[Math.round((0, game_1.random)(0, round.enemySelection.length - 1))]) {
                case "ball":
                    enemy = ballEnemy_1.BallEnemy;
                    break;
                case "ranged":
                    enemy = rangedEnemy_1.RangedEnemy;
                    break;
                case "spiral":
                    enemy = spiralEnemy_1.SpiralEnemy;
                    break;
                // default:
                //     enemy = RangedEnemy
                //     break
            }
            this.game.enemies.push(new (enemy)(x, y, this.game.enemyId, this.game));
            this.game.enemyId += 1;
        }
        if (this.game.getTicks() >= this.lastCrateSpawn + round.crateSpawnDelay && this.crates.length < round.maxCrates) {
            this.lastCrateSpawn = this.game.getTicks();
            this.crates.push(crate_1.Crate.randomCrate(this.crateId, this.game));
            this.crateId += 1;
        }
    }
}
exports.RoundManager = RoundManager;

},{"../../config":4,"../game":8,"./crate":10,"./dungeonGenerator":11,"./enemies/ballEnemy":12,"./enemies/rangedEnemy":13,"./enemies/spiralEnemy":14}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.margin = exports.drawHud = void 0;
const config_1 = require("../config");
const game_1 = require("./game");
const guns_1 = require("./game/guns");
const margin = 16;
exports.margin = margin;
function drawAmmoCounter(number, ammoType, image, ctx, game) {
    ctx.drawImage(image.image, margin * number + 32 * (number - 1), config_1.config.height - (32 + margin));
    ctx.font = "20px serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(game.player.ammo[ammoType].toString(), 32 * (number - 1) + (margin * number + 16) - (ctx.measureText(game.player.ammo[ammoType].toString()).width) / 2, config_1.config.height - (32 + margin * 1.5));
    if (game.player.gun.ammo === ammoType) {
        // Cooldown screen
        const cooldownPercent = ((((0, game_1.clamp)(game.getTicks() - game.lastShot, 0, game.player.gun.shootDelay)) - game.player.gun.shootDelay) * -1) / game.player.gun.shootDelay;
        const length = 32 * cooldownPercent;
        ctx.fillRect(32 * (number - 1) + (margin * number + 16) - length / 2, config_1.config.height - (margin), length, margin / 4);
    }
}
function drawInventoryGunSlot(number, gun, ctx, margin, game) {
    const x = game.showInventoryX;
    const y = margin * 3 + 16 + (64 * number) + (margin / 2 * number);
    ctx.drawImage(game.frameImage.image, x, y);
    if (gun)
        ctx.drawImage(gun.image.image, x, y);
    ctx.font = "20px serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText((number + 1).toString(), x - ctx.measureText((number + 1).toString()).width + 64 - margin / 2, y + 22);
}
function drawHud(ctx, game) {
    /* --------------------------------- Ammo ---------------------------------- */
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#000000";
    drawAmmoCounter(1, guns_1.Ammo.small, game.smallAmmoImage, ctx, game);
    drawAmmoCounter(2, guns_1.Ammo.medium, game.mediumAmmoImage, ctx, game);
    drawAmmoCounter(3, guns_1.Ammo.large, game.largeAmmoImage, ctx, game);
    drawAmmoCounter(4, guns_1.Ammo.shell, game.shellsAmmoImage, ctx, game);
    /* ---------------------------------- Lives --------------------------------- */
    ctx.shadowColor = "#FD0100";
    ctx.drawImage(game.healthImage.image, margin, margin);
    ctx.font = "20px serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.shadowColor = "#000000";
    ctx.fillText(game.player.lives.toString(), margin * 2 + 32, margin + 16);
    /* ---------------------------------- Coins --------------------------------- */
    ctx.shadowColor = "#FFDF00";
    ctx.drawImage(game.coinsImage.image, margin, margin * 2 + 32);
    ctx.font = "20px serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.shadowColor = "#000000";
    ctx.fillText(game.player.coins.toString(), margin * 2 + 32, margin * 2 + 32 + 16);
    /* ------------------------------ Gun selector ------------------------------ */
    ctx.shadowBlur = 2;
    ctx.drawImage(game.frameImage.image, margin, config_1.config.height - (32 * 4 + margin));
    ctx.drawImage(game.player.gun.image.image, margin, config_1.config.height - (32 * 4 + margin));
    for (let i = 0; i < 9; i++) {
        const gun = game.player.gunInventory[i + 1];
        drawInventoryGunSlot(i, gun, ctx, margin, game);
    }
    /* ------------------------------ Custom cursor ----------------------------- */
    ctx.shadowBlur = 4;
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(game.mouse.x, game.mouse.y, 5, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(game.mouse.x, game.mouse.y, 5, 0, 2 * Math.PI);
    ctx.stroke();
    /* ------------------------------ Current round ----------------------------- */
    if (game.dungeonManager.currentRoomObject !== "0" && game.dungeonManager.currentRoomObject?.type === "dungeon" && game.dungeonManager.currentRoomObject.dungeonRounds.active) {
        ctx.shadowBlur = 10;
        ctx.font = "20px serif";
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(`Round: ${game.dungeonManager.currentRoomObject.dungeonRounds.round + 1} / ${game.dungeonManager.currentRoomObject.dungeonRounds.rounds.length}`, config_1.config.width - ctx.measureText(`Round: ${game.dungeonManager.currentRoomObject.dungeonRounds.round + 1} / ${game.dungeonManager.currentRoomObject.dungeonRounds.rounds.length}`).width - margin, margin + 16);
    }
    /* ----------------------------- System messages ---------------------------- */
    ctx.font = "20px verdana";
    ctx.fillStyle = "#FF0000";
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#000000";
    const removedMessages = [];
    for (let i = 0; i < game.systemMessages.length; i++) {
        const systemMessage = game.systemMessages[i];
        if (game.getTicks() >= systemMessage.sentAt + 2000) {
            removedMessages.push(systemMessage.id);
            continue;
        }
        ctx.fillText(systemMessage.message, config_1.config.width / 2 - ctx.measureText(systemMessage.message).width / 2, margin * 2 + 20 * i);
    }
    if (removedMessages.length > 0)
        game.systemMessages = game.systemMessages.filter(msg => !removedMessages.includes(msg.id));
    ctx.shadowBlur = 0;
}
exports.drawHud = drawHud;

},{"../config":4,"./game":8,"./game/guns":15}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shooting = void 0;
const angles_1 = require("../angles");
const bullet_1 = require("./game/bullet");
function shooting(game) {
    if (game.player.ammo[game.player.gun.ammo] > 0) {
        game.player.ammo[game.player.gun.ammo] = game.player.ammo[game.player.gun.ammo] - 1;
        const angle = (0, angles_1.getAngle)(game.player.location, game.mouse);
        game.player.gun.sound.clonePlay();
        for (let i = 0; i < game.player.gun.bullets; i++) {
            game.bullets.push(new bullet_1.Bullet(game.player.location.x, game.player.location.y, 10, 10, angle, 1, game.bulletId, game.player.gun.inaccuracy, game.player.gun.damage, game.player.gun.range, game));
            game.bulletId += 1;
        }
        game.lastShot = game.getTicks();
    }
    else {
        game.noAmmoSound.clonePlay();
        game.lastShot = game.getTicks();
    }
}
exports.shooting = shooting;

},{"../angles":1,"./game/bullet":9}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.volume = exports.Sound = void 0;
const game_1 = require("./scenes/game");
class SoundVolume {
    _volume;
    get volume() { return this._volume; }
    set volume(newVolume) {
        newVolume = (0, game_1.clamp)(newVolume, 0, 1);
        this._volume = newVolume;
    }
    constructor(volume = 1) {
        this._volume = volume;
    }
}
const volume = new SoundVolume();
exports.volume = volume;
class Sound {
    sound;
    constructor(source) {
        this.sound = document.createElement("audio");
        this.sound.src = source;
        this.sound.setAttribute("preload", "auto");
        this.sound.setAttribute("controls", "none");
        this.sound.style.display = "none";
        this.sound.volume = volume.volume;
        document.body.appendChild(this.sound);
    }
    clonePlay() {
        // Clone node to overlap sound
        this.sound.volume = volume.volume;
        const clonedAudio = this.sound.cloneNode();
        clonedAudio.play();
    }
    play() {
        this.sound.volume = volume.volume;
        this.sound.play();
    }
    stop() {
        this.sound.pause();
    }
}
exports.Sound = Sound;

},{"./scenes/game":8}]},{},[7]);
