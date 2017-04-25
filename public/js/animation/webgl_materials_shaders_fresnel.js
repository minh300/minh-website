			if (!Detector.webgl) Detector.addGetWebGLMessage();
			var container;
			var camera, scene, renderer;
			var mesh, zmesh, lightMesh, geometry;
			var spheres = [];
			var directionalLight, pointLight;
			var mouseX = 0,
			    mouseY = 0;
			var windowHalfX = window.innerWidth / 2;
			var windowHalfY = window.innerHeight / 2;
			document.addEventListener('mousemove', onDocumentMouseMove, false);
			init();
			animate();

			function init() {
			    //container =  document.getElementById("myCanvas");
			    //document.body.appendChild( container );
			    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 100000);
			    camera.position.z = 3200;
			    //
			    var path = "images/lieinapril_squared";
			    var format = '.jpg';
			    var urls = [
			        path + format, path + format,
			        path + format, path + format,
			        path + format, path + format
			    ];
			    var textureCube = new THREE.CubeTextureLoader().load(urls);
			    textureCube.format = THREE.RGBFormat;
			    scene = new THREE.Scene();
			    scene.background = textureCube;
			    //
			    var geometry = new THREE.SphereGeometry(100, 32, 16);
			    var shader = THREE.FresnelShader;
			    var uniforms = THREE.UniformsUtils.clone(shader.uniforms);
			    uniforms["tCube"].value = textureCube;
			    var material = new THREE.ShaderMaterial({
			        uniforms: uniforms,
			        vertexShader: shader.vertexShader,
			        fragmentShader: shader.fragmentShader
			    });
			    for (var i = 0; i < 500; i++) {
			        var mesh = new THREE.Mesh(geometry, material);
			        mesh.position.x = Math.random() * 10000 - 5000;
			        mesh.position.y = Math.random() * 10000 - 5000;
			        mesh.position.z = Math.random() * 10000 - 5000;
			        mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 3 + 1;
			        scene.add(mesh);
			        spheres.push(mesh);
			    }
			    scene.matrixAutoUpdate = false;
			    //
			    renderer = new THREE.WebGLRenderer({ antialias: false, canvas: document.getElementById("myCanvas") });
			    renderer.setPixelRatio(window.devicePixelRatio);
			    renderer.setSize(window.innerWidth, window.innerHeight);
			    //container.appendChild( renderer.domElement );
			    //
			    window.addEventListener('resize', onWindowResize, false);
			}

			function onWindowResize() {
			    windowHalfX = window.innerWidth / 2;
			    windowHalfY = window.innerHeight / 2;
			    camera.aspect = window.innerWidth / window.innerHeight;
			    camera.updateProjectionMatrix();
			    renderer.setSize(window.innerWidth, window.innerHeight);
			}

			function onDocumentMouseMove(event) {
			    mouseX = (event.clientX - windowHalfX) * 10;
			    mouseY = (event.clientY - windowHalfY) * 10;
			}
			//
			function animate() {
			    requestAnimationFrame(animate);
			    render();
			}

			function render() {
			    var timer = 0.0001 * Date.now();
			    camera.position.x += (mouseX - camera.position.x) * .05;
			    camera.position.y += (-mouseY - camera.position.y) * .05;
			    camera.lookAt(scene.position);
			    for (var i = 0, il = spheres.length; i < il; i++) {
			        var sphere = spheres[i];
			        sphere.position.x = 5000 * Math.cos(timer + i);
			        sphere.position.y = 5000 * Math.sin(timer + i * 1.1);
			    }
			    renderer.render(scene, camera);
			}
