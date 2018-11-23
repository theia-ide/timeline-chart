import { TimeGraphContainer } from "./time-graph-container";
import { TimeGraphCursor } from "./time-graph-cursor";
import { TimeGraphRectangle } from "./time-graph-rectangle";

export class TimeGraphCursorContainer extends TimeGraphContainer {
    protected mouseIsDown: boolean;
    protected shiftKeyDown: boolean;
    protected init() {
        this.mouseIsDown = false;
        this.shiftKeyDown = false
        this._stage.interactive = true;
        document.addEventListener('keydown', (event: KeyboardEvent) => {
            this.shiftKeyDown = event.shiftKey;
        });
        document.addEventListener('keyup', (event: KeyboardEvent) => {
            this.shiftKeyDown = event.shiftKey;
        });
        this._stage.on('mousedown', (event: PIXI.interaction.InteractionEvent) => {
            this.mouseIsDown = true;
            const mouseX = event.data.global.x;
            const xpos = this.unitController.viewRange.start + (mouseX / this.stateController.zoomFactor);
            if (this.shiftKeyDown) {
                const start = this.unitController.selectionRange ? this.unitController.selectionRange.start : 0;
                this.unitController.selectionRange = {
                    start,
                    end: xpos
                }
            } else {
                this.unitController.selectionRange = {
                    start: xpos,
                    end: xpos
                }
            }
        });
        this._stage.on('mousemove', (event: PIXI.interaction.InteractionEvent) => {
            if (this.mouseIsDown && this.unitController.selectionRange) {
                const mouseX = event.data.global.x;
                const xStartPos = this.unitController.selectionRange.start;
                const xEndPos = this.unitController.viewRange.start + (mouseX / this.stateController.zoomFactor);
                this.unitController.selectionRange = {
                    start: xStartPos,
                    end: xEndPos
                }
            }
        });
        this._stage.on('mouseup', (event: PIXI.interaction.InteractionEvent) => {
            this.mouseIsDown = false;
        });
        this._stage.on('mouseupoutside', (event: PIXI.interaction.InteractionEvent) => {
            this.mouseIsDown = false;
        });
        this.unitController.onSelectionRangeChange(() => {
            this.update();
        })
    }

    update() {
        if (this.unitController.selectionRange) {
            const firstCursorPosition = (this.unitController.selectionRange.start - this.unitController.viewRange.start) * this.stateController.zoomFactor;
            const secondCursorPosition = (this.unitController.selectionRange.end - this.unitController.viewRange.start) * this.stateController.zoomFactor;
            const color = 0x0000ff;
            const firstCursor = new TimeGraphCursor({
                color,
                height: this.canvas.height,
                position: {
                    x: firstCursorPosition,
                    y: 0
                }
            });
            this.addChild(firstCursor);
            if (secondCursorPosition !== firstCursorPosition) {
                const secondCursor = new TimeGraphCursor({
                    color,
                    height: this.canvas.height,
                    position: {
                        x: secondCursorPosition,
                        y: 0
                    }
                });
                this.addChild(secondCursor);
                const selectionRange = new TimeGraphRectangle({
                    color,
                    opacity: 0.2,
                    position: {
                        x: firstCursorPosition,
                        y: 0
                    },
                    height: this._canvas.height,
                    width: secondCursorPosition - firstCursorPosition
                });
                this.addChild(selectionRange);
            }
        }
    }
}