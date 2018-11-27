import { TimeGraphCursor } from "../components/time-graph-cursor";
import { TimeGraphRectangle } from "../components/time-graph-rectangle";
import { TimeGraphLayer } from "./time-graph-layer";

export class TimeGraphChartCursors extends TimeGraphLayer {
    protected mouseIsDown: boolean;
    protected shiftKeyDown: boolean;
    protected firstCursor: TimeGraphCursor;
    protected secondCursor: TimeGraphCursor;
    protected selectionRange: TimeGraphRectangle;
    protected navigateLeftHandler: () => void;
    protected navigateRightHandler: () => void;

    protected init() {
        this.addBackground();

        this.mouseIsDown = false;
        this.shiftKeyDown = false
        this.stage.interactive = true;
        document.addEventListener('keydown', (event: KeyboardEvent) => {
            this.shiftKeyDown = event.shiftKey;
            if (event.keyCode === 37) {
                this.goLeft();
            } else if (event.keyCode === 39) {
                this.goRight();
            }
        });
        document.addEventListener('keyup', (event: KeyboardEvent) => {
            this.shiftKeyDown = event.shiftKey;
        });
        this.stage.on('mousedown', (event: PIXI.interaction.InteractionEvent) => {
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
        this.stage.on('mousemove', (event: PIXI.interaction.InteractionEvent) => {
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
        this.stage.on('mouseup', (event: PIXI.interaction.InteractionEvent) => {
            this.mouseIsDown = false;
        });
        this.stage.on('mouseupoutside', (event: PIXI.interaction.InteractionEvent) => {
            this.mouseIsDown = false;
        });
        this.unitController.onSelectionRangeChange(() => this.update());
        this.unitController.onViewRangeChanged(() => this.update());
    }

    onNavigateLeft(handler: () => void) {
        this.navigateLeftHandler = handler;
    }

    protected goLeft() {
        if (this.navigateLeftHandler) {
            this.navigateLeftHandler();
        }
    }

    onNavigateRight(handler: () => void) {
        this.navigateRightHandler = handler;
    }

    protected goRight() {
        if (this.navigateRightHandler) {
            this.navigateRightHandler();
        }
    }

    // this background is needed because an empty stage, or a point at that stage which is not actually an displayObject, wont react on mouse events.
    protected addBackground() {
        const background = new TimeGraphRectangle({
            position: { x: 0, y: 0 },
            height: this.canvas.height,
            width: this.canvas.width,
            opacity: 0
        });
        this.addChild(background);
    }

    update() {
        this.removeChildren();
        this.addBackground();
        if (this.unitController.selectionRange) {
            const firstCursorPosition = (this.unitController.selectionRange.start - this.unitController.viewRange.start) * this.stateController.zoomFactor;
            const secondCursorPosition = (this.unitController.selectionRange.end - this.unitController.viewRange.start) * this.stateController.zoomFactor;
            const color = 0x0000ff;
            const firstCursorOptions = {
                color,
                height: this.canvas.height,
                position: {
                    x: firstCursorPosition,
                    y: 0
                }
            };
            this.firstCursor = new TimeGraphCursor(firstCursorOptions);
            this.addChild(this.firstCursor);
            if (secondCursorPosition !== firstCursorPosition) {
                const secondCursorOptions = {
                    color,
                    height: this.canvas.height,
                    position: {
                        x: secondCursorPosition,
                        y: 0
                    }
                };
                this.secondCursor = new TimeGraphCursor(secondCursorOptions);
                this.addChild(this.secondCursor);

                const selectionRange = new TimeGraphRectangle({
                    color,
                    opacity: 0.2,
                    position: {
                        x: firstCursorPosition,
                        y: 0
                    },
                    height: this.canvas.height,
                    width: secondCursorPosition - firstCursorPosition
                });
                this.addChild(selectionRange);
            }
        }
    }
}