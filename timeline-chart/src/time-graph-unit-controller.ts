import { TimelineChart } from "./time-graph-model";

export class TimeGraphUnitController {
    protected viewRangeChangedHandlers: ((newRange: TimelineChart.TimeGraphRange) => void)[];
    protected _viewRange: TimelineChart.TimeGraphRange;

    protected selectionRangeChangedHandlers: ((newRange?: TimelineChart.TimeGraphRange) => void)[];
    protected _selectionRange?: TimelineChart.TimeGraphRange;

    /**
     *  Create a string from the given number, which is shown in TimeAxis.
     *  Or return undefined to not show any text for that number.
     */
    numberTranslator?: (theNumber: number) => string | undefined;
    scaleSteps?: number[]

    constructor(public absoluteRange: number, viewRange?: TimelineChart.TimeGraphRange) {
        this.viewRangeChangedHandlers = [];
        this._viewRange = viewRange || { start: 0, end: absoluteRange };

        this.selectionRangeChangedHandlers = [];
    }

    protected handleViewRangeChange() {
        this.viewRangeChangedHandlers.forEach(handler => handler(this._viewRange));
    }

    protected handleSelectionRangeChange() {
        this.selectionRangeChangedHandlers.forEach(handler => handler(this._selectionRange));
    }

    onViewRangeChanged(handler: (viewRange: TimelineChart.TimeGraphRange) => void) {
        this.viewRangeChangedHandlers.push(handler);
    }

    onSelectionRangeChange(handler: (selectionRange?: TimelineChart.TimeGraphRange) => void) {
        this.selectionRangeChangedHandlers.push(handler);
    }

    get viewRange(): TimelineChart.TimeGraphRange {
        return this._viewRange;
    }
    set viewRange(newRange: TimelineChart.TimeGraphRange) {
        if (newRange.end > newRange.start) {
            this._viewRange = { start: newRange.start, end: newRange.end };
        }
        if (newRange.start < 0) {
            this._viewRange.start = 0;
        }
        if (this._viewRange.end > this.absoluteRange) {
            this._viewRange.end = this.absoluteRange;
        }
        this.handleViewRangeChange();
    }

    get selectionRange(): TimelineChart.TimeGraphRange | undefined {
        return this._selectionRange;
    }
    set selectionRange(value: TimelineChart.TimeGraphRange | undefined) {
        this._selectionRange = value;
        this.handleSelectionRangeChange();
    }

    get viewRangeLength(): number {
        return this._viewRange.end - this._viewRange.start;
    }
}