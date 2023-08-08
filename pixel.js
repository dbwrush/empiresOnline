import Empire from './empire.js';
import Missile from './missile.js';
import Boat from './boat.js';
import Paratrooper from './paratrooper.js';

export default class Pixel {
    static maxAge = 0;
	static gameState;
	
	static ColorMode = {
        empire: 'empire',
        strength: 'strength',
        ideology: 'ideology',
        need: 'need',
        age: 'age',
        friction: 'friction',
        alliance: 'alliance',
        perspective: 'perspective',
        habitability: 'habitability',
    };

    constructor(x, y, habitability, scale, gameState) {
        this.x = x;
        this.y = y;
        this.habitability = Math.max(habitability, 0);
        this.scale = scale;
        this.need = 0;
        this.gameState = gameState;
        this.strength = habitability * 20;
        this.age = 0;
        this.neighbors = null;
        this.friendlyNeighbors = [];
    }

    revolt() {
        const old = this.getEmpire();
        const e = new Empire(this.gameState, old.getName());
        e.addTerritory(this);
        this.age = 0;
        this.strength = this.habitability * 20;
        e.setEnemy(old, true, true);
        old.setEnemy(e, true, true);
        e.setCapital(this);
        for (const p of this.neighbors) {
            if (p.getEmpire() === old && Math.random() < 0.5) {
                e.addTerritory(p);
                p.setStrength(p.getHabitability() * 20);
            }
        }
        return e;
    }

    getEmpire() {
        return this.gameState.getTerritoryManager().getEmpireForPixel(this);
    }

    getHabitability() {
        return this.habitability;
    }

    setHabitability(habitability) {
        this.habitability = habitability;
    }
	
	getStrength() {
		return this.strength;
	}
	
	getNeighbors() {
		return this.gameState.getNeighbors(this.x, this.y);
	}

	setStrength(strength) {
		this.strength = strength;
	}
	
	isHabitable() {
		return this.habitability > 0;
	}

    render(g, colorMode) {
        this.age += 1;
        if (this.age > Pixel.maxAge) {
            Pixel.maxAge = Math.ceil(this.age);
        }
        g.fillStyle = this.getColor(colorMode);
        g.fillRect(this.x * this.scale, this.y * this.scale, this.scale, this.scale);
    }

    strengthPhase() {
        if (!this.neighbors) {
            this.neighbors = this.gameState.getNeighbors(this.x, this.y);
        }
        const empire = this.getEmpire();
        if (empire) {
            this.strength += this.habitability;
            this.strength *= 0.99;
        }
    }

    attackPhase() {
        this.borderFriction = 0;
        const empire = this.getEmpire();
        if (empire) {
            let target = null;
            let bestStrength = 0;
            for (const p of this.neighbors) {
                const pEmpire = p.getEmpire();
                if (p.isHabitable()) {
                    if (!pEmpire && (this.strength - ((1 - p.habitability) * 3)) > bestStrength) {
                        target = p;
                        bestStrength = this.strength - ((1 - p.habitability) * 3);
                    } else if (empire.getEnemies().includes(pEmpire) && (this.strength - (p.getStrength() * 3)) > bestStrength) {
                        target = p;
                        bestStrength = this.strength - (p.getStrength() * 3);
                    }
                    if (pEmpire) {
                        if (pEmpire !== empire) {
                            if (empire.getAllies().includes(pEmpire)) {
                                this.borderFriction += (Math.abs(this.strength - p.getStrength()) / 5) * ((255 - empire.getCoopIso()) / 255);
                            } else {
                                this.borderFriction += Math.abs(this.strength - p.getStrength()) * ((255 - empire.getCoopIso()) / 255);
                            }
                            const ideoDiff = empire.ideoDifference(pEmpire);
                            const coopIso = (empire.getCoopIso() + pEmpire.getCoopIso()) / 4;
                            if (ideoDiff < coopIso * Empire.getAllianceDifficulty()) {
                                empire.setAlly(pEmpire);
                            }
                            if (this.borderFriction > this.gameState.getWarThreshold() && coopIso < ideoDiff * 0.33 * Math.random() && !empire.getEnemies().includes(pEmpire)) {
                                empire.setEnemy(pEmpire, true, true);
                            }
                            if (empire.getEnemies().includes(pEmpire) && ((ideoDiff + (this.borderFriction / 5)) * 2 < this.gameState.getWarThreshold())) {
                                empire.makePeace(pEmpire);
                            }
                        }
                    }
                }
            }
            if (target) {
                if (bestStrength > 0) {
                    if (target.getEmpire()) {
                        this.strength -= target.getStrength();
                    } else {
                        this.strength -= 1 - target.getHabitability();
                    }
                    empire.addTerritory(target);
                    target.setStrength(this.strength * 0.5);
                    this.strength *= 0.5;
                    target.setAge(0);
                } else {
                    target.setStrength(target.getStrength() - (0.5 * this.strength));
                    this.strength = this.strength - (target.getStrength() * 0.5);
                }
            }
        }
    }
	
	getX() {
		return this.x;
	}
	
	getY() {
		return this.y;
	}

    needPhase() {
        this.friendlyNeighbors = [];
        this.need *= 0.9;
        const empire = this.getEmpire();
        if (empire) {
            for (const p of this.neighbors) {
                if (p.getEmpire() === empire || empire.getAllies().includes(p.getEmpire())) {
                    this.friendlyNeighbors.push(p);
                } else {
                    if (p.isHabitable()) {
                        if (empire.getEnemies().includes(p.getEmpire())) {
                            this.need += 63;
                        } else {
                            this.need += 7;
                        }
                    } else {
                        this.need += 3;
                    }
                }
            }
            if (empire.getCapital() === this) {
                this.need += 7;
            }
            if (this.need > 255) {
                this.need = 255;
            }
        }
    }

    needSpreadPhase() {
        let maxNeed = this.need;
        for (const p of this.friendlyNeighbors) {
            if (p.need > maxNeed) {
                maxNeed = p.need;
            }
        }
        if (maxNeed * 0.9 > this.need) {
            this.need = maxNeed * 0.9;
        }
    }

    resourcePhase() {
        let totalNeed = this.need;
        let maxNeed = this.need;
        for (const p of this.friendlyNeighbors) {
            totalNeed += p.need;
            if (p.need > maxNeed) {
                maxNeed = p.need;
            }
        }
        if (this.friendlyNeighbors.length > 0 && maxNeed > this.need) {
            const factor = this.strength / totalNeed;
            for (const p of this.friendlyNeighbors) {
                p.strength += p.need * factor;
            }
            this.strength *= this.need / totalNeed;
        }
    }

    spawnBoat() {
        const empire = this.getEmpire();
        if (!empire) {
            return;
        }
        for (const p of this.neighbors) {
            if (!p.isHabitable()) {
                this.gameState.addBoat(new Boat(empire, this.strength / 2, p.getX(), p.getY(), this.gameState, Math.random() * 8));
                this.strength = this.strength / 2;
                return;
            }
        }
    }

    spawnMissile() {
        const empire = this.getEmpire();
        if (!empire) {
            return;
        }
        this.gameState.addMissile(new Missile(empire, this.x, this.y, this.gameState, this.strength));
    }

    spawnParatrooper() {
        const empire = this.getEmpire();
        if (!empire) {
            return;
        }
        this.gameState.addParatrooper(new Paratrooper(empire, this.x, this.y, this.gameState, this.strength * 0.9));
        this.strength *= 0.1;
    }

    getColor(colorMode) {
        const empire = this.getEmpire();
        if (empire && empire.getCapital() === this) {
			console.log("I have a color");
            return empire.getColor();
        }
        switch (colorMode) {
            case 'empire':
                if (empire) {
                    return empire.getColor();
                }
            case 'strength':
                if (empire) {
                    let s = this.strength;
                    if (this.friendlyNeighbors.length > 0) {
                        for (const p of this.friendlyNeighbors) {
                            s += p.getStrength();
                        }
                        s /= this.friendlyNeighbors.length;
                    }
                    const r = (empire.getColor().r * s) / 255;
                    const g = (empire.getColor().g * s) / 255;
                    const b = (empire.getColor().b * s) / 255;
                    return `rgb(${r}, ${g}, ${b})`;
                }
            case 'ideology':
                if (empire) {
                    return empire.getIdeologyColor();
                }
            case 'need':
                if (empire) {
                    const n = this.need;
                    const r = (empire.getColor().r * n) / 255;
                    const g = (empire.getColor().g * n) / 255;
                    const b = (empire.getColor().b * n) / 255;
                    return `rgb(${r}, ${g}, ${b})`;
                }
            case 'age':
                if (empire) {
                    let a = this.age;
                    if (a > Pixel.maxAge && Pixel.maxAge < 2048) {
                        a = Pixel.maxAge;
                    }
                    const hue = (a / Pixel.maxAge) * 120;
                    const saturation = 1.0;
                    const brightness = 1.0;
                    return `hsl(${hue}, ${saturation * 100}%, ${brightness * 100}%)`;
                }
            case 'friction':
                if (empire) {
                    const f = this.borderFriction;
                    const r = (empire.getColor().r * f) / 255;
                    const g = (empire.getColor().g * f) / 255;
                    const b = (empire.getColor().b * f) / 255;
                    return `rgb(${r}, ${g}, ${b})`;
                }
            case 'alliance':
                if (empire) {
                    const g = this.friendlyNeighbors.length;
                    const r = 8 - g;
                    return `rgb(${(r / 8) * 255}, ${(g / 8) * 255}, 0)`;
                }
            case 'perspective':
                if (empire) {
                    const r = (8 - this.friendlyNeighbors.length) * 255;
                    const g = 255 - (empire.ideoDifference(this.gameState.getPerspectiveEmpire()) / 3);
                    const base = `rgb(${r / 8}, ${g / 8}, 0)`;
                    if (this.gameState.getPerspectiveEmpire() === empire) {
                        return 'rgb(255, 255, 0)';
                    }
                    if (this.gameState.getPerspectiveEmpire().getEnemies().includes(empire)) {
                        return 'rgb(255, 0, 0)';
                    }
                    if (this.gameState.getPerspectiveEmpire().getAllies().includes(empire)) {
                        return 'rgb(0, 255, 255)';
                    }
                    const baseColor = new Color((base.getRed() + r) / 2, (base.getGreen() + g) / 2, base.getBlue());
                    return `rgb(${baseColor.r}, ${baseColor.g}, ${baseColor.b})`;
                }
            case 'habitability':
                if (this.habitability === 0) {
                    return 'rgb(0, 0, 100)';
                }
                return `rgb(0, ${this.habitability * 200}, 0)`;
            default:
                if (this.habitability === 0) {
                    return 'rgb(0, 0, 100)';
                } else {
                    return `rgb(0, ${this.habitability * 200}, 0)`;
                }
        }
    }

    getAge() {
        return this.age;
    }

    setAge(age) {
        this.age = age;
    }
}
