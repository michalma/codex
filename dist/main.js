"use strict";
var Game = /** @class */ (function () {
    function Game() {
        var _this = this;
        this.width = 800;
        this.height = 600;
        this.tileWidth = 64;
        this.tileHeight = 32;
        this.mapSize = 10;
        this.playerX = 0;
        this.playerY = 0;
        this.peas = [];
        this.score = 0;
        this.groundPattern = null;
        this.canvas = document.getElementById('game');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        var ctx = this.canvas.getContext('2d');
        if (!ctx)
            throw new Error('Canvas not supported');
        this.ctx = ctx;
        this.scoreEl = document.getElementById('score');
        this.createGroundPattern();
        this.reset();
        this.registerEvents();
        requestAnimationFrame(function () { return _this.loop(); });
    }
    Game.prototype.reset = function () {
        for (var y = 0; y < this.mapSize; y++) {
            this.peas[y] = [];
            for (var x = 0; x < this.mapSize; x++) {
                this.peas[y][x] = Math.random() < 0.3; // 30% chance for pea pod
            }
        }
        this.playerX = Math.floor(this.mapSize / 2);
        this.playerY = Math.floor(this.mapSize / 2);
    };
    Game.prototype.registerEvents = function () {
        var _this = this;
        window.addEventListener('keydown', function (e) {
            switch (e.key) {
                case 'ArrowUp':
                    if (_this.playerY > 0)
                        _this.playerY--;
                    break;
                case 'ArrowDown':
                    if (_this.playerY < _this.mapSize - 1)
                        _this.playerY++;
                    break;
                case 'ArrowLeft':
                    if (_this.playerX > 0)
                        _this.playerX--;
                    break;
                case 'ArrowRight':
                    if (_this.playerX < _this.mapSize - 1)
                        _this.playerX++;
                    break;
            }
            _this.checkPea();
        });
    };
    Game.prototype.createGroundPattern = function () {
        var patternCanvas = document.createElement('canvas');
        patternCanvas.width = 64;
        patternCanvas.height = 32;
        var pctx = patternCanvas.getContext('2d');
        if (!pctx)
            return;
        pctx.fillStyle = '#6b5234';
        pctx.fillRect(0, 0, patternCanvas.width, patternCanvas.height);
        pctx.fillStyle = '#5a472c';
        for (var i = 0; i < 100; i++) {
            var x = Math.random() * patternCanvas.width;
            var y = Math.random() * patternCanvas.height;
            pctx.fillRect(x, y, 1, 1);
        }
        this.groundPattern = this.ctx.createPattern(patternCanvas, 'repeat');
    };
    Game.prototype.checkPea = function () {
        if (this.peas[this.playerY][this.playerX]) {
            this.peas[this.playerY][this.playerX] = false;
            this.score++;
            this.scoreEl.textContent = "Peas eaten: ".concat(this.score);
        }
    };
    Game.prototype.loop = function () {
        var _this = this;
        this.draw();
        requestAnimationFrame(function () { return _this.loop(); });
    };
    Game.prototype.draw = function () {
        this.ctx.clearRect(0, 0, this.width, this.height);
        // draw tiles
        for (var y = 0; y < this.mapSize; y++) {
            for (var x = 0; x < this.mapSize; x++) {
                var screen_1 = this.isoToScreen(x, y);
                this.drawTile(screen_1.x, screen_1.y);
                if (this.peas[y][x]) {
                    this.drawPeaPod(screen_1.x, screen_1.y - this.tileHeight / 2);
                }
            }
        }
        // draw player
        var playerScreen = this.isoToScreen(this.playerX, this.playerY);
        this.drawBear(playerScreen.x, playerScreen.y - this.tileHeight / 2);
    };
    Game.prototype.drawTile = function (x, y) {
        if (this.groundPattern) {
            this.ctx.fillStyle = this.groundPattern;
        }
        else {
            this.ctx.fillStyle = '#6b5234';
        }
        this.drawDiamond(x, y, this.tileWidth, this.tileHeight, true);
        this.ctx.strokeStyle = '#3a2f1a';
        this.drawDiamond(x, y, this.tileWidth, this.tileHeight, false);
    };
    Game.prototype.drawPeaPod = function (x, y) {
        var grad = this.ctx.createLinearGradient(x - 12, y, x + 12, y);
        grad.addColorStop(0, '#1a722f');
        grad.addColorStop(1, '#34aa46');
        this.ctx.fillStyle = grad;
        this.ctx.beginPath();
        this.ctx.moveTo(x - 12, y);
        this.ctx.quadraticCurveTo(x, y - 8, x + 12, y);
        this.ctx.quadraticCurveTo(x, y + 8, x - 12, y);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.fillStyle = '#b7e57d';
        for (var i = -1; i <= 1; i++) {
            this.ctx.beginPath();
            this.ctx.arc(x + i * 6, y, 3, 0, Math.PI * 2);
            this.ctx.fill();
        }
    };
    Game.prototype.drawBear = function (x, y) {
        // body with shading
        var bodyGrad = this.ctx.createRadialGradient(x, y + 8, 5, x, y + 8, 18);
        bodyGrad.addColorStop(0, '#6e4a24');
        bodyGrad.addColorStop(1, '#3b2512');
        this.ctx.fillStyle = bodyGrad;
        this.ctx.beginPath();
        this.ctx.ellipse(x, y + 8, 18, 14, 0, 0, Math.PI * 2);
        this.ctx.fill();
        // legs
        this.ctx.fillStyle = '#3b2512';
        this.ctx.beginPath();
        this.ctx.ellipse(x - 8, y + 18, 5, 8, 0, 0, Math.PI * 2);
        this.ctx.ellipse(x + 8, y + 18, 5, 8, 0, 0, Math.PI * 2);
        this.ctx.fill();
        // head with shading
        var headGrad = this.ctx.createRadialGradient(x, y - 4, 2, x, y - 4, 10);
        headGrad.addColorStop(0, '#6e4a24');
        headGrad.addColorStop(1, '#3b2512');
        this.ctx.fillStyle = headGrad;
        this.ctx.beginPath();
        this.ctx.ellipse(x, y - 4, 10, 8, 0, 0, Math.PI * 2);
        this.ctx.fill();
        // muzzle
        this.ctx.fillStyle = '#c69c6d';
        this.ctx.beginPath();
        this.ctx.ellipse(x, y + 1, 6, 4, 0, 0, Math.PI * 2);
        this.ctx.fill();
        // nose
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 2, 0, Math.PI * 2);
        this.ctx.fill();
        // ears
        this.ctx.fillStyle = '#3b2512';
        this.ctx.beginPath();
        this.ctx.arc(x - 6, y - 9, 3, 0, Math.PI * 2);
        this.ctx.arc(x + 6, y - 9, 3, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = '#c69c6d';
        this.ctx.beginPath();
        this.ctx.arc(x - 6, y - 9, 1.5, 0, Math.PI * 2);
        this.ctx.arc(x + 6, y - 9, 1.5, 0, Math.PI * 2);
        this.ctx.fill();
        // eyes
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(x - 3, y - 5, 1.5, 0, Math.PI * 2);
        this.ctx.arc(x + 3, y - 5, 1.5, 0, Math.PI * 2);
        this.ctx.fill();
    };
    Game.prototype.isoToScreen = function (x, y) {
        var screenX = (x - y) * (this.tileWidth / 2) + this.width / 2;
        var screenY = (x + y) * (this.tileHeight / 2) + 50;
        return { x: screenX, y: screenY };
    };
    Game.prototype.drawDiamond = function (cx, cy, width, height, fill) {
        if (fill === void 0) { fill = false; }
        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy - height / 2);
        this.ctx.lineTo(cx + width / 2, cy);
        this.ctx.lineTo(cx, cy + height / 2);
        this.ctx.lineTo(cx - width / 2, cy);
        this.ctx.closePath();
        if (fill) {
            this.ctx.fill();
        }
        else {
            this.ctx.stroke();
        }
    };
    return Game;
}());
window.addEventListener('load', function () {
    new Game();
});
