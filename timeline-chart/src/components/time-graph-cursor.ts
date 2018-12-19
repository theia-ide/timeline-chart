import { TimeGraphComponent, TimeGraphElementPosition } from "./time-graph-component";

export interface TimeGraphCursorOptions {
    height: number
    position: TimeGraphElementPosition
    color: number
}

export class TimeGraphCursor extends TimeGraphComponent{

    constructor(protected opts: TimeGraphCursorOptions){
        super('cursor');
    }

    render(): void {
        this.vline(this.opts);
    }
}