import { TimeGraphAxisScale } from "../components/time-graph-axis-scale";
import { TimeGraphLayer } from "./time-graph-layer";
import * as _ from "lodash";

export class TimeGraphAxis extends TimeGraphLayer {

    protected scaleComponent: TimeGraphAxisScale;
    protected numberTranslator?: (theNumber: number) => string;

    constructor(id: string, protected style?: { color?: number }) {
        super(id);
    }

    protected getOptions() {
        const color = this.style && this.style.color ? this.style.color : undefined;
        return {
            height: this.stateController.canvasDisplayHeight,
            width: this.stateController.canvasDisplayWidth,
            position: {
                x: 0,
                y: 0
            },
            color
        }
    }

    protected afterAddToContainer() {
        const mw = _.throttle((ev: WheelEvent) => {
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
        this.onCanvasEvent('mousewheel', mw);
        this.scaleComponent = new TimeGraphAxisScale(
            this.id + '_scale',
            this.getOptions(),
            this.unitController,
            this.numberTranslator
        );
        this.addChild(this.scaleComponent);

        this.unitController.onSelectionRangeChange(() => this.update());
        this.unitController.onViewRangeChanged(() => this.update());
    }

    update() {
        this.scaleComponent.update({
            x: {
                start: this.unitController.viewRange.start,
                end: this.unitController.viewRange.start,
                pixelFactor: (this.unitController.viewRange.end - this.unitController.viewRange.start) / this.stateController.canvasDisplayWidth
            },
            y: {
                start: 0,
                end: 13,
                pixelFactor: 1
            },
        });
    }

    registerNumberTranslator(translator: (theNumber: number) => string) {
        this.numberTranslator = translator;
    }
}