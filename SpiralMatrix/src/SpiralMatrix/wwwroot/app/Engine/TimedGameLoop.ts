﻿namespace SpiralMatrix {
    export class TimedGameLoop extends SimpleGameLoop {
        private _totalRenderTime = 0;
        private _lastFrameTime = new Date();
        public onRunningSlow = new PromiseEvent<number>();

        get totalRenderTime() {
            return this._totalRenderTime;
        }

        get lastFrameTime() {
            return this._lastFrameTime;
        }

        update() {
            super.update();
            let thisFrameTime = new Date();
            let frameTime = (thisFrameTime.getTime() - this._lastFrameTime.getTime()) / 1000;
            this._lastFrameTime = thisFrameTime;
            this._totalRenderTime += frameTime;

            if (frameTime > 0.25) {
                this.onRunningSlow.fire(frameTime);
                return true;
            }
        }

        roundPerSecond(round: number) {
            return round * this.totalRenderTime * Math.PI * 2;
        }

        anglePerSecond(angle: number) {
            return angle / 360 * this.totalRenderTime * Math.PI * 2;
        }
    }
}