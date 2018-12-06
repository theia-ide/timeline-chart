import { TimeGraphUnitController } from "../time-graph-unit-controller";
import { TimeGraphComponent, TimeGraphStyledRect, TimeGraphInteractionHandler } from "../components/time-graph-component";
import { TimeGraphStateController } from "../time-graph-state-controller";
import { TimeGraphRectangle } from "../components/time-graph-rectangle";
import { TimeGraphLayer } from "./time-graph-layer";

export class TimeGraphNavigator extends TimeGraphLayer {

    protected navigatorHandle: TimeGraphNavigatorHandle;
    protected selectionRange?: TimeGraphRectangle;

    afterAddToContainer() {
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
                color: 0xb7b799,
                height: this.stateController.canvasDisplayHeight,
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
        } else {
            if(this.selectionRange){
                this.selectionRange.clear();
            }
        }
    }
}

export class TimeGraphNavigatorHandle extends TimeGraphComponent {

    protected mouseIsDown: boolean;
    protected mouseStartX: number;
    protected oldViewStart: number;

    constructor(protected unitController: TimeGraphUnitController, protected stateController: TimeGraphStateController) {
        super('navigator_handle');
        this.addEvent('mousedown', event => {
            this.mouseStartX = event.data.global.x;
            this.oldViewStart = this.unitController.viewRange.start;
            this.mouseIsDown = true;
        }, this._displayObject);
        this.addEvent('mousemove', event => {
            if (this.mouseIsDown) {
                const delta = (event.data.global.x - this.mouseStartX);
                const start = this.oldViewStart + (delta / this.stateController.absoluteResolution);
                const end = start + this.unitController.viewRangeLength;
                if (end < this.unitController.absoluteRange && start > 0) {
                    this.unitController.viewRange = {
                        start,
                        end
                    }
                }
            }
        }, this._displayObject);
        const moveEnd: TimeGraphInteractionHandler = event => {
            this.mouseIsDown = false;
        }
        this.addEvent('mouseup', moveEnd, this._displayObject);
        this.addEvent('mouseupoutside', moveEnd, this._displayObject);
    }

    render(): void {
        const position = { x: this.unitController.viewRange.start * this.stateController.absoluteResolution, y: 0 };
        const width = this.unitController.viewRangeLength * this.stateController.absoluteResolution;
        this.rect({
            height: 20,
            position,
            width,
            color: 0x777769
        })
    }
}