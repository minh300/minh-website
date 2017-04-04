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
    //  var texture = new THREE.TextureLoader().load('images/textures/floor/ice.jpg');
    // texture.wrapS = THREE.RepeatWrapping;
    //  texture.wrapT = THREE.RepeatWrapping;
    //  texture.repeat.set(4, 4);

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
    scene.fog = new THREE.Fog(0x000000, 0, 120);
    scene.add(new THREE.AxisHelper(100));
    var light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75);

    scene.add(light)
    scene.add(controls.yawObject);

    // floor
    var geometry = new THREE.PlaneGeometry(500, 500, 1, 1);
    geometry.rotateX(-Math.PI / 2);
    var material = new THREE.MeshPhongMaterial({ transparent: true, opacity: 1 });
    var mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    wrapper.floor = mesh;

    // objects
    // var material_sphere = new THREE.MeshPhongMaterial({ color: 0xffaa00, shading: THREE.FlatShading, shininess: 0 });
    //audioManager.playSound('sounds/LoveIsGone.mp3');
    var textureCube = new THREE.CubeTextureLoader()
        .setPath('images/textures/cube/Park3Med/')
        .load(['px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg']);
    textureCube.mapping = THREE.CubeRefractionMapping;
    var material = new THREE.MeshBasicMaterial({ color: 0xffffff, envMap: textureCube, refractionRatio: 0.95 });
    wrapper.objects = [];

    for (var i = 0; i < FFTSIZE / 2; i++) {
        var sphere = new THREE.SphereGeometry(5, 32, 16);

        var newMesh = new THREE.Mesh(sphere, material);
        newMesh.position.x = Math.floor(Math.random() * 20 - 10) * 20;
        newMesh.position.y = Math.floor(Math.random() * 20) * 20 + 10;
        newMesh.position.z = Math.floor(Math.random() * 20 - 10) * 20;
        scene.add(newMesh);
        wrapper.objects.push(newMesh);
    }

    wrapper.scene = scene;

    wrapper.updateObjects = function(delta) {
        if (this.material1) {
            this.material1.emissive.b = this.analyser1.getAverageFrequency() / 256;
            var children = this.spheres;
            var dataArray = new Uint8Array(this.analyser1.analyser.frequencyBinCount);
            // this.analyser1.analyser.getByteTimeDomainData(dataArray);
            //  this.analyser1.analyser.getByteFrequencyData(dataArray);
            for (var i = 0; i < children.length; i++) {
                if (dataArray[i] != 0)
                    children[i].scale.set(dataArray[i] * .05, dataArray[i] * .05, dataArray[i] * .05);

                //   children[i].translateX(dataarray[i]);
                //  children[i].translateY(dataarray[i]);
                //  children[i].translateZ(dataarray[i] );
            }
        }
    }
}


//rename this
function addObject(wrapper, objYaw, x, y, z, sceneID) {
    var geometry = new THREE.BoxGeometry(20, 20, 20);
    for (var i = 0, l = geometry.faces.length; i < l; i++) {
        var face = geometry.faces[i];
        //     face.vertexColors[0] = new THREE.Color().setHSL(Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75);
        //     face.vertexColors[1] = new THREE.Color().setHSL(Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75);
        //     face.vertexColors[2] = new THREE.Color().setHSL(Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75);
    }


    var textureCube = new THREE.CubeTextureLoader()
        .setPath('images/textures/cube/Park3Med/')
        .load(['px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg']);
    textureCube.mapping = THREE.CubeRefractionMapping;
    var material = new THREE.MeshBasicMaterial({ color: 0xffffff, envMap: textureCube, refractionRatio: 0.95 });

    //  var material = new THREE.MeshPhongMaterial({
    //       specular: 0xffffff,
    //       shading: THREE.FlatShading,
    //       vertexColors: THREE.VertexColors
    //   });
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
    var INTERSECTED;//todo

Scene.prototype.checkIntersection = function() {
    if (!this.controls.enabled && !transitionParams.animateTransition) {
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
