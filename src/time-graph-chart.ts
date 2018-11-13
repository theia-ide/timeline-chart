import { TimeGraphContainer, TimeGraphContainerOptions } from "./time-graph-container";
import { TimeGraphRowElement } from "./time-graph-row-element";
import { TimeGraphRow } from "./time-graph-row";
import { TimeGraphRowModel, TimeGraphRowElementModel, TimeGraphRange } from "./time-graph-model";
import { TimeGraphStateController } from "./time-graph-state-controller";

export class TimeGraphChart extends TimeGraphContainer {

    protected rows: TimeGraphRowModel[];

    constructor(canvasOpts: TimeGraphContainerOptions, protected range: TimeGraphRange, controller: TimeGraphStateController) {
        super({
            id: canvasOpts.id,
            height: canvasOpts.height,
            width: canvasOpts.width,
            backgroundColor: 0xFFFFFF
        }, controller);
        this.rows = [];
    }

    addRow(row: TimeGraphRowModel) {
        const height = 20;
        const rowId = 'row_' + this._stage.children.length;
        const rowComponent = new TimeGraphRow(rowId, {
            position: {
                x: 0, // TODO must be calculated by zoom and pan
                y: (height * this.rows.length) + height / 2
            },
            width: this.range.end
        });
        this.addChild(rowComponent);
        this.rows.push(row);

        row.states.forEach((rowElement: TimeGraphRowElementModel, idx: number) => {
            const newRowElement: TimeGraphRowElementModel = {
                label: rowElement.label,
                range: {
                    start: (rowElement.range.start * this._controller.zoomFactor) + this._controller.positionOffset.x,
                    end: (rowElement.range.end * this._controller.zoomFactor) + this._controller.positionOffset.x
                }
            }
            const el = new TimeGraphRowElement(rowId + '_el_' + idx, newRowElement, rowComponent);
            this.addChild(el);
        });
    }

    addRows(rows: TimeGraphRowModel[]) {
        this.rows = [];
        rows.forEach(row => {
            this.addRow(row);
        })
    }

    update() {
        this.stage.removeChildren();
        this.addRows(this.rows);
    }

}