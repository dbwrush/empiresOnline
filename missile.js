export default class Missile {
	
    constructor(empire, x, y, gs, strength) {
        this.empire = empire;
        this.x = x;
        this.y = y;
        this.gs = gs;
        this.strength = strength;

        if (empire.getEnemies().length === 0) {
            this.gs.removeMissile(this);
            return;
        }
        const enemy = empire.getEnemies()[(Math.random() * empire.getEnemies().length) | 0];

        if (enemy.getTerritory().length === 0) {
            this.gs.removeMissile(this);
            return;
        }

        this.pickTarget(enemy);
    }

    pickTarget(enemy) {
        const size = enemy.getTerritory().length;
        let firstpart = (size * 0.95) | 0;
        let secondpart = (size * 0.01) | 0;
        if (Math.random() < 0.2) {
            firstpart = (size * 0.3) | 0;
        }

        this.target = enemy.getTerritory()[(secondpart * Math.random() + firstpart) | 0];

        const xDist = this.target.getX() - this.x;
        const yDist = this.target.getY() - this.y;

        this.dist = Math.sqrt((xDist * xDist) + (yDist * yDist));

        if (this.dist > this.strength) {
            this.gs.removeMissile(this);
        }

        this.xRate = xDist / this.dist;
        this.yRate = yDist / this.dist;
    }

    tick() {
        this.x += this.xRate;
        this.y += this.yRate;

        if (!this.target || !this.target.getEmpire()) {
            this.gs.removeMissile(this);
            return;
        }

        const xDist = this.target.getX() - this.x;
        const yDist = this.target.getY() - this.y;

        this.dist = Math.sqrt((xDist * xDist) + (yDist * yDist));

        if (this.dist <= 0.5) {
            this.target.setStrength(this.target.getStrength() * 0.01);
            for (const p of this.target.getNeighbors()) {
                if (p.getEmpire() === this.target.getEmpire()) {
                    p.setStrength(p.getStrength() * 0.02);
                }
            }
            this.gs.removeMissile(this);
            return;
        }
    }

    render(g, scale) {
        g.fillStyle = 'red';
        g.fillRect(this.x * scale, this.y * scale, scale, scale);
    }
}
