export default class PixelBatch {
	constructor() {
		this.pixelList = [];
		this.eventListeners = {};

		this.on("strengthPhase", () => this.startStrengthPhase());
		this.on("attackPhase", () => this.startAttackPhase());
		this.on("needPhase", () => this.startNeedPhase());
		this.on("needSpreadPhase", () => this.startNeedSpreadPhase());
		this.on("resourcePhase", () => this.startResourcePhase());
	}

	addPixel(p) {
		this.pixelList.push(p);
	}

	on(eventName, callback) {
		if (!this.eventListeners[eventName]) {
			this.eventListeners[eventName] = [];
		}
		this.eventListeners[eventName].push(callback);
	}

	dispatch(eventName) {
		const listeners = this.eventListeners[eventName];
		if (listeners) {
		listeners.forEach((callback) => callback());
		}
	}

	startStrengthPhase() {
		for (let p of this.pixelList) {
		p.strengthPhase();
		}
	}

	startAttackPhase() {
		for (let p of this.pixelList) {
		p.attackPhase();
		}
	}

	startNeedPhase() {
		for (let p of this.pixelList) {
			p.needPhase();
		}
	}

	startNeedSpreadPhase() {
		for (let p of this.pixelList) {
			p.needSpreadPhase();
		}
	}

	startResourcePhase() {
		for (let p of this.pixelList) {
			p.resourcePhase();
		}
	}
	  
	shuffleArray() {
		for (let i = this.pixelList.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[this.pixelList[i], this.pixelList[j]] = [this.pixelList[j], this.pixelList[i]];
		}
	}
}
