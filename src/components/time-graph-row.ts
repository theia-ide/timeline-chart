import { TimeGraphComponent, TimeGraphHorizontalElement, TimeGraphElementPosition } from "./time-graph-component";

export class TimeGraphRow extends TimeGraphComponent {

    constructor(id: string, protected _options: TimeGraphHorizontalElement, protected _rowIndex: number) {
        super(id);
    }

    get rowIndex(): number {
        return this._rowIndex;
    }

    render() {
        this.hline({
            color: 0x000000,
            opacity: 0.2,
            width: this._options.width,
            position: this._options.position
        });
    }

    get position(): TimeGraphElementPosition {
        return this._options.position;
    }
}