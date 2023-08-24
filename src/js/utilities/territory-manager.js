export default class TerritoryManager {
    constructor() {
        this.pixelToEmpireMap = new Map();
        this.empireToPixelsMap = new Map();
    }

    addPixelToEmpire(pixel, empire) {
        const currentEmpire = this.pixelToEmpireMap.get(pixel);

        if (currentEmpire && currentEmpire === empire) {
            return; // Pixel is already controlled by the desired empire
        }

        this.removePixelFromEmpire(pixel); // Ensure pixel is not controlled by any empire
        this.pixelToEmpireMap.set(pixel, empire);
        if (!this.empireToPixelsMap.has(empire)) {
            this.empireToPixelsMap.set(empire, []);
        }
        this.empireToPixelsMap.get(empire).push(pixel);
    }

    removePixelFromEmpire(pixel) {
        const empire = this.pixelToEmpireMap.get(pixel);
        if (empire) {
            const pixelList = this.empireToPixelsMap.get(empire);
            if (pixelList) {
                const pixelIndex = pixelList.indexOf(pixel);
                if (pixelIndex !== -1) {
                    pixelList.splice(pixelIndex, 1);
                    if (pixelList.length === 0) {
                        this.empireToPixelsMap.delete(empire);
                    }
                }
            }
        }
        this.pixelToEmpireMap.delete(pixel);
    }

    transferPixelToEmpire(pixel, newEmpire) {
        const currentEmpire = this.pixelToEmpireMap.get(pixel);
        if (currentEmpire) {
            if (currentEmpire === newEmpire) {
                return; // Pixel is already controlled by the new empire
            }
            this.removePixelFromEmpire(pixel);
        }
        this.addPixelToEmpire(pixel, newEmpire);
    }

    getEmpireForPixel(pixel) {
        return this.pixelToEmpireMap.get(pixel);
    }

    getPixelsForEmpire(empire) {
        return this.empireToPixelsMap.get(empire) || [];
    }

	//Adds an empire to the map without giving it territory. This is unused.
    addEmpire(empire) {
        if (!this.empireToPixelsMap.has(empire)) {
            this.empireToPixelsMap.set(empire, []);
        }
    }

	//Removes an empire from the sim entirely. This may become unused in the future.
    removeEmpire(empire) {
        const pixelList = this.empireToPixelsMap.get(empire);
        if (pixelList) {
            for (const pixel of pixelList) {
                this.pixelToEmpireMap.delete(pixel);
            }
            this.empireToPixelsMap.delete(empire);
        }
    }

    getEmpires() {
        return Array.from(this.empireToPixelsMap.keys());
    }
}