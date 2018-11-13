import { TimeGraphStateController } from "./time-graph-state-controller";

export type TimeGraphInteractionType = 'mouseover' | 'mouseout' | 'mousemove' | 'mousedown' | 'mouseup' | 'mouseupoutside' | 'click';
export type TimeGraphInteractionHandler = (event: PIXI.interaction.InteractionEvent) => void;

export class TimeGraphInteraction {
    protected mouseStartY: number;
    protected mouseStartX: number;
    protected graphWidthStart: number;

    protected mouseIsDown: boolean = false;

    constructor(protected controller: TimeGraphStateController) {}

    addMousewheelZoomAndPan(canvas: HTMLCanvasElement) {
        canvas.addEventListener('mousewheel', (ev: WheelEvent) => {
            this.mouseStartX = ev.x;
            this.graphWidthStart = this.controller.graphWidth;
            this.zoom((ev.deltaY / 100) * (-1));
            this.setXOffset(ev.deltaX * (-1));
            this.setZoomAndPosition();
            return false;
        });
    }

    addDnDZoomAndPan(displayObject: PIXI.DisplayObject) {
        this.addEvent('mousedown', event => {
            this.mouseStartY = event.data.global.y;
            this.mouseStartX = event.data.global.x;
            this.graphWidthStart = this.controller.graphWidth;
            this.mouseIsDown = true;
        }, displayObject);

        this.addEvent('mousemove', event => {
            if (this.mouseIsDown) {

                const deltaY = event.data.global.y - this.mouseStartY;
                const zoomMulti = (deltaY / 100);
                this.zoom(zoomMulti);

                const deltaMouseX = event.data.global.x - this.mouseStartX;
                this.setXOffset(deltaMouseX);
            }
        }, displayObject);
        const mouseUp = (event: PIXI.interaction.InteractionEvent) => {
            this.mouseIsDown = false;
            this.setZoomAndPosition();
        }
        this.addEvent('mouseup', mouseUp, displayObject);
        this.addEvent('mouseupoutside', mouseUp, displayObject);
    }

    protected setZoomAndPosition() {
        this.controller.oldZoomFactor = this.controller.zoomFactor;
        this.controller.oldPositionOffset = this.controller.positionOffset;
    }

    protected setXOffset(deltaMouseX: number = 0) {
        const c = this.controller;
        const normZoomFactor = c.graphWidth / this.graphWidthStart;
        const graphMouseStartX = (c.oldPositionOffset.x * (-1)) + this.mouseStartX;
        const shiftedMouseX = normZoomFactor * graphMouseStartX;
        const xOffset = c.oldPositionOffset.x + graphMouseStartX - shiftedMouseX + deltaMouseX;

        const minOffset = c.canvasWidth - c.graphWidth;
        let finalXOffset: number;
        if (xOffset > 0) {
            finalXOffset = 0;
        } else if (xOffset < minOffset) {
            finalXOffset = minOffset;
        } else {
            finalXOffset = xOffset;
        }
        c.positionOffset = { x: finalXOffset, y: 0 };
    }

    zoom(zoomMulti: number) {
        const c = this.controller;
        const newZoomFactor = c.oldZoomFactor + zoomMulti;
        if (newZoomFactor > c.initialZoomFactor) {
            c.zoomFactor = newZoomFactor;
        }
    }

    protected addEvent(event: TimeGraphInteractionType, handler: TimeGraphInteractionHandler, displayObject: PIXI.DisplayObject) {
        displayObject.interactive = true;
        displayObject.on(event, (e: PIXI.interaction.InteractionEvent) => {
            if (handler) {
                handler(e);
            }
        });
    }
}