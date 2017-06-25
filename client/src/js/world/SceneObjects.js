function CenterObject(wrapper, angle, objProperties) {
    var ring = wrapper.ring;
    var color = objProperties.color;
    var hsl = color.getHSL();

    var geometry = new THREE.SphereBufferGeometry(4, 32, 16);

    var material = new THREE.MeshBasicMaterial({ color: color, envMap: objProperties.textureCube, refractionRatio: 0.90 });

    THREE.Mesh.call(this, geometry, material);
    this.name = objProperties.name;
    this.textureCube = objProperties.textureCube;
    this.randomPos = {
        x: Math.random() * 160 - 80,
        y: 2,
        z: Math.random() * 160 - 80
    };

    var radius = 10;
    this.circlePos = {
        x: radius * Math.cos(angle),
        y: 12.5,
        z: radius * Math.sin(angle)
    };

    this.onHover = function() {
        this.material.color.setHSL(hsl.h, 1, .5);
        //change color
    }

    this.offHover = function() {
        this.material.color.setHSL(hsl.h, hsl.s, hsl.l);
    }



    this.onClick = function() {
        var me = this;
        if (wrapper.transitioning) {
            return;
        }

        wrapper.transitioning = true;

        if (me.clicked) {
            me.clicked = false;
            var centerTween = new TWEEN.Tween(me.position).to(me.circlePos, 500).onComplete(function() {
                wrapper.send("nextTweenReady", { clicked: true, clickedObj: me });
            });

            centerTween.start();
        } else {
            me.clicked = true;
            var centerTween = new TWEEN.Tween(me.position).to({ x: 0, y: me.position.y, z: 0 }, 500).onComplete(function() {
                ring.update();
                wrapper.send("nextTweenReady", { clicked: false, clickedObj: me });
            });

            centerTween.start();
        }
    }
    this._onClick = bind(this, this.onClick);
}

CenterObject.prototype = Object.create(THREE.Mesh.prototype);

CenterObject.prototype.constructor = CenterObject;

function InvisibleSphere(wrapper) {
    THREE.Mesh.call(this, new THREE.SphereBufferGeometry(100, 3, 2), new THREE.MeshPhongMaterial());
    this.visible = false;

    this.inRange = function() {
        wrapper.send("transition", { current: 1, rotation: 0.005 })
    }
    this.outRange = function() {
        wrapper.send("transition", { current: 0, rotation: 0 })
    }
}

InvisibleSphere.prototype = Object.create(THREE.Mesh.prototype);

InvisibleSphere.prototype.constructor = InvisibleSphere;

function CenterObjectContainer(wrapper, sphereCount) {
    THREE.Object3D.call(this);

    var me = this;

    this.yawRotation = 0;
    var objProperties = [{
            name: "anime",
            textureCube: new THREE.CubeTextureLoader()
                .setPath('images/textures/anime/')
                .load(['1.png', '2.png', '3.png', '1.png', '2.png', '3.png']),
            color: new THREE.Color().setHSL(0, 0.5, 0.5)
        },
        { name: "work", textureCube: null, color: new THREE.Color().setHSL(1 / 5, 0.5, 0.5) },
        { name: "lemon", textureCube: null, color: new THREE.Color().setHSL(2 / 5, 0.5, 0.5) },
        { name: "something1", textureCube: null, color: new THREE.Color().setHSL(3 / 5, 0.5, 0.5) },
        { name: "something2", textureCube: null, color: new THREE.Color().setHSL(4 / 5, 0.5, 0.5) }
    ];



    for (var i = 0, l = objProperties.length; i < l; i++) {
        var angle = (i * 360 / l) * Math.PI / 180;
        var centerObj = new CenterObject(wrapper, angle, objProperties[i]);
        this.add(centerObj);
        wrapper.objects.push(centerObj);
    }


    var transitionThottler;

    wrapper.on("transition", function transition(context) {
        if (!me.miniScene) {
            if (!wrapper.transitioning) {
                for (var i = 0; i < sphereCount; i++) {
                    var object = me.children[i];
                    var endPos = context.current === 0 ? object.randomPos : object.circlePos;
                    new TWEEN.Tween(object.position)
                        .to(endPos, Math.random() * 2000)
                        .easing(TWEEN.Easing.Exponential.InOut)
                        .start();
                }
                me.yawRotation = context.rotation;
            } else {
                if (transitionThottler) {
                    clearTimeout(transitionThottler);
                }
                transitionThottler = setTimeout(function() { transition(context) }, 1000);
            }
        }
    });

    this.addChildrenTo = function(objects) {
        for (var i = 0; i < sphereCount; i++) {
            objects.push(this.children[i]);
        }
    }

    wrapper.on("nextTweenReady", function(context) {
        var before, startTween,
            clickedObj = context.clickedObj;

        if (context.clicked) {
            me.yawRotation = .405;
            for (var i = 0, x = 0; i < sphereCount; i++) {
                var object = wrapper.objects[i];
                if (clickedObj !== object) {
                    x++
                    before = getNext(before, clickedObj, object, x);
                    if (!startTween) {
                        startTween = before;
                    }
                }
            }

            before.onComplete(function() {
                wrapper.transitioning = false;
                clickedObj.material.envMap = clickedObj.textureCube;
                clickedObj.material.transparent = false;
                clickedObj.material.needsUpdate = true;
                me.miniScene = null;
            });

            function getNext(before, clickedObj, object, index) {
                var pos = object.position,
                    posEnd = object.circlePos;
                var start = { x: pos.x, y: pos.y, z: pos.z, r: me.yawRotation - .1 * (index - 1), s: 1.5 - .125 * (index - 1) };
                var end = { x: posEnd.x, y: posEnd.y, z: posEnd.z, r: me.yawRotation - .1 * index, s: 1.5 - .125 * index };

                var next = new TWEEN.Tween(start).to(end, 500).onStart(function() {
                    object.material.visible = true;
                }).onUpdate(function() {
                    pos.x = start.x;
                    pos.y = start.y;
                    pos.z = start.z;
                    me.yawRotation = start.r;
                    clickedObj.scale.set(start.s, start.s, start.s);
                });
                if (before) {
                    before.chain(next);
                }
                return next;
            }

            if (clickedObj.name === "anime") {
                wrapper.send("animeTween", context);
            }
            wrapper.send("changeEnviroment", context);
        } else {
            me.yawRotation = .105;

            for (var i = 0, x = 0; i < sphereCount; i++) {
                var object = wrapper.objects[i];
                if (clickedObj !== object) {
                    x++
                    before = getNext(before, clickedObj, object, x == sphereCount - 1, x);
                    if (!startTween) {
                        startTween = before;
                    }
                }

            }

            function getNext(before, clickedObj, object, lastOne, index) {
                var pos = object.position;
                var start = { x: pos.x, y: pos.y, z: pos.z, r: me.yawRotation + .1 * (index - 1) };
                var end = { x: 0, y: pos.y, z: 0, r: me.yawRotation + .1 * index };
                var next = new TWEEN.Tween(start).to(end, 500).onUpdate(function() {
                    pos.x = start.x;
                    pos.y = start.y;
                    pos.z = start.z;
                    me.yawRotation = start.r;
                }).onComplete(function() {
                    clickedObj.scale.x += .125;
                    clickedObj.scale.y += .125;
                    clickedObj.scale.z += .125;
                    object.material.visible = false;
                    if (lastOne) {
                        if (context.clickedObj.name === "anime") {
                            wrapper.send("animeTween", context);
                            clickedObj.material.envMap = null;
                            clickedObj.material.transparent = true;
                            clickedObj.material.opacity = .5;
                            clickedObj.material.needsUpdate = true;
                        }
                        wrapper.send("changeEnviroment", context);
                        wrapper.transitioning = false;
                        me.miniScene = context.clickedObj.name;
                    }
                });
                if (before) {
                    before.chain(next);
                }
                return next;
            }
        }
        startTween.start();

    });
}
CenterObjectContainer.prototype = Object.create(THREE.Object3D.prototype);

CenterObjectContainer.prototype.constructor = CenterObjectContainer;

CenterObjectContainer.prototype.update = function(texture) {
    this.rotation.y += this.yawRotation;
}

function ScreenObject(wrapper) {
    THREE.Object3D.call(this);
    var topLevelObject = new THREE.Object3D();
    topLevelObject.visible = false;
    topLevelObject.rotationSpeed = .1;
    var topLevelObject2 = new THREE.Object3D();
    topLevelObject2.visible = false;
    topLevelObject2.rotationSpeed = -.1;
    var me = this;
    this.add(topLevelObject);
    this.add(topLevelObject2);
    for (var i = 0; i < 5; i++) {
        var angle = (i * 360 / 5) * Math.PI / 180;
        topLevelObject.add(new WallPaper(100 * Math.cos(angle), 25, 100 * Math.sin(angle), -Math.PI, WallPaper.newAnimeWallpaper()));
    }
    for (var i = 0; i < 5; i++) {
        var angle = (i * 360 / 5) * Math.PI / 180;
        topLevelObject2.add(new WallPaper(100 * Math.cos(angle + 50), 100, 100 * Math.sin(angle + 50), -Math.PI, WallPaper.newAnimeWallpaper()));
    }

    this.changeWallPaper = function() {
        for (var x = 0, l = me.children.length; x < l; x++) {
            var topChild = me.children[x];
            for (var i = 0, l2 = topChild.children.length; i < l2; i++) {
                var child = topChild.children[i];
                var mapOverlay = WallPaper.newAnimeWallpaper();
                child.material.map = mapOverlay;
                child.material.map.needsUpdate = true;
            }
        }
    }

    wrapper.on("animeTween", function(context) {
        var imageStart = context.clicked ? { x: 1, rotationSpeed: .001 } : { x: 0, rotationSpeed: .1 };
        var imageEnd = context.clicked ? { x: 0, rotationSpeed: .1 } : { x: 1, rotationSpeed: .001 };
        var animeTween = new TWEEN.Tween(imageStart).to(imageEnd, 1000).onUpdate(function() {
            for (var i = 0, l = topLevelObject.children.length; i < l; i++) {
                var child1 = topLevelObject.children[i];
                var child2 = topLevelObject2.children[i];
                child1.material.opacity = imageStart.x * 100;
                child2.material.opacity = imageStart.x * 100;
            }

            topLevelObject.rotationSpeed = imageStart.rotationSpeed;
            topLevelObject2.rotationSpeed = -imageStart.rotationSpeed;
        });
        if (context.clicked) {
            animeTween.onComplete(function() {
                topLevelObject.visible = false;
                topLevelObject2.visible = false;
            });
            animeTween.delay(1000).start();

        } else {
            topLevelObject.visible = true;
            topLevelObject2.visible = true;
            animeTween.start();
        }
    });
};

ScreenObject.prototype = Object.create(THREE.Object3D.prototype);

ScreenObject.prototype.constructor = ScreenObject;

ScreenObject.prototype.update = function() {
    for (var i = 0; i < this.children.length; i++) {
        var topLevel = this.children[i];

        for (var x = 0; x < topLevel.children.length; x++) {
            var curObj = topLevel.children[x];
            curObj.update();
        }
        topLevel.rotation.y += topLevel.rotationSpeed;
    }
};


function WallPaper(x, y, z, rotation, mapOverlay) {
    var textureCubeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, map: mapOverlay, side: THREE.BackSide, transparent: true });
    var geometry = new THREE.PlaneGeometry(100, 50, 1, 1);
    geometry.rotateY(rotation);

    THREE.Mesh.call(this, geometry, textureCubeMaterial);
    this.position.set(x, y, z); //starts in middle of geo's width and height
    this.endPos = { x: x, y: y, z: z };
    this.lookAtPosition = new THREE.Vector3(0, y, 0);
    textureCubeMaterial.opacity = 0;
    this.startTime = clock.getElapsedTime();
    this.changeInterval = Math.random() * 50 + 10;
    this.changing = false;
}

WallPaper.newAnimeWallpaper = (function() {
    var unqieArray = [];
    var size = 15;
    var totalWallpapers = 10;
    return function() {
        var index = Math.floor(Math.random() * size);

        while (unqieArray.indexOf(index) !== -1) {
            index = Math.floor(Math.random() * size);
        }

        unqieArray.push(index);
        if (unqieArray.length == size) {
            unqieArray.splice(0, size - totalWallpapers);
        }

        return new THREE.TextureLoader().load("images/shelter/" + index + ".png");
    }
}());

WallPaper.prototype = Object.create(THREE.Mesh.prototype);

WallPaper.prototype.constructor = WallPaper;

WallPaper.prototype.update = function() {
    this.lookAt(this.lookAtPosition);

    var currentTime = clock.getElapsedTime() - this.startTime;
    if (currentTime > this.changeInterval && !this.changing) {
        this.changing = true;
        this.startTime = clock.getElapsedTime();
        this.changeInterval = Math.random() * 50 + 10;
        var mapOverlay = WallPaper.newAnimeWallpaper();

        var me = this;
        var start = { o: 1 };
        var fadeOut = new TWEEN.Tween(start).to({ o: 0 }, 1000).onUpdate(function() {
            me.material.opacity = start.o;
        });

        var fadeIn = new TWEEN.Tween(start).to({ o: 1 }, 1000).onStart(function() {
            me.material.map = mapOverlay;
            me.material.map.needsUpdate = true;
        }).onUpdate(function() {
            me.material.opacity = start.o;
        }).onComplete(function() {
            me.changing = false;
        });


        fadeOut.chain(fadeIn);
        fadeOut.start();
    }
}

function DotFloor() {
    THREE.Object3D.call(this);

    var separation = 25;
    var amountx = 10;
    var amounty = 10;
    var spriteMap = new THREE.TextureLoader().load("images/textures/disc.png");
    var spriteMaterial = new THREE.SpriteMaterial({ map: spriteMap, color: 0x000000 });

    for (var ix = 0; ix < amountx; ix++) {
        for (var iy = 0; iy < amounty; iy++) {
            var particle = new THREE.Sprite(spriteMaterial);
            particle.position.x = ix * separation - ((amountx * separation) / 2);
            particle.position.y = 0;
            particle.position.z = iy * separation - ((amounty * separation) / 2);
            particle.scale.x = particle.scale.y = particle.scale.z = .5;
            this.add(particle);
        }
    }
    this.visible = false;
}

DotFloor.prototype = Object.create(THREE.Object3D.prototype);

DotFloor.prototype.constructor = DotFloor;
