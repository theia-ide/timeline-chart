import { TimeGraphContainer, TimeGraphContainerOptions } from "./time-graph-container";
import { TimeGraphRowElement } from "./time-graph-row-element";
import { TimeGraphRow } from "./time-graph-row";
import { TimeGraphRowModel, TimeGraphRowElementModel } from "./time-graph-model";
import { TimeGraphUnitController } from "./time-graph-unit-controller";

export class TimeGraphChart extends TimeGraphContainer {

    protected rows: TimeGraphRowModel[];

    constructor(canvasOpts: TimeGraphContainerOptions, unitController: TimeGraphUnitController) {
        super({
            id: canvasOpts.id,
            height: canvasOpts.height,
            width: canvasOpts.width,
            backgroundColor: 0xFFFFFF
        }, unitController);
        this.rows = [];

        this.unitController.onViewRangeChanged(() => {
            this.update();
        });
    }

    addRow(row: TimeGraphRowModel) {
        const height = 20;
        const rowId = 'row_' + this._stage.children.length;
        const range = row.range.end - row.range.start;
        const relativeStartPosition = row.range.start - this.unitController.viewRange.start;
        const rowComponent = new TimeGraphRow(rowId, {
            position: {
                x: relativeStartPosition * this.stateController.zoomFactor,
                y: (height * this.rows.length) + height / 2
            },
            width: range * this.stateController.zoomFactor
        });
        this.addChild(rowComponent);
        this.rows.push(row);

        row.states.forEach((rowElement: TimeGraphRowElementModel, idx: number) => {
            const relativeElementStartPosition = rowElement.range.start - this.unitController.viewRange.start;
            const relativeElementEndPosition = rowElement.range.end - this.unitController.viewRange.start
            const newRowElement: TimeGraphRowElementModel = {
                label: rowElement.label,
                range: {
                    start: (relativeElementStartPosition * this.stateController.zoomFactor) + this.stateController.positionOffset.x,
                    end: (relativeElementEndPosition * this.stateController.zoomFactor) + this.stateController.positionOffset.x
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