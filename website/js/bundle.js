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
    width: 750
};
exports.config = config;

},{}],5:[function(require,module,exports){
"use strict";
// Key keeper
Object.defineProperty(exports, "__esModule", { value: true });
exports.wait = exports.play = exports.BaseScene = void 0;
const pressedKeys = new Map();
let eventQueue = [];
// EVENTS
// Prevent multiple keydown:
const alreadyFired = new Map();
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
    eventQueue.push({
        eventType: "MouseMove",
        raw: event
    });
};
document.onmousedown = (event) => {
    pressedKeys.set((event.button === 0) ? "Mouse Left" : (event.button === 1) ? "Mouse Middle" : (event.button === 2) ? "Mouse Right" : "Mouse Unknown", true);
    eventQueue.push({
        eventType: "MouseDown",
        raw: event
    });
};
document.onmouseup = (event) => {
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
 * Start the game
 */
async function play(startingScene, fps, canvas) {
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    let t = performance.now();
    let timeLastFrame = t;
    let scene = startingScene;
    startingScene.canvas = canvas;
    while (scene !== null) {
        // Delta time
        t = performance.now();
        const deltaTime = t - timeLastFrame;
        timeLastFrame = t;
        // Processing new events
        const events = eventQueue;
        eventQueue = []; // Clear event queue
        // Send data to the scene
        startingScene.processInput(events, pressedKeys, deltaTime);
        startingScene.update(deltaTime);
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear screen
        startingScene.draw(ctx);
        scene = startingScene.next; // Set next scene
        if (!scene.canvas)
            scene.canvas = canvas;
        await wait(1000 / fps);
    }
}
exports.play = play;
class BaseScene {
    next;
    /**
     * Canvas will be automatically set by the {@link play} function
     */
    canvas;
    constructor() {
        this.next = this;
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
    draw(ctx) {
        throw new Error("draw wasn't overridden");
    }
}
exports.BaseScene = BaseScene;

},{}],6:[function(require,module,exports){
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
if (canvas.width != config_1.config.width)
    throw new Error("Canvas \"game\" width doesn't match the config!");
if (canvas.height != config_1.config.height)
    throw new Error("Canvas \"game\" height doesn't match the config!");
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
const dungeonGenerator_1 = require("./game/dungeonGenerator");
const map_1 = require("./game/map");
const player_1 = require("./game/player");
const roundManager_1 = require("./game/roundManager");
const hud_1 = require("./hud");
const shooting_1 = require("./shooting");
function random(min, max) {
    return (Math.random() * (max - min)) + min;
}
exports.random = random;
class GameScene extends game_1.BaseScene {
    /* ---------------------------------- Misc ---------------------------------- */
    player;
    mouse;
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
    crates;
    crateId;
    cratePickupSound;
    /* -------------------------------- Managers -------------------------------- */
    roundManager;
    dungeonManager;
    map;
    /* --------------------------------- Images --------------------------------- */
    healthImage;
    crateImage;
    frameImage;
    smallAmmoImage;
    mediumAmmoImage;
    largeAmmoImage;
    shellsAmmoImage;
    rangedEnemyImage;
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
        this.mouse = { x: 0, y: 0 };
        this.crates = [];
        this.crateId = 0;
        this.cratePickupSound = new sound_1.Sound("./sounds/pickupCoin.wav");
        this.roundManager = new roundManager_1.RoundManager(this);
        this.dungeonManager = new roundManager_1.DungeonManager(this);
        this.map = new map_1.Map(this);
        this.healthImage = new image_1.CustomImage("./images/health.png");
        this.crateImage = new image_1.CustomImage("./images/crate.png");
        this.frameImage = new image_1.CustomImage("./images/guns/frame.png");
        this.smallAmmoImage = new image_1.CustomImage("./images/smallammo.png");
        this.mediumAmmoImage = new image_1.CustomImage("./images/mediumammo.png");
        this.largeAmmoImage = new image_1.CustomImage("./images/largeammo.png");
        this.shellsAmmoImage = new image_1.CustomImage("./images/shellsammo.png");
        this.rangedEnemyImage = new image_1.CustomImage("./images/skins/rangedEnemy.png");
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
                case "MouseMove":
                    event = event;
                    // Set relative to canvas window
                    const rect = this.canvas?.getBoundingClientRect();
                    this.mouse = { x: event.raw.clientX - rect.left, y: event.raw.clientY - rect.top };
                    break;
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
                            this.canvas.requestFullscreen();
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
                            this.map.mapNavigator = !this.map.mapNavigator;
                            console.log("📓 ~ file: game.ts ~ line 193 ~ this.map.mapNavigator", this.map.mapNavigator);
                            break;
                        case "g":
                            (0, dungeonGenerator_1.fullGenerate)(this, { layoutSize: 7, rooms: 20 }, [{ type: "shop", count: 5 }]).then(layout => {
                                this.dungeonManager.layout = layout;
                            });
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
        // Round
        this.roundManager.update();
        // Player
        this.player.update(dt);
        // Crates
        this.crates.forEach(crate => crate.check());
        // Enemies
        this.enemies.forEach(enemy => enemy.update(dt));
        // Bullets / rays
        this.bullets.forEach(bullet => bullet.update(dt));
        this.rays.forEach(ray => ray.update());
        this.balls.forEach(ball => ball.update(dt));
        // Animation
        this.showInventoryAnimation.update(dt);
        this.hideInventoryAnimation.update(dt);
    }
    draw(ctx) {
        ctx.fillStyle = "#5a6988";
        ctx.fillRect(0, 0, config_1.config.width, config_1.config.height);
        this.crates.forEach(crate => crate.draw(ctx));
        this.bullets.forEach(bullet => bullet.draw(ctx));
        this.rays.forEach(ray => ray.draw(ctx));
        this.balls.forEach(ball => ball.draw(ctx));
        this.enemies.forEach(enemy => enemy.draw(ctx));
        this.player.draw(ctx);
        (0, hud_1.drawHud)(ctx, this);
        this.map.draw(ctx);
    }
    getTicks() {
        return performance.now();
    }
}
exports.GameScene = GameScene;
function clamp(number, min, max) {
    return Math.min(Math.max(number, min), max);
}
exports.clamp = clamp;

},{"../animations":2,"../config":4,"../game":5,"../image":6,"../sound":21,"./game/dungeonGenerator":11,"./game/map":16,"./game/player":17,"./game/roundManager":18,"./hud":19,"./shooting":20}],9:[function(require,module,exports){
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
    draw(ctx) {
        ctx.shadowBlur = 5;
        ctx.shadowColor = "#000000";
        ctx.fillStyle = (this.hitPlayer) ? "#8d1b1f" : "#0000FF";
        ctx.fillRect(this.location.x - this.width / 2, this.location.y - this.width / 2, this.width, this.height);
        ctx.shadowBlur = 0;
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
        if ((0, collision_1.touches)((0, collision_1.xywdToCollisionRect)(this.game.player.location.x, this.game.player.location.y, this.game.player.width, this.game.player.height), (0, collision_1.xywdToCollisionRect)(this.location.x, this.location.y, 64, 64))) {
            this.game.crates = this.game.crates.filter(crate => crate.id != this.id);
            this.pickups.forEach(pickup => {
                this.game.cratePickupSound.clonePlay();
                const anyPickup = pickup;
                if (pickup.type === "Health") {
                    this.game.player.lives += pickup.amount;
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
    draw(ctx) {
        ctx.drawImage(this.image.image, Math.round(this.location.x - 32), Math.round(this.location.y - 32));
    }
    /**
     * Only for **HEALTH** or **AMMO**
     */
    static randomCrate(id, game, image) {
        const type = (Math.random() < 0.5) ? "Health" : randomEnum(guns_1.Ammo);
        return new this((0, game_1.random)(0 + 32, config_1.config.width - 32), (0, game_1.random)(0 + 32, config_1.config.height - 32), [{
                type: type,
                amount: (type === "Health") ? 1 : Math.round((0, game_1.random)(10, 100))
            }], id, game, image);
    }
}
exports.Crate = Crate;

},{"../../collision":3,"../../config":4,"../game":8,"./guns":15}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.spaceCharacter = exports.Direction = exports.printLayout = exports.fullGenerate = void 0;
const game_1 = require("../../game");
const game_2 = require("../game");
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
        direction: [Direction.up],
        type: "dungeon",
        dungeonRounds: new roundManager_1.RoundManager(game),
        discovered: false
    };
    let found = false;
    while (!found) {
        returnRoom = {
            x: lastRoom.x,
            y: lastRoom.y,
            direction: [Direction.up],
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
            resolve(layout);
        });
    });
}
exports.fullGenerate = fullGenerate;

},{"../../game":5,"../game":8,"./roundManager":18}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BallEnemy = exports.Ball = void 0;
const angles_1 = require("../../../angles");
const config_1 = require("../../../config");
const game_1 = require("../../game");
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
    draw(ctx) {
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(this.location.x, this.location.y, this.radius + 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#FD0100";
        ctx.fillStyle = "#8d1b1f";
        ctx.beginPath();
        ctx.arc(this.location.x, this.location.y, this.radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.shadowBlur = 0;
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
            this.game.roundManager.enemiesKilledThisRound += 1;
            return true;
        }
        return false;
    }
    draw(ctx) {
        ctx.fillStyle = "#FFFF00";
        ctx.shadowBlur = 4;
        ctx.shadowColor = "#000000";
        ctx.fillRect(Math.round(this.location.x - this.width / 2), Math.round(this.location.y - this.height / 2), this.width, this.height);
        ctx.shadowBlur = 0;
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

},{"../../../angles":1,"../../../config":4,"../../game":8,"./rangedEnemy":13}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findAngle = exports.lineRect = exports.lineLine = exports.Ray = exports.RangedEnemy = void 0;
const angles_1 = require("../../../angles");
const config_1 = require("../../../config");
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
    draw(ctx) {
        switch (this.state) {
            case "wind":
                ctx.beginPath();
                ctx.moveTo(this.location.x, this.location.y);
                ctx.strokeStyle = "#808080";
                ctx.lineWidth = 2;
                ctx.lineTo(this.destinationX, this.destinationY);
                ctx.stroke();
                if (!this.disableBall) {
                    ctx.fillStyle = "#8d1b1f";
                    ctx.beginPath();
                    ctx.arc(this.location.x, this.location.y, 10, 0, 2 * Math.PI);
                    ctx.fill();
                }
                break;
            case "fire":
                ctx.beginPath();
                ctx.moveTo(this.location.x, this.location.y);
                ctx.shadowBlur = 15;
                ctx.shadowColor = "#FD0100";
                ctx.strokeStyle = "#8d1b1f";
                ctx.lineWidth = 10;
                ctx.lineTo(this.destinationX, this.destinationY);
                ctx.stroke();
                ctx.shadowBlur = 0;
                if (!this.disableBall) {
                    ctx.fillStyle = "#8d1b1f";
                    ctx.beginPath();
                    ctx.arc(this.location.x, this.location.y, 10, 0, 2 * Math.PI);
                    ctx.fill();
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
            this.game.roundManager.enemiesKilledThisRound += 1;
            return true;
        }
        return false;
    }
    draw(ctx) {
        ctx.shadowBlur = 4;
        ctx.shadowColor = "#000000";
        ctx.drawImage(this.game.rangedEnemyImage.image, Math.round(this.location.x - this.width / 2), Math.round(this.location.y - this.height / 2));
        ctx.shadowBlur = 0;
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

},{"../../../angles":1,"../../../config":4}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpiralEnemy = void 0;
const angles_1 = require("../../../angles");
const bullet_1 = require("../bullet");
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
            this.game.roundManager.enemiesKilledThisRound += 1;
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
    draw(ctx) {
        ctx.fillStyle = (this.station) ? "#FFFF90" : "#00FFFF";
        ctx.shadowBlur = 4;
        ctx.shadowColor = "#000000";
        ctx.fillRect(Math.round(this.location.x - this.width / 2), Math.round(this.location.y - this.height / 2), this.width, this.height);
        ctx.shadowBlur = 0;
    }
}
exports.SpiralEnemy = SpiralEnemy;

},{"../../../angles":1,"../bullet":9}],15:[function(require,module,exports){
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

},{"../../image":6,"../../sound":21}],16:[function(require,module,exports){
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
        const roomSize = 64;
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
            ctx.shadowBlur = 0;
        }
        // Tunnels
        ctx.fillStyle = "#00FFFF";
        const tunnelSize = roomMargin;
        room.direction.forEach(direction => {
            switch (direction) {
                case dungeonGenerator_1.Direction.up:
                    // ctx.fillStyle = "#00FFFF"
                    ctx.fillRect(roomX - tunnelSize, roomY - roomSize / 2 - tunnelSize, tunnelSize * 2, tunnelSize);
                    break;
                case dungeonGenerator_1.Direction.down:
                    // ctx.fillStyle = "#FFFF00"
                    ctx.fillRect(roomX - tunnelSize, roomY + roomSize / 2, tunnelSize * 2, tunnelSize);
                    break;
                case dungeonGenerator_1.Direction.left:
                    // ctx.fillStyle = "#FF00FF"
                    ctx.fillRect(roomX - roomSize / 2 - tunnelSize, roomY - tunnelSize / 2, tunnelSize, tunnelSize * 2);
                    break;
                case dungeonGenerator_1.Direction.right:
                    // ctx.fillStyle = "#5920F0"
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
    draw(ctx) {
        if (this.game.dungeonManager.layout === null)
            return;
        if (this.mapNavigator) {
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, config_1.config.width, config_1.config.height);
            this.drawMap(ctx);
        }
    }
    processInput(events) {
        if (this.game.dungeonManager.layout === null || this.game.dungeonManager.currentRoom === null)
            return;
        if (this.game.roundManager.active)
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
        if (this.game.dungeonManager.layout[this.game.dungeonManager.currentRoom.y + vspd]?.[this.game.dungeonManager.currentRoom.x + hspd]?.discovered === false) {
            this.game.dungeonManager.layout[this.game.dungeonManager.currentRoom.y + vspd][this.game.dungeonManager.currentRoom.x + hspd].discovered = true;
        }
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
    draw(ctx) {
        if (this.dashing) {
            ctx.beginPath();
            ctx.moveTo(Math.round(this.location.x), Math.round(this.location.y));
            ctx.strokeStyle = "#0000FF";
            ctx.lineWidth = 10;
            ctx.shadowColor = "#0000FF";
            ctx.shadowBlur = 2;
            ctx.lineTo(Math.round(this.dashOrigin.x), Math.round(this.dashOrigin.y));
            ctx.stroke();
        }
        ctx.shadowColor = "#000000";
        ctx.shadowBlur = 5;
        ctx.drawImage((!this.dashing) ? this.image.image : this.dashingImage.image, Math.round(this.location.x - this.width / 2), Math.round(this.location.y - this.height / 2));
        ctx.shadowBlur = 0;
    }
    update(dt) {
        // if (this.dashing) {
        //     const movePerFrame = ((this.dashDistance) / (this.dashLength)) * dt
        //     this.dashFrame += 1 * dt
        //     const location = project({
        //         x: this.x,
        //         y: this.y
        //     }, this.dashAngle, movePerFrame)
        //     this.x = location.x
        //     this.y = location.y
        //     // Dash collision
        //     if (this.x > config.width || this.x < 0) {
        //         this.x = (this.x < config.width / 2) ? this.width / 2 : config.width - this.width / 2
        //         this.dashing = false
        //     }
        //     if (this.y > config.height || this.y < 0) {
        //         this.y = (this.y < config.height / 2) ? this.height / 2 : config.height - this.height / 2
        //         this.dashing = false
        //     }
        //     if (this.dashFrame >= this.dashLength) {
        //         this.dashing = false
        //     }
        // }
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

},{"../../angles":1,"../../animations":2,"../../config":4,"../../image":6,"../../sound":21,"./guns":15}],18:[function(require,module,exports){
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
        if (this._layout === null || this.currentRoom === null)
            return null;
        return this._layout[this.currentRoom.y][this.currentRoom.x];
    }
    constructor(game) {
        (0, dungeonGenerator_1.fullGenerate)(game, { layoutSize: 7, rooms: 20 }, [{ type: "shop", count: 5 }, { type: "chest", count: 3 }]).then(layout => {
            this._layout = layout;
            this.currentRoom = { x: (layout.length - 1) / 2, y: (layout.length - 1) / 2 };
        });
    }
}
exports.DungeonManager = DungeonManager;
class RoundManager {
    active;
    rounds;
    round;
    enemiesKilledThisRound;
    roundStart;
    game;
    lastEnemySpawn;
    lastCrateSpawn;
    constructor(game) {
        this.active = false;
        this.rounds = [];
        for (let i = 0; i < 10; i++) {
            this.rounds[i] = {
                enemies: 10,
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
        if (!this.active)
            return;
        if (this.enemiesKilledThisRound >= this.rounds[this.round].enemies) {
            this.round += 1;
            this.enemiesKilledThisRound = 0;
            this.game.enemies = [];
            this.game.crates = [];
        }
        if (this.round > this.rounds.length - 1) {
            this.active = false;
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
        if (this.game.getTicks() >= this.lastCrateSpawn + round.crateSpawnDelay && this.game.crates.length < round.maxCrates) {
            this.lastCrateSpawn = this.game.getTicks();
            this.game.crates.push(crate_1.Crate.randomCrate(this.game.crateId, this.game, this.game.crateImage));
            this.game.crateId += 1;
        }
    }
}
exports.RoundManager = RoundManager;

},{"../../config":4,"../game":8,"./crate":10,"./dungeonGenerator":11,"./enemies/ballEnemy":12,"./enemies/rangedEnemy":13,"./enemies/spiralEnemy":14}],19:[function(require,module,exports){
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
// function drawUpdate(dt: number, game: GameScene) {
//     // TODO Finish this up check back in with player.ts because this aint working!
//     const movePerFrame = ((game.showInventoryAnimationHideX - game.showInventoryAnimationShowX) / (game.showInventoryAnimationLength)) * dt
//     game.showInventoryAnimationFrame += 1 * dt
//     game.showInventoryAnimationX -= movePerFrame
//     console.log("MovePerFrame: ", movePerFrame, "X: ", game.showInventoryAnimationX)
//     if (game.showInventoryAnimationFrame >= game.showInventoryAnimationLength) {
//         game.showInventoryAnimationX = game.showInventoryAnimationShowX
//         game.showInventoryAnimation = false
//     }
// }
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
    ctx.shadowBlur = 10;
    ctx.font = "20px serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(`Round: ${game.roundManager.round}`, config_1.config.width - ctx.measureText(`Round: ${game.roundManager.round}`).width - margin, margin + 16);
    ctx.shadowBlur = 0;
}
exports.drawHud = drawHud;

},{"../config":4,"./game":8,"./game/guns":15}],20:[function(require,module,exports){
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

},{"../angles":1,"./game/bullet":9}],21:[function(require,module,exports){
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
