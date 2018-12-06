import { TimeGraphAxisScale } from "../components/time-graph-axis-scale";
import { TimeGraphLayer } from "./time-graph-layer";

export class TimeGraphAxis extends TimeGraphLayer {

    protected scaleComponent: TimeGraphAxisScale;

    protected afterAddToContainer() {
        this.onCanvasEvent('mousewheel', (ev: WheelEvent) => {
            const shiftStep = ev.deltaY;
            const oldViewRange = this.unitController.viewRange;
            let start = oldViewRange.start + (shiftStep / this.stateController.zoomFactor);
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
        this.scaleComponent = new TimeGraphAxisScale(this.id + '_scale', {
            height: this.stateController.canvasDisplayHeight,
            width: this.stateController.canvasDisplayWidth,
            position: {
                x: 0,
                y: 0
            }
        }, this.unitController, this.stateController);

        this.addChild(this.scaleComponent);

        this.unitController.onSelectionRangeChange(() => this.update());
        this.unitController.onViewRangeChanged(() => this.update());
    }

    update() {
        this.scaleComponent.update({
            height: this.stateController.canvasDisplayHeight,
            width: this.stateController.canvasDisplayWidth,
            position: {
                x: 0,
                y: 0
            }
        });
    }
}