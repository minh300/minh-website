function CenterObject(wrapper, color, i, total) {
    var scene = wrapper.scene;
    var floor = wrapper.floor;
    var dotFloor = wrapper.dotFloor;
    var snow = wrapper.snow;
    var ring = wrapper.ring;
    var topLevelObject = wrapper.topLevelObject;
    var topLevelObject2 = wrapper.topLevelObject2;
    var objYaw = wrapper.objYaw;
    var yawRotation = wrapper.yawRotation;
    var cubeCamera = wrapper.cubeCamera1;
    var sphereCount = 5;
    var objects = wrapper.objects;
    var hsl = color.getHSL();
    var reflectMaterial = new THREE.MeshPhysicalMaterial({
        envMap: cubeCamera.renderTarget.texture,
        reflectivity: 1,
        color: color
    });
    var geometry = new THREE.SphereBufferGeometry(4, 32, 16);


    THREE.Mesh.call(this, geometry, reflectMaterial);

    this.id = i;

    this.randomPos = {
        x: Math.random() * 160 - 80,
        y: 2,
        z: Math.random() * 160 - 80
    };

    var angle = (i * 360 / total) * Math.PI / 180;
    var radius = 10;
    this.circlePos = {
        x: radius * Math.cos(angle),
        y: 12.5,
        z: radius * Math.sin(angle)
    };

    this.position.x = Math.random() * 40 - 20;
    this.position.y = 2;
    this.position.z = Math.random() * 40 - 20;

    this.onHover = function() {
        this.material.color.setHSL(hsl.h, hsl.s, 1);
        //change color
    }

    this.offHover = function() {
        this.material.color.setHSL(hsl.h, hsl.s, hsl.l);
    }



    this.onClick = function() {
        var me = this;
        var start = {
            far: 100,
            saturation: 54,
            opacity: 100,
        }
        var target = {
            far: 600,
            saturation: 100,
            opacity: 0,
        };
        if (me.clicked) {
            floor.material.visible = true;

            var tween = new TWEEN.Tween(target).to(start, 1000).onUpdate(function() {
                floor.material.opacity = target.opacity;
                floor.material.color = new THREE.Color("hsl(200, 33%, " + Math.floor(target.saturation) + "%)");
                wrapper.clearColor = new THREE.Color("hsl(200, 33%, " + Math.floor(target.saturation) + "%)");
                scene.fog.color = new THREE.Color("hsl(200, 33%, " + Math.floor(target.saturation) + "%)");
                scene.fog.far = target.far;
            }).onComplete(function() {
                me.clicked = false;
                dotFloor.visible = false;
                snow.obj.visible = true;
            });

            var centerTween = new TWEEN.Tween(me.position).to(me.circlePos, 500).onComplete(function() {
                wrapper.yawRotation -= .2;
            });
            var before = centerTween;
            var imageStart = { x: 1, rotationSpeed: .001 };

            var imageTween = new TWEEN.Tween(imageStart).to({ x: 0, rotationSpeed: .1 }, 1000).onUpdate(function() {
                for (var i = 0, l = topLevelObject.children.length; i < l; i++) {
                    var child1 = topLevelObject.children[i];
                    var child2 = topLevelObject2.children[i];
                    child1.material.opacity = imageStart.x * 100;
                    child2.material.opacity = imageStart.x * 100;
                }

                topLevelObject.rotationSpeed = imageStart.rotationSpeed;
                topLevelObject2.rotationSpeed = imageStart.rotationSpeed;
            }).onComplete(function() {
                topLevelObject.visible = false;
                topLevelObject2.visible = false;
            });

            for (var i = 0, x = 0; i < sphereCount; i++) {
                var object = objects[i];
                if (me !== object) {
                    x++
                    nextTween(object, x == sphereCount - 1);
                }

            }

            function nextTween(object, lastOne) {
                var next = new TWEEN.Tween(object.position).to(object.circlePos, 500).easing(TWEEN.Easing.Exponential.InOut).onComplete(function() {
                    me.scale.x -= .25;
                    me.scale.y -= .25;
                    me.scale.z -= .25;
                    wrapper.yawRotation -= .1;
                    object.material.visible = true;

                });
                before.chain(next);
                before = next;
            }
            imageTween.delay(1000).start();
            tween.delay(1000).start();
            centerTween.start();
        } else {
            var tween = new TWEEN.Tween(start).to(target, 1000).onUpdate(function() {
                floor.material.opacity = start.opacity;
                floor.material.color = new THREE.Color("hsl(200, 33%, " + Math.floor(start.saturation) + "%)");
                wrapper.clearColor = new THREE.Color("hsl(200, 33%, " + Math.floor(start.saturation) + "%)");
                scene.fog.color = new THREE.Color("hsl(200, 33%, " + Math.floor(start.saturation) + "%)");
                scene.fog.far = start.far;
            }).onComplete(function() {
                floor.material.visible = false;
                dotFloor.visible = true;
                me.clicked = true;
                ring.resetPosition();
                snow.obj.visible = false;
            });
            var centerTween = new TWEEN.Tween(me.position).to({ x: 0, y: me.position.y, z: 0 }, 500).onComplete(function() {
                wrapper.yawRotation += .2;
                ring.update();
            });
            var before = centerTween;
            var imageStart = { x: 0, rotationSpeed: .1 };

            var imageTween = new TWEEN.Tween(imageStart).to({ x: 1, rotationSpeed: .001 }, 1000).onUpdate(function() {
                for (var i = 0, l = topLevelObject.children.length; i < l; i++) {
                    var child1 = topLevelObject.children[i];
                    var child2 = topLevelObject2.children[i];
                    child1.material.opacity = imageStart.x * 100;
                    child2.material.opacity = imageStart.x * 100;
                }
                topLevelObject.visible = true;
                topLevelObject2.visible = true;
                topLevelObject.rotationSpeed = imageStart.rotationSpeed;
                topLevelObject2.rotationSpeed = imageStart.rotationSpeed;
            });
            for (var i = 0, x = 0; i < sphereCount; i++) {
                var object = objects[i];
                if (me !== object) {
                    x++
                    nextTween(object, x == sphereCount - 1);
                }

            }

            function nextTween(object, lastOne) {
                var next = new TWEEN.Tween(object.position).to({
                    x: 0,
                    y: object.position.y,
                    z: 0
                }, 500).easing(TWEEN.Easing.Exponential.InOut).onComplete(function() {
                    me.scale.x += .25;
                    me.scale.y += .25;
                    me.scale.z += .25;
                    wrapper.yawRotation += .1;
                    object.material.visible = false;
                    if (lastOne) {
                        imageTween.start();
                        tween.start();
                    }
                });
                before.chain(next);
                before = next;
            }

            centerTween.start();
        }
    }

    this._onClick = bind(this, this.onClick);
}

CenterObject.prototype = Object.create(THREE.Mesh.prototype);

CenterObject.prototype.constructor = CenterObject;

CenterObject.prototype.update = function(texture) {
    this.material.envMap = texture;
}
