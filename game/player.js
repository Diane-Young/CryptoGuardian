// Sistema do Jogador
class Player {
    static x = 400;
    static y = 300;
    static width = 32;
    static height = 48;
    static speed = 4;
    static direction = 'front';

    static update() {
        // Movimento
        if (InputManager.isPressed('arrowup') || InputManager.isPressed('w')) {
            this.y -= this.speed;
            this.direction = 'back';
        }
        if (InputManager.isPressed('arrowdown') || InputManager.isPressed('s')) {
            this.y += this.speed;
            this.direction = 'front';
        }
        if (InputManager.isPressed('arrowleft') || InputManager.isPressed('a')) {
            this.x -= this.speed;
            this.direction = 'front';
        }
        if (InputManager.isPressed('arrowright') || InputManager.isPressed('d')) {
            this.x += this.speed;
            this.direction = 'front';
        }

        // Limites da tela
        this.x = Math.max(0, Math.min(800 - this.width, this.x));
        this.y = Math.max(0, Math.min(600 - this.height, this.y));
    }

    static render(ctx) {
        const sprite = this.direction === 'front' 
            ? AssetManager.get('player_front') 
            : AssetManager.get('player_back');
        
        if (sprite) {
            ctx.drawImage(sprite, this.x, this.y, this.width, this.height);
        }
    }

    static getPosition() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        };
    }
}