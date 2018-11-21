import { TimeGraphContainer, TimeGraphContainerOptions } from "./time-graph-container";
import { TimeGraphUnitController } from "./time-graph-unit-controller";
import { TimeGraphComponent } from "./time-graph-component";
import { TimeGraphStateController } from "./time-graph-state-controller";

export class TimeGraphNavigator extends TimeGraphContainer {

    protected scaleComponent: TimeGraphNavigatorHandle;

    constructor(protected canvasOpts: TimeGraphContainerOptions, protected unitController: TimeGraphUnitController) {
        super({
            id: canvasOpts.id,
            height: canvasOpts.height,
            width: canvasOpts.width,
            backgroundColor: 0x111111
        }, unitController);

        this.unitController.onViewRangeChanged(() => this.update());
        this.scaleComponent = new TimeGraphNavigatorHandle(this.unitController, this.stateController);
        this.addChild(this.scaleComponent);
    }

    update() {
        this.scaleComponent.clear();
        this.scaleComponent.render();
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