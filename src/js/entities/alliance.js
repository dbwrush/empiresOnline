export default class Alliance {	
    constructor(gameState) {
        this.allies = [];
		this.ideology = [];
		this.color = [Math.random() * 360, Math.random() * 100];
        this.gameState = gameState;
    }

	getIdeology() {
		return this.ideology;
	}
	
	setIdeology(ideo) {
		this.ideology = ideo;
	}
	
    getCoopIso() {
        return this.ideology[0];
    }

    getAuthLib() {
        return this.ideology[1];
    }

    getLeftRight() {
        return this.ideology[2];
    }

    setEnemy(e) {
		if(!this.allies.includes(e)) {
			for(let a of this.allies) {
				a.enemies.push(e);
				e.enemies.push(a);
			}
		}
    }

    makePeace(e) {
		for(let a of this.allies) {
			a.enemies.remove(e);
			e.enemies.remove(a);
		}
    }

    breakAlliance(e) {
		this.allies = [];
    }
	
	removeAlly(e) {
		if(this.allies.includes(e)) {
			let i = this.allies.indexOf(e);
			this.allies.splice(i, 1);
			e.alliance = null;
		}
	}
	
    setAlly(e) {
		if(this.allies.includes(e)) {
			return;
		}
		if(this.allies.length >= this.maxAllies) {
			return;
		}
		//console.log(this.allies);
		for(let a of this.allies) {
			let ideoDiff = a.ideoDifference(e);
			if(a.getEnemies().includes(e)) {
				return;
			}
			if(100 + Math.min(a.getCoopIso(), e.getCoopIso()) / 2 <  ideoDiff * this.getAllianceDifficulty()) {
				return;
			}
		}
		if(e.alliance) {
			e.alliance.removeAlly(e);
		}
		this.allies.push(e);
		e.alliance = this;
    }
	
	updateIdeology() {
		for(let a of this.allies) {
			for(let i = 0; i < this.ideology.length; i++) {
				this.ideology[i] += a.ideology[i];
			}
		}
		for(let i = 0; i < this.ideology.length; i++) {
			this.ideology[i] /= this.allies.length;
		}
	}

    ideoDifference(e) {
        let total = 0;
        for (let i = 0; i < this.ideology.length; i++) {
            total += Math.abs(this.ideology[i] - e[i]);
        }
        return total;
    }

    getColor() {
        return this.color;
    }

    getAllies() {
        return this.allies;
    }

    getAllianceDifficulty() {
        return this.gameState.allianceDifficulty;
    }
}
