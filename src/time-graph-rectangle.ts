import { TimeGraphComponent, TimeGraphStyledRect } from "./time-graph-component";

export class TimeGraphRectangle extends TimeGraphComponent {
    constructor(protected opts: TimeGraphStyledRect){
        super('rect');
    }

    setOptions(opts: TimeGraphStyledRect){
        this.opts = opts;
    }

    render(): void {
        this.rect(this.opts);
    }
}