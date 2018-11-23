import { TimeGraphContainer, TimeGraphContainerOptions } from "./time-graph-container";
import { TimeGraphUnitController } from "./time-graph-unit-controller";
import { TimeGraphComponent, TimeGraphStyledRect } from "./time-graph-component";
import { TimeGraphStateController } from "./time-graph-state-controller";
import { TimeGraphRectangle } from "./time-graph-rectangle";

export class TimeGraphNavigator extends TimeGraphContainer {

    protected navigatorHandle: TimeGraphNavigatorHandle;
    protected selectionRange: TimeGraphRectangle;

    constructor(protected canvasOpts: TimeGraphContainerOptions, protected unitController: TimeGraphUnitController) {
        super({
            id: canvasOpts.id,
            height: canvasOpts.height,
            width: canvasOpts.width,
            backgroundColor: 0x111111
        }, unitController);

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
                height: this.canvasOpts.height,
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