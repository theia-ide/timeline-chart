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
            if (this.needsMoreData()) {
                const rowData = this.pullHook(this.unitController.viewRange, this.stateController.zoomFactor);
                this.setRowModel(rowData.rows);
            }
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
            this.handleVerticalPositionChange();
            return false;
        });
        this.throttledUpdate = _.throttle(() => {
            if (this.rows && this.rowHeight) {
                this.removeChildren();
                this.addRows(this.rows, this.rowHeight);
            }
        }, 40);
    }

    /**
     * whether the data model needs to be updated
     */
    protected needsMoreData(): boolean {
        return this.rows === undefined;
    }

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
        const range = row.range.end - row.range.start;
        const relativeStartPosition = row.range.start - this.unitController.viewRange.start;
        const rowStyle = this.rowStyleHook ? this.rowStyleHook(row) : undefined;
        const rowComponent = new TimeGraphRow(rowId, {
            position: {
                x: relativeStartPosition * this.stateController.zoomFactor,
                y: (height * rowIndex) - this.stateController.positionOffset.y
            },
            width: range * this.stateController.zoomFactor,
            height
        }, rowIndex, row, rowStyle);
        rowComponent.displayObject.interactive = true;
        rowComponent.displayObject.on('click', ((e: PIXI.interaction.InteractionEvent) => {
            this.selectRow(row);
        }).bind(this));
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

    protected update() {
        this.throttledUpdate();
    }

    registerPullHook(pullHook: (range: TimeGraphRange, resolution: number) => {rows: TimeGraphRowModel[], range: TimeGraphRange}){
        this.pullHook = pullHook;
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
        this.update();
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
        this.update();
    }

    setRowModel(rows: TimeGraphRowModel[]) {
        this.rows = rows;
        this.update();
    }

    setVerticalPositionOffset(ypos: number) {
        this.stateController.positionOffset.y = ypos;
        this.update();
    }
}