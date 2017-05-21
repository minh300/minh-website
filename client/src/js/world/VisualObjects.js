var VISUALOBJECTS = (function() {

    function getShape(numberOfSides, size) {
        var shape = new THREE.Shape(); // From http://blog.burlock.org/html5/130-paths
        var x = 0,
            y = 0;
        shape.moveTo(x + size * Math.cos(0 * 2 * Math.PI / numberOfSides), y + size * Math.sin(0 * 2 * Math.PI / numberOfSides));

        for (var i = 1; i < numberOfSides; i++) {
            shape.lineTo(x + size * Math.cos(i * 2 * Math.PI / numberOfSides), y + size * Math.sin(i * 2 * Math.PI / numberOfSides));
        }

        var extrudeSettings = {
            amount: 1,
            bevelEnabled: true,
            bevelSegments: 1,
            steps: 2,
            bevelSize: 1,
            bevelThickness: 1
        };
        var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geometry.rotateX(Math.PI);
        geometry.scale(0.4, 0.4, 0.4);
        return geometry;
    }

    function addChildrenFromSphere(obj, radius, count, heaxgonSize, opacity) {
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
            obj.add(mesh);
        }
    }

    //color logic by https://github.com/michaelbromley/soundcloud-visualizer
    function getColors(val) {
        var colors = {}
        if (val > 128) {
            colors.r = (val - 128) * 2;
            colors.g = ((Math.cos((2 * val / 128 * Math.PI / 2) - 4 * Math.PI / 3) + 1) * 128);
            colors.b = (val - 105) * 3;
        } else {
            colors.r = ((Math.cos((2 * val / 128 * Math.PI / 2)) + 1) * 128);
            colors.g = ((Math.cos((2 * val / 128 * Math.PI / 2) - 4 * Math.PI / 3) + 1) * 128);
            colors.b = ((Math.cos((2.4 * val / 128 * Math.PI / 2) - 2 * Math.PI / 3) + 1) * 128);
        }

        return colors;
    }

    function SphericalObject(radius, count, heaxgonSize, opacity, name, pos) {
        var obj = new THREE.Object3D();
        obj.name = name;
        if (pos) {
            obj.position.set(pos.x, pos.y, pos.z);
        } else {
            obj.position.set(0, 0, 0);
        }

        addChildrenFromSphere(obj, radius, count, heaxgonSize, opacity);
        this.obj = obj;
        this.topIndexFunction = function(i, l) {
            return i;
        };
        this.botIndexFunction = function(i, l) {
            return i;
        };
        this.rotationFunction = function(i, x) {
            return x > 0 ? 1 : -1;
        };

        this.update = function(avgFrequency, dataArray, decay, transforming, to, opacity) {
            var total = 0;

            for (var i = 0, l = dataArray.length / 2; i < l; i++) {
                total += dataArray[i];
                var topIndex = this.topIndexFunction(i, l);
                var botIndex = this.botIndexFunction(i, l);
                var inChild1 = this.obj.children[topIndex];
                var inChild2 = this.obj.children[botIndex];

                var val = Math.pow((dataArray[i] / 255), 2) * 255;
                val *= i > 42 ? 1.1 : 1;
                // establish the value for this tile
                var scalar = avgFrequency > 60 ? 50 : 100;
                var scaleVal = val / scalar;

                if (scaleVal > inChild1.scalehigh) {
                    inChild1.scalehigh = val / scalar;
                } else {
                    inChild1.scalehigh = (inChild1.scalehigh * 100 - inChild1.decay * decay) / 100;
                    scaleVal = inChild1.scalehigh;
                }

                if (scaleVal == 0) {
                    scaleVal = .01;
                }

                if (val > inChild1.high) {
                    inChild1.high = val;
                } else {
                    inChild1.high -= inChild1.decay * decay;
                    val = inChild1.high;
                }

                inChild1.scale.set(scaleVal, scaleVal, scaleVal);
                inChild2.scale.set(scaleVal, scaleVal, scaleVal);

                // figure out what colour to fill it and then draw the polygon
                if (val > 50) {
                    //color
                    var colors = getColors(val);
                    inChild1.material.color.setRGB(Math.round(colors.r) / 100, Math.round(colors.g) / 100, Math.round(colors.b) / 100);
                    inChild2.material.color.setRGB(Math.round(colors.r) / 100, Math.round(colors.g) / 100, Math.round(colors.b) / 100);


                    //rotations
                    if (avgFrequency > 60) {
                        inChild1.rotation.y = this.rotationFunction(inChild1.rotation.y, .01);
                        inChild2.rotation.y = this.rotationFunction(inChild1.rotation.y, -.01);
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
                } //end of val>50

                if (transforming) {
                    if (to) {
                        inChild1.material.opacity = opacity;
                        inChild2.material.opacity = opacity;
                    } else {
                        inChild1.material.opacity = 1 - opacity;
                        inChild2.material.opacity = 1 - opacity;
                    }
                    inChild1.rotation.y = (2 * Math.PI) * opacity;
                    inChild2.rotation.y = -(2 * Math.PI) * opacity;
                } else {
                    inChild1.material.opacity = .95;
                    inChild2.material.opacity = .95;
                }
            } //end of for
        }

    }






    function Heart(radius, count, heaxgonSize, opacity, name) {
        SphericalObject.call(this, radius, count, heaxgonSize, opacity, name);
        this.obj.rotation.x = (-Math.PI / 2);
        this.topIndexFunction = function(i, l) {
            return i + l;
        };
        this.botIndexFunction = function(i, l) {
            return l - i - 1;
        };
        this.rotationFunction = function(i, x) {
            return x > 0 ? 1 : -1;
        };
    }

    Heart.prototype = Object.create(SphericalObject.prototype);











    function Staff(radius, count, heaxgonSize, opacity, name) {
        SphericalObject.call(this, radius, count, heaxgonSize, opacity, name);
        this.obj.rotation.z = (-Math.PI / 2);

        this.botIndexFunction = function(i, l) {
            return l * 2 - i - 1;
        };
        this.rotationFunction = function(i, x) {
            return i + x;
        };
    }

    Staff.prototype = Object.create(SphericalObject.prototype);










    function OutterSphere(radius, count, heaxgonSize, opacity, name) {
        SphericalObject.call(this, radius, count, heaxgonSize, opacity, name);
        this.update = function(avgFrequency, dataArray, decay, transforming, to, opacity) {
            var total = 0;

            for (var i = 0, l = dataArray.length / 2; i < l; i++) {
                total += dataArray[i];
                var topIndex = i + l;
                var botIndex = l - i - 1;

                var outChild1 = this.obj.children[topIndex];
                var outChild2 = this.obj.children[botIndex];

                var val = Math.pow((dataArray[i] / 255), 2) * 255;
                val *= i > 42 ? 1.1 : 1;

                if (val > outChild1.high) {
                    outChild1.high = val;
                } else {
                    outChild1.high -= outChild1.decay * decay;
                    val = outChild1.high;
                }

                // figure out what colour to fill it and then draw the polygon
                var r, g, b, a;
                if (val > 50) {
                    //color
                    var colors = getColors(val);
                    outChild1.material.color.setRGB(Math.round(colors.r), Math.round(colors.g), Math.round(colors.b));
                    outChild2.material.color.setRGB(Math.round(colors.r), Math.round(colors.g), Math.round(colors.b));
                } //end of val>50 
            } //end of for
            if (transforming) {

                this.obj.rotation.y += .05;
            } else {
                this.obj.rotation.y += 0.005;

            }
        }
    }
    OutterSphere.prototype = Object.create(SphericalObject.prototype);













    function Flower(radius, count, heaxgonSize, opacity, name) {
        SphericalObject.call(this, radius, count, heaxgonSize, opacity, name, { x: 0, y: -40, z: 0 });
        for (var i = this.obj.children.length / 2, l = this.obj.children.length; i < l; i++) {
            this.obj.children[i].visible = false;
        }
        this.obj.rotation.x = (Math.PI);

        this.botIndexFunction = function(i, l) {
            return l * 2 - i - 1;
        };
        this.rotationFunction = function(i, x) {
            return i + x;
        };
    }

    Flower.prototype = Object.create(SphericalObject.prototype);











    function Spiral(radius, count, heaxgonSize, opacity, name) {
        SphericalObject.call(this, radius, count, heaxgonSize, opacity, name);

        for (var i = this.obj.children.length / 2, l = this.obj.children.length; i < l; i++) {
            this.obj.children[i].visible = false;
        }
        this.obj.rotation.x = (-Math.PI / 2);

        this.update = function(avgFrequency, dataArray, decay, transforming, to, opacity) {

            for (var i = 0, l = dataArray.length; i < l; i++) {
                var inChild1 = this.obj.children[l - i - 1];

                var val = Math.pow((dataArray[i] / 255), 2) * 255;
                val *= i > 42 ? 1.1 : 1;
                // establish the value for this tile
                var scalar = avgFrequency > 60 ? 50 : 100;
                var scaleVal = val / scalar;

                if (scaleVal > inChild1.scalehigh) {
                    inChild1.scalehigh = val / scalar;
                } else {
                    inChild1.scalehigh = (inChild1.scalehigh * 100 - inChild1.decay * decay) / 100;
                    scaleVal = inChild1.scalehigh;
                }

                if (scaleVal == 0) {
                    scaleVal = .01;
                }

                if (val > inChild1.high) {
                    inChild1.high = val;
                } else {
                    inChild1.high -= inChild1.decay * decay;
                    val = inChild1.high;
                }

                inChild1.scale.set(scaleVal, scaleVal, scaleVal);

                // figure out what colour to fill it and then draw the polygon
                //color
                var colors = getColors(val);
                inChild1.material.color.setRGB(Math.round(colors.r) / 100, Math.round(colors.g) / 100, Math.round(colors.b) / 100);

                //rotations
                if (avgFrequency > 60) {
                    inChild1.rotation.y += .01;
                } else {
                    inChild1.rotation.y -= inChild1.decay / 500;
                    if (inChild1.rotation.y < 0) {
                        inChild1.rotation.y = 0;
                    }
                }

                if (transforming) {
                    if (to) {
                        inChild1.material.opacity = opacity;
                    } else {
                        inChild1.material.opacity = 1 - opacity;
                    }
                    inChild1.rotation.y = (2 * Math.PI) * opacity;
                } else {
                    inChild1.material.opacity = .95;
                }
            } //end of for

        }
    }

    Spiral.prototype = Object.create(SphericalObject.prototype);












    function Fountain(radius, count, heaxgonSize, opacity, name) {
        var obj = new THREE.Object3D();
        obj.name = name;
        obj.position.set(0, -35, 0);

        for (var i = 1, l = count; i <= l; i++) {
            var geometry = getShape(6, heaxgonSize);

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
            mesh.position.set(i * Math.cos(i), 0, i * Math.sin(i));
            mesh.decay = i > 42 ? 1.5 : 2;
            mesh.high = 0;
            mesh.scalehigh = 0;
            mesh.rotation.x = (-Math.PI / 2);
            mesh.base = mesh.position.x;
            mesh.base2 = mesh.position.y;
            obj.add(mesh);
        }
        obj.rotation.y = (Math.PI / 2);

        this.obj = obj;

        this.update = function(avgFrequency, dataArray, decay, transforming, to, opacity) {

            for (var i = dataArray.length - 1, l = 0; i >= l; i--) {
                var inChild1 = this.obj.children[i];

                var val = Math.pow((dataArray[i] / 255), 2) * 255;
                val *= i > 42 ? 1.1 : 1;
                // establish the value for this tile
                var scalar = avgFrequency > 60 ? 50 : 100;
                var scaleVal = val / scalar;

                if (scaleVal > inChild1.scalehigh) {
                    inChild1.scalehigh = val / scalar;
                } else {
                    inChild1.scalehigh = (inChild1.scalehigh * 100 - inChild1.decay * decay) / 100;
                    scaleVal = inChild1.scalehigh;
                }

                if (scaleVal == 0) {
                    scaleVal = .01;
                }

                if (val > inChild1.high) {
                    inChild1.high = val;
                } else {
                    inChild1.high -= inChild1.decay * decay;
                    val = inChild1.high;
                }

                inChild1.scale.set(scaleVal, scaleVal, scaleVal);
                inChild1.position.y = inChild1.base + (scaleVal * val / 10);

                // figure out what colour to fill it and then draw the polygon
                //color
                var colors = getColors(val);
                inChild1.material.color.setRGB(Math.round(colors.r) / 100, Math.round(colors.g) / 100, Math.round(colors.b) / 100);

                //rotations
                if (avgFrequency > 60) {
                    inChild1.rotation.z += .01;
                } else {
                    inChild1.rotation.z -= inChild1.decay / 500;
                    if (inChild1.rotation.z < 0) {
                        inChild1.rotation.z = 0;
                    }

                }

                if (transforming) {
                    if (to) {
                        inChild1.material.opacity = opacity;
                    } else {
                        inChild1.material.opacity = 1 - opacity;
                    }
                    inChild1.rotation.y = (2 * Math.PI) * opacity;
                } else {
                    inChild1.material.opacity = .95;
                }
            } //end of for

        }
    }

    return { Heart: Heart, Staff: Staff, Spiral: Spiral, Flower: Flower, Fountain: Fountain, OutterSphere: OutterSphere };;
})();
