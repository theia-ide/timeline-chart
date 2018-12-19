import { TimeGraphAxisCursor } from "../components/time-graph-axis-cursor";
import { TimeGraphLayer } from "./time-graph-layer";

export class TimeGraphAxisCursors extends TimeGraphLayer {
    protected firstCursor?: TimeGraphAxisCursor;
    protected secondCursor?: TimeGraphAxisCursor;
    protected color: number = 0x0000ff;

    constructor(id: string, style?: { color?: number }) {
        super(id);

        if (style && style.color) {
            this.color = style.color;
        }
    }

    afterAddToContainer() {
        this.unitController.onSelectionRangeChange(() => this.update());
        this.unitController.onViewRangeChanged(() => this.update());
    }

    update(): void {
        if (this.unitController.selectionRange) {
            const firstCursorPosition = (this.unitController.selectionRange.start - this.unitController.viewRange.start) * this.stateController.zoomFactor;
            const secondCursorPosition = (this.unitController.selectionRange.end - this.unitController.viewRange.start) * this.stateController.zoomFactor;
            const firstOpts = {
                color: this.color,
                position: {
                    x: firstCursorPosition,
                    y: this.stateController.canvasDisplayHeight
                }
            };
            if (!this.firstCursor) {
                this.firstCursor = new TimeGraphAxisCursor(firstOpts);
                this.addChild(this.firstCursor);
            } else {
                this.firstCursor.setOptions(firstOpts);
            }
            if (secondCursorPosition !== firstCursorPosition) {
                const secondOpts = {
                    color: this.color,
                    position: {
                        x: secondCursorPosition,
                        y: this.stateController.canvasDisplayHeight
                    }
                }
                if (!this.secondCursor) {
                    this.secondCursor = new TimeGraphAxisCursor(secondOpts);
                    this.addChild(this.secondCursor);
                } else {
                    this.secondCursor.setOptions(secondOpts);
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