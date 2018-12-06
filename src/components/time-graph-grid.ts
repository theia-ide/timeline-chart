import { TimeGraphAxisScale } from "./time-graph-axis-scale";
import { TimeGraphRect } from "./time-graph-component";
import { TimeGraphUnitController } from "../time-graph-unit-controller";
import { TimeGraphStateController } from "../time-graph-state-controller";

export class TimeGraphGrid extends TimeGraphAxisScale {

    constructor(id: string, protected _options: TimeGraphRect, protected rowHeight: number, protected unitController: TimeGraphUnitController, protected stateController: TimeGraphStateController) {
        super(id, _options, unitController, stateController);
    }

    protected addEvents() { }

    render(): void {
        this.renderVerticalLines(this.stateController.canvasDisplayHeight, 0xdddddd);

        const rowNumber = Math.trunc(this.stateController.canvasDisplayHeight / this.rowHeight) + 2;
        for (let i = 0; i < rowNumber; i++) {
            this.hline({
                color: 0xdddddd,
                position: {
                    x: this._options.position.x,
                    y: (i * this.rowHeight) - (this.rowHeight / 2)
                },
                width: this._options.width
            });
        }
    }
}