import { TimeGraphAxisScale } from "./time-graph-axis-scale";
import { TimeGraphContainer, TimeGraphContainerOptions } from "./time-graph-container";
import { TimeGraphUnitController } from "./time-graph-unit-controller";

export class TimeGraphAxis extends TimeGraphContainer {

    protected scaleComponent: TimeGraphAxisScale;

    constructor(protected canvasOpts: TimeGraphContainerOptions, protected unitController: TimeGraphUnitController) {
        super({
            id: canvasOpts.id,
            height: canvasOpts.height,
            width: canvasOpts.width,
            backgroundColor: 0xAA30f0
        }, unitController);

        this.init();
        this._canvas.addEventListener('mousewheel', (ev: WheelEvent) => {
            const shiftStep = ev.deltaY * 10;
            const oldViewRange = this.unitController.viewRange;
            let start = oldViewRange.start + shiftStep;
            if (start < 0) {
                start = 0;
            }
            let end = start + this.unitController.viewRangeLength;
            if (end > this.unitController.absoluteRange) {
                start = this.unitController.absoluteRange - this.unitController.viewRangeLength;
                end = start + this.unitController.viewRangeLength;
            }
            this.unitController.viewRange = { start, end }
            return false;
        });
    }

    init() {
        this.scaleComponent = new TimeGraphAxisScale(this.canvasOpts.id + '_scale', {
            height: 30,
            width: this.unitController.viewRangeLength * this.stateController.zoomFactor,
            position: {
                x: this.stateController.positionOffset.x,
                y: 0
            }
        }, this.unitController, this.stateController);

        this.addChild(this.scaleComponent);
    }

    update() {
        this.scaleComponent.clear();
        this.scaleComponent.render();
    }
}