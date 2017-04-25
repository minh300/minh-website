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


function getShape(numberOfSides, size) {
    var octagonShape = new THREE.Shape(); // From http://blog.burlock.org/html5/130-paths
    var x = 0,
        y = 0;
    octagonShape.moveTo(x + size * Math.cos(0 * 2 * Math.PI / numberOfSides), y + size * Math.sin(0 * 2 * Math.PI / numberOfSides));

    for (var i = 1; i < numberOfSides; i++) {
        octagonShape.lineTo(x + size * Math.cos(i * 2 * Math.PI / numberOfSides), y + size * Math.sin(i * 2 * Math.PI / numberOfSides));
    }

    var extrudeSettings = {
        amount: 1,
        bevelEnabled: true,
        bevelSegments: 1,
        steps: 2,
        bevelSize: 1,
        bevelThickness: 1
    };
    var geometry = new THREE.ExtrudeGeometry(octagonShape, extrudeSettings);
    geometry.rotateX(Math.PI);
    geometry.scale(0.4, 0.4, 0.4);
    return geometry;
}

function getGeo(radius, count, heaxgonSize, opacity, name) {
    var parent = new THREE.Object3D();
    parent.name = name;
    parent.position.set(0, 0, 0);
    var positions = [];
    var normals = [];
    var colors = [];
    var spherical = new THREE.Spherical();
    var vector = new THREE.Vector3();

    for (var i = 1, l = count; i <= l; i++) {
        var phi = Math.acos(-1 + (2 * i) / l);
        var theta = Math.sqrt(l * Math.PI) * phi;
        spherical.set(radius, phi, theta);
        vector.setFromSpherical(spherical);
        var geometry = getShape(6, heaxgonSize);
        geometry.lookAt(vector);
        geometry.translate(vector.x, vector.y, vector.z);
        var color = new THREE.Color(0xffffff);
        color.setHSL((i / l), 1.0, 0.7);
        var material = new THREE.MeshPhongMaterial({
            shininess: 100,
            vertexColors: THREE.VertexColors,
            color: color,
            transparent: true,
            opacity: opacity
        });

        var mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = vector.x;
        mesh.position.y = vector.y;
        mesh.position.z = vector.z;
        mesh.decay = i > 42 ? 1.5 : 2;
        mesh.high = 0;
        mesh.scalehigh = 0;
        mesh.rotationSpeed = 0;
        parent.add(mesh);
    }

    return parent;
}

function musicScene(wrapper, controls) {

    var scene = new THREE.Scene();
    wrapper.scene = scene;

    scene.fog = new THREE.Fog(0x000000, 0, 300);
    // scene.add(new THREE.AxisHelper(100));
    var light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75);

    scene.add(light)
    scene.add(controls.yawObject);

    wrapper.objects = [];

    var particleSystem = new ParticleSystem(wrapper);
    wrapper.particleSystem = particleSystem;
    wrapper.outterCircle = getGeo(75, 128, 25, 1, "outterCircle");
    scene.add(wrapper.outterCircle);

    wrapper.onCompleteCircles = function(audioInfo) {
        var innerRadius = Math.max(Math.min(50 * audioInfo.vol, 18), 12); //floor of 12, ceil of 18
        this.innerCircle = getGeo(innerRadius, 128, 10, .95, "innerCircle");
        this.innerCircle.rotation.x = (-Math.PI / 2);
        this.scene.add(this.innerCircle);
    }

    wrapper.updateObjects = function(delta) {

        if (audioManager.isPlaying()) {
            if (ParticleSystemParams.hide) {
                particleSystem.particleSystem.material.opacity = 0;
            } else {
                particleSystem.particleSystem.material.opacity = 1;
                particleSystem.update(audioManager.getByteFrequencyData());
            }

        }

        if (this.outterCircle && this.innerCircle) {
            var avgFrequency = audioManager.getAverageFrequency();

            var dataArray = audioManager.getByteFrequencyData();
            var total = 0;
            var onBeat = audioManager.onBeat();
            for (var i = 0, l = dataArray.length / 2; i < l; i++) {
                total += dataArray[i];
                var topIndex = i + 64;
                var botIndex = l - i - 1;
                var inChild1 = this.innerCircle.children[topIndex];
                var inChild2 = this.innerCircle.children[botIndex];
                var outChild1 = this.outterCircle.children[topIndex];
                var outChild2 = this.outterCircle.children[botIndex];

                var val = Math.pow((dataArray[i] / 255), 2) * 255;
                val *= i > 42 ? 1.1 : 1;
                // establish the value for this tile
                var scalar = avgFrequency > 60 ? 50 : 100;
                var scaleVal = val / scalar;

                if (scaleVal > inChild1.scalehigh) {
                    inChild1.scalehigh = val / scalar;
                    inChild2.scalehigh = val / scalar;
                } else {
                    inChild1.scalehigh = (inChild1.scalehigh * 100 - inChild1.decay) / 100;
                    inChild2.scalehigh = (inChild1.scalehigh * 100 - inChild1.decay) / 100;
                    scaleVal = inChild1.scalehigh;
                }

                if (scaleVal == 0) {
                    scaleVal = .01;
                }

                if (val > inChild1.high) {
                    inChild1.high = val;
                    inChild2.high = val;
                } else {
                    inChild1.high -= inChild1.decay;
                    inChild2.high -= inChild2.decay;
                    val = inChild1.high;
                }

                inChild1.scale.set(scaleVal, scaleVal, scaleVal);
                inChild2.scale.set(scaleVal, scaleVal, scaleVal);

                // figure out what colour to fill it and then draw the polygon
                var r, g, b, a;
                if (val > 50) {
                    if (val > 128) {
                        r = (val - 128) * 2;
                        g = ((Math.cos((2 * val / 128 * Math.PI / 2) - 4 * Math.PI / 3) + 1) * 128);
                        b = (val - 105) * 3;
                    } else {
                        r = ((Math.cos((2 * val / 128 * Math.PI / 2)) + 1) * 128);
                        g = ((Math.cos((2 * val / 128 * Math.PI / 2) - 4 * Math.PI / 3) + 1) * 128);
                        b = ((Math.cos((2.4 * val / 128 * Math.PI / 2) - 2 * Math.PI / 3) + 1) * 128);
                    }

                    if (val > 210) {}
                    if (val > 120) {}
                    // set the alpha
                    var e = 2.7182;
                    a = (0.5 / (1 + 40 * Math.pow(e, -val / 8))) + (0.5 / (1 + 40 * Math.pow(e, -val / 20)));


                    //color
                    outChild1.material.color.setRGB(Math.round(r), Math.round(g), Math.round(b));
                    outChild2.material.color.setRGB(Math.round(r), Math.round(g), Math.round(b));
                    inChild1.material.color.setRGB(Math.round(r) / 100, Math.round(g) / 100, Math.round(b) / 100);
                    inChild2.material.color.setRGB(Math.round(r) / 100, Math.round(g) / 100, Math.round(b) / 100);


                    //rotations
                    if (avgFrequency > 60) {
                        inChild1.rotation.y = 1;
                        inChild2.rotation.y = -1;
                    } else {
                        inChild1.rotation.y -= inChild1.decay / 500;
                        inChild2.rotation.y += inChild2.decay / 500;
                        if (inChild1.rotation.y < 0) {
                            inChild1.rotation.y = 0;
                        }
                        if (inChild2.rotation.y > 0) {
                            inChild2.rotation.y = 0;
                        }
                    }

                } else {
                    //  inChild1.scale.set(0.5, 0.5, 0.5);
                    // inChild2.scale.set(0.5, 0.5, 0.5);
                    //  inChild1.material.color.setRGB(255, 255, 255);
                    // inChild2.material.color.setRGB(255, 255, 255);

                }

                if (onBeat) {
                    //	          inChild1.rotation.y +=.1;
                    //    inChild2.rotation.y +=.1;
                    //  outChild1.scale.set(2, 2, 2);
                    //outChild2.scale.set(2, 2, 2);
                } else {
                    //      	           inChild1.rotation.y =0;
                    //  inChild2.rotation.y =0;
                    //  outChild1.scale.set(outChild1.scale.x-outChild1.decay/100,outChild1.scale.y-outChild1.decay/100,outChild1.scale.y-outChild1.decay/100);
                    //  outChild2.scale.set(outChild2.scale.x-outChild2.decay/100,outChild2.scale.y-outChild2.decay/100,outChild2.scale.y-outChild2.decay/100);
                }

            }

            if (total > 10000) {
                // this.objYaw.rotation.y += Math.sin(Math.sin(total / 800000));
                //  innerCircle.rotation.y += Math.sin(Math.sin(total / 800000));
                //   innerCircle.rotation.x += 0.1;

            } else {

            }

            this.outterCircle.rotation.y += 0.005;



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
