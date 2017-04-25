// borrowed from http://colordodge.com/Kaleidoscope/
var bufferSize = 1024;
var bufferWidth = bufferSize;
var bufferHeight = bufferSize;

var showTexture = false;
var speed = 0.5;
var saturation = 3.0;
var lightness = 1.5;
var isPaused = false;
var textureZoom = 2.2;
var isDragging = false;
var useEnvMap = true;
var reflectivity = 0.7;
var envMapSelect = 1;


var scene = new THREE.Scene();

var bufferCamera = new THREE.PerspectiveCamera(75, bufferWidth / bufferHeight, 0.1, 1000);
bufferCamera.position.z = textureZoom;

var camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 0.1, 1000 );
camera.position.z = 5;
camera.zoom = 1.5;
camera.updateProjectionMatrix();

var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var controls = new THREE.TrackballControls(bufferCamera, renderer.domElement);
controls.noZoom = true;
controls.dynamicDampingFactor = 0.5;
controls.rotateSpeed = 1;

var controls2 = new THREE.OrbitControls(camera, renderer.domElement);
controls2.enableZoom = true;
controls2.enableRotate = false;
controls2.zoomSpeed = 0.3;
controls2.minZoom = 0.2;
controls2.maxZoom = 2;
controls2.enablePan = false;




var bufferScene = new THREE.Scene();
var bufferTexture = new THREE.WebGLRenderTarget( bufferWidth, bufferHeight, { minFilter: THREE.LinearMipMapLinearFilter, magFilter: THREE.LinearFilter, antialias: true});


var urls = [
		  'images/cubeMaps/1/pos-x.png',
		  'images/cubeMaps/1/neg-x.png',
		  'images/cubeMaps/1/pos-y.png',
		  'images/cubeMaps/1/neg-y.png',
		  'images/cubeMaps/1/pos-z.png',
		  'images/cubeMaps/1/neg-z.png'
		];

var cubemap = THREE.ImageUtils.loadTextureCube(urls);
cubemap.format = THREE.RGBFormat;

/// buffer scene objects

var numAxes = 12;
var allShapes = [];
var numShapes = 10;
var complexity = 5;

function createShapes()
{
	for (var i=0; i<numShapes; i++)
	{
		var shape = new TorusKnotShape();
		shape.update();
		bufferScene.add(shape.mesh);
		allShapes[i] = shape;

		if (i < complexity) {
			shape.mesh.visible = true;
		} else {
			shape.mesh.visible = false;
		}
	}	
}
createShapes();


var ambientLight = new THREE.AmbientLight(0x808080);
bufferScene.add(ambientLight);

var pointLight = new THREE.PointLight(0xaaaaaa);
pointLight.position.set(0,50,200);
bufferScene.add(pointLight);

var pointLight = new THREE.PointLight(0x404040);
pointLight.position.set(0,50,-200);
bufferScene.add(pointLight);



// Kaleidoscope Grid


var grid = new KaleidoscopeGrid(bufferTexture);

function updateGridGeometry()
{
	scene.remove(grid.mesh);
	grid.createGeometry();
	scene.add(grid.mesh);
}
updateGridGeometry();


// texture plane
var planeMat = new THREE.MeshBasicMaterial({map:bufferTexture, side:THREE.DoubleSide});
var planeGeo = new THREE.PlaneGeometry(bufferWidth/2, bufferHeight/2);
var planeObj = new THREE.Mesh(planeGeo, planeMat);
scene.add(planeObj);
planeObj.visible = false;




function render()
{
	update();
	
	renderer.render(bufferScene, bufferCamera, bufferTexture);
	renderer.render(scene, camera);

	requestAnimationFrame(render);
}
render();

function update()
{
	controls.update();

	if (!isPaused && !isDragging)
	{
		for (var i=0; i<complexity; i++) {
			allShapes[i].update();
		}
	}
}

window.addEventListener('resize', function() 
{
	var WIDTH = window.innerWidth;
	var HEIGHT = window.innerHeight;
	renderer.setSize(WIDTH, HEIGHT);

	camera.left = window.innerWidth / - 2;
	camera.right = window.innerWidth / 2;
	camera.top = window.innerHeight / 2;
	camera.bottom = window.innerHeight / - 2;
	camera.updateProjectionMatrix();
});

window.addEventListener('keydown', function(e)
{
	e = e || window.event;

    if (e.keyCode == '32')  {
    	isPaused = !isPaused;
    }
});

renderer.domElement.addEventListener('mousedown', function() {
	isDragging = true;
});

renderer.domElement.addEventListener('mouseup', function() {
	isDragging = false;
});

renderer.domElement.addEventListener('touchstart', function() {
	isDragging = true;
});

renderer.domElement.addEventListener('touchend', function() {
	isDragging = false;
});
