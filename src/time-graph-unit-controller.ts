import { TimeGraphRange } from "./time-graph-model";

export class TimeGraphUnitController {
    protected viewRangeChangedHandler: ((newRange: TimeGraphRange) => void)[];

    protected _viewRange: TimeGraphRange;

    constructor(public absoluteRange: number, viewRange?: TimeGraphRange) {
        this.viewRangeChangedHandler = [];

        this._viewRange = viewRange || { start: 0, end: absoluteRange };
    }

    protected handleViewRangeChange() {
        this.viewRangeChangedHandler.map(handler => handler(this._viewRange));
    }

    onViewRangeChanged(handler: (viewRange: TimeGraphRange) => void) {
        this.viewRangeChangedHandler.push(handler);
    }

    get viewRange(): TimeGraphRange {
        return this._viewRange;
    }
    set viewRange(newRange: TimeGraphRange) {
        const greaterThanAbsoluteRange = (newRange.start + this.viewRangeLength) > this.absoluteRange;
        if (newRange.end > newRange.start && !greaterThanAbsoluteRange) {
            this._viewRange = newRange;
        } else if(greaterThanAbsoluteRange) {
            this._viewRange = {start: newRange.start, end: (this.absoluteRange - newRange.start)};
        }
        this.handleViewRangeChange();
    }

    get viewRangeLength(): number {
        return this._viewRange.end - this._viewRange.start;
    }
}
