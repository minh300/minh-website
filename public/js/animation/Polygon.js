   function Polygon(sides, x, y, tileSize, ctx, num) {
        this.sides = sides;
        this.tileSize = tileSize;
        this.ctx = ctx;
        this.num = num; // the number of the tile, starting at 0
        this.high = 0; // the highest colour value, which then fades out
        this.decay = this.num > 42 ? 1.5 : 2; // increase this value to fade out faster.
        this.highlight = 0; // for highlighted stroke effect;
        // figure out the x and y coordinates of the center of the polygon based on the
        // 60 degree XY axis coordinates passed in
        var step = Math.round(Math.cos(Math.PI/6)*tileSize*2);
        this.y = Math.round(step * Math.sin(Math.PI/3) * -y  );
        this.x = Math.round(x * step + y * step/2 );

        // calculate the vertices of the polygon
        this.vertices = [];
        for (var i = 1; i <= this.sides;i += 1) {
            x = this.x + this.tileSize * Math.cos(i * 2 * Math.PI / this.sides + Math.PI/6);
            y = this.y + this.tileSize * Math.sin(i * 2 * Math.PI / this.sides + Math.PI/6);
            this.vertices.push([x, y]);
        }
    }
    Polygon.prototype.rotateVertices = function() {
        // rotate all the vertices to achieve the overall rotational effect
        var rotation = fgRotation;
        rotation -= audioSource.volume > 10000 ? Math.sin(audioSource.volume/800000) : 0;
        for (var i = 0; i <= this.sides-1;i += 1) {
            this.vertices[i][0] = this.vertices[i][0] -  this.vertices[i][1] * Math.sin(rotation);
            this.vertices[i][1] = this.vertices[i][1] +  this.vertices[i][0] * Math.sin(rotation);
        }
    };
    var minMental = 0, maxMental = 0;
    Polygon.prototype.calculateOffset = function(coords) {
        var angle = Math.atan(coords[1]/coords[0]);
        var distance = Math.sqrt(Math.pow(coords[0], 2) + Math.pow(coords[1], 2)); // a bit of pythagoras
        var mentalFactor = Math.min(Math.max((Math.tan(audioSource.volume/6000) * 0.5), -20), 2); // this factor makes the visualization go crazy wild
        /*
        // debug
        minMental = mentalFactor < minMental ? mentalFactor : minMental;
         maxMental = mentalFactor > maxMental ? mentalFactor : maxMental;*/
        var offsetFactor = Math.pow(distance/3, 2) * (audioSource.volume/2000000) * (Math.pow(this.high, 1.3)/300) * mentalFactor;
        var offsetX = Math.cos(angle) * offsetFactor;
        var offsetY = Math.sin(angle) * offsetFactor;
        offsetX *= (coords[0] < 0) ? -1 : 1;
        offsetY *= (coords[0] < 0) ? -1 : 1;
        return [offsetX, offsetY];
    };
    Polygon.prototype.drawPolygon = function() {
        var bucket = Math.ceil(audioSource.streamData.length/tiles.length*this.num);
        var val = Math.pow((audioSource.streamData[bucket]/255),2)*255;
        val *= this.num > 42 ? 1.1 : 1;
        // establish the value for this tile
        if (val > this.high) {
            this.high = val;
        } else {
            this.high -= this.decay;
            val = this.high;
        }

        // figure out what colour to fill it and then draw the polygon
        var r, g, b, a;
        if (val > 0) {
            this.ctx.beginPath();
            var offset = this.calculateOffset(this.vertices[0]);
            this.ctx.moveTo(this.vertices[0][0] + offset[0], this.vertices[0][1] + offset[1]);
            // draw the polygon
            for (var i = 1; i <= this.sides-1;i += 1) {
                offset = this.calculateOffset(this.vertices[i]);
                this.ctx.lineTo (this.vertices[i][0] + offset[0], this.vertices[i][1] + offset[1]);
            }
            this.ctx.closePath();

            if (val > 128) {
                r = (val-128)*2;
                g = ((Math.cos((2*val/128*Math.PI/2)- 4*Math.PI/3)+1)*128);
                b = (val-105)*3;
            }
            else if (val > 175) {
                r = (val-128)*2;
                g = 255;
                b = (val-105)*3;
            }
            else {
                r = ((Math.cos((2*val/128*Math.PI/2))+1)*128);
                g = ((Math.cos((2*val/128*Math.PI/2)- 4*Math.PI/3)+1)*128);
                b = ((Math.cos((2.4*val/128*Math.PI/2)- 2*Math.PI/3)+1)*128);
            }
            if (val > 210) {
                this.cubed = val; // add the cube effect if it's really loud
            }
            if (val > 120) {
                this.highlight = 100; // add the highlight effect if it's pretty loud
            }
            // set the alpha
            var e = 2.7182;
            a = (0.5/(1 + 40 * Math.pow(e, -val/8))) + (0.5/(1 + 40 * Math.pow(e, -val/20)));

            this.ctx.fillStyle = "rgba(" +
                Math.round(r) + ", " +
                Math.round(g) + ", " +
                Math.round(b) + ", " +
                a + ")";
            this.ctx.fill();
            // stroke
            if (val > 20) {
                var strokeVal = 20;
                this.ctx.strokeStyle =  "rgba(" + strokeVal + ", " + strokeVal + ", " + strokeVal + ", 0.5)";
                this.ctx.lineWidth = 1;
                this.ctx.stroke();
            }
        }
        // display the tile number for debug purposes
        /*this.ctx.font = "bold 12px sans-serif";
         this.ctx.fillStyle = 'grey';
         this.ctx.fillText(this.num, this.vertices[0][0], this.vertices[0][1]);*/
    };
    Polygon.prototype.drawHighlight = function() {
        this.ctx.beginPath();
        // draw the highlight
        var offset = this.calculateOffset(this.vertices[0]);
        this.ctx.moveTo(this.vertices[0][0] + offset[0], this.vertices[0][1] + offset[1]);
        // draw the polygon
        for (var i = 0; i <= this.sides-1;i += 1) {
            offset = this.calculateOffset(this.vertices[i]);
            this.ctx.lineTo (this.vertices[i][0] + offset[0], this.vertices[i][1] + offset[1]);
        }
        this.ctx.closePath();
        var a = this.highlight/100;
        this.ctx.strokeStyle =  "rgba(255, 255, 255, " + a + ")";
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        this.highlight -= 0.5;
    };

