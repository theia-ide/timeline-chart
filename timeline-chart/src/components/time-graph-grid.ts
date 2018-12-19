import { TimeGraphAxisScale } from "./time-graph-axis-scale";
import { TimeGraphRect } from "./time-graph-component";
import { TimeGraphUnitController } from "../time-graph-unit-controller";

// TODO externalize the step configuration and don't inherit from axisScale
export class TimeGraphGrid extends TimeGraphAxisScale {

    constructor(id: string,
        protected _options: TimeGraphRect,
        protected rowHeight: number,
        protected unitController: TimeGraphUnitController) {
        super(id, _options, unitController);
    }

    protected addEvents() { }

    render(): void {
        const y = this.viewportInformation.y;
        const logicalHeight = y.end - y.start;
        this.renderVerticalLines(logicalHeight, 0xdddddd);
    }
}