import { TimeGraphComponent } from "./time-graph-component";
import { TimeGraphRow } from "./time-graph-row";
import { TimeGraphRowElementModel } from "./time-graph-model";

export class TimeGraphRowElement extends TimeGraphComponent {

    constructor(id: string, protected options: TimeGraphRowElementModel, protected row: TimeGraphRow) {
        super(id);
    }

    render() {
        const height = 20;
        const position = {
            x: this.options.range.start,
            y: this.row.position.y - (height / 2)
        };
        const width = this.options.range.end - this.options.range.start;

        this.rect({
            color: 0xC80000,
            height,
            position,
            width
        });
    }
}