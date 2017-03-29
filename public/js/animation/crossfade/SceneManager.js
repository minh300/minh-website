var transitionParams = {
    "useTexture": true,
    "transition": 0.5,
    "transitionSpeed": 2.0,
    "texture": 5,
    "loopTexture": true,
    "animateTransition": false,
    "textureThreshold": 0.3
};

var currentScene = 0;

function onDocumentMouseMove(event) {
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

var mouse = new THREE.Vector2();

document.addEventListener('mousemove', onDocumentMouseMove, false);


function SceneManager(scenes) {

    this.scene = new THREE.Scene();

    this.cameraOrtho = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, -10, 10);

    this.textures = [];
    for (var i = 0; i < 6; i++)
        this.textures[i] = new THREE.TextureLoader().load('images/textures/transition/transition' + (i + 1) + '.png');

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
                value: this.textures[0]
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

    quadgeometry = new THREE.PlaneBufferGeometry(window.innerWidth, window.innerHeight);

    this.quad = new THREE.Mesh(quadgeometry, this.quadmaterial);
    this.scene.add(this.quad);

    // Link both scenes and their FBOs
    this.scenes = scenes;
    this.sceneA = scenes[0];

    this.quadmaterial.uniforms.tDiffuse1.value = this.sceneA.fbo.texture;

    this.needChange = false;

    this.setTextureThreshold = function(value) {

        this.quadmaterial.uniforms.threshold.value = value;

    };

    this.useTexture = function(value) {

        this.quadmaterial.uniforms.useTexture.value = value ? 1 : 0;

    };

    this.setTexture = function(i) {

        this.quadmaterial.uniforms.tMixTexture.value = this.textures[i];

    };

    this.setNewSceneB = function(id) {
        this.sceneB = this.scenes[id];
        this.quadmaterial.uniforms.tDiffuse2.value = this.sceneB.fbo.texture;
    }

    this.setNewSceneA = function(id) {
        this.sceneA = this.scenes[id];
        this.quadmaterial.uniforms.tDiffuse1.value = this.sceneA.fbo.texture;
    }



    this.render = function(delta) {

        // Transition animation
        this.quadmaterial.uniforms.mixRatio.value = transitionParams.transition;

        if (!transitionParams.animateTransition) {
            this.scenes[currentScene].render(delta, false);
            transitionParams.animateTransition = false;
        } else {
            // When 0<transition<1 render transition between two scenes
            this.sceneA.render(delta, true);
            this.sceneB.render(delta, true);
            renderer.render(this.scene, this.cameraOrtho, null, true);
        }



    }


    this.onKeyUp = function(event) {
        switch (event.keyCode) {
            case 82: // r
                var sceneManager = this;
                sceneManager.setNewSceneB(currentScene == 0 ? 1 : 0);

                var position = {
                    x: 1
                };
                var target = {
                    x: 0
                };
                var tween = new TWEEN.Tween(position).to(target, 2000);

                tween.onUpdate(function() {
                    transitionParams.animateTransition = true;
                    transitionParams.transition = position.x;
                });
                tween.onComplete(function() {
                    transitionParams.animateTransition = false;
                    currentScene = currentScene == 0 ? 1 : 0;
                    sceneManager.setNewSceneA(currentScene);
                });
                tween.start();
                break;
        }
    }
    var _onKeyUp = bind(this, this.onKeyUp);

    this.transitionTo = function(sceneID) {
        var sceneManager = this;
        sceneManager.setNewSceneB(sceneID);

        var position = {
            x: 1
        };
        var target = {
            x: 0
        };
        var tween = new TWEEN.Tween(position).to(target, 2000);

        tween.onUpdate(function() {
            transitionParams.animateTransition = true;
            transitionParams.transition = position.x;
        });
        tween.onComplete(function() {
            transitionParams.animateTransition = false;
            currentScene = sceneID;
            sceneManager.setNewSceneA(sceneID);
        });
        tween.start();
    }

    document.addEventListener('keyup', _onKeyUp, false);


}
