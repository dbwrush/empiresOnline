import Empire from './entities/empire.js';
import Missile from './entities/missile.js';
import Boat from './entities/boat.js';
import Paratrooper from './entities/paratrooper.js';

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
		stability: 'stability',
        habitability: 'habitability',
    };

    constructor(x, y, habitability, gameState) {
        this.x = x;
        this.y = y;
        this.habitability = Math.max(habitability, 0);
        this.need = 0;
        this.gameState = gameState;
        this.strength = habitability * 20;
        this.age = 0;
        this.neighbors = null;
        this.friendlyNeighbors = [];
		
    }
	
	getLocalIdeology() {
		return localIdeology;
	}
	
	setLocalIdeology(newIdeo) {
		this.localIdeology = [newIdeo[0], newIdeo[1], newIdeo[2]];
	}
	
	avgLocalIdeology(newIdeo, prop) {
		if(prop > 1) {
			prop = 1;
		}
		if(prop < 0) {
			return;
		}
		if(!this.localIdeology) {
			this.setLocalIdeology(newIdeo);
			return;
		}
		this.localIdeology[0] = (this.localIdeology[0] * (1 - prop)) + (newIdeo[0] * prop);
		this.localIdeology[1] = (this.localIdeology[1] * (1 - prop)) + (newIdeo[1] * prop);
		this.localIdeology[2] = (this.localIdeology[2] * (1 - prop)) + (newIdeo[2] * prop);
	}

    revolt(ideo) {
        let old = this.getEmpire();
        let e = new Empire(this.gameState, old.getName());
		e.setIdeology(ideo);
        e.addTerritory(this);
        this.age = 0;
        this.strength = (this.strength + this.habitability) * 10;
        e.setEnemy(old, true, true);
        old.setEnemy(e, true, true);
        e.setCapital(this);
        this.recruitNeighborsToRevolt(old);
        return e;
    }
	
	recruitNeighborsToRevolt(old) {
		let e = this.getEmpire()
		for(let p of this.neighbors) {
			if(p.getEmpire() == old && p.localIdeology && e.ideoDifference(p.localIdeology) < this.localIdeology[0] && Math.random() < 0.3) {
				e.addTerritory(p);
				p.setStrength((p.getStrength() + p.getHabitability()) * 5);
				p.recruitNeighborsToRevolt(old);
				p.setAge(0);
			}
		}
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

    render(g, colorMode, scale) {
        this.age += 1;
        g.fillStyle = this.getColor(colorMode);
        g.fillRect(this.x * scale, this.y * scale, scale, scale);		
    }

    strengthPhase() {
        if (!this.neighbors) {
            this.neighbors = this.gameState.getNeighbors(this.x, this.y);
        }
        let empire = this.getEmpire();
        if (empire) {
            this.strength += this.habitability;
            this.strength *= 0.99;
        }
    }

    attackPhase() {
        this.borderFriction = 0;
        let empire = this.getEmpire();
        if (empire) {
			if(!this.localIdeology) {
				this.setLocalIdeology(empire.getIdeology());
			}
			let diff = empire.ideoDifference(this.localIdeology) / 3;
			if(diff > this.localIdeology[0] && Math.random() * 255 < diff && Math.random() < 0.1 && this.age > 100) {
				this.revolt(this.localIdeology);
			}
			if(this.friendlyNeighbors.length == this.neighbors.length) {
				return;
			}
            let target = null;
            let bestStrength = 0;
            for (let p of this.neighbors) {
                let pEmpire = p.getEmpire();
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
                            let ideoDiff = empire.ideoDifference(pEmpire.getIdeology());
                            let coopIso = (empire.getCoopIso() + pEmpire.getCoopIso()) / 2;
                            if (ideoDiff < coopIso * Empire.getAllianceDifficulty()) {
                                empire.setAlly(pEmpire);
                            }
                            if (this.borderFriction > this.gameState.getWarThreshold() && coopIso < ideoDiff * 0.33 * Math.random() && !empire.getEnemies().includes(pEmpire)) {
                                empire.setEnemy(pEmpire, true, true);
                            }
                            if (empire.getEnemies().includes(pEmpire) && ((ideoDiff + (this.borderFriction / 5)) < this.gameState.getWarThreshold())) {
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
        let empire = this.getEmpire();
        if (empire) {
            for (let p of this.neighbors) {
                if (p.getEmpire() === empire || empire.getAllies().includes(p.getEmpire())) {
                    this.friendlyNeighbors.push(p);
                } else {
                    if (p.isHabitable()) {
                        if (empire.getEnemies().includes(p.getEmpire())) {
                            this.need += 127;
                        } else {
                            this.need += 2;
                        }
                    } else {
                        this.need += 1;
                    }
                }
            }
            if (empire.getCapital() === this) {
                this.need += 2;
            }
            if (this.need > 255) {
                this.need = 255;
            }
			if(Math.random() < ((this.strength / this.habitability) / 100) && this.age > 10) {//drift closer to empire
				this.avgLocalIdeology(empire.getIdeology(), this.strength / 255);
			} else if(this.localIdeology && this.age > 10) {//drift away from empire
				let e = empire.getIdeology();
				let l = this.localIdeology;
				let diff = [e[0] - l[0], e[1] - l[1], e[2] - e[2]];
				for (var i = 0; i < 3; i++) {
					if(Math.abs(diff[i]) < 1) {
						diff[i] = (Math.random() - 0.5) * 2;
					}
				}
				let r = Math.random(40);
				this.localIdeology = [l[0] + (r * diff[0]), l[1] + (r * diff[1]), l[2] + (r * diff[2])];
				this.localIdeology = this.localIdeology.map(value => (value < 0 ? 0 : value > 255 ? 255 : value));
			}
        }
    }

    needSpreadPhase() {
        let maxNeed = this.need;
        for (let p of this.friendlyNeighbors) {
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
        for (let p of this.friendlyNeighbors) {
            totalNeed += p.need;
            if (p.need > maxNeed) {
                maxNeed = p.need;
            }
        }
        if (this.friendlyNeighbors.length > 0 && maxNeed > this.need) {
            let factor = this.strength / totalNeed;
            for (let p of this.friendlyNeighbors) {
                p.strength += p.need * factor;
            }
            this.strength *= this.need / totalNeed;
        }
    }

    spawnBoat() {
        let empire = this.getEmpire();
        if (empire == null) {
            return;
        }
		if(Math.random() < empire.getCoopIso() / 255) {
			return;
		}
        for (let p of this.neighbors) {
            if (!p.isHabitable()) {
                this.gameState.addBoat(new Boat(empire, this.strength / 2, p.getX(), p.getY(), this.gameState, Math.random() * 8));
                this.strength = this.strength / 2;
                return;
            }
        }
    }

    spawnMissile() {
        let empire = this.getEmpire();
        if (empire == null) {
            return;
        }
        this.gameState.addMissile(new Missile(empire, this.x, this.y, this.gameState, this.strength));
    }

    spawnParatrooper() {
        let empire = this.getEmpire();
        if (empire == null) {
            return;
        }
        this.gameState.addParatrooper(new Paratrooper(empire, this.x, this.y, this.gameState, this.strength * 0.9));
        this.strength *= 0.1;
    }

    getColor(colorMode) {
        let empire = this.getEmpire();
        switch (colorMode) {
            case 'empire':
                if (empire) {
                    let hue = empire.getColor()[0];
                    let saturation = empire.getColor()[1];
                    let brightness = 1.0;
                    return `hsl(${hue}, ${saturation}%, ${brightness * 50}%)`;
                }
            case 'strength':
                if (empire) {
                    let s = this.strength;
                    if (this.friendlyNeighbors.length > 0) {
                        for (let p of this.friendlyNeighbors) {
                            s += p.getStrength();
                        }
                        s /= this.friendlyNeighbors.length;
                    }
                    let hue = empire.getColor()[0];
                    let saturation = empire.getColor()[1];
                    let brightness = s / 255;
                    return `hsl(${hue}, ${saturation}%, ${brightness * 50}%)`;
                }
            case 'ideology':
                if (empire && this.localIdeology) {
					let b = this.friendlyNeighbors.length / 8;
					let color = this.rybToRgb(this.localIdeology.map(value => (value > 255 ? 255 : value)));
                    return `rgb(${color[0] * b}, ${color[1] * b}, ${color[2] * b})`;
                }
            case 'need':
                if (empire) {
                    let n = this.need;
                    let hue = empire.getColor()[0];
                    let saturation = empire.getColor()[1];
                    let brightness = n / 255;
                    return `hsl(${hue}, ${saturation}%, ${brightness * 50}%)`;
                }
            case 'age':
                if (empire) {
                    let a = this.age;
                    if (a > Pixel.maxAge) {
                        Pixel.maxAge = a;
                    }
                    let hue = (a / Pixel.maxAge) * 120;
                    let saturation = 1.0;
                    let brightness = 1.0;
                    return `hsl(${hue}, ${saturation * 100}%, ${brightness * 50}%)`;
                }
            case 'friction':
                if (empire) {
                    let f = this.borderFriction;
                    let hue = empire.getColor()[0];
                    let saturation = empire.getColor()[1];
                    let brightness = f / 255;
                    return `hsl(${hue}, ${saturation}%, ${brightness * 50}%)`;
                }
            case 'alliance':
                if (empire) {
					let hue = empire.getColor()[0];
                    let saturation = empire.getColor()[1];
                    let brightness = this.friendlyNeighbors.length / 8;
                    return `hsl(${hue}, ${saturation}%, ${brightness * 50}%)`;
                }
            case 'perspective':
                if (empire) {
                    let r = (8 - this.friendlyNeighbors.length) * 255;
                    let g = 255 - (empire.ideoDifference(this.gameState.getPerspectiveEmpire().getIdeology()) / 3);
                    let base = `rgb(${r / 8}, ${g / 8}, 0)`;
                    if (this.gameState.getPerspectiveEmpire() === empire) {
                        return 'rgb(255, 255, 0)';
                    }
                    if (this.gameState.getPerspectiveEmpire().getEnemies().includes(empire)) {
                        return 'rgb(255, 0, 0)';
                    }
                    if (this.gameState.getPerspectiveEmpire().getAllies().includes(empire)) {
                        return 'rgb(0, 255, 255)';
                    }
					// Remove "rgb(" and ")" from the string
					let rgbValues = base.substring(4, base.length - 1);

					// Split the remaining string by comma and convert the values to numbers
					let [red, green, blue] = rgbValues.split(',').map(value => parseInt(value));
                    let baseColor = [(red + r) / 2, (green + g) / 2, blue];
                    return `rgb(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]})`;
                }
            case 'habitability':
                if (this.habitability === 0) {
                    return 'rgb(0, 0, 100)';
                }
                return `rgb(0, ${this.habitability * 200}, 0)`;
			case 'stability':
				if(empire) {
                    let hue = empire.getColor()[0];
                    let saturation = empire.getColor()[1];
                    let brightness = (1 - this.getEmpire().getStability()) * 50;
                    return `hsl(${hue}, ${saturation}%, ${brightness}%)`;
				}
            default:
                if (this.habitability === 0) {
                    return 'rgb(0, 0, 100)';
                } else {
                    return `rgb(0, ${this.habitability * 200}, 0)`;
                }
        }
		if (this.habitability === 0) {
			return 'rgb(0, 0, 100)';
		} else {
			return `rgb(0, ${this.habitability * 200}, 0)`;
		}
    }

    getAge() {
        return this.age;
    }

    setAge(age) {
        this.age = age;
    }
	
	rybToRgb(ryb) {
		var r = ryb[0] / 255;
		var y = ryb[1] / 255;
		var b = ryb[2] / 255;
		var w = Math.min(r, y, b);
		r -= w;
		y -= w;
		b -= w;
		var my = Math.max(r, y, b);
		var g = Math.min(y, b);
		y -= g;
		b -= g;
		if (b && g) {
			b *= 2;
			g *= 2;
		}
		r += y;
		g += y;
		var mg = Math.max(r, g, b);
		if (mg) {
			var n = my / mg;
			r *= n;
			g *= n;
			b *= n;
		}
		r += w;
		g += w;
		b += w;
		return [Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255)];
	}
}
