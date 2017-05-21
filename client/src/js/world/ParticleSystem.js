function ParticleSystem() {
    this.particleCount = 4000;
    this.particles = new THREE.Geometry();
    this.pMaterial = new THREE.PointsMaterial({
        color: 0xFFFFFF,
        size: 4,
        map: new THREE.TextureLoader().load("images/textures/particle.png"),
        blending: THREE.AdditiveBlending,
        depthTest: true,
        depthWrite: false,
        alphaTest: 0.5,
        transparent: true
    });

    this.pRadius = 10; //particle radius
    this.totalWaves = 4; //divides the particle count by this
    this.waveSize = this.particleCount / this.totalWaves;
    this.lastWaveStart = this.particleCount - this.waveSize; //start at the last set of waves
    this.emitPosition = { y: 22 };
    this.emitBottomPosition = { y: 22 };
    this.emitTopPosition = {};
    this.curWave = 0;

    // now create the individual particles
    for (var p = 0; p < this.particleCount; p++) {
        var angle = (p % 360) * Math.PI / 180;
        var pX = Math.cos(angle) * this.pRadius;
        var pY = 22;
        var pZ = Math.sin(angle) * this.pRadius;
        var random = p > this.lastWaveStart ? Math.random() : 1
        var particle = new THREE.Vector3(pX, pY, pZ);
        particle.velocity = new THREE.Vector3(pX * random, 0, pZ * random);
        particle.direction = new THREE.Vector3(pX / this.pRadius, pY / this.pRadius, pZ / this.pRadius);
        particle.acceleration = new THREE.Vector3(.1 * particle.direction.x, 0, .1 * particle.direction.z);
        particle.distance = 125;

        // add it to the geometry
        this.particles.vertices.push(particle);
    }
    // create the particle system
    this.obj = new THREE.Points(
        this.particles,
        this.pMaterial);
    this.obj.name = "particleSystem";
    this.obj.position.y = -50;
    this.obj.frustumCulled = false;
}


ParticleSystem.prototype.update = function(avgFrequency,audioData, pulse) {
    if (audioManager.isPlaying()) {
        var total = 0;
        for (var i = 0; i < 80; i++) {
            total += audioData[i];
        }
        var multipler = total / 10000;

        for (var pCount = 0; pCount < this.particleCount; pCount++) {
            // get the particle
            var particle = this.particles.vertices[pCount];

            //only uses 1 wave
            if (pCount >= this.lastWaveStart && avgFrequency > 60) {
                // emits random particles if its loud enough
                if (Math.sqrt(Math.pow(particle.x, 2) + Math.pow(particle.y, 2) + Math.pow(particle.z, 2)) > particle.distance) {
                    particle.x = 0;
                    particle.z = 0;
                    particle.y = 50;
                    particle.distance = 125 * multipler;
                    var theta = 2 * Math.PI * Math.random();
                    var phi = Math.acos(2 * Math.random() - 1);
                    particle.velocity.x = (Math.sin(phi) * Math.cos(theta)) * 5 * multipler;
                    particle.velocity.y = (Math.sin(phi) * Math.sin(theta)) * 5 * multipler;
                    particle.velocity.z = Math.cos(phi) * 5 * multipler;
                    particle.acceleration.x = 0;
                    particle.acceleration.z = 0;
                }
            }

            //emits the pulse for the beat, cycles through th remaining waves
            if (this.emitPosition.bottomBeat && pulse) {
                var l = this.waveSize * (this.curWave + 1);
                if (pCount >= this.waveSize * this.curWave && pCount < l) {
                    //makes it a scattered circle
                    particle.x = Math.random() * this.pRadius * particle.direction.x;
                    particle.z = Math.random() * this.pRadius * particle.direction.z;
                    particle.y = 22;

                    particle.velocity.x = this.pRadius * particle.direction.x * multipler * 5;
                    particle.velocity.z = this.pRadius * particle.direction.z * multipler * 5;
                    particle.acceleration.x = -1 * particle.direction.x;
                    particle.acceleration.z = -1 * particle.direction.z;
                }

            }

            particle.velocity.x += particle.acceleration.x;
            particle.velocity.z += particle.acceleration.z;
            particle.velocity.y += particle.acceleration.y;

            if (pulse && (particle.direction.x * particle.velocity.x < 0 || particle.direction.z * particle.velocity.z < 0)) {
                //hides the particles
                particle.x = 0;
                particle.z = 0;
                particle.y = 250;
            } else {
                particle.x += particle.velocity.x * .1;
                particle.z += particle.velocity.z * .1;
                particle.y += particle.velocity.y * .1;
            }
        }

        if (this.emitPosition.bottomBeat && pulse) {
            this.emitPosition.bottomBeat = false;
            this.curWave = (this.curWave + 1) % (this.totalWaves - 1);
        }

        this.particles.verticesNeedUpdate = true;

    }
}


ParticleSystem.prototype.onCompleteParticleSystem = function(audioInfo) {
    if (this.upBeatTween) {
        this.upBeatTween.stop();
    }
    if (this.downBeatTween) {
        this.downBeatTween.stop();
    }
    var bpmm = 1000 * 60 / audioInfo.tempo;
    this.emitTopPosition.y = bpmm / 3;

    this.upBeatTween = new TWEEN.Tween(this.emitPosition).to(this.emitTopPosition, bpmm / 2);
    var emitPosition = this.emitPosition;

    this.downBeatTween = new TWEEN.Tween(this.emitPosition).to(this.emitBottomPosition, bpmm / 2).onComplete(function() { emitPosition.bottomBeat = true; });

    this.upBeatTween.chain(this.downBeatTween);
    this.downBeatTween.chain(this.upBeatTween);
    this.upBeatTween.start();
}
