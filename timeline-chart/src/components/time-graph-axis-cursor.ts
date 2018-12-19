import { TimeGraphComponent, TimeGraphElementPosition, TimeGraphComponentOptions } from "./time-graph-component";

export interface TimeGraphAxisCursorOptions extends TimeGraphComponentOptions {
    position: TimeGraphElementPosition
    color: number
}

export class TimeGraphAxisCursor extends TimeGraphComponent {

    constructor(protected options: TimeGraphAxisCursorOptions) {
        super('cursor');
    }

    setOptions(options: TimeGraphAxisCursorOptions) {
        this.options = options;
    }

    render(): void {
        const { position, color } = this.options;
        const x = this.toXpx(position.x);
        const y = this.toYpx(position.y);
        this._displayObject.beginFill(color);
        this._displayObject.moveTo(x, y);
        this._displayObject.lineTo(x - 5, y - 5);
        this._displayObject.lineTo(x + 5, y - 5);
        this._displayObject.lineTo(x, y);
        this._displayObject.endFill();
    }

}