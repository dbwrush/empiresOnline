// game-state.js
import State from './state.js'; // Import the base State class
import Pixel from './pixel.js'; // Import the required classes
import Boat from './entities/boat.js';
import Missile from './entities/missile.js';
import Paratrooper from './entities/paratrooper.js';
import Empire from './entities/empire.js';
import TerritoryManager from './utilities/territory-manager.js';
import PerlinNoiseGenerator from './utilities/perlin-noise-generator.js';

class GameState extends State {
    constructor(game, width, height, scale, numEmpires, warThreshold) {
        super(game);
        console.log("Switched to GameState");
        this.warThreshold = warThreshold;
		this.allianceDifficulty = 2;
        this.scale = scale;
        this.tm = new TerritoryManager();
        this.habitablePixels = [];
        this.pixels = [];
        this.boats = [];
        this.remBoats = [];
        this.missiles = [];
        this.remMissiles = [];
        this.paratroopers = [];
        this.remParatroopers = [];
        this.colorMode = Pixel.ColorMode.empire;
        this.perspectiveEmpire = this.getEmpires()[0];
		this.numEmpires = numEmpires;

        this.init(width, height);
    }

    init(width, height) {
        this.habitablePixels = [];
		const mapWidth = Math.floor(width / this.scale);
		const mapHeight = Math.floor(height / this.scale);
		while(this.habitablePixels.length < mapWidth * mapHeight / 2) {
			this.habitablePixels = [];
			this.genTerrain(mapWidth, mapHeight);
		}
        this.genEmpires(this.numEmpires);
    }

    genTerrain(width, height) {
        console.log("Generating Terrain");
        this.pixels = new Array(width);
        const perlin = new PerlinNoiseGenerator(width, height, 0.01, 4);
        const habitability = perlin.getNoise();
        for (let x = 0; x < this.pixels.length; x++) {
            this.pixels[x] = new Array(height);
            for (let y = 0; y < this.pixels[0].length; y++) {
                let h = (habitability[x][y] + 1) / 2;
                if (h < 0.4) {
                    h = 0;
                }
                const p = new Pixel(x, y, h, this);
                if (h > 0) {
                    this.habitablePixels.push(p);
                }
                this.pixels[x][y] = p;
            }
        }
        console.log("Finished Generating Terrain");
    }


	getHabitablePixels() {
		return this.habitablePixels;
	}

	getPerspectiveEmpire() {
		return this.perspectiveEmpire;
	}

	genEmpires(numEmpires) {
		const empires = this.tm.getEmpires();
		while (empires.length <= this.numEmpires) {
			const e = new Empire(this);
			const p = this.habitablePixels[Math.floor(Math.random() * this.habitablePixels.length)];
			console.log(this.tm.getEmpireForPixel(p));
			if (this.tm.getEmpireForPixel(p) == undefined) {
				e.addTerritory(p);
				e.setCapital(p);
				e.getCapital().setStrength(2);
			}
			empires.push(e);
		}
		console.log("Finished generating empires");
	}

	getWarThreshold() {
		return this.warThreshold;
	}

	removeBoat(b) {
		this.remBoats.push(b);
	}

	removeMissile(m) {
		this.remMissiles.push(m);
	}

	removeParatrooper(p) {
		this.remParatroopers.push(p);
	}

	getNeighbors(x, y) {
		const neighbors = [];

		let leftOne = x - 1;
		let rightOne = x + 1;

		if (leftOne < 0) {
			leftOne = this.pixels.length - 1;
		}
		if (rightOne > this.pixels.length - 1) {
			rightOne = 0;
		}

		if (y > 0) {
			neighbors.push(this.pixels[leftOne][y - 1]);
			neighbors.push(this.pixels[x][y - 1]);
			neighbors.push(this.pixels[rightOne][y - 1]);
		}
		neighbors.push(this.pixels[rightOne][y]);
		if (y < this.pixels[0].length - 1) {
			neighbors.push(this.pixels[rightOne][y + 1]);
			neighbors.push(this.pixels[x][y + 1]);
			neighbors.push(this.pixels[leftOne][y + 1]);
		}
		neighbors.push(this.pixels[leftOne][y]);

		return neighbors;
	}
	
	setColorMode(colorMode) {
		this.colorMode = colorMode;
	}

	tick() {
		if (this.warThreshold > 0 && Math.random() < 0.01) {
			this.warThreshold -= 1;
		}
		if (this.allianceDifficulty < 255 && Math.random() < 0.0001) {
			this.allianceDifficulty *= 1.1;
		}
		if (!this.tm.getEmpires().includes(this.perspectiveEmpire)) {
			this.perspectiveEmpire = this.tm.getEmpires()[0];
		}
		const empires = this.tm.getEmpires();
		empires.sort(() => Math.random() - 0.5); // Shuffle the empires
		for (const e of empires) {
			e.tick();
			if (e.getTerritory().size === 0) {
				this.tm.removeEmpire(e);
			}
		}

		this.tickPixels();

		for (const b of this.boats) {
			b.tick();
		}

		for (const b of this.remBoats) {
			const index = this.boats.indexOf(b);
			if (index !== -1) {
				this.boats.splice(index, 1);
			}
		}
		this.remBoats = [];

		for (const m of this.missiles) {
			m.tick();
		}

		for (const m of this.remMissiles) {
			const index = this.missiles.indexOf(m);
			if (index !== -1) {
				this.missiles.splice(index, 1);
			}
		}
		this.remMissiles = [];

		for (const p of this.paratroopers) {
			p.tick();
		}

		for (const p of this.remParatroopers) {
			const index = this.paratroopers.indexOf(p);
			if (index !== -1) {
				this.paratroopers.splice(index, 1);
			}
		}
		this.remParatroopers = [];
	}


	tickPixels() {
		this.shuffleArray(this.habitablePixels);
		for (const p of this.habitablePixels) {
			p.strengthPhase();
		}
		for (const p of this.habitablePixels) {
			p.attackPhase();
		}
		for (const p of this.habitablePixels) {
			p.needPhase();
		}
		for (const p of this.habitablePixels) {
			p.needSpreadPhase();
		}
		for (const p of this.habitablePixels) {
			p.resourcePhase();
		}
	}

	shuffleArray(array) {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
	}
	
	getScale() {
		return this.scale;
	}

	getWidth() {
		return this.pixels.length;
	}

	getHeight() {
		return this.pixels[0].length;
	}

	getEmpires() {
		return this.tm.getEmpires();
	}

	setColorMode(colorMode) {
		this.colorMode = colorMode;
	}

	render(g) {
		for (const pa of this.pixels) {
			for (const p of pa) {
				p.render(g, this.colorMode, this.scale);
			}
		}
		for (const b of this.boats) {
			b.render(g, this.scale);
		}
		for (const e of this.getEmpires()) {
			e.render(g);
		}
		for (const m of this.missiles) {
			m.render(g, this.scale);
		}
		for (const p of this.paratroopers) {
			p.render(g, this.scale);
		}
	}

	mouseClicked(point) {
		const x = Math.floor(point.x / this.scale);
		const y = Math.floor(point.y / this.scale);

		if (this.tm.getEmpireForPixel(this.pixels[x][y]) !== null) {
			this.perspectiveEmpire = this.tm.getEmpireForPixel(this.pixels[x][y]);
		}
	}
	
	getEmpireForPixel(pixel) {
		return this.tm.getEmpireForPixel(pixel);
	}

	addBoat(boat) {
		this.boats.push(boat);
	}

	addMissile(missile) {
		this.missiles.push(missile);
	}

	addParatrooper(paratrooper) {
		this.paratroopers.push(paratrooper);
	}

	getTerritoryManager() {
		return this.tm;
	}
}

// Export the GameState class to be imported in other modules
export default GameState;
