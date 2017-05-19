/**
 *
 * A modified pointer lock control
 */

THREE.PointerLockControls = function(camera) {
    this.id = Math.random();

    this.mouse = new THREE.Vector2();
    this.mouseDown = false;
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.canJump = false;
    this.prevTime = performance.now();
    this.velocity = new THREE.Vector3();
    this.increaseDecay = false;
    this.decreaseDecay = false;

    camera.rotation.set(0, 0, 0);
    this.pitchObject = new THREE.Object3D();
    this.pitchObject.add(camera);

    this.yawObject = new THREE.Object3D();
    this.yawObject.position.set(0, 11, 100);

    this.yawObject.add(this.pitchObject);

    this.enabled = false;
    this.pointerLockEnabled = false;

    this.getDirection = function() {

        // assumes the camera itself is not rotated

        var direction = new THREE.Vector3(0, 0, -1);
        var rotation = new THREE.Euler(0, 0, 0, "YXZ");

        return function(v) {

            rotation.set(pitchObject.rotation.x, yawObject.rotation.y, 0);

            v.copy(direction).applyEuler(rotation);

            return v;

        };

    };


    var _onKeyDown = bind(this, this.onKeyDown);
    var _onKeyUp = bind(this, this.onKeyUp);
    var _onMouseDown = bind(this, this.onMouseDown);
    var _onMouseUp = bind(this, this.onMouseUp);
    var _onMouseMove = bind(this, this.onMouseMove);

    document.addEventListener('keydown', _onKeyDown, false);
    document.addEventListener('keyup', _onKeyUp, false);
    document.addEventListener('mousedown', _onMouseDown, false);
    document.addEventListener('mouseup', _onMouseUp, false);
    document.addEventListener('mousemove', _onMouseMove, false);

    var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
    if (havePointerLock) {
        var _pointerlockchange = bind(this, this.pointerlockchange);
        // Hook pointer lock state change events
        document.addEventListener('pointerlockchange', _pointerlockchange, false);
        document.addEventListener('mozpointerlockchange', _pointerlockchange, false);
        document.addEventListener('webkitpointerlockchange', _pointerlockchange, false);
    } else {
        alert('Your browser doesn\'t seem to support Pointer Lock API');
    }
};



THREE.PointerLockControls.prototype.pointerlockchange = function(event) {
    var element = document.body;

    if (document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element) {
        this.pointerLockEnabled = true;
    } else {
        this.pointerLockEnabled = false;
    }
};

THREE.PointerLockControls.prototype.onMouseMove = function(event) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    if (this.pointerLockEnabled === false) return;

    var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

    this.yawObject.rotation.y -= movementX * 0.002;
    this.pitchObject.rotation.x -= movementY * 0.002;
    var PI_2 = Math.PI / 2;

    this.pitchObject.rotation.x = Math.max(-PI_2, Math.min(PI_2, this.pitchObject.rotation.x));
};

THREE.PointerLockControls.prototype.onKeyDown = function(event) {
    if (this.enabled === false) return;

    switch (event.keyCode) {

        case 38: // up
        case 87: // w
            this.moveForward = true;
            break;
        case 37: // left
        case 65: // a
            this.moveLeft = true;
            break;
        case 40: // down
        case 83: // s
            this.moveBackward = true;
            break;
        case 39: // right
        case 68: // d
            this.moveRight = true;
            break;
        case 32: // space
            if (this.canJump === true) this.velocity.y += 350;
            this.canJump = false;
            break;
    }

};
THREE.PointerLockControls.prototype.onKeyUp = function(event) {
    if (this.enabled === false) return;

    switch (event.keyCode) {
        case 38: // up
        case 87: // w
            this.moveForward = false;
            break;
        case 37: // left
        case 65: // a
            this.moveLeft = false;
            break;
        case 40: // down
        case 83: // s
            this.moveBackward = false;
            break;
        case 39: // right
        case 68: // d
            this.moveRight = false;
            break;
        case 70: //f
            var element = document.body;

            // Ask the browser to lock the pointer
            if (document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element) {
                document.exitPointerLock();
            } else {
                element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
                element.requestPointerLock();
            }
            break;
        case 82: // r
            sceneManager.transitionTo(sceneManager.currentScene == 0 ? 4 : 0);
            break;
    }
};

THREE.PointerLockControls.prototype.onMouseDown = function(event) {
    this.mouseDown = true;
};

THREE.PointerLockControls.prototype.onMouseUp = function(event) {
    this.mouseDown = false;
};

THREE.PointerLockControls.prototype.update = function() {
    if (this.enabled === false) return;

    var time = performance.now();
    var delta = (time - this.prevTime) / 1000;
    if (!sceneManager.animateTransition) {

        this.velocity.x -= this.velocity.x * 10.0 * delta;
        this.velocity.z -= this.velocity.z * 10.0 * delta;
        this.velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass
        if (this.moveForward) this.velocity.z -= 400.0 * delta;
        if (this.moveBackward) this.velocity.z += 400.0 * delta;
        if (this.moveLeft) this.velocity.x -= 400.0 * delta;
        if (this.moveRight) this.velocity.x += 400.0 * delta;
        if (this.isOnObject === true) {
            this.velocity.y = Math.max(0, this.velocity.y);
            this.canJump = true;
        }
        this.yawObject.translateX(this.velocity.x * delta);
        this.yawObject.translateY(this.velocity.y * delta);
        this.yawObject.translateZ(this.velocity.z * delta);

        if (this.yawObject.position.y < 10) {
            this.velocity.y = 0;
            this.yawObject.position.y = 10;
            this.canJump = true;
        }

    } else {
        this.moveForward = this.moveRight = this.moveLeft = this.moveBackward = false;
    }
    this.prevTime = time;
}
THREE.PointerLockControls.prototype.moveTo = function(x, y, z) {
    this.moveForward = true;
};

function bind(scope, fn) {

    return function() {

        fn.apply(scope, arguments);

    };

}
