namespace SpiralMatrix {
    class ImageItem {
        smoothX = 0;
        smoothY = 0;

        update(x: number, y: number, time: number) {
            this.x = x;
            this.y = y;

            return $(this).animate(
                {
                    smoothX: x,
                    smoothY: y
                },
                {
                    duration: time,
                    queue: false
                }).promise();
        }

        image: HTMLImageElement;

        constructor(
            public x: number,
            public y: number,
            public imageUrl?: string) {
            this.smoothX = x;
            this.smoothY = y;

            if (imageUrl) {
                this.image = document.createElement("img");
                this.image.src = imageUrl;
            }
        }
    }

    function getSpiralIndexFromLocation(x: number, y: number) {
        let index = 0;
        if (x * x >= y * y) {
            index = 4 * x * x - x - y;
            if (x < y)
                index = index - 2 * (x - y);
        } else {
            index = 4 * y * y - x - y;
            if (x < y)
                index = index + 2 * (x - y);
        }
        return index;
    }

    class System {
        private items: Array<ImageItem>;

        private _size: number;
        get size() {
            return this._size;
        }
        set size(size) {
            this._size = size;
            this.items = Array<ImageItem>(size * size);
            for (let x = 0; x < this.size; ++x) {
                for (let y = 0; y < this.size; ++y) {
                    this.setAt(x, y, new ImageItem(x, y));
                }
            }
        }

        images() {
            return this.items.filter(x => !!x.imageUrl);
        }

        getAt(x: number, y: number) {
            x = x - (this.size - 1) / 2;
            y = y - (this.size - 1) / 2;
            return this.items[getSpiralIndexFromLocation(x, y)];
        }

        setAt(x: number, y: number, value: ImageItem) {
            x = x - (this.size - 1) / 2;
            y = y - (this.size - 1) / 2;
            this.items[getSpiralIndexFromLocation(x, y)] = value;
        }

        update() {
            let first = new ImageItem(this.items[0].x, this.items[0].y);
            for (let i = 0; i < this.items.length; ++i) {
                let nextItem = this.items[i + 1] || first;
                let item = this.items[i];
                item.update(nextItem.x, nextItem.y, this.updateInterval);
            }
            this.items.push(this.items.shift());
        }

        timeoutId: number;
        updateInterval: number;
        keepsUpdate(updateInterval: number) {
            this.stopUpdateIfPresent();
            this.updateInterval = updateInterval;
            this.timeoutId = setInterval(() => this.update(), updateInterval);
        }

        stopUpdateIfPresent() {
            if (this.timeoutId) {
                clearInterval(this.timeoutId);
            }
        }

        init() {
            for (var i = 0; i < this.size; ++i) {
                for (var j = 0; j < this.size; ++j) {
                    let id = i * this.size + j + 1;
                    this.setAt(i, j, new ImageItem(i, j, `.\\img\\${id % 54 + 1}.jpg`));
                }
            }
        }

        constructor(size: number) {
            this.size = size;
        }
    }

    class Renderer extends RendererBase {
        system = new System(13);

        size() {
            return Math.min(this.canvas.width(), this.canvas.height()) - 15;
        }

        render(time: number) {
            this.canvas.setTransform(float3x2.identity()
                .multiply(this.centerTransform()));
            //this.renderGrid();
            this.renderImages();
        }

        renderImages() {
            let length = this.size() / this.system.size;
            for (let image of this.system.images()) {
                this.canvas.ctx.drawImage(image.image,
                    (image.smoothX - this.system.size / 2) / this.system.size * this.size(),
                    (image.smoothY - this.system.size / 2) / this.system.size * this.size(),
                    length, length);
            }
        }

        renderGrid() {
            let size = this.size();
            let length = size / this.system.size;
            this.canvas.beginPath();
            for (let i = 0; i <= this.system.size; ++i) {
                let p = -size / 2 + i * length;
                this.canvas.line(p, -size / 2, p, size / 2);
                this.canvas.line(-size / 2, p, size / 2, p);
            }
            this.canvas.stroke();
        }

        constructor(canvas: CanvasManager) {
            super(canvas);
            window["r"] = this;

            this.system.init();
            this.system.keepsUpdate(500);
        }
    }

    let scene = new Scene(<HTMLCanvasElement>document.querySelector("canvas"));
    scene.addRenderer(new AlignToWindowUtil(scene.getCanvas()));
    scene.addRenderer(new FpsRenderer(scene.getCanvas()));
    scene.addRenderer(new Renderer(scene.getCanvas()));
}