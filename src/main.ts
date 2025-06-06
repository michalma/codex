class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width = 800;
  private height = 600;
  private tileWidth = 64;
  private tileHeight = 32;
  private mapSize = 10;
  private playerX = 0;
  private playerY = 0;
  private peas: boolean[][] = [];
  private score = 0;
  private scoreEl: HTMLElement;

  constructor() {
    this.canvas = document.getElementById('game') as HTMLCanvasElement;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');
    this.ctx = ctx;
    this.scoreEl = document.getElementById('score')!;

    this.reset();
    this.registerEvents();
    requestAnimationFrame(() => this.loop());
  }

  private reset() {
    for (let y = 0; y < this.mapSize; y++) {
      this.peas[y] = [];
      for (let x = 0; x < this.mapSize; x++) {
        this.peas[y][x] = Math.random() < 0.3; // 30% chance for pea pod
      }
    }
    this.playerX = Math.floor(this.mapSize / 2);
    this.playerY = Math.floor(this.mapSize / 2);
  }

  private registerEvents() {
    window.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowUp':
          if (this.playerY > 0) this.playerY--;
          break;
        case 'ArrowDown':
          if (this.playerY < this.mapSize - 1) this.playerY++;
          break;
        case 'ArrowLeft':
          if (this.playerX > 0) this.playerX--;
          break;
        case 'ArrowRight':
          if (this.playerX < this.mapSize - 1) this.playerX++;
          break;
      }
      this.checkPea();
    });
  }

  private checkPea() {
    if (this.peas[this.playerY][this.playerX]) {
      this.peas[this.playerY][this.playerX] = false;
      this.score++;
      this.scoreEl.textContent = `Peas eaten: ${this.score}`;
    }
  }

  private loop() {
    this.draw();
    requestAnimationFrame(() => this.loop());
  }

  private draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    // draw tiles
    for (let y = 0; y < this.mapSize; y++) {
      for (let x = 0; x < this.mapSize; x++) {
        const screen = this.isoToScreen(x, y);
        this.ctx.strokeStyle = '#555';
        this.drawDiamond(screen.x, screen.y, this.tileWidth, this.tileHeight);
        if (this.peas[y][x]) {
          this.ctx.fillStyle = 'green';
          this.ctx.beginPath();
          this.ctx.arc(screen.x, screen.y - this.tileHeight / 2, 6, 0, Math.PI * 2);
          this.ctx.fill();
        }
      }
    }
    // draw player
    const playerScreen = this.isoToScreen(this.playerX, this.playerY);
    this.ctx.fillStyle = 'brown';
    this.ctx.beginPath();
    this.ctx.arc(playerScreen.x, playerScreen.y - this.tileHeight / 2, 12, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private isoToScreen(x: number, y: number) {
    const screenX = (x - y) * (this.tileWidth / 2) + this.width / 2;
    const screenY = (x + y) * (this.tileHeight / 2) + 50;
    return { x: screenX, y: screenY };
  }

  private drawDiamond(cx: number, cy: number, width: number, height: number) {
    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy - height / 2);
    this.ctx.lineTo(cx + width / 2, cy);
    this.ctx.lineTo(cx, cy + height / 2);
    this.ctx.lineTo(cx - width / 2, cy);
    this.ctx.closePath();
    this.ctx.stroke();
  }
}

window.addEventListener('load', () => {
  new Game();
});

