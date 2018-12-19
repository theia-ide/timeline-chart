import { TimeGraphComponent, TimeGraphInteractionHandler, TimeGraphStyledRect } from "./time-graph-component";
import { TimeGraphUnitController } from "../time-graph-unit-controller";
import * as _ from "lodash";

export class TimeGraphAxisScale extends TimeGraphComponent {

    protected mouseStartY: number;
    protected mouseStartX: number;
    protected mouseIsDown: boolean = false;
    protected labels: PIXI.Text[];

    constructor(id: string,
        protected options: TimeGraphStyledRect,
        protected unitController: TimeGraphUnitController,
        protected numberTranslator?: (theNumber: number) => string) {
        super(id);
        this.addEvents();
        this.labels = [];
    }

    protected addEvents() {
        const mouseMove = _.throttle(event => {
            if (this.mouseIsDown) {
                const delta = event.data.global.y - this.mouseStartY;
                const zoomStep = (delta / 100);
                this.zoom(zoomStep);
            }
        }, 40);
        this.addEvent('mousedown', event => {
            this.mouseStartY = event.data.global.y;
            this.mouseStartX = event.data.global.x;
            this.mouseIsDown = true;
        }, this._displayObject);
        this.addEvent('mousemove', mouseMove, this._displayObject);
        const moveEnd: TimeGraphInteractionHandler = event => {
            this.mouseIsDown = false;
        }
        this.addEvent('mouseup', moveEnd, this._displayObject);
        this.addEvent('mouseupoutside', moveEnd, this._displayObject);
    }

    /**
     * @returns the number of ticks on the x axis between vertical lines
     */
    protected getStepLength(): number {
        // improve me
        return (this.viewportInformation.x.end - this.viewportInformation.x.start) / 20;
    }

    protected renderVerticalLines(lineHeight: number, lineColor: number) {
        const stepLength = this.getStepLength();
        const steps = Math.trunc(this.unitController.absoluteRange / stepLength);
        for (let i = 0; i < steps; i++) {
            const absolutePosition = stepLength * i;
            const xpos = (absolutePosition - this.viewportInformation.x.start);
            const position = {
                x: xpos,
                y: this.options.height
            };
            if (this.numberTranslator) {
                const label = this.numberTranslator(absolutePosition);
                this.text(label, position);
            }
            this.vline({
                position,
                height: lineHeight * (-1),
                color: lineColor
            });
        }
    }

    render() {
        this.rect({
            color: this.options.color || 0xededdd,
            height: this.options.height,
            width: this.options.width,
            position: this.options.position
        });
        this.renderVerticalLines(10, 0x000000);
    }

    zoom(zoomStep: number) {
        let start = this.viewportInformation.x.start - zoomStep;
        if (start < 0) {
            start = 0;
        }
        let end = this.viewportInformation.x.start + zoomStep;
        if (end > this.unitController.absoluteRange) {
            end = this.unitController.absoluteRange;
        }
        this.unitController.viewRange = {
            start,
            end
        }
    }
}