import { TimeGraphRowElement } from "./time-graph-row-element";
import { TimeGraphRow } from "./time-graph-row";
import { TimeGraphRowModel, TimeGraphRowElementModel } from "./time-graph-model";
import { TimeGraphCursorContainer } from "./time-graph-cursor-container";
import { TimeGraphRectangle } from "./time-graph-rectangle";

export class TimeGraphChart extends TimeGraphCursorContainer {

    protected rows: TimeGraphRowModel[];

    protected init(){
        super.init();
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
            const relativeElementEndPosition = rowElement.range.end - this.unitController.viewRange.start;
            const start = (relativeElementStartPosition * this.stateController.zoomFactor) + this.stateController.positionOffset.x;
            const end = (relativeElementEndPosition * this.stateController.zoomFactor) + this.stateController.positionOffset.x;
            if (start < this._canvas.width && end > 0) {
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
        const background = new TimeGraphRectangle({
            position: {x: 0, y:0},
            height: this._canvas.height,
            width: this.canvas.width,
            color: 0xffffff
        });
        this.addChild(background);
        this.rows = [];
        rows.forEach(row => {
            this.addRow(row);
        })
    }

    update() {
        this.stage.removeChildren();
        this.addRows(this.rows);
        super.update();
    }

}