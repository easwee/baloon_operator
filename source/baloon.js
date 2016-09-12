var Baloon = function(config) {
	this.x = config.x || 0;
	this.y = config.y || 0;
	this.radius = config.radius || 2;
	this.centerY = config.centerY;
	this.centerX = config.centerX;
	this.altitude = config.altitude || 100;
	this.steer = 0;
	this.steerMax = 10;
	this.gas = 0;
	this.steerMax = 10;
	this.health = config.health || 100;
	this.healthDisplay = document.getElementById('health');
};

Baloon.prototype.draw = function(ctx) {
	var x = this.centerX;
	var y = this.centerY;
	var r = this.radius;
	
	ctx.lineWidth = 2;
	ctx.fillStyle = 'transparent';
	ctx.strokeStyle = 'rgba(0, 184, 0, 1)';

    ctx.beginPath();
    
    ctx.moveTo(x - r , y);
    ctx.lineTo(x + r , y);
    ctx.stroke();

    ctx.moveTo(x, y - r);
    ctx.lineTo(x, y + r);
    ctx.stroke();
};

Baloon.prototype.updatePosition = function() {
	this.x -= this.steer;
	this.y -= this.gas;
};

Baloon.prototype.updateDamage = function() {
	if(this.health <= 0) return;
	
	this.health -= 0.3;
};

Baloon.prototype.isSafe = function(mX, mY) {
	var offset = 200;
	return (this.x < -offset || this.x > mX + offset || this.y < -offset || this.y > mY + offset) ? true : false;
};

Baloon.prototype.isDead = function() {
	return (this.health <= 0) ? true : false;
};