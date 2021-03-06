function SceneManager(container) {

    this.scene = new THREE.Scene();

    this.cameraOrtho = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, -10, 10);

    this.texture = new THREE.TextureLoader().load('images/textures/transition/transition1.png');

    this.quadmaterial = new THREE.ShaderMaterial({

        uniforms: {

            tDiffuse1: {
                value: null
            },
            tDiffuse2: {
                value: null
            },
            mixRatio: {
                value: 0.0
            },
            threshold: {
                value: 0.1
            },
            useTexture: {
                value: 1
            },
            tMixTexture: {
                value: this.texture
            }
        },
        vertexShader: [

            "varying vec2 vUv;",

            "void main() {",

            "vUv = vec2( uv.x, uv.y );",
            "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

            "}"

        ].join("\n"),
        fragmentShader: [

            "uniform float mixRatio;",

            "uniform sampler2D tDiffuse1;",
            "uniform sampler2D tDiffuse2;",
            "uniform sampler2D tMixTexture;",

            "uniform int useTexture;",
            "uniform float threshold;",

            "varying vec2 vUv;",

            "void main() {",

            "vec4 texel1 = texture2D( tDiffuse1, vUv );",
            "vec4 texel2 = texture2D( tDiffuse2, vUv );",

            "if (useTexture==1) {",

            "vec4 transitionTexel = texture2D( tMixTexture, vUv );",
            "float r = mixRatio * (1.0 + threshold * 2.0) - threshold;",
            "float mixf=clamp((transitionTexel.r - r)*(1.0/threshold), 0.0, 1.0);",

            "gl_FragColor = mix( texel1, texel2, mixf );",
            "} else {",

            "gl_FragColor = mix( texel2, texel1, mixRatio );",

            "}",
            "}"

        ].join("\n")

    });

    this.quadgeometry = new THREE.PlaneBufferGeometry(window.innerWidth, window.innerHeight);

    this.quad = new THREE.Mesh(this.quadgeometry, this.quadmaterial);
    this.quad.name = "quad";
    this.scene.add(this.quad);
    this.animateTransition = false;
    this.currentScene = 0;
    // Link both scenes and their FBOs
    var scenes = [];
    scenes.push(new SCENES.MainScene(this, 0, 0xb3cde0));
    scenes.push(new SCENES.RoomScene(this, 1, 0x6497b1)); //hsl(200, 33%, 54%)
    scenes.push(new SCENES.MainScene(this, 2, 0x005b96));
    // scenes.push(new MainScene(this, 3, 0x03396c));
    scenes.push(new SCENES.MusicScene(this, 3, 0x011f4b));

    this.scenes = scenes;
    this.sceneA = scenes[this.currentScene];

    this.quadmaterial.uniforms.tDiffuse1.value = this.sceneA.fbo.texture;


    this.renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.sortObjects = false;
    container.appendChild(this.renderer.domElement);

}

SceneManager.prototype.moveTo = function(x, y, z) {
    for (var i = 0; i < this.scenes.length; i++) {
        this.scenes[i].moveTo(x, y, z);
    }
}

SceneManager.prototype.enableControls = function(enable) {
    for (var i = 0; i < this.scenes.length; i++) {
        this.scenes[i].enableControls(enable);
    }
}

SceneManager.prototype.currentIsMusicScene = function() {
    return this.sceneA.name === "MusicScene";
}

SceneManager.prototype.getScene = function(name) {
    for (var i = 0, l = this.scenes.length; i < l; i++) {
        if (this.scenes[i].name === name) {
            return this.scenes[i];
        }
    }
    return null;
}

SceneManager.prototype.getCurrentScene = function() {
    return this.sceneA;
}


SceneManager.prototype.resizeWindows = function(width, height) {
    this.renderer.setSize(width, height);
    for (var i = 0; i < this.scenes.length; i++) {
        this.scenes[i].resizeWindow(width, height);
    }
    this.cameraOrtho = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, -10, 10);
    this.quadgeometry = new THREE.PlaneBufferGeometry(width, height);
    this.scene.remove(this.quad);
    this.quad = new THREE.Mesh(this.quadgeometry, this.quadmaterial);
    this.scene.add(this.quad);
}

SceneManager.prototype.setNewSceneB = function(id) {
    this.sceneB = this.scenes[id];
    this.quadmaterial.uniforms.tDiffuse2.value = this.sceneB.fbo.texture;
}


SceneManager.prototype.setNewSceneA = function(id) {
    this.sceneA = this.scenes[id];
    this.animateTransition = false;
    this.currentScene = id;
    this.quadmaterial.uniforms.tDiffuse1.value = this.sceneA.fbo.texture;
}

SceneManager.prototype.render = function(delta) {
    // Transition animation
    this.quadmaterial.uniforms.mixRatio.value = this.transition;

    if (!this.animateTransition) {
        this.scenes[this.currentScene].render(this.renderer, delta, false);
        this.animateTransition = false;
    } else {
        // When 0<transition<1 render transition between two scenes
        this.sceneA.render(this.renderer, delta, true);
        this.sceneB.render(this.renderer, delta, true);
        this.renderer.render(this.scene, this.cameraOrtho, null, true);
    }
}


SceneManager.prototype.transitionTo = function(sceneID) {
    if (this.tween) {
        this.tween.stop();
    }
    this.setNewSceneB(sceneID);
    if (this.scenes[sceneID].name !== "MusicScene") {
        $('#visualControls').addClass("hidden");
        $('#controlPanel').addClass("hidden");
    }

    var position = {
        x: 1
    };
    var target = {
        x: 0
    };
    this.tween = new TWEEN.Tween(position).to(target, 1000);

    var sceneManager = this;

    this.tween.onStart(function() {
        sceneManager.animateTransition = true;
    }).onUpdate(function() {
        sceneManager.transition = position.x;
    });
    this.tween.onComplete(function() {
        sceneManager.setNewSceneA(sceneID);
        if (sceneManager.scenes[sceneID].name === "MusicScene") {
            $('#visualControls').removeClass("hidden");
            $('#controlPanel').removeClass("hidden");
        }
        sceneManager.specialAnimate = false;
    });
    this.tween.start();

}
