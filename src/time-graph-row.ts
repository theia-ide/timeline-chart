import { TimeGraphComponent, TimeGraphHorizontalElement, TimeGraphElementPosition } from "./time-graph-component";

export class TimeGraphRow extends TimeGraphComponent {

    constructor(id: string, protected options: TimeGraphHorizontalElement) {
        super(id);
    }

    render() {
        this.hline({
            color: 0x000000,
            opacity: 0.2,
            width: this.options.width,
            position: this.options.position
        });
    }

    get position(): TimeGraphElementPosition {
        return this.options.position;
    }
}