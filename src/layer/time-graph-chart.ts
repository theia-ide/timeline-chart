import { TimeGraphRowElement, TimeGraphRowElementStyle } from "../components/time-graph-row-element";
import { TimeGraphRow, TimeGraphRowStyle } from "../components/time-graph-row";
import { TimeGraphRowModel, TimeGraphRowElementModel, TimeGraphRange } from "../time-graph-model";
import { TimeGraphLayer } from "./time-graph-layer";
import { TimeGraphComponent } from "../components/time-graph-component";

export interface TimeGraphRowElementMouseInteractions {
    click?: (el: TimeGraphRowElement, ev: PIXI.interaction.InteractionEvent) => void
    mouseover?: (el: TimeGraphRowElement, ev: PIXI.interaction.InteractionEvent) => void
    mouseout?: (el: TimeGraphRowElement, ev: PIXI.interaction.InteractionEvent) => void
    mousedown?: (el: TimeGraphRowElement, ev: PIXI.interaction.InteractionEvent) => void
    mouseup?: (el: TimeGraphRowElement, ev: PIXI.interaction.InteractionEvent) => void
}

export class TimeGraphChart extends TimeGraphLayer {

    protected rows: TimeGraphRowModel[];
    protected rowHeight: number;
    protected rowElementStyleHook: (el: TimeGraphRowElementModel) => TimeGraphRowElementStyle | undefined;
    protected rowStyleHook: (row: TimeGraphRowModel) => TimeGraphRowStyle | undefined;
    protected rowElementMouseInteractions: TimeGraphRowElementMouseInteractions;
    protected selectedElementModel: TimeGraphRowElementModel;
    protected selectedElementChangedHandler: ((el: TimeGraphRowElementModel) => void)[] = [];
    protected selectedRow: TimeGraphRowModel;
    protected selectedRowChangedHandler: ((el: TimeGraphRowModel) => void)[] = [];
    protected verticalOffset: number = 0;

    protected afterAddToContainer() {
        this.unitController.onViewRangeChanged(() => {
            this.update();
        });
    }

    protected handleSelectedRowElementChange() {
        this.selectedElementChangedHandler.forEach(handler => handler(this.selectedElementModel));
    }

    protected handleSelectedRowChange() {
        this.selectedRowChangedHandler.forEach(handler => handler(this.selectedRow));
    }

    protected addRow(row: TimeGraphRowModel, height: number, rowIndex: number) {
        const rowId = 'row_' + rowIndex;
        const range = row.range.end - row.range.start;
        const relativeStartPosition = row.range.start - this.unitController.viewRange.start;
        const rowStyle = this.rowStyleHook ? this.rowStyleHook(row) : undefined;
        const rowComponent = new TimeGraphRow(rowId, {
            position: {
                x: relativeStartPosition * this.stateController.zoomFactor,
                y: (height * rowIndex) - this.verticalOffset
            },
            width: range * this.stateController.zoomFactor,
            height
        }, rowIndex, row, rowStyle);
        this.addChild(rowComponent);
        row.states.forEach((rowElementModel: TimeGraphRowElementModel, elementIndex: number) => {
            const relativeElementStartPosition = rowElementModel.range.start - this.unitController.viewRange.start;
            const relativeElementEndPosition = rowElementModel.range.end - this.unitController.viewRange.start;
            const start = (relativeElementStartPosition * this.stateController.zoomFactor) + this.stateController.positionOffset.x;
            const end = (relativeElementEndPosition * this.stateController.zoomFactor) + this.stateController.positionOffset.x;
            if (start < this.stateController.canvasDisplayWidth && end > 0) {
                const range: TimeGraphRange = {
                    start,
                    end
                };
                const elementStyle = this.rowElementStyleHook ? this.rowElementStyleHook(rowElementModel) : undefined;
                const el = new TimeGraphRowElement(rowElementModel.id, rowElementModel, range, rowComponent, elementStyle);
                this.addElementInteractions(el);
                this.addChild(el);
            }
        });
    }

    protected selectRow(row: TimeGraphRowModel) {
        if (this.selectedRow) {
            this.selectedRow.selected = false;
        }
        this.selectedRow = row;
        row.selected = true;
        this.handleSelectedRowChange();
    }

    protected addElementInteractions(el: TimeGraphRowElement) {
        el.displayObject.interactive = true;
        el.displayObject.on('click', ((e: PIXI.interaction.InteractionEvent) => {
            this.selectRowElement(el.model);
            if (this.rowElementMouseInteractions && this.rowElementMouseInteractions.click) {
                this.rowElementMouseInteractions.click(el, e);
            }
        }).bind(this));
        el.displayObject.on('mouseover', ((e: PIXI.interaction.InteractionEvent) => {
            if (this.rowElementMouseInteractions && this.rowElementMouseInteractions.mouseover) {
                this.rowElementMouseInteractions.mouseover(el, e);
            }
        }).bind(this));
        el.displayObject.on('mouseout', ((e: PIXI.interaction.InteractionEvent) => {
            if (this.rowElementMouseInteractions && this.rowElementMouseInteractions.mouseout) {
                this.rowElementMouseInteractions.mouseout(el, e);
            }
        }).bind(this));
        el.displayObject.on('mousedown', ((e: PIXI.interaction.InteractionEvent) => {
            if (this.rowElementMouseInteractions && this.rowElementMouseInteractions.mousedown) {
                this.rowElementMouseInteractions.mousedown(el, e);
            }
        }).bind(this));
        el.displayObject.on('mouseup', ((e: PIXI.interaction.InteractionEvent) => {
            if (this.rowElementMouseInteractions && this.rowElementMouseInteractions.mouseup) {
                this.rowElementMouseInteractions.mouseup(el, e);
            }
        }).bind(this));
    }

    protected addRows(rows: TimeGraphRowModel[], height: number) {
        if (!this.stateController) {
            throw ('Add this TimeGraphChart to a container before adding rows.');
        }
        this.rowHeight = height;
        rows.forEach((row: TimeGraphRowModel, index: number) => {
            this.addRow(row, height, index);
        });
    }

    protected update() {
        if (this.rows && this.rowHeight) {
            this.removeChildren();
            this.addRows(this.rows, this.rowHeight);
        }
    }

    registerRowStyleHook(styleHook: (row: TimeGraphRowModel) => TimeGraphRowStyle | undefined) {
        this.rowStyleHook = styleHook;
    }

    registerRowElementStyleHook(styleHook: (el: TimeGraphRowElementModel) => TimeGraphRowElementStyle | undefined) {
        this.rowElementStyleHook = styleHook;
    }

    registerRowElementMouseInteractions(interactions: TimeGraphRowElementMouseInteractions) {
        this.rowElementMouseInteractions = interactions;
    }

    onSelectedRowElementChanged(handler: (el: TimeGraphRowElementModel) => void) {
        this.selectedElementChangedHandler.push(handler);
    }

    onSelectedRowChanged(handler: (row: TimeGraphRowModel) => void) {
        this.selectedRowChangedHandler.push(handler);
    }

    getRowModels(): TimeGraphRowModel[] {
        return this.rows;
    }

    getElementById(id: string): TimeGraphRowElement | undefined {
        const element: TimeGraphComponent | undefined = this.children.find((child) => {
            return child.id === id;
        });
        return element as TimeGraphRowElement;
    }

    selectRowElement(model: TimeGraphRowElementModel) {
        if (this.selectedElementModel) {
            this.selectedElementModel.selected = false;
        }
        this.selectedElementModel = model;
        model.selected = true;
        const el = this.getElementById(model.id);
        if (el) {
            this.selectRow(el.row.model);
        }
        this.handleSelectedRowElementChange();
        this.update();
    }

    setRowModel(rows: TimeGraphRowModel[], rowHeight: number) {
        this.rowHeight = rowHeight;
        this.rows = rows;
        this.update();
    }

    setVerticalPositionOffset(ypos: number){
        this.verticalOffset = ypos;
        this.update();
    }
}