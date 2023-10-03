export default class PixelBatch {
	constructor(pixelList) {
		this.addEventListener("strengthPhase", (event) => event.start());
		this.addEventListener("attackPhase", (event) => event.start());
		this.addEventListener("needPhase", (event) => event.start());
		this.addEventListener("needSpreadPhase", (event) => event.start());
		this.addEventListener("resourcePhase", (event) => event.start());
		this.pixelList = pixelList;
    }
	
	const strengthPhase = new CustomEvent("strengthPhase", {
	  start: () => {
		for(p in this.pixelList) {
			p.strengthPhase();
		}
	  }
	});
		
	const attackPhase = new CustomEvent("attackPhase", {
	  start: () => {
		for(p in this.pixelList) {
			p.attackPhase();
		}
	  }
	});
	
	const needPhase = new CustomEvent("needPhase", {
	  start: () => {
		for(p in this.pixelList) {
			p.needPhase();
		}
	  }
	});
	
	const needSpreadPhase = new CustomEvent("needSpreadPhase", {
	  start: () => {
		for(p in this.pixelList) {
			p.needSpreadPhase();
		}
	  }
	});
	
	const resourcePhase = new CustomEvent("resourcePhase", {
	  start: () => {
		for(p in this.pixelList) {
			p.resourcePhase();
		}
	  }
	});
}