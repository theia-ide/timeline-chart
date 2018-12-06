import { TimeGraphRange } from "./time-graph-model";

export class TimeGraphUnitController {
    protected viewRangeChangedHandler: ((newRange: TimeGraphRange) => void)[];
    protected _viewRange: TimeGraphRange;

    protected selectionRangeChangedHandler: ((newRange?: TimeGraphRange) => void)[];
    protected _selectionRange?: TimeGraphRange;

    constructor(public absoluteRange: number, viewRange?: TimeGraphRange) {
        this.viewRangeChangedHandler = [];
        this._viewRange = viewRange || { start: 0, end: absoluteRange };

        this.selectionRangeChangedHandler = [];
    }

    protected handleViewRangeChange() {
        this.viewRangeChangedHandler.map(handler => handler(this._viewRange));
    }

    protected handleSelectionRangeChange() {
        this.selectionRangeChangedHandler.map(handler => handler(this._selectionRange));
    }

    onViewRangeChanged(handler: (viewRange: TimeGraphRange) => void) {
        this.viewRangeChangedHandler.push(handler);
    }

    onSelectionRangeChange(handler: (selectionRange: TimeGraphRange) => void) {
        this.selectionRangeChangedHandler.push(handler);
    }

    get viewRange(): TimeGraphRange {
        return this._viewRange;
    }
    set viewRange(newRange: TimeGraphRange) {
        if (newRange.end > newRange.start) {
            this._viewRange = { start: ~~(newRange.start + 0.5), end: ~~(newRange.end + 0.5) };
        }
        if (newRange.start < 0) {
            this._viewRange.start = 0;
        }
        if (this._viewRange.end > this.absoluteRange) {
            this._viewRange.end = this.absoluteRange;
        }
        this.handleViewRangeChange();
    }

    get selectionRange(): TimeGraphRange | undefined {
        return this._selectionRange;
    }
    set selectionRange(value: TimeGraphRange | undefined) {
        this._selectionRange = value;
        this.handleSelectionRangeChange();

    }

    get viewRangeLength(): number {
        return this._viewRange.end - this._viewRange.start;
    }
}
