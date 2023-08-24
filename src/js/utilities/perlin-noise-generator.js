export default class PerlinNoiseGenerator {
    constructor(width, height, frequency, octaves) {
        this.width = width;
        this.height = height;
		console.log("Using width: " + width + " and height " + height);
        this.frequency = frequency;
        this.octaves = octaves;
        this.noise = this.generateNoise();
    }

    getNoise() {
        return this.noise;
    }

    generateNoise() {
        const noise = new Array(this.width).fill(null).map(() => new Array(this.height).fill(0));
        const gradients = new Array(this.width).fill(null).map(() =>
            new Array(this.height).fill(null).map(() => new Array(2).fill(0))
        );

        // Generate random gradients
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                const angle = Math.random() * 2 * Math.PI;
                gradients[x][y][0] = Math.cos(angle);
                gradients[x][y][1] = Math.sin(angle);
            }
        }

        // Generate Perlin noise
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                let noiseValue = 0;
                let frequency = this.frequency;
                let amplitude = 1;

                for (let octave = 0; octave < this.octaves; octave++) {
                    const sampleX = x * frequency;
                    const sampleY = y * frequency;

                    const x0 = Math.floor(sampleX);
                    const x1 = (x0 + 1) % this.width;
                    const y0 = Math.floor(sampleY);
                    const y1 = (y0 + 1) % this.height;

                    const dx = sampleX - x0;
                    const dy = sampleY - y0;

                    const dot0 = this.dotProduct(gradients[x0][y0], dx, dy);
                    const dot1 = this.dotProduct(gradients[x1][y0], dx - 1, dy);
                    const dot2 = this.dotProduct(gradients[x0][y1], dx, dy - 1);
                    const dot3 = this.dotProduct(gradients[x1][y1], dx - 1, dy - 1);

                    const interpX0 = this.interpolate(dot0, dot1, this.smoothStep(dx));
                    const interpX1 = this.interpolate(dot2, dot3, this.smoothStep(dx));
                    const interpY = this.interpolate(interpX0, interpX1, this.smoothStep(dy));

                    noiseValue += interpY * amplitude;

                    frequency *= 2;
                    amplitude *= 0.5;
                }

                noise[x][y] = noiseValue;
            }
        }

        return noise;
    }

    dotProduct(gradient, x, y) {
        return gradient[0] * x + gradient[1] * y;
    }

    interpolate(a, b, t) {
        return a * (1 - t) + b * t;
    }

    smoothStep(t) {
        return t * t * (3 - 2 * t);
    }
}