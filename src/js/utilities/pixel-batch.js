export default class EmpireNameGenerator {
	constructor(pixelList) {
		this.addEventListener("strengthPhase", (event) => event.start());
		this.pixelList = pixelList;
    }
	
	const strengthPhase = new CustomEvent("strengthPhase", {
	  start: () => {
		for(p in this.pixelList) {
			p.strengthPhase();
		}
	  }
	});
		
	attackPhase() {
		for(p in this.pixelList) {
			p.attackPhase();
		}
	}
	
	needPhase() {
		for(p in this.pixelList) {
			p.needPhase();
		}
	}
	
	needSpreadPhase() {
		for(p in this.pixelList) {
			p.needSpreadPhase();
		}
	}
	
	resourcePhase() {
		for(p in this.pixelList) {
			p.resourcePhase();
		}
	}
	
	
}