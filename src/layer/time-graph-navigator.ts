import { TimeGraphUnitController } from "../time-graph-unit-controller";
import { TimeGraphComponent, TimeGraphStyledRect } from "../components/time-graph-component";
import { TimeGraphStateController } from "../time-graph-state-controller";
import { TimeGraphRectangle } from "../components/time-graph-rectangle";
import { TimeGraphLayer } from "./time-graph-layer";

export class TimeGraphNavigator extends TimeGraphLayer {

    protected navigatorHandle: TimeGraphNavigatorHandle;
    protected selectionRange: TimeGraphRectangle;

    init() {
        this.unitController.onViewRangeChanged(() => this.update());
        this.navigatorHandle = new TimeGraphNavigatorHandle(this.unitController, this.stateController);
        this.addChild(this.navigatorHandle);
        this.unitController.onSelectionRangeChange(() => this.update());
    }

    update() {
        this.navigatorHandle.clear();
        this.navigatorHandle.render();

        if (this.unitController.selectionRange) {
            const selectionOpts: TimeGraphStyledRect = {
                color: 0xf6f666,
                height: this.canvas.height,
                opacity: 0.5,
                position: {
                    x: this.unitController.selectionRange.start * this.stateController.absoluteResolution,
                    y: 0
                },
                width: (this.unitController.selectionRange.end - this.unitController.selectionRange.start) * this.stateController.absoluteResolution
            };
            if (!this.selectionRange) {
                this.selectionRange = new TimeGraphRectangle(selectionOpts);
                this.addChild(this.selectionRange);
            } else {
                this.selectionRange.displayObject.clear();
                this.selectionRange.setOptions(selectionOpts);
                this.selectionRange.render();
            }
        }
    }
}

export class TimeGraphNavigatorHandle extends TimeGraphComponent {
    constructor(protected unitController: TimeGraphUnitController, protected stateController: TimeGraphStateController) {
        super('navigator_handle');
    }

    render(): void {
        const position = { x: this.unitController.viewRange.start * this.stateController.absoluteResolution, y: 0 };
        const width = this.unitController.viewRangeLength * this.stateController.absoluteResolution;
        this.rect({
            height: 20,
            position,
            width,
            color: 0x11aa11
        })
    }
}