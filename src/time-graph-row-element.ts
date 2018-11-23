import { TimeGraphComponent, TimeGraphStyledRect } from "./time-graph-component";
import { TimeGraphRow } from "./time-graph-row";
import { TimeGraphRowElementModel } from "./time-graph-model";

export class TimeGraphRowElement extends TimeGraphComponent {

    protected style: TimeGraphStyledRect;

    constructor(id: string, protected options: TimeGraphRowElementModel, protected row: TimeGraphRow) {
        super(id);
        const height = 20;
        const position = {
            x: this.options.range.start,
            y: this.row.position.y - (height / 2)
        };
        const width = this.options.range.end - this.options.range.start;

        this.style = {
            color: 0xC80000,
            height,
            position,
            width
        };

        this.addEvent('mouseover', this.handleMouseOver, this._displayObject);
        this.addEvent('mouseout', this.handleMouseOut, this._displayObject);
        this.addEvent('mousedown', this.handleMouseDown, this._displayObject);
        this.addEvent('mouseup', this.handleMouseUp, this._displayObject);
    }

    render() {
        this.rect(this.style);
    }

    protected changeColor(color: number) {
        this.style.color = color;
        this.update();
    }

    protected handleMouseOver = ((event: PIXI.interaction.InteractionEvent) => {
        this.changeColor(0x00C800);
    }).bind(this);

    protected handleMouseOut = ((event: PIXI.interaction.InteractionEvent) => {
        this.changeColor(0xC80000);
    }).bind(this);

    protected handleMouseDown = ((event: PIXI.interaction.InteractionEvent) => {
        this.changeColor(0x0000C8);
    }).bind(this);

    protected handleMouseUp = ((event: PIXI.interaction.InteractionEvent) => {
        this.changeColor(0x00C800);
    }).bind(this);
}