import { TimeGraphRowElement } from "../components/time-graph-row-element";
import { TimeGraphRow } from "../components/time-graph-row";
import { TimeGraphRowModel, TimeGraphRowElementModel } from "../time-graph-model";
import { TimeGraphLayer } from "./time-graph-layer";

export class TimeGraphChart extends TimeGraphLayer {

    protected rows: TimeGraphRowModel[];
    protected rowCount: number;

    protected init(){
        this.rowCount = 0;
        this.unitController.onViewRangeChanged(() => {
            this.update();
        });
    }

    addRow(row: TimeGraphRowModel) {
        const height = 20;
        const rowId = 'row_' + this.rowCount;
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
            const relativeElementEndPosition = rowElement.range.end - this.unitController.viewRange.start;
            const start = (relativeElementStartPosition * this.stateController.zoomFactor) + this.stateController.positionOffset.x;
            const end = (relativeElementEndPosition * this.stateController.zoomFactor) + this.stateController.positionOffset.x;
            if (start < this.canvas.width && end > 0) {
                const newRowElement: TimeGraphRowElementModel = {
                    label: rowElement.label,
                    range: {
                        start,
                        end
                    }
                }
                const el = new TimeGraphRowElement(rowId + '_el_' + idx, newRowElement, rowComponent);
                this.addChild(el);
            }
        });
    }

    addRows(rows: TimeGraphRowModel[]) {
        if(!this.stateController){
            throw('Add this TimeGraphChart to a container before adding rows.');
        }
        this.rows = [];
        this.rowCount = 0;
        rows.forEach(row => {
            this.rowCount++;
            this.addRow(row);
        })
    }

    update() {
        this.removeChildren();
        this.addRows(this.rows);
    }

}