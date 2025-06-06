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
        this.canvas = document.getElementById('game');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        var ctx = this.canvas.getContext('2d');
        if (!ctx)
            throw new Error('Canvas not supported');
        this.ctx = ctx;
        this.scoreEl = document.getElementById('score');
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
                this.ctx.strokeStyle = '#555';
                this.drawDiamond(screen_1.x, screen_1.y, this.tileWidth, this.tileHeight);
                if (this.peas[y][x]) {
                    this.ctx.fillStyle = 'green';
                    this.ctx.beginPath();
                    this.ctx.arc(screen_1.x, screen_1.y - this.tileHeight / 2, 6, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }
        }
        // draw player
        var playerScreen = this.isoToScreen(this.playerX, this.playerY);
        this.ctx.fillStyle = 'brown';
        this.ctx.beginPath();
        this.ctx.arc(playerScreen.x, playerScreen.y - this.tileHeight / 2, 12, 0, Math.PI * 2);
        this.ctx.fill();
    };
    Game.prototype.isoToScreen = function (x, y) {
        var screenX = (x - y) * (this.tileWidth / 2) + this.width / 2;
        var screenY = (x + y) * (this.tileHeight / 2) + 50;
        return { x: screenX, y: screenY };
    };
    Game.prototype.drawDiamond = function (cx, cy, width, height) {
        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy - height / 2);
        this.ctx.lineTo(cx + width / 2, cy);
        this.ctx.lineTo(cx, cy + height / 2);
        this.ctx.lineTo(cx - width / 2, cy);
        this.ctx.closePath();
        this.ctx.stroke();
    };
    return Game;
}());
window.addEventListener('load', function () {
    new Game();
});
