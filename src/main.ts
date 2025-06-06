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
  private groundPattern: CanvasPattern | null = null;

  constructor() {
    this.canvas = document.getElementById('game') as HTMLCanvasElement;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');
    this.ctx = ctx;
    this.scoreEl = document.getElementById('score')!;
    this.createGroundPattern();

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

  private createGroundPattern() {
    const patternCanvas = document.createElement('canvas');
    patternCanvas.width = 64;
    patternCanvas.height = 32;
    const pctx = patternCanvas.getContext('2d');
    if (!pctx) return;
    pctx.fillStyle = '#6b5234';
    pctx.fillRect(0, 0, patternCanvas.width, patternCanvas.height);
    pctx.fillStyle = '#5a472c';
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * patternCanvas.width;
      const y = Math.random() * patternCanvas.height;
      pctx.fillRect(x, y, 1, 1);
    }
    this.groundPattern = this.ctx.createPattern(patternCanvas, 'repeat');
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
        this.drawTile(screen.x, screen.y);
        if (this.peas[y][x]) {
          this.drawPeaPod(screen.x, screen.y - this.tileHeight / 2);
        }
      }
    }
    // draw player
    const playerScreen = this.isoToScreen(this.playerX, this.playerY);
    this.drawBear(playerScreen.x, playerScreen.y - this.tileHeight / 2);
  }

  private drawTile(x: number, y: number) {
    if (this.groundPattern) {
      this.ctx.fillStyle = this.groundPattern;
    } else {
      this.ctx.fillStyle = '#6b5234';
    }
    this.drawDiamond(x, y, this.tileWidth, this.tileHeight, true);
    this.ctx.strokeStyle = '#3a2f1a';
    this.drawDiamond(x, y, this.tileWidth, this.tileHeight, false);
  }

  private drawPeaPod(x: number, y: number) {
    const grad = this.ctx.createLinearGradient(x - 12, y, x + 12, y);
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
    for (let i = -1; i <= 1; i++) {
      this.ctx.beginPath();
      this.ctx.arc(x + i * 6, y, 3, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  private drawBear(x: number, y: number) {
    // body with shading
    const bodyGrad = this.ctx.createRadialGradient(x, y + 8, 5, x, y + 8, 18);
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
    const headGrad = this.ctx.createRadialGradient(x, y - 4, 2, x, y - 4, 10);
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
  }

  private isoToScreen(x: number, y: number) {
    const screenX = (x - y) * (this.tileWidth / 2) + this.width / 2;
    const screenY = (x + y) * (this.tileHeight / 2) + 50;
    return { x: screenX, y: screenY };
  }

  private drawDiamond(
    cx: number,
    cy: number,
    width: number,
    height: number,
    fill = false
  ) {
    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy - height / 2);
    this.ctx.lineTo(cx + width / 2, cy);
    this.ctx.lineTo(cx, cy + height / 2);
    this.ctx.lineTo(cx - width / 2, cy);
    this.ctx.closePath();
    if (fill) {
      this.ctx.fill();
    } else {
      this.ctx.stroke();
    }
  }
}

window.addEventListener('load', () => {
  new Game();
});

