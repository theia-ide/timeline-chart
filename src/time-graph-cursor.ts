import { TimeGraphComponent, TimeGraphElementPosition } from "./time-graph-component";

export interface TimeGraphCursorOptions {
    height: number
    position: TimeGraphElementPosition
    color: number
}

export class TimeGraphCursor extends TimeGraphComponent{
    constructor(protected opts: TimeGraphCursorOptions){
        super('cursor')
    }
    render(): void {
        this.vline({
            color:this.opts.color,
            height: this.opts.height,
            position: this.opts.position
        })
    }
}