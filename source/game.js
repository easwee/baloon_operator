var Game = function(config) {
    this.canvas = null;
    this.ctx = null;
    this.keys = [];
    this.timeString = '00:00:00';
    this.started = false;
    this.over = false;

    this.options = {
        steerGainRate:  config.steerGainRate || 0.01,
        gasGainRate:    config.gasGainRate || 0.01,
        healthDropRate: config.healthDropRate || 0.5,
        mapSizeX:       6000,
        mapSizeY:       6000,
        stormMaxIterations: 10000,
        stormMaxInstances: 1700
    };

    this.controls = {
        steer: 0,
        gas: 0
    };

    this.baloon = null;
    this.sky = null;
};

Game.prototype.init = function() {
    this.canvas = document.getElementById('display');
    this.ctx = this.canvas.getContext('2d');

    this.initControls();
    this.initMap();
    this.loop();
};

Game.prototype.initMap = function() {
    this.sky = new Sky({
        width: this.options.mapSizeX, 
        height: this.options.mapSizeY,
        maxInstances: this.options.stormMaxInstances,
        maxIterations: this.options.stormMaxIterations
    });

    this.sky.generateStorms();

    this.baloon = new Baloon({
        x: this.options.mapSizeX / 2,
        y: this.options.mapSizeY / 2,
        centerX: this.canvas.width / 2, 
        centerY: this.canvas.height / 2,
        radius: 10
    });
};

Game.prototype.loop = function() {
    this.update();
    this.draw();

    window.requestAnimationFrame(this.loop.bind(this));
};

Game.prototype.draw = function() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
 
    if(!this.started) {
        if(this.over) {
            this.drawGameOver();
        } else {
            this.drawMenu();
        }
        this.sky.renderScanLines(this.ctx)
    } else {
        this.sky.draw(this.ctx);
        this.baloon.draw(this.ctx);
        this.drawTimer();
    }
};

Game.prototype.update = function() {
    if(this.started) {
        if(this.sky.checkBaloonOverlap(this.baloon, this.sky.storms)) {
            this.baloon.updateDamage();
        }

        if(this.baloon.isDead() || this.baloon.isSafe(this.options.mapSizeX, this.options.mapSizeY)) {
            this.stopTimer();
            this.started = false;
            this.over = true;
        }

        this.sky.updateScanLinePosition();
        this.sky.checkScanLineOverlap();
        this.sky.moveStorms(this.baloon.steer, this.baloon.gas);
        this.baloon.updatePosition(this.canvas.height);
    }
};

Game.prototype.updateSteer = function(steerValue) {
    var steer = steerValue || this.controls.steer.value;

    if(steerValue === undefined) {
        this.baloon.steer = 0;
    }

    this.baloon.steer += parseInt(steer) * this.options.steerGainRate;
};

Game.prototype.updateGas = function(gasValue) {
    var gas = gasValue || this.controls.gas.value;

    if(gasValue === undefined) {
        this.baloon.gas = 0;
    }

    this.baloon.gas += parseInt(gas) * this.options.gasGainRate;
};

Game.prototype.startTimer = function() {
    var self = this;
    var unit = -1;

    function pad(val) { 
        return val > 9 ? val : "0" + val; 
    }

    this.timer = setInterval(function () {
        seconds = pad(++unit % 60);
        minutes = pad(parseInt(unit / 60, 10) % 60);
        hours = pad(parseInt(unit / 3600, 10));

        self.timeString = hours + ':' + minutes + ':' + seconds;
    }, 1000);
};

Game.prototype.stopTimer = function(gasValue) {
    clearInterval(this.timer);
    this.timer = null;
};

Game.prototype.resetTimer = function(gasValue) {
    this.timeString = '00:00:00';
};

Game.prototype.drawTimer = function() {
    this.ctx.fillStyle= '#01cc00';
    this.ctx.font = '20px monospace';
    this.ctx.fillText(this.timeString, 40, 40);
    this.ctx.fillText('HEALTH: ' + ~~this.baloon.health + '%', 40, this.canvas.height - 30);
};

Game.prototype.drawMenu = function() {
    var ctx = this.ctx;
    
    ctx.fillStyle= '#01cc00';
    ctx.font = '30px monospace';
    
    var txtGameTitle = 'baloon operator';   
    var txtGameInfo1 = 'welcome my young baloon operator...';
    var txtGameInfo2 = 'we badly need your help! ';
    var txtGameInfo3 = 'one of our weather baloons got lost in the storm,';
    var txtGameInfo4 = 'and this glitchy old radar system is all we got';
    var txtGameInfo5 = 'to contact him and guide him out to the clear sky.';
    var txtGameInfo6 = 'adjust the levers and';
    var txtGameInfo7 = 'try to avoid storm cloud signals.';
    var txtGameInfo8 = 'the storm is big and hard to navigate,';
    var txtGameInfo9 = 'but with dedication you can do it!';
    var txtGameInfo10 = 'click to begin...';

    ctx.fillText(txtGameTitle, 40, 80);
    ctx.font = '18px monospace';
    ctx.fillText(txtGameInfo1, 40, 130);
    ctx.fillText(txtGameInfo2, 40, 160);
    ctx.fillText(txtGameInfo3, 40, 220);
    ctx.fillText(txtGameInfo4, 40, 250);
    ctx.fillText(txtGameInfo5, 40, 280);
    ctx.fillText(txtGameInfo6, 40, 340);
    ctx.fillText(txtGameInfo7, 40, 370);
    ctx.fillText(txtGameInfo8, 40, 430);
    ctx.fillText(txtGameInfo9, 40, 460);
    ctx.fillText(txtGameInfo10, 40, 530);
};

Game.prototype.drawGameOver = function() {
    var ctx = this.ctx;
    var txtGameOver = 'game over!';
    var txtGameWin = 'congratulations!';
    var txtQuoteBad = 'you lost him.';
    var txtQuoteGood = 'you reached clear sky! our baloon is safe!';
    var txtTime = 'time: ' + this.timeString + '.';
    var txtRetry = 'click to retry.';
    var txtReplay = 'click to play again.';
    
    if(this.baloon.isDead()) {
        ctx.fillText(txtGameOver, this.canvas.height/2 - ctx.measureText(txtGameOver).width/2, this.canvas.height/2 - 50);
        ctx.fillText(txtQuoteBad, this.centerText(txtQuoteBad), this.canvas.height/2);
        ctx.fillText(txtRetry, this.centerText(txtRetry), this.canvas.height / 2 + 90);
    } else {
        ctx.fillText(txtGameWin, this.canvas.height/2 - ctx.measureText(txtGameWin).width/2, this.canvas.height/2 - 50);
        ctx.fillText(txtQuoteGood, this.centerText(txtQuoteGood), this.canvas.height/2);
        ctx.fillText(txtTime, this.centerText(txtTime), this.canvas.height / 2 + 50);
        ctx.fillText(txtReplay, this.centerText(txtReplay), this.canvas.height / 2 + 90);
    }
};

Game.prototype.centerText = function(txt) {
    return this.canvas.height/2 - this.ctx.measureText(txt).width/2;
};

Game.prototype.initControls = function() {
    this.controls.steer = document.getElementById('steer');
    this.controls.gas = document.getElementById('gas');

    this.controls.steer.addEventListener('input', this.updateSteer.bind(this, undefined), false);
    this.controls.gas.addEventListener('input', this.updateGas.bind(this, undefined), false);

    var self = this;
    
    this.canvas.addEventListener('mousedown', function() {
        if(!self.started && !self.over) {
            self.started = true;    
            self.resetMovement();
            self.startTimer();
        }
        else if (self.started && !self.over) {
            return;
        } 
        else if (!self.started && self.over){
            self.reset();
        }
    });
};

Game.prototype.reset = function() {
    this.initMap();
    this.resetTimer();
    this.resetMovement();

    this.started = false;
    this.over = false;
};

Game.prototype.resetMovement = function() {
    this.baloon.steer = 0;
    this.baloon.gas = 0;
    this.controls.steer.value = '0';
    this.controls.gas.value = '0';
};