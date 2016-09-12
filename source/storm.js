var Storm = function(id, x, y, radius) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.active = false;
    this.animating = false;
    this.fading = false;
    this.fadeValue = 0;
    this.fadeTimeout = null;
    this.gCanvas = document.createElement('canvas');
    this.gCtx = this.gCanvas.getContext('2d');
    this.gCanvas.width = this.radius*2;
    this.gCanvas.height = this.radius*2;
    this.gRect = this.gCanvas.getBoundingClientRect();
};

Storm.prototype.moveBy = function(x, y) {
    this.x += x;
    this.y += y;
};

Storm.prototype.activate = function() {
    this.active = true;
};

Storm.prototype.reload = function(){
    this.triggered = false; 
};

Storm.prototype.draw = function(storm, ctx, drawOffset) {
    var x = storm.x;
    var y = storm.y;
    var glitch = this.generateGlitch(storm.id);

    ctx.drawImage(glitch, x - this.radius, y - this.radius);

    this.active = false;
};

Storm.prototype.generateGlitch = function(id) {
    var half = this.gCanvas.width / 2;
    var jitter = half + 30;
    var rndPos = {
        x: 10 + ~~(half + Math.random()*jitter - jitter/2),
        y: 10 + ~~(half + Math.random()*jitter - jitter/2)
    };
    var pos = this.getSquare(rndPos, this.gRect);

    if(this.fading) {
        this.fadeValue += 0.1;

        if(this.fadeValue > 0.8) {          
            this.fadeValue = 0.4;
        }
    } else {
        this.fadeValue -= 0.2;

        if(this.fadeValue < 0) {
            this.fadeValue = 0;            
        }
    }

    this.fillSquare(this.gCtx, pos.x, pos.y, this.fadeValue);

    return this.gCanvas;
};

Storm.prototype.getSquare = function(pos, rect) {
    return {
        x: (pos.x - rect.left) - (pos.x - rect.left) % 10,
        y: (pos.y - rect.top) - (pos.y - rect.top) % 10
    };
};

Storm.prototype.fillSquare = function(context, x, y, opacity) {
    context.clearRect(x, y, x + 10, y + 10);
    context.fillStyle = 'rgba(0, 184, 0, ' + opacity + ')';
    context.fillRect(x, y, 10, 10);
};

Storm.prototype.startFadeCycle = function(id) {
    this.fading = true;
    this.fadeTimeout = setTimeout(this.stopFadeCycle.bind(this, id), 1000);
};

Storm.prototype.stopFadeCycle = function(id) {
    this.animating = false;
    this.fading = false;
};