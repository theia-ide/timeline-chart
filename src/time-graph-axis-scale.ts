import { TimeGraphComponent, TimeGraphRect } from "./time-graph-component";

export class TimeGraphAxisScale extends TimeGraphComponent {

    constructor(id: string, protected options: TimeGraphRect) {
        super(id);
    }

    render() {
        this.rect({
            color: 0xFF0000,
            height: this.options.height,
            width: this.options.width,
            position: this.options.position
        });
        console.log("render axis", this.options.width);
    }

}