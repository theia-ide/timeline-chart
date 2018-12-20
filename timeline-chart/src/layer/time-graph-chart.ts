import { TimeGraphRowElement, TimeGraphRowElementStyle } from "../components/time-graph-row-element";
import { TimeGraphRow, TimeGraphRowStyle } from "../components/time-graph-row";
import { TimeGraphRowModel, TimeGraphRowElementModel, TimeGraphRange } from "../time-graph-model";
import { TimeGraphLayer } from "./time-graph-layer";
import { TimeGraphComponent } from "../components/time-graph-component";
import * as _ from "lodash";

export interface TimeGraphRowElementMouseInteractions {
    click?: (el: TimeGraphRowElement, ev: PIXI.interaction.InteractionEvent) => void
    mouseover?: (el: TimeGraphRowElement, ev: PIXI.interaction.InteractionEvent) => void
    mouseout?: (el: TimeGraphRowElement, ev: PIXI.interaction.InteractionEvent) => void
    mousedown?: (el: TimeGraphRowElement, ev: PIXI.interaction.InteractionEvent) => void
    mouseup?: (el: TimeGraphRowElement, ev: PIXI.interaction.InteractionEvent) => void
}

export type TimeGraphRowStyleHook = (row: TimeGraphRowModel) => TimeGraphRowStyle | undefined;

export class TimeGraphChart extends TimeGraphLayer {

    protected rows: TimeGraphRowModel[];
    protected rowElementStyleHook: (el: TimeGraphRowElementModel) => TimeGraphRowElementStyle | undefined;
    protected rowStyleHook: (row: TimeGraphRowModel) => TimeGraphRowStyle | undefined;
    protected rowElementMouseInteractions: TimeGraphRowElementMouseInteractions;
    protected selectedElementModel: TimeGraphRowElementModel;
    protected selectedElementChangedHandler: ((el: TimeGraphRowElementModel) => void)[] = [];
    protected selectedRow: TimeGraphRowModel;
    protected selectedRowChangedHandler: ((el: TimeGraphRowModel) => void)[] = [];
    protected verticalPositionChangedHandler: ((verticalChartPosition: number) => void)[] = [];
    protected totalHeight: number;
    protected throttledUpdate: () => void;
    protected pullHook: (range: TimeGraphRange, resolution: number) => {rows: TimeGraphRowModel[], range: TimeGraphRange};

    constructor(id: string, protected rowHeight: number) {
        super(id);
    }

    protected afterAddToContainer() {
        this.unitController.onViewRangeChanged(() => {
            this.stage.position.x = -(this.unitController.viewRange.start * this.stateController.zoomFactor);
            this.stage.scale.x = this.stateController.zoomFactor;
            this.update();
        });
        this.onCanvasEvent('mousewheel', (ev: WheelEvent) => {
            const shiftStep = ev.deltaY;
            let verticalOffset = this.stateController.positionOffset.y + shiftStep;
            if (verticalOffset < 0) {
                verticalOffset = 0;
            }
            if (this.totalHeight - verticalOffset <= this.stateController.canvasDisplayHeight) {
                verticalOffset = this.totalHeight - this.stateController.canvasDisplayHeight;
            }
            this.stateController.positionOffset.y = verticalOffset;
            this.stage.position.y = -verticalOffset;
            this.handleVerticalPositionChange();
            return false;
        });
    }

    update() {}

    protected handleVerticalPositionChange() {
        this.verticalPositionChangedHandler.forEach(handler => handler(this.stateController.positionOffset.y));
    }

    protected handleSelectedRowElementChange() {
        this.selectedElementChangedHandler.forEach(handler => handler(this.selectedElementModel));
    }

    protected handleSelectedRowChange() {
        this.selectedRowChangedHandler.forEach(handler => handler(this.selectedRow));
    }

    protected addRow(row: TimeGraphRowModel, height: number, rowIndex: number) {
        const rowId = 'row_' + rowIndex;
        const length = row.range.end - row.range.start;
        const rowStyle = this.rowStyleHook ? this.rowStyleHook(row) : undefined;
        const rowComponent = new TimeGraphRow(rowId, {
            position: {
                x: row.range.start,
                y: (height * rowIndex)
            },
            width: length,
            height
        }, rowIndex, row, rowStyle);
        rowComponent.displayObject.interactive = true;
        rowComponent.displayObject.on('click', ((e: PIXI.interaction.InteractionEvent) => {
            this.selectRow(row);
        }).bind(this));
        this.addChild(rowComponent);
        row.states.forEach((rowElementModel: TimeGraphRowElementModel, elementIndex: number) => {
            const start = rowElementModel.range.start;
            const end = rowElementModel.range.end;
            const range: TimeGraphRange = {
                start,
                end
            };
            const elementStyle = this.rowElementStyleHook ? this.rowElementStyleHook(rowElementModel) : undefined;
            const el = new TimeGraphRowElement(rowElementModel.id, rowElementModel, range, rowComponent, elementStyle);
            this.addElementInteractions(el);
            this.addChild(el);
        });
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
        this.totalHeight = rows.length * height;
        rows.forEach((row: TimeGraphRowModel, index: number) => {
            this.addRow(row, height, index);
        });
    }

    registerPullHook(pullHook: (range: TimeGraphRange, resolution: number) => {rows: TimeGraphRowModel[], range: TimeGraphRange}){
        this.pullHook = pullHook;
        // lets fetch everything
        const rowData = this.pullHook({ start:0, end: this.unitController.absoluteRange}, 1);
        this.setRowModel(rowData.rows);
        this.addRows(rowData.rows, this.rowHeight);
    }

    registerRowStyleHook(styleHook: TimeGraphRowStyleHook) {
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

    onVerticalPositionChanged(handler: (verticalChartPosition: number) => void) {
        this.verticalPositionChangedHandler.push(handler);
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

    getSelectedRow(): TimeGraphRowModel {
        return this.selectedRow;
    }

    selectRow(row: TimeGraphRowModel) {
        if (this.selectedRow) {
            this.selectedRow.selected = false;
        }
        this.selectedRow = row;
        row.selected = true;
        this.handleSelectedRowChange();
    }

    getSelectedRowElement(): TimeGraphRowElementModel {
        return this.selectedElementModel;
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
    }

    setRowModel(rows: TimeGraphRowModel[]) {
        this.rows = rows;
    }

    setVerticalPositionOffset(ypos: number) {
        this.stateController.positionOffset.y = ypos;
    }
}