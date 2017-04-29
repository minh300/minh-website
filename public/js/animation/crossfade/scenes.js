var increaseDecay = false;
var decreaseDecay = false;
var visualizerParams = {
    "decay": 1,
    "pulse": false,
    "current": 0,
    "form": 0,
    "forms": 5,
    "opacity": 0
}

function mainScene(wrapper, controls, clearColor) {

    var scene = new THREE.Scene();
    scene.fog = new THREE.Fog(clearColor, 0, 120);
    scene.add(new THREE.AxisHelper(100));
    var light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75);

    scene.add(light)
    scene.add(controls.yawObject);
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
    scene.add(mesh);
    wrapper.floor = mesh;

    // objects
    wrapper.objects = [];

    var objYaw = new THREE.Object3D();
    objYaw.position.set(0, 0, 0);
    scene.add(objYaw);
    addObject(wrapper, objYaw, -40, 22, 0, 1);
    addObject(wrapper, objYaw, 0, 22, -40, 2);
    addObject(wrapper, objYaw, 40, 22, 0, 3);
    addObject(wrapper, objYaw, 0, 22, 40, 4);

    wrapper.objYaw = objYaw;
    wrapper.scene = scene;

    wrapper.updateObjects = function(delta) {
        for (var i = 0; i < this.objects.length; i++) {
            var curObj = this.objects[i];

            curObj.rotation.x += 0.001 * curObj.rotationSpeed;
            curObj.rotation.y += 0.001 * curObj.rotationSpeed;
            curObj.rotation.z += 0.001 * curObj.rotationSpeed;
        }
        this.objYaw.rotation.y += 0.005;
    }
}

function musicScene(wrapper, controls) {

    var scene = new THREE.Scene();
    wrapper.scene = scene;

    scene.fog = new THREE.Fog(0x000000, 0, 400);
    // scene.add(new THREE.AxisHelper(100));
    var light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75);

    scene.add(light)
    scene.add(controls.yawObject);

    wrapper.objects = [];

    var particleSystem = new ParticleSystem(wrapper);
    wrapper.particleSystem = particleSystem;
    wrapper.OutterSphere = new OutterSphere(75, 128, 25, 1, "OutterSphere");
    scene.add(wrapper.OutterSphere.obj);

    wrapper.onCompleteCircles = function(audioInfo) {
        var innerRadius = Math.max(Math.min(50 * audioInfo.vol, 18), 12); //floor of 12, ceil of 18
        var visuals = [];
        visuals.push(new Staff(innerRadius, 128, 10, .95, "staff"));
        visuals.push(new Heart(innerRadius, 128, 10, .95, "heart"));
        visuals.push(new Spiral(innerRadius, 256, 10, .95, "spiral"));
        visuals.push(new Flower(innerRadius, 128, 10, .95, "flower"));
        visuals.push(new Fountain(innerRadius, 128, 10, .95, "fountain"));

        for (var i = 0; i < visuals.length; i++) {
            this.scene.add(visuals[i].obj);
        }
        this.visuals = visuals;
    }

    wrapper.updateObjects = function(delta) {
        var avgFrequency = audioManager.getAverageFrequency();
        var dataArray = audioManager.getByteFrequencyData();
        if (audioManager.isPlaying()) {
            particleSystem.particleSystem.material.opacity = 1;
            particleSystem.update(dataArray);
        } else {
            particleSystem.particleSystem.material.opacity = 0;
        }


        if (this.visuals) {
            if (visualizerParams.transforming) {
                this.visuals[visualizerParams.form].obj.visible = true;
                this.visuals[visualizerParams.form].update(avgFrequency, dataArray, visualizerParams.decay, true, true, visualizerParams.opacity);
                this.visuals[visualizerParams.current].update(avgFrequency, dataArray, visualizerParams.decay, true, false, visualizerParams.opacity);
            } else {
                for (var i = 0; i < this.visuals.length; i++) {
                    if (i != visualizerParams.current) {
                        this.visuals[i].obj.visible = false;
                    }
                }
                this.visuals[visualizerParams.current].update(avgFrequency, dataArray, visualizerParams.decay);
            }
        }

        if (this.OutterSphere) {
            this.OutterSphere.update(avgFrequency, dataArray, visualizerParams.decay,visualizerParams.transforming);
        }

    }
}

//rename this
function addObject(wrapper, objYaw, x, y, z, sceneID) {
    var geometry = new THREE.BoxGeometry(20, 20, 20);
    var textureCube = new THREE.CubeTextureLoader()
        .setPath('images/textures/cube/Park3Med/')
        .load(['px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg']);
    textureCube.mapping = THREE.CubeRefractionMapping;
    var material = new THREE.MeshBasicMaterial({ color: 0xffffff, envMap: textureCube, refractionRatio: 0.95 });

    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = x;
    mesh.position.y = y;
    mesh.position.z = z;
    mesh.rotation.x = Math.random() * 200 - 100;
    mesh.rotation.y = Math.random() * 200 - 100;
    mesh.rotation.z = Math.random() * 200 - 100;
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


function Scene(type, clearColor, controls, camera) {
    this.clearColor = clearColor;
    this.camera = camera;
    this.controls = controls;
    if (type == "mainScene") {
        mainScene(this, controls, clearColor);
    } else if (type == "musicScene") {
        musicScene(this, controls, clearColor);
    }
    controls.yawObject.position.set(0, 11, 100);

    this.getObjects = function() {
        return this.objects;
    }

    renderTargetParameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false };
    this.fbo = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, renderTargetParameters);



}

Scene.prototype.render = function(delta, rtt) {
    this.checkIntersection();
    this.updateObjects(delta);
    renderer.setClearColor(this.clearColor);
    if (rtt)
        renderer.render(this.scene, this.camera, this.fbo, true);
    else
        renderer.render(this.scene, this.camera);

};
var INTERSECTED; //todo

Scene.prototype.checkIntersection = function() {
    if (!this.controls.enabled && !transitionParams.animateTransition && currentScene != 1) {
        var raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 100);

        raycaster.setFromCamera(this.controls.mouse, this.camera);
        var intersects = raycaster.intersectObjects(this.objects);
        if (intersects.length > 0) {
            if (INTERSECTED != intersects[0].object) {
                if (INTERSECTED) {
                    INTERSECTED.resetAnimation();
                }
                INTERSECTED = intersects[0].object;
                INTERSECTED.onHover();
            }
            if (INTERSECTED.sceneID && this.controls.mouseDown) {
                sceneManager.transitionTo(INTERSECTED.sceneID);
            }
        } else {
            if (INTERSECTED) {
                INTERSECTED.resetAnimation();
            }
            INTERSECTED = null;
        }
    } else {
        if (INTERSECTED) {
            INTERSECTED.resetAnimation();
        }
        INTERSECTED = null;
    }
}
