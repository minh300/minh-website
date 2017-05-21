function MainScene(id, clearColor, controls, camera) {
    Scene.call(this, id, clearColor, controls, camera);
    this.name = "MainScene";

    this.scene.fog = new THREE.Fog(clearColor, 0, 120);

    // floor
    var geometry = new THREE.PlaneGeometry(500, 500, 1, 1);
    geometry.rotateX(-Math.PI / 2);
    for (var i = 0, l = geometry.vertices.length; i < l; i++) {
        var vertex = geometry.vertices[i];
        vertex.x += Math.random() * 20 - 10;
        vertex.y += Math.random() * 2;
        vertex.z += Math.random() * 20 - 10;
    }
    for (var i = 0, l = geometry.faces.length; i < l; i++) {
        var face = geometry.faces[i];
        face.vertexColors[0] = new THREE.Color().setHSL(Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75);
        face.vertexColors[1] = new THREE.Color().setHSL(Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75);
        face.vertexColors[2] = new THREE.Color().setHSL(Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75);
    }

    var material = new THREE.MeshPhongMaterial({ transparent: true, opacity: 1 });

    var mesh = new THREE.Mesh(geometry, material);
    this.scene.add(mesh);
    this.floor = mesh;

    var objYaw = new THREE.Object3D();
    objYaw.position.set(0, 0, 0);
    this.scene.add(objYaw);
    addObject(this, objYaw, -40, 22, 0, 1, 0x0000FF);
    addObject(this, objYaw, 0, 22, -40, 2, 0xFF0000);
    addObject(this, objYaw, 40, 22, 0, 3, 0xFFFF00);
    addObject(this, objYaw, 0, 22, 40, 4, 0x000000);

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

    mesh.resetAnimation = function() {
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

    objYaw.add(mesh);
    wrapper.objects.push(mesh);
}
















function MusicScene(id, clearColor, controls, camera) {
    Scene.call(this, id, clearColor, controls, camera);
    this.name = "MusicScene";
    this.scene.fog = new THREE.Fog(clearColor, 0, 400);

    this.particleSystem = new ParticleSystem(this);
    this.outterSphere = new OutterSphere(75, 128, 25, 1, "OutterSphere");
    this.scene.add(this.outterSphere.obj);
    this.scene.add(this.particleSystem.obj);

    var innerRadius = 18; // Math.max(Math.min(50 * audioInfo.vol, 18), 18); //floor of 18, ceil of 18

    this.visuals = [];
    this.visuals.push(new Staff(innerRadius, 128, 10, .95, "staff"));
    this.visuals.push(new Heart(innerRadius, 128, 10, .95, "heart"));
    // this.visuals.push(new Spiral(innerRadius, 256, 10, .95, "spiral"));
    this.visuals.push(new Flower(innerRadius, 128, 10, .95, "flower"));
    this.visuals.push(new Fountain(innerRadius, 128, 10, .95, "fountain"));

    for (var i = 0; i < this.visuals.length; i++) {
        this.scene.add(this.visuals[i].obj);
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


    document.addEventListener('keyup', _onKeyUp, false);
    document.addEventListener('keydown', _onKeyDown, false);

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
        case 71: //g
            this.transformVisual();
            break;
        case 66: //b
            this.visualizerParams.pulse = !this.visualizerParams.pulse;
            break;
        case 49: //1
            this.decreaseDecay = false;
            break;
        case 50: //2
            this.increaseDecay = false;
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
                for (var i = (Math.floor(Math.random() * 5)); i == this.visualizerParams.current; i = (Math.floor(Math.random() * 5))); //no body
                this.transformVisual(i);
            }
        }
    }


    var avgFrequency = audioManager.getAverageFrequency();
    var dataArray = audioManager.getByteFrequencyData();

    //particle system
    if (audioManager.isPlaying()) {
        this.particleSystem.obj.material.opacity = 1;
        this.particleSystem.update(dataArray, this.visualizerParams.pulse);
    } else {
        this.particleSystem.obj.material.opacity = 0;
    }


    //main visuals
    if (this.visuals) {
        if (this.visualizerParams.transforming) {
            this.visuals[this.visualizerParams.form].obj.visible = true;
            this.visuals[this.visualizerParams.form].update(avgFrequency, dataArray, this.visualizerParams.decay, true, true, this.visualizerParams.opacity);
            this.visuals[this.visualizerParams.current].update(avgFrequency, dataArray, this.visualizerParams.decay, true, false, this.visualizerParams.opacity);
        } else {
            for (var i = 0; i < this.visuals.length; i++) {
                if (i != this.visualizerParams.current) {
                    this.visuals[i].obj.visible = false;
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














function Scene(id, clearColor) {
    this.id = id;
    this.clearColor = clearColor;
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    this.controls = new THREE.PointerLockControls(this.camera);
    this.scene = new THREE.Scene();

    // scene.add(new THREE.AxisHelper(100));
    var light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75);

    this.scene.add(light)
    this.scene.add(this.controls.yawObject);

    this.objects = [];
    this.fbo = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false });
}


Scene.prototype.moveTo = function(x, y, z) {
    this.controls.moveTo(x, y, z);
}
Scene.prototype.enableControls = function(enable) {
    this.controls.enabled = enable;
}

Scene.prototype.resizeWindow = function(width, height) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
}

Scene.prototype.render = function(delta, rtt) {
    this.controls.update();
    this.checkIntersection();
    this.updateObjects(delta);
    renderer.setClearColor(this.clearColor);
    if (rtt)
        renderer.render(this.scene, this.camera, this.fbo, true);
    else
        renderer.render(this.scene, this.camera);

};

Scene.prototype.checkIntersection = function() {
    if (this.controls.enabled && !this.controls.pointerLockEnabled && !sceneManager.animateTransition) {
        var raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 100);

        raycaster.setFromCamera(this.controls.mouse, this.camera);
        var intersects = raycaster.intersectObjects(this.objects);
        if (intersects.length > 0) {
            if (this.INTERSECTED != intersects[0].object) {
                if (this.INTERSECTED) {
                    this.INTERSECTED.resetAnimation();
                }
                this.INTERSECTED = intersects[0].object;
                this.INTERSECTED.onHover();
            }
            if (this.INTERSECTED.sceneID && this.controls.mouseDown) {
                sceneManager.specialAnimate = true;
                if (this.INTERSECTED.sceneID < 3)
                    scrollTo(this.INTERSECTED.sceneID)
                sceneManager.transitionTo(this.INTERSECTED.sceneID);
            }
        } else {
            if (this.INTERSECTED) {
                this.INTERSECTED.resetAnimation();
            }
            this.INTERSECTED = null;
        }
    } else {
        if (this.INTERSECTED) {
            this.INTERSECTED.resetAnimation();
        }
        this.INTERSECTED = null;
    }
}
