    var renderer;
    var sceneManager;
    var clock = new THREE.Clock();
    var audioManager;

    function initVisualControls() {
        var gui = new dat.GUI({
            autoPlace: false
        });
        var visualFolder = gui.addFolder('Visual controls');
        var musicScene = sceneManager.getScene("MusicScene");
        var visualizerParams = musicScene.visualizerParams;
        visualFolder.add(visualizerParams, 'decay').min(1.0).max(3.0).step(0.01).listen();
        visualFolder.add(visualizerParams, 'pulse', {
            on: true,
            off: false
        }).onChange(function(value) {
            musicScene.visualizerParams.pulse = (value == 'true');
        }).listen();

        visualFolder.add(visualizerParams, 'form', {
            Staff: 0,
            Heart: 1,
            Spiral: 2,
            Flower: 3,
            Fountain: 4
        }).onChange(function(value) {
            musicScene.transformVisual(value);
        }).listen();

        visualFolder.add(visualizerParams, 'randomize', {
            on: true,
            off: false
        }).onChange(function(value) {
            musicScene.visualizerParams.randomize = (value == 'true');
        }).listen();

        visualFolder.add(visualizerParams, 'randomizeIntervals').min(1).max(60).step(1).listen();

        visualFolder.open();

        var customContainer = document.getElementById('visualControls');
        customContainer.appendChild(gui.domElement);
    }

    function init() {
        sceneManager = new SceneManager();
        audioManager = new AudioManager();
        initVisualControls();

        var container = document.getElementById("container");

        renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.sortObjects = false;
        container.appendChild(renderer.domElement);

        window.addEventListener('resize', onWindowResize, false);

    }

    function onWindowResize(event) {
        var SCREEN_WIDTH = window.innerWidth;
        var SCREEN_HEIGHT = window.innerHeight;
        renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
        sceneManager.resizeWindows(SCREEN_WIDTH, SCREEN_HEIGHT);
    }

    function animate() {
        requestAnimationFrame(animate);
        render();
        TWEEN.update();
    }

    function render() {
        sceneManager.render(clock.getDelta());
    }
