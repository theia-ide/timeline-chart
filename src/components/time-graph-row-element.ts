import { TimeGraphComponent, TimeGraphStyledRect } from "./time-graph-component";
import { TimeGraphRow } from "./time-graph-row";
import { TimeGraphRowElementModel } from "../time-graph-model";

export class TimeGraphRowElement extends TimeGraphComponent {

    protected _style: TimeGraphStyledRect;

    constructor(
        id: string,
        protected _options: TimeGraphRowElementModel,
        protected _row: TimeGraphRow,
        style: { color?: number, height?: number } = { color: 0xfffa66, height: 14 }
    ) {
        super(id);
        const height = style.height || 14;
        const position = {
            x: this._options.range.start,
            y: this._row.position.y - (height / 2)
        };
        const width = this._options.range.end - this._options.range.start;
        this._style = {
            color: style.color,
            height,
            position,
            width
        };
    }

    get model(): TimeGraphRowElementModel {
        return this._options;
    }

    get row(): TimeGraphRow {
        return this._row;
    }

    set style(style: { color?: number, height?: number }) {
        if (style.color) {
            this._style.color = style.color;
        }
        if (style.height) {
            this._style.height = style.height;
        }
        this.update();
    }

    render() {
        this.rect(this._style);
    }
}