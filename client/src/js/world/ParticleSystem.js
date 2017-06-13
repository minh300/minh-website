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


ParticleSystem.prototype.update = function(avgFrequency, audioData, pulse) {
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




function SnowSystem() {
    this.particleCount = 4000;
    this.obj = new THREE.Object3D();
    this.obj.name = "SnowSystem";
    for (var i = 1; i < 4; i++) {
        var geometry = new THREE.Geometry();
        var material = new THREE.PointsMaterial({
            color: 0xFFFFFF,
            size: 4,
            map: new THREE.TextureLoader().load("images/textures/snowflake" + i + ".png"),
            blending: THREE.AdditiveBlending,
            depthTest: true,
            depthWrite: true,
            alphaTest: 0.5,
            transparent: true
        });
        for (var p = 0; p < this.particleCount / 3; p++) {
            var angle = (p % 360) * Math.PI / 180;
            var pX = Math.random() * 250 - 125;
            var pY = Math.random() * 300;
            var pZ = Math.random() * 250 - 125;
            var random = p > this.lastWaveStart ? Math.random() : 1
            var particle = new THREE.Vector3(pX, pY, pZ);
            particle.velocity = new THREE.Vector3(0, Math.random() * .25 + .25, 0);

            // add it to the geometry
            geometry.vertices.push(particle);
        }
        var points = new THREE.Points(
            geometry,
            material);
        points.frustumCulled = false;
        this.obj.add(points);
    }


}

SnowSystem.prototype.update = function(delta) {
    for (var i = 0, l = this.obj.children.length; i < l; i++) {
        var cur = this.obj.children[i].geometry;
        for (var pCount = 0; pCount < this.particleCount / l; pCount++) {
            // get the particle
            var particle = cur.vertices[pCount];

            particle.y -= particle.velocity.y;

            if (particle.y < 0) {
                //hides the particles
                particle.y = 250;
                particle.velocity.y = Math.random() * .25 + .25;


            }
        }
        cur.verticesNeedUpdate = true;

    }
}


function RingSystem(rotation) {
    this.particleCount = 200;
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

    this.pRadius = 14; //particle radius
    this.ringPositions = [];
    this.outterRingPositions = [];

    // now create the individual particles
    for (var p = 0; p < this.particleCount; p++) {
        var angle = (p * 360 / this.particleCount) * Math.PI / 180;

        var pX = Math.cos(angle) * this.pRadius;
        var pY = 12.5;
        var pZ = Math.sin(angle) * this.pRadius;
        this.ringPositions.push({ x: pX, y: pY, z: pZ });
        this.outterRingPositions.push({ x: pX * 10, y: pY, z: pZ * 10 });
        var particle = new THREE.Vector3(Math.random() * 500 - 250, Math.random() * 500 - 250, Math.random() * 500 - 250);

        // add it to the geometry
        this.particles.vertices.push(particle);
    }


    // create the particle system
    this.obj = new THREE.Points(
        this.particles,
        this.pMaterial);
    this.obj.name = "RingSystem";
    this.obj.position.y = 0;
    this.obj.frustumCulled = false;
    this.obj.visible = false;
     this.obj.rotation.z = rotation;
}

RingSystem.prototype.update = function() {
    this.obj.visible = true;

    var duration = 2000;
    var me = this;
    for (var i = 0; i < this.particleCount; i++) {
        var particle = this.particles.vertices[i];
        var startTween = new TWEEN.Tween(particle)
            .to({
                x: me.ringPositions[i].x,
                y: me.ringPositions[i].y,
                z: me.ringPositions[i].z
            }, 1750)
            .easing(TWEEN.Easing.Exponential.InOut).onUpdate(function() {
                me.particles.verticesNeedUpdate = true;
                me.obj.rotation.y += .001;
               // me.obj.rotation.x += Math.random() * .001 - .0005;
               // me.obj.rotation.z += Math.random() * .001 - .0005;

            });

        var endTween = new TWEEN.Tween(particle)
            .to({
                x: me.outterRingPositions[i].x,
                y: me.outterRingPositions[i].y,
                z: me.outterRingPositions[i].z
            }, 500)
            .easing(TWEEN.Easing.Exponential.InOut).onUpdate(function() {
                me.particles.verticesNeedUpdate = true;
            });

        startTween.chain(endTween).start();
    }




}

RingSystem.prototype.resetPosition = function() {
    for (var i = 0; i < this.particleCount; i++) {
        var particle = this.particles.vertices[i];
        particle.x = Math.random() * 500 - 250;
        particle.y = Math.random() * 500 - 250;
        particle.z = Math.random() * 500 - 250;
    }
    this.particles.verticesNeedUpdate = true;
    this.obj.visible = false;
}
