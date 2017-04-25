var ParticleSystemParams = {
    "keepBeat": true,
    "hide": false
};

function ParticleSystem(wrapper) {
	this.wrapper = wrapper;
    this.particleCount = 16000;
    this.particles = new THREE.Geometry(),
        this.pMaterial = new THREE.PointsMaterial({
            color: 0xFFFFFF,
            size: 4,
            map: new THREE.TextureLoader().load("images/particle.png"),
            blending: THREE.AdditiveBlending,
            depthTest: true,
            depthWrite: false,
            alphaTest: 0.5,
            transparent: true
        });

    var radius = 10;
    this.totalWaves = 16;
    this.onBeat = false;
    this.emitPosition = { y: 22 };
    this.emitBottomPosition = { y: 22 };
    this.emitTopPosition = {};
    this.curWave = 0;

    // now create the individual particles
    for (var p = 0; p < this.particleCount; p++) {
        var angle = (p % 360) * Math.PI / 180;
        var pX = Math.cos(angle) * radius;
        var pY = 22;
        var pZ = Math.sin(angle) * radius;
        var random = p > this.particleCount / (this.totalWaves) * (this.totalWaves - 1) ? Math.random() : 1
        var particle = new THREE.Vector3(pX, pY, pZ);
        particle.velocity = new THREE.Vector3(pX * random, 0, pZ * random);
        particle.direction = new THREE.Vector3(pX / radius, pY / radius, pZ / radius);
        particle.acceleration = new THREE.Vector3(.1 * particle.direction.x, 0, .1 * particle.direction.z);

        particle.mass = 100; //kg
        particle.radius = radius; // 1px = 1cm
        particle.restitution = -0.7;
        particle.distance = 125;

        // add it to the geometry
        this.particles.vertices.push(particle);

    }
    // create the particle system
    this.particleSystem = new THREE.Points(
        this.particles,
        this.pMaterial);
    this.particleSystem.name = "particleSystem";
    this.particleSystem.position.y = -50;
    this.particleSystem.frustumCulled = false;
}

ParticleSystem.prototype.reset = function() {
    for (var p = 0; p < this.particleCount; p++) {
        var particle = this.particles.vertices[p];
        particle.x = 100;
        particle.z = 100;
    }
}

ParticleSystem.prototype.update = function(audioData) {
    if (audioManager.isPlaying()) {
        var avgFrequency = audioManager.getAverageFrequency();

        var total = 0;
        for (var i = 0; i < 80; i++) { // get the volume from the first 80 bins, else it gets too loud with treble
            total += audioData[i];
        }
        var multipler = total / 10000;
        var doBeat = this.emitPosition.bottomBeat;
        var lastSetStart = (this.particleCount / this.totalWaves) * (this.totalWaves - 1);
        for (var pCount = lastSetStart; pCount < this.particleCount; pCount++) {
            var particle = this.particles.vertices[pCount];

            // check if we need to reset
            if ((Math.sqrt(Math.pow(particle.x, 2) + Math.pow(particle.y, 2) + Math.pow(particle.z, 2)) > particle.distance) && avgFrequency > 60) {
                particle.x = 0; // Math.random() * 100;
                particle.z = 0; //Math.random() * 100;
                particle.y = 50;
                particle.distance = 125 * multipler;
                var theta = 2 * Math.PI * Math.random();
                var phi = Math.acos(2 * Math.random() - 1);
                particle.velocity.x = (Math.sin(phi) * Math.cos(theta)) * 5 * multipler;
                particle.velocity.y = (Math.sin(phi) * Math.sin(theta)) * 5 * multipler;
                particle.velocity.z = (Math.cos(phi)) * 5 * multipler;
                particle.acceleration.x = 0;
                particle.acceleration.z = 0;
            }


        }

        if (this.emitPosition.bottomBeat && ParticleSystemParams.keepBeat) {
            for (var pCount = (this.particleCount / this.totalWaves) * this.curWave; pCount < (this.particleCount / this.totalWaves) * this.curWave + (this.particleCount / this.totalWaves); pCount++) {
                var particle = this.particles.vertices[pCount];

                //makes it a scattered circle
                particle.x = Math.random() * particle.radius * particle.direction.x;
                particle.z = Math.random() * particle.radius * particle.direction.z;
                particle.y = 22;

                particle.velocity.x = particle.radius * particle.direction.x * multipler * 5;
                particle.velocity.z = particle.radius * particle.direction.z * multipler * 5;
                particle.acceleration.x = -1 * particle.direction.x;
                particle.acceleration.z = -1 * particle.direction.z;
            }
            this.emitPosition.bottomBeat = false;

            this.curWave = (this.curWave + 1) % (this.totalWaves - 1);
        }

        for (var pCount = 0; pCount < this.particleCount; pCount++) {
            // get the particle
            var particle = this.particles.vertices[pCount];

            // Integrate to get velocity
            // particle.acceleration.x -= .01 * particle.direction.x;
            // particle.acceleration.z -= .01 * particle.direction.z;
            particle.velocity.x += particle.acceleration.x;
            particle.velocity.z += particle.acceleration.z;
            particle.velocity.y += particle.acceleration.y;

            if (ParticleSystemParams.keepBeat && ((particle.direction.x > 0 && particle.velocity.x < 0 || particle.direction.x < 0 && particle.velocity.x > 0) || (particle.direction.z > 0 && particle.velocity.z < 0 || particle.direction.z < 0 && particle.velocity.z > 0))) {
                particle.x = 0; //Math.random() * particle.radius * particle.direction.x;
                particle.z = 0; //Math.random() * particle.radius * particle.direction.z;
                particle.y = 250;
            } else {
                particle.x += particle.velocity.x * .1;
                particle.z += particle.velocity.z * .1;
                particle.y += particle.velocity.y * .1;
            }
        }


        this.particles.verticesNeedUpdate = true;

    }
}

ParticleSystem.prototype.update2 = function(audioData) {
    if (audioManager.isPlaying()) {

        var total = 0;
        for (var i = 0; i < 80; i++) { // get the volume from the first 80 bins, else it gets too loud with treble
            total += audioData[i];
        }
        var multipler = total / 10000;


        for (var pCount = 0; pCount < this.particleCount; pCount++) {
            // get the particle
            var particle = this.particles.vertices[pCount];
            // check if we need to reset
            if (particle.y < 0) {

                particle.x = Math.random() * 100 * (Math.random() > .5 ? 1 : -1);
                particle.z = Math.random() * 100 * (Math.random() > .5 ? 1 : -1);
                particle.y = 50;
                var theta = 2 * Math.PI * Math.random();
                var phi = Math.acos(2 * Math.random() - 1);
                particle.velocity.x = (Math.sin(phi) * Math.cos(theta)) * 5 * multipler;
                particle.velocity.y = 5 * multipler; //(Math.sin(phi) * Math.sin(theta)) * 5 * multipler;
                particle.velocity.z = (Math.cos(phi)) * 5 * multipler;
                particle.acceleration.x = 0;
                particle.acceleration.z = 0;
            }

            particle.y -= particle.velocity.y * .1;

        }


        this.particles.verticesNeedUpdate = true;

    }
}



ParticleSystem.prototype.onCompleteParticleSystem = function(audioInfo) {

	this.wrapper.scene.add(this.particleSystem);
    if (this.tween) {
        this.tween.stop();
    }
    if (this.tween2) {
        this.tween2.stop();
    }
    var bpmm = 1000 * 60 / audioInfo.ret;
    this.emitTopPosition.y = bpmm / 3;

    var target = this.emitTopPosition;
    this.tween = new TWEEN.Tween(this.emitPosition).to(this.emitTopPosition, bpmm / 2);
    var emitPosition = this.emitPosition;
    this.tween.onUpdate(function() {});

    this.tween2 = new TWEEN.Tween(this.emitPosition).to(this.emitBottomPosition, bpmm / 2);
    var bottom = this.emitBottomPosition.y;
    this.tween2.onUpdate(function() {
        if (emitPosition.y == bottom)
            emitPosition.bottomBeat = true;
    });

    this.tween.chain(this.tween2);
    this.tween2.chain(this.tween);
    this.tween.start();
}
