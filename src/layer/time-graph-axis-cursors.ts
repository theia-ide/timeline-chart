import { TimeGraphAxisCursor } from "../components/time-graph-axis-cursor";
import { TimeGraphLayer } from "./time-graph-layer";

export class TimeGraphAxisCursors extends TimeGraphLayer {
    protected firstCursor?: TimeGraphAxisCursor;
    protected secondCursor?: TimeGraphAxisCursor;

    afterAddToContainer() {
        this.unitController.onSelectionRangeChange(() => this.update());
        this.unitController.onViewRangeChanged(() => this.update());
    }

    update(): void {
        if (this.unitController.selectionRange) {
            const firstCursorPosition = (this.unitController.selectionRange.start - this.unitController.viewRange.start) * this.stateController.zoomFactor;
            const secondCursorPosition = (this.unitController.selectionRange.end - this.unitController.viewRange.start) * this.stateController.zoomFactor;
            const color = 0x0000ff;
            const firstOpts = {
                color,
                position: {
                    x: firstCursorPosition,
                    y: this.stateController.canvasDisplayHeight
                }
            };
            if (!this.firstCursor) {
                this.firstCursor = new TimeGraphAxisCursor(firstOpts);
                this.addChild(this.firstCursor);
            } else {
                this.firstCursor.update(firstOpts);
            }
            if (secondCursorPosition !== firstCursorPosition) {
                const secondOpts = {
                    color,
                    position: {
                        x: secondCursorPosition,
                        y: this.stateController.canvasDisplayHeight
                    }
                }
                if (!this.secondCursor) {
                    this.secondCursor = new TimeGraphAxisCursor(secondOpts);
                    this.addChild(this.secondCursor);
                } else {
                    this.secondCursor.update(secondOpts);
                }
            } else if (this.secondCursor) {
                this.secondCursor.clear();
            }
        } else {
            this.removeChildren();
            this.firstCursor = undefined;
            this.secondCursor = undefined;
        }
    }
}