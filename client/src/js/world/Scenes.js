var SCENES = (function() {

    function MainScene(sceneManager, id, clearColor, controls, camera) {
        Scene.call(this, sceneManager, id, clearColor, controls, camera);
        this.name = "MainScene";

        this.scene.fog = new THREE.Fog(clearColor, 0, 120);

        // floor
        var geometry = new THREE.PlaneGeometry(500, 500, 1, 1);
        geometry.rotateX(-Math.PI / 2);

        var material = new THREE.MeshPhongMaterial();

        var mesh = new THREE.Mesh(geometry, material);
        this.scene.add(mesh);

        var objYaw = new THREE.Object3D();
        objYaw.position.set(0, 0, 0);
        this.scene.add(objYaw);
        addObject(this, objYaw, -40, 22, 0, 0, 0x0000FF);
        addObject(this, objYaw, 0, 22, -40, 1, 0xFF0000);
        addObject(this, objYaw, 40, 22, 0, 2, 0xFFFF00);
        addObject(this, objYaw, 0, 22, 40, 3, 0x000000);

        this.objYaw = objYaw;
    }

    MainScene.prototype = Object.create(Scene.prototype);

    MainScene.prototype.updateObjects = function(delta) {
        for (var i = 0; i < this.objects.length; i++) {
            var curObj = this.objects[i];

            curObj.rotation.x += 0.001 * curObj.rotationSpeed;
            curObj.rotation.y += 0.001 * curObj.rotationSpeed;
            curObj.rotation.z += 0.001 * curObj.rotationSpeed;
        }
        this.objYaw.rotation.y += 0.005;
    }


    //rename this
    function addObject(wrapper, objYaw, x, y, z, sceneID, clearColor) {
        var geometry = new THREE.BoxGeometry(20, 20, 20);
        /*   var textureCube = new THREE.CubeTextureLoader()
               .setPath('images/textures/cube/Park3Med/')
               .load(['px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg']);
           textureCube.mapping = THREE.CubeRefractionMapping;*/
        var material = new THREE.MeshBasicMaterial({ color: clearColor, vertexColors: THREE.VertexColors, refractionRatio: 0.95 });
        //  var material = new THREE.MeshBasicMaterial({ color: 0xffffff, envMap: textureCube, refractionRatio: 0.95 });

        var mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, y, z)
        mesh.position.y = y;
        mesh.position.z = z;
        mesh.rotation.set(Math.random() * 200 - 100, Math.random() * 200 - 100, Math.random() * 200 - 100);
        mesh.sceneID = sceneID; //to teleport to
        mesh.rotationSpeed = 1;

        mesh.onHover = function() {
            if (this.resetTween) {
                this.resetTween.stop();
            }
            var mesh = this;
            var start = {
                x: mesh.scale.x,
                s: mesh.rotationSpeed,
            };
            var target = {
                x: 1.25,
                s: 15
            };
            var tween = new TWEEN.Tween(start).to(target, 500);

            tween.onUpdate(function() {
                mesh.scale.set(start.x, start.x, start.x);
                mesh.rotationSpeed = start.s;
            });
            tween.onComplete(function() {
                mesh.growTween = null;

            });
            this.growTween = tween;
            tween.start();

        }

        mesh.offHover = function() {
            if (this.growTween) {
                this.growTween.stop();
            }
            var mesh = this;
            var start = {
                x: mesh.scale.x,
                s: mesh.rotationSpeed
            };
            var target = {
                x: 1,
                s: 1
            };
            var tween = new TWEEN.Tween(start).to(target, 250);

            tween.onUpdate(function() {
                mesh.scale.set(start.x, start.x, start.x);
                mesh.rotationSpeed = start.s;
            });
            tween.onComplete(function() {
                mesh.resetTween = null;

            });
            this.resetTween = tween;

            tween.start();
        }

        mesh.onClick = function() {
            wrapper.sceneManager.transitionTo(mesh.sceneID);
        }
        mesh._onClick = bind(mesh, mesh.onClick);

        objYaw.add(mesh);
        wrapper.objects.push(mesh);
    }

















    function RoomScene(sceneManager, id, clearColor, controls, camera) {
        Scene.call(this, sceneManager, id, clearColor, controls, camera);
        var me = this;
        var scene = this.scene;
        this.name = "RoomScene";

        this.scene.fog = new THREE.Fog(clearColor, 0, 100);

        this.listeners = {};

        this.on = function(event, action) {
            if (!this.listeners[event]) {
                this.listeners[event] = [];
            }
            this.listeners[event].push(action);
        }

        this.send = function(event, context) {
            var handles = this.listeners[event];
            for (var i = 0; i < handles.length; i++) {
                handles[i](context);
            }
        }

        // floor
        var geometry = new THREE.PlaneGeometry(500, 500, 1, 1);
        geometry.rotateX(-Math.PI / 2);
        var floor = this.floor = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({ transparent: true, color: "hsl(200, 33%, 54%)" }));
        this.scene.add(this.floor);

        //screen object
        this.screenObj = new ScreenObject(this);
        this.scene.add(this.screenObj);

        //snow
        var snow = this.snow = new SnowSystem();
        this.scene.add(this.snow);

        //ring
        var ring = this.ring = new RingSystem(0);
        this.scene.add(this.ring);

        //dotFloor
        var dotFloor = new DotFloor();
        this.scene.add(dotFloor);

        //invObj
        var invObj = new InvisibleSphere(this);
        this.positionalObjects.push(invObj);
        this.scene.add(invObj);

        //centerContainer
        this.centerObjectContainer = new CenterObjectContainer(this, 5);
        this.scene.add(this.centerObjectContainer);

        this.on("changeEnviroment", function(context) {
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
            if (context.clicked) {
                floor.material.visible = true;

                var tween = new TWEEN.Tween(target).to(start, 1000).onUpdate(function() {
                    floor.material.opacity = target.opacity;
                    floor.material.color = new THREE.Color("hsl(200, 33%, " + Math.floor(target.saturation) + "%)");
                    me.clearColor = new THREE.Color("hsl(200, 33%, " + Math.floor(target.saturation) + "%)");
                    scene.fog.color = new THREE.Color("hsl(200, 33%, " + Math.floor(target.saturation) + "%)");
                    scene.fog.far = target.far;
                }).onComplete(function() {
                    dotFloor.visible = false;
                    snow.visible = true;
                });
                tween.delay(1000).start();

            } else {

                var tween = new TWEEN.Tween(start).to(target, 1000).onUpdate(function() {
                    floor.material.opacity = start.opacity;
                    floor.material.color = new THREE.Color("hsl(200, 33%, " + Math.floor(start.saturation) + "%)");
                    me.clearColor = new THREE.Color("hsl(200, 33%, " + Math.floor(start.saturation) + "%)");
                    scene.fog.color = new THREE.Color("hsl(200, 33%, " + Math.floor(start.saturation) + "%)");
                    scene.fog.far = start.far;
                }).onComplete(function() {
                    floor.visible = false;
                    dotFloor.visible = true;
                    ring.resetPosition();
                    snow.visible = false;
                }).start();
            }
        });


    }

    RoomScene.prototype = Object.create(Scene.prototype);

    RoomScene.prototype.updateObjects = function(delta, renderer) {
        this.snow.update();
        this.screenObj.update();
        this.centerObjectContainer.update();

    }

    function randomSpherePoint(x0, y0, z0, radius) {
        var u = Math.random();
        var v = Math.random();
        var theta = 2 * Math.PI * u;
        var phi = Math.acos(2 * v - 1);
        var x = x0 + (radius * Math.sin(phi) * Math.cos(theta));
        var y = y0 + (radius * Math.sin(phi) * Math.sin(theta));
        var z = z0 + (radius * Math.cos(phi));
        return [x, y, z];
    }








































    function MusicScene(sceneManager, id, clearColor, controls, camera) {
        Scene.call(this, sceneManager, id, clearColor, controls, camera);
        this.name = "MusicScene";
        this.scene.fog = new THREE.Fog(clearColor, 0, 400);

        this.particleSystem = new ParticleSystem();
        this.outterSphere = new VISUALOBJECTS.OutterSphere(75, 128, 25, 1, "OutterSphere");


        var innerRadius = 18; // Math.max(Math.min(50 * audioInfo.vol, 18), 18); //floor of 18, ceil of 18

        this.visuals = [];
        this.visuals.push(new VISUALOBJECTS.Staff(innerRadius, 128, 10, .95, "staff"));
        this.visuals.push(new VISUALOBJECTS.Heart(innerRadius, 128, 10, .95, "heart"));
        // this.visuals.push(new Spiral(innerRadius, 256, 10, .95, "spiral"));
        this.visuals.push(new VISUALOBJECTS.Flower(innerRadius, 128, 10, .95, "flower"));
        this.visuals.push(new VISUALOBJECTS.Fountain(innerRadius, 128, 10, .95, "fountain"));


        this.scene.add(this.outterSphere);
        this.scene.add(this.particleSystem);
        for (var i = 0; i < this.visuals.length; i++) {
            this.scene.add(this.visuals[i]);
        }

        this.startTime = clock.getElapsedTime();

        this.increaseDecay = false;
        this.decreaseDecay = false;
        this.visualizerParams = {
            "decay": 1,
            "pulse": false,
            "current": 0,
            "form": 0,
            "forms": 4,
            "opacity": 0,
            "randomize": true,
            "randomizeIntervals": 30
        };

        var _onKeyDown = bind(this, this.onKeyDown);
        var _onKeyUp = bind(this, this.onKeyUp);

        this.enableControls = function(enable) {
            this.controls.enableControls(enable);
            if (enable) {
                $(document).on('keyup', _onKeyUp);
                $(document).on('keydown', _onKeyDown);
            } else {
                $(document).off('keyup', _onKeyUp);
                $(document).off('keydown', _onKeyDown);
            }
        }
    }

    MusicScene.prototype = Object.create(Scene.prototype);

    MusicScene.prototype.onKeyDown = function(event) {
        switch (event.keyCode) {
            case 49:
                this.decreaseDecay = true;
                break;
            case 50:
                this.increaseDecay = true;
                break;
        }
    }


    MusicScene.prototype.onKeyUp = function(event) {
        switch (event.keyCode) {
            case 27: //ESC
                openInfo();
                break;
            case 49: //1
                this.decreaseDecay = false;
                break;
            case 50: //2
                this.increaseDecay = false;
                break;
            case 71: //g
                this.transformVisual();
                break;
            case 66: //b
                this.visualizerParams.pulse = !this.visualizerParams.pulse;
                break;
            case 81: //q
                toggleForId("visualControls", "myHidden");
                break;
            case 90: //z
                toggleForId("controlPanel", "myHidden");
                break;
        }

    };

    MusicScene.prototype.updateObjects = function(delta) {
        this.updateDecay(delta);
        //randomizing
        if (this.visualizerParams.randomize) {
            var currentTime = clock.getElapsedTime() - this.startTime;
            if (currentTime > this.visualizerParams.randomizeIntervals) {
                this.startTime = clock.getElapsedTime();
                if (audioManager.isPlaying()) {
                    for (var i = (Math.floor(Math.random() * 4)); i == this.visualizerParams.current; i = (Math.floor(Math.random() * 4))); //no body
                    this.transformVisual(i);
                }
            }
        }


        var avgFrequency = audioManager.getAverageFrequency();
        var dataArray = audioManager.getByteFrequencyData();

        //particle system
        if (audioManager.isPlaying()) {
            this.particleSystem.material.opacity = 1;
            this.particleSystem.update(avgFrequency, dataArray, this.visualizerParams.pulse);
        } else {
            this.particleSystem.material.opacity = 0;
        }


        //main visuals
        if (this.visuals) {
            if (this.visualizerParams.transforming) {
                this.visuals[this.visualizerParams.form].visible = true;
                this.visuals[this.visualizerParams.form].update(avgFrequency, dataArray, this.visualizerParams.decay, true, true, this.visualizerParams.opacity);
                this.visuals[this.visualizerParams.current].update(avgFrequency, dataArray, this.visualizerParams.decay, true, false, this.visualizerParams.opacity);
            } else {
                for (var i = 0; i < this.visuals.length; i++) {
                    if (i != this.visualizerParams.current) {
                        this.visuals[i].visible = false;
                    }
                }
                this.visuals[this.visualizerParams.current].update(avgFrequency, dataArray, this.visualizerParams.decay);
            }
        }


        //outter sphere
        if (this.outterSphere) {
            this.outterSphere.update(avgFrequency, dataArray, this.visualizerParams.decay, this.visualizerParams.transforming);
        }

    }


    MusicScene.prototype.onMusicLoaded = function(audioInfo) {
        this.visualizerParams.decay = audioInfo.decay;
        this.startTime = clock.getElapsedTime();
    }

    MusicScene.prototype.transformVisual = (function() {
        var position = {
            x: 0
        };
        var target = {
            x: .95
        };
        var tween = new TWEEN.Tween(position).to(target, 1000);

        return function(to) {
            var visualizerParams = this.visualizerParams;
            if (!visualizerParams.transforming) {
                position.x = 0;
                visualizerParams.form = to || ((visualizerParams.form + 1) % visualizerParams.forms);
                visualizerParams.transforming = true;


                tween.onUpdate(function() {
                    visualizerParams.opacity = position.x;
                });
                tween.onComplete(function() {
                    visualizerParams.transforming = false;
                    visualizerParams.current = visualizerParams.form;
                });
                tween.start();
            }
        };
    })();

    MusicScene.prototype.updateDecay = function(delta) {
        var visualizerParams = this.visualizerParams;
        if (this.increaseDecay && visualizerParams.decay < 3) {
            visualizerParams.decay = visualizerParams.decay + 2 * delta;
            if (visualizerParams.decay > 3) {
                visualizerParams.decay = 3;
            }
        }

        if (this.decreaseDecay && visualizerParams.decay > 1) {
            visualizerParams.decay = visualizerParams.decay - 2 * delta;
            if (visualizerParams.decay < 1) {
                visualizerParams.decay = 1;
            }
        }
    }













    function Scene(sceneManager, id, clearColor) {
        this.sceneManager = sceneManager;
        this.id = id;
        this.clearColor = clearColor;
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
        this.controls = new THREE.PointerLockControls(this.camera);
        this.scene = new THREE.Scene();

        //   this.scene.add(new THREE.AxisHelper(100));
        var light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75);

        this.scene.add(light)
        this.scene.add(this.controls.yawObject);

        this.objects = [];
        this.positionalObjects = [];
        this.fbo = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false });
        this.raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 50);

    }


    Scene.prototype.moveTo = function(x, y, z) {
        this.controls.moveTo(x, y, z);
    }

    Scene.prototype.enableControls = function(enable) {
        this.controls.enableControls(enable);
    }

    Scene.prototype.resizeWindow = function(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }

    Scene.prototype.render = function(renderer, delta, rtt) {
        this.controls.update();
        var myPos = this.controls.yawObject.position;
        this.checkIntersection();
        this.positionalIntersection();
        this.updateObjects(delta, renderer);
        renderer.setClearColor(this.clearColor);
        if (rtt)
            renderer.render(this.scene, this.camera, this.fbo, true);
        else
            renderer.render(this.scene, this.camera);

    };

    Scene.prototype.checkIntersection = function() {
        var container = $("#bgContainer");

        if (this.controls.enabled && !this.controls.pointerLockEnabled && !this.sceneManager.animateTransition) {
            this.raycaster.far = 50;
            this.raycaster.setFromCamera(this.controls.mouse, this.camera);
            var intersects = this.raycaster.intersectObjects(this.objects);

            if (intersects.length > 0) {
                if (this.INTERSECTED != intersects[0].object) {
                    if (this.INTERSECTED) {
                        this.INTERSECTED.offHover();
                        $(document).off('click', this.INTERSECTED._onClick);
                        container.toggleClass("clickable");

                    }
                    this.INTERSECTED = intersects[0].object;
                    this.INTERSECTED.onHover();
                    $(document).on('click', this.INTERSECTED._onClick);
                    container.toggleClass("clickable");
                }
            } else {
                if (this.INTERSECTED) {
                    this.INTERSECTED.offHover();
                    $(document).off('click', this.INTERSECTED._onClick);
                    container.toggleClass("clickable");

                }
                this.INTERSECTED = null;
            }
        } else {
            if (this.INTERSECTED) {
                this.INTERSECTED.offHover();
                $(document).off('click', this.INTERSECTED._onClick);
                container.toggleClass("clickable");
            }
            this.INTERSECTED = null;
        }
    }

    Scene.prototype.positionalIntersection = function() {
        if (this.controls.enabled) {
            for (var i = 0, l = this.positionalObjects.length; i < l; i++) {
                var posObj = this.positionalObjects[i].position;
                var radius = this.positionalObjects[i].geometry.parameters.radius;
                var myPos = this.controls.yawObject.position;

                if (myPos.x * myPos.x + myPos.z * myPos.z < radius * radius) {
                    if (this.INTERSECTED2 != this.positionalObjects[i]) {
                        if (this.INTERSECTED2) {
                            this.INTERSECTED2.outRange();
                        }
                        this.INTERSECTED2 = this.positionalObjects[i];
                        this.INTERSECTED2.inRange();
                    }
                } else {
                    if (this.INTERSECTED2) {
                        this.INTERSECTED2.outRange();
                    }
                    this.INTERSECTED2 = null;
                }
            }
        } else {
            if (this.INTERSECTED2) {
                this.INTERSECTED2.outRange();

            }
            this.INTERSECTED2 = null;
        }
    }
    return { MainScene: MainScene, RoomScene: RoomScene, MusicScene: MusicScene };

})();
