    var sceneManager;
    var clock;
    var audioManager;

    function initWorld() {
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
                //   Spiral: 2,
                Flower: 2,
                Fountain: 3
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

        function onWindowResize(event) {
            var SCREEN_WIDTH = window.innerWidth;
            var SCREEN_HEIGHT = window.innerHeight;
            var fgContainer = $("#fgContainer");
            fgContainer.height(SCREEN_HEIGHT - 42); //42 is constant size of navigation panel
            sceneManager.resizeWindows(SCREEN_WIDTH, SCREEN_HEIGHT);
        }

        function animate() {
            requestAnimationFrame(animate);
            sceneManager.render(clock.getDelta());
            TWEEN.update();
        }
        var container = document.getElementById("bgContainer");

        clock = new THREE.Clock();
        sceneManager = new SceneManager(container);
        audioManager = new AudioManager();
        initVisualControls();

        window.addEventListener('resize', onWindowResize, false);
        animate();
    }
