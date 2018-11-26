import { TimeGraphComponent, TimeGraphElementPosition } from "./time-graph-component";

export interface TimeGraphCursorOptions {
    height: number
    position: TimeGraphElementPosition
    color: number
}

export class TimeGraphCursor extends TimeGraphComponent{
    constructor(opts: TimeGraphCursorOptions){
        super('cursor');
        this.options = opts;
    }
    render(): void {
        const {color, height, position} = this.options as TimeGraphCursorOptions;
        this.vline({
            color,
            height,
            position
        })
    }
}