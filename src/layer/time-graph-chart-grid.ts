import { TimeGraphLayer } from "./time-graph-layer";
import { TimeGraphGrid } from "../components/time-graph-grid";

export class TimeGraphChartGrid extends TimeGraphLayer {

    protected gridComponent: TimeGraphGrid;

    constructor(id: string, protected rowHeight: number) {
        super(id);
    }

    protected afterAddToContainer() {
        this.gridComponent = new TimeGraphGrid('', {
            height: this.stateController.canvasDisplayHeight,
            position: { x: 0, y: 0 },
            width: this.stateController.canvasDisplayWidth
        }, this.rowHeight, this.unitController, this.stateController);
        this.addChild(this.gridComponent);
        this.unitController.onViewRangeChanged(() => this.update());
    }

    update() {
        this.gridComponent.update();
    }

}