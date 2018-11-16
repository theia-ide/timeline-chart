import { TimeGraphComponent, TimeGraphRect } from "./time-graph-component";
import { TimeGraphInteraction } from "./time-graph-interaction";

export class TimeGraphAxisScale extends TimeGraphComponent {

    constructor(id: string, protected options: TimeGraphRect, interaction: TimeGraphInteraction) {
        super(id);

        const navigationApi = interaction.dnDZoomAndPan;
        interaction.addEvent('mousedown', navigationApi.start, this._displayObject);
        interaction.addEvent('mousemove', navigationApi.move, this._displayObject);
        interaction.addEvent('mouseup', navigationApi.end, this._displayObject);
        interaction.addEvent('mouseupoutside', navigationApi.end, this._displayObject);
    }

    render() {
        this.rect({
            color: 0xFF0000,
            height: this.options.height,
            width: this.options.width,
            position: this.options.position
        });
    }

}