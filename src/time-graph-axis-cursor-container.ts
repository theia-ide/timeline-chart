import { TimeGraphContainer } from "./time-graph-container";
import { TimeGraphAxisCursor } from "./time-graph-axis-cursor";

export class TimeGraphAxisCursorContainer extends TimeGraphContainer {
    protected firstCursor: TimeGraphAxisCursor;
    protected secondCursor: TimeGraphAxisCursor;

    update(): void {
        if (this.unitController.selectionRange) {
            const firstCursorPosition = (this.unitController.selectionRange.start - this.unitController.viewRange.start) * this.stateController.zoomFactor;
            const secondCursorPosition = (this.unitController.selectionRange.end - this.unitController.viewRange.start) * this.stateController.zoomFactor;
            const color = 0x0000ff;
            const firstOpts = {
                color,
                position: {
                    x: firstCursorPosition,
                    y: this._canvas.height
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
                        y: this._canvas.height
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
        }
    }
}