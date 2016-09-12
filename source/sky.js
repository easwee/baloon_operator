var Sky = function(config) {
    this.props = {
        width: config.width,
        height: config.height,
        maxInstances: config.maxInstances || 50,
        maxIterations: config.maxIterations || 500
    };

    this.scan = {
        position: -10,
        height: 100,
        speed: 4
    };

    this.storms = [];
};

Sky.prototype.init = function() {    
    this.generateStorms();
    this.draw(); 
};

Sky.prototype.generateStorms = function() {
    this.drawOffset = (this.props.width - 600) /2;
    var stormsCount   = 0;
    var maxInstances  = this.props.maxInstances;
    var skyCenter  =  this.skyCenter = {x: this.props.width / 2, y: this.props.height / 2};
    var skyRadius     = this.props.width/2;
    var iteration     = 0;
    var maxIterations = this.props.maxIterations;

    var storms = this.storms = [];

    while (stormsCount < maxInstances && iteration < maxIterations) {
        var x = skyCenter.x + 2 * skyRadius * Math.random() - skyRadius;
        var y = skyCenter.y + 2 * skyRadius * Math.random() - skyRadius;
        var r = this.getRandomInt(30,70);

        var stormWidth = x - this.drawOffset;
        var stormHeight = y - this.drawOffset;
        var storm = new Storm(stormsCount, stormWidth, stormHeight, r);

        if (this.checkBounds(storm, storm.radius, skyCenter, skyRadius) && 
            this.checkOverlap(storm, storms) &&
            this.chackSpawnOverlap(storm, skyCenter)
        ) {
            storms.push(storm);
            stormsCount++;
        }

        iteration += 1;
    }
};

Sky.prototype.chackSpawnOverlap = function(current, center) {
    if (current.x > center.x - 100- this.drawOffset && 
        current.x < center.x + 100- this.drawOffset && 
        current.y > center.y - 100- this.drawOffset && 
        current.y < center.y + 100- this.drawOffset) 
    {
        return false;
    }
    return true;
};

Sky.prototype.checkBounds = function(cPosition, cRadius, boundsCenter, boundsRadius) {
    var minX = boundsCenter.x - boundsRadius - this.drawOffset;
    var maxX = boundsCenter.x + boundsRadius - this.drawOffset;
    var minY = boundsCenter.y - boundsRadius - this.drawOffset;
    var maxY = boundsCenter.y + boundsRadius - this.drawOffset;

    var withinX = (cPosition.x + cRadius <= maxX) && (cPosition.x - cRadius >= minX);
    var withinY = (cPosition.y + cRadius <= maxY) && (cPosition.y - cRadius >= minY);

    return withinX && withinY;
};

Sky.prototype.checkOverlap = function(current, all) {
    for (var i = 0; i < all.length; i++) {
        var length = Math.sqrt((all[i].x-current.x)*(all[i].x-current.x) + (all[i].y-current.y)*(all[i].y-current.y));
        if (length < all[i].radius * 2) {
            return false;
        }
    }
    return true;
};

Sky.prototype.checkBaloonOverlap = function(current, all) {
    for (var i = 0; i < all.length; i++) {
        var dx = current.centerX - all[i].x;
        var dy = current.centerY - all[i].y;
        var distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < current.radius + all[i].radius) {
            all[i].activate();
            return true;
        }
    }

    return false;
};

Sky.prototype.getRandomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

Sky.prototype.draw = function(ctx) {
    var storms = this.storms;

    for (var i = 0; i < storms.length; i++) {
        storms[i].draw(storms[i], ctx, this.drawOffset);
    }
    ctx.globalCompositeOperation = 'lighter';
    this.renderMainScanLine(ctx);
    this.renderScanLines(ctx);
};

Sky.prototype.moveStorms = function(horizontal, vertical) {
    var storms = this.storms;
    var x = 0;
    var y = 0;

    if(horizontal < 10 || horizontal > -10) {
        if (horizontal > 0) {
            x += horizontal;
        } 
        else if (horizontal < 0) {
            x += horizontal;
        }
    }

    if(vertical < 10 || vertical > -10) {
        if (vertical > 0) {
            y += vertical;
        } 
        else if (vertical < 0) {
            y += vertical;
        }
    }

    for(var i = 0; i < storms.length; i++) {
        storms[i].moveBy(x, y);
    }
};

Sky.prototype.renderScanLines = function(ctx){
    var i;
    var j;

    ctx.beginPath();

    for( i = 0; i < this.props.height; i += 2 ){    
        ctx.moveTo( 0, i + .5 );
        ctx.lineTo( this.props.width, i + .5);
    }

    ctx.lineWidth = 1;
    ctx.strokeStyle = 'hsla( 0, 0%, 0%, 1 )';
    ctx.globalCompositeOperation = 'source-over';
    ctx.stroke();
};

Sky.prototype.renderMainScanLine = function(ctx){
    var gradient = ctx.createLinearGradient(0 , this.scan.position - this.scan.height, 0 , this.scan.position );

    gradient.addColorStop( 0, 'rgba(0, 25, 0, 0)' );
    gradient.addColorStop( 1, 'rgba(37, 128, 0, 0.5)' );

    ctx.fillStyle = gradient;
    ctx.fillRect(0, this.scan.position - this.scan.height, this.props.width, this.scan.height);

    ctx.fill();
};

Sky.prototype.updateScanLinePosition = function(resetPoint){
    if(this.scan.position - this.scan.height  < 600) {
        this.scan.position += this.scan.speed;
    } else {
        this.scan.position = -this.scan.height - 300;
    }
};

Sky.prototype.checkScanLineOverlap = function(){
    for(var i = 0; i<this.storms.length; i++) {
        var storm = this.storms[i];
        if(!storm.animating && (this.skyCenter.y-300 - this.drawOffset) + this.scan.position > storm.y && this.scan.position > 0) {
            storm.startFadeCycle(storm.id);
            storm.animating = true;
        }
    }
};