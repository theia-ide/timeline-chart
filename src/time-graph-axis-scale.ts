import { TimeGraphComponent, TimeGraphRect, TimeGraphInteractionHandler } from "./time-graph-component";
import { TimeGraphUnitController } from "./time-graph-unit-controller";
import { TimeGraphRange } from "./time-graph-model";
import { TimeGraphStateController } from "./time-graph-state-controller";

export class TimeGraphAxisScale extends TimeGraphComponent {

    protected mouseStartY: number;
    protected mouseStartX: number;
    protected oldViewRange: TimeGraphRange;

    protected mouseIsDown: boolean = false;

    constructor(id: string, protected options: TimeGraphRect, protected unitController: TimeGraphUnitController, protected stateController: TimeGraphStateController) {
        super(id);

        this.addEvent('mousedown', event => {
            this.mouseStartY = event.data.global.y;
            this.mouseStartX = event.data.global.x;
            this.oldViewRange = this.unitController.viewRange;
            this.mouseIsDown = true;
        }, this._displayObject);
        this.addEvent('mousemove', event => {
            if (this.mouseIsDown) {
                const delta = event.data.global.y - this.mouseStartY;
                const zoomStep = (delta / 100);
                this.zoom(zoomStep);
            }
        }, this._displayObject);
        const moveEnd: TimeGraphInteractionHandler = event => {
            this.mouseIsDown = false;
        }
        this.addEvent('mouseup', moveEnd, this._displayObject);
        this.addEvent('mouseupoutside', moveEnd, this._displayObject);
    }

    render() {
        this.rect({
            color: 0xededdd,
            height: this.options.height,
            width: this.options.width,
            position: this.options.position
        });
        const stepLength = 1000;
        const steps = Math.trunc(this.unitController.absoluteRange / stepLength);
        for (let i = 0; i < steps; i++) {
            const height = i % 10 === 0 ? -10 : -5;
            const xpos = (stepLength * i - this.unitController.viewRange.start) * this.stateController.zoomFactor;
            if (xpos >= 0 && xpos < this.stateController.canvasWidth) {
                const position = {
                    x: xpos,
                    y: this.options.height
                };
                this.vline({
                    position,
                    height,
                    color: 0x000000
                });
            }
        }
    }

    zoom(zoomStep: number) {
        const oldViewRangeLength = this.oldViewRange.end - this.oldViewRange.start;
        const newViewRangeLength = oldViewRangeLength / (1 + (zoomStep));
        const normZoomFactor = newViewRangeLength / oldViewRangeLength;
        const shiftedMouseX = normZoomFactor * this.mouseStartX;
        const xOffset = this.mouseStartX - shiftedMouseX;
        const viewRangeOffset = xOffset / (this.stateController.canvasWidth / oldViewRangeLength);
        let start = this.oldViewRange.start + viewRangeOffset;
        if(start < 0) {
            start = 0;
        }
        let end = start + newViewRangeLength;
        if(end > this.unitController.absoluteRange){
            end = this.unitController.absoluteRange;
        }
        this.unitController.viewRange = {
            start,
            end
        }


    }


}