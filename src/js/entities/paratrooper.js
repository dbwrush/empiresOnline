export default class Paratrooper {
    constructor(empire, x, y, gs, strength) {
        this.empire = empire;
        this.x = x;
        this.y = y;
        this.gs = gs;
        this.strength = strength;

        if (empire.getEnemies().length === 0) {
            this.gs.removeParatrooper(this);
            return;
        }
        this.enemy = empire.getEnemies()[(Math.random() * empire.getEnemies().length) | 0];

        if (this.enemy.getTerritory().length === 0) {
            this.gs.removeParatrooper(this);
            return;
        }

        this.pickTarget(this.enemy);
    }

    pickTarget(enemy) {
        const size = this.enemy.getTerritory().length;
        const firstpart = 0;
        const secondpart = (size * 0.30) | 0;
        this.target = this.enemy.getTerritory()[(secondpart * Math.random() + firstpart) | 0];

        const xDist = this.target.getX() - this.x;
        const yDist = this.target.getY() - this.y;

        this.dist = Math.sqrt((xDist * xDist) + (yDist * yDist));

        if (this.dist > this.strength) {
            this.gs.removeParatrooper(this);
        }

        this.xRate = xDist / this.dist;
        this.yRate = yDist / this.dist;
    }

    tick() {
        this.x += this.xRate;
        this.y += this.yRate;

        if (!this.target || !this.target.getEmpire()) {
            this.gs.removeParatrooper(this);
            return;
        }

        const xDist = this.target.getX() - this.x;
        const yDist = this.target.getY() - this.y;

        this.dist = Math.sqrt((xDist * xDist) + (yDist * yDist));

        if (this.dist <= 0.5) {
            if (this.target.getStrength() * 3 < this.strength) {
                this.empire.addTerritory(this.target);
                this.target.setAge(0);
                this.target.setStrength(this.strength);
            } else {
                this.target.setStrength(this.target.getStrength() - this.strength);
            }
            this.gs.removeParatrooper(this);
        }
    }

    render(g, scale) {
        g.fillStyle = 'green';
        g.fillRect(this.x * scale, this.y * scale, scale, scale);
    }
}
