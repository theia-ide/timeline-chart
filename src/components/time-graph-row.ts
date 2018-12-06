import { TimeGraphComponent, TimeGraphElementPosition, TimeGraphRect } from "./time-graph-component";
import { TimeGraphRowModel } from "../time-graph-model";

export interface TimeGraphRowStyle {
    backgroundColor?: number
    backgroundOpacity?: number
    lineThickness?: number
    lineColor?: number
    lineOpacity?: number
}

export class TimeGraphRow extends TimeGraphComponent {

    constructor(
        id: string,
        protected _options: TimeGraphRect,
        protected _rowIndex: number,
        public readonly model: TimeGraphRowModel,
        protected style: TimeGraphRowStyle = {lineOpacity:0.5, lineThickness: 1, backgroundOpacity: 0}) {
        super(id);
    }

    get rowIndex(): number {
        return this._rowIndex;
    }

    render() {
        this.rect({
            color: this.style.backgroundColor,
            opacity: this.style.backgroundOpacity,
            height: this._options.height,
            width: this._options.width,
            position: this._options.position
        });
        this.hline({
            color: this.style.lineColor || 0xeeeeee,
            opacity: this.style.lineOpacity || 0.5,
            thickness: this.style.lineThickness || 1,
            width: this._options.width,
            position: {
                x: this._options.position.x,
                y: this._options.position.y + (this._options.height/2)
            }
        });
    }

    get position(): TimeGraphElementPosition {
        return this._options.position;
    }

    get height(): number {
        return this._options.height;
    }
}