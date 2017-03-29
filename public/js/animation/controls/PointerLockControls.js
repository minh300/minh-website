/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.PointerLockControls = function(camera) {
    this.id = Math.random();

    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.canJump = false;
    this.prevTime = performance.now();
    this.velocity = new THREE.Vector3();

    var scope = this;

    camera.rotation.set(0, 0, 0);

    var pitchObject = new THREE.Object3D();
    pitchObject.add(camera);

    var yawObject = new THREE.Object3D();
    yawObject.position.y = 10;
    yawObject.add(pitchObject);

    var PI_2 = Math.PI / 2;

    var onMouseMove = function(event) {

        if (scope.enabled === false) return;

        var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

        yawObject.rotation.y -= movementX * 0.002;
        pitchObject.rotation.x -= movementY * 0.002;

        pitchObject.rotation.x = Math.max(-PI_2, Math.min(PI_2, pitchObject.rotation.x));
    };

    this.dispose = function() {

        document.removeEventListener('mousemove', onMouseMove, false);

    };

    document.addEventListener('mousemove', onMouseMove, false);

    this.enabled = false;

    this.getObject = function() {

        return yawObject;

    };

    this.getDirection = function() {

        // assumes the camera itself is not rotated

        var direction = new THREE.Vector3(0, 0, -1);
        var rotation = new THREE.Euler(0, 0, 0, "YXZ");

        return function(v) {

            rotation.set(pitchObject.rotation.x, yawObject.rotation.y, 0);

            v.copy(direction).applyEuler(rotation);

            return v;

        };

    }();



    this.onKeyDown = function(event) {
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
    this.onKeyUp = function(event) {
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
        }

    };


    var _onKeyDown = bind(this, this.onKeyDown);
    var _onKeyUp = bind(this, this.onKeyUp);

    document.addEventListener('keydown', _onKeyDown, false);
    document.addEventListener('keyup', _onKeyUp, false);


    this.update = function() {

        var time = performance.now();
        var delta = (time - this.prevTime) / 1000;
        if (!transitionParams.animateTransition) {

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
            this.getObject().translateX(this.velocity.x * delta);
            this.getObject().translateY(this.velocity.y * delta);
            this.getObject().translateZ(this.velocity.z * delta);

            if (this.getObject().position.y < 10) {
                this.velocity.y = 0;
                this.getObject().position.y = 10;
                this.canJump = true;
            }

        } else {
            this.moveForward = this.moveRight = this.moveLeft = this.moveBackward = false;
        }
        this.prevTime = time;
    }

};

function bind(scope, fn) {

    return function() {

        fn.apply(scope, arguments);

    };

}
