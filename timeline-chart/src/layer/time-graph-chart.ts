import * as PIXI from "pixi.js-legacy"

import { TimeGraphRowElement, TimeGraphRowElementStyle } from "../components/time-graph-row-element";
import { TimeGraphRow, TimeGraphRowStyle } from "../components/time-graph-row";
import { TimelineChart } from "../time-graph-model";
import { TimeGraphComponent, TimeGraphRect, TimeGraphStyledRect } from "../components/time-graph-component";
import { TimeGraphChartLayer } from "./time-graph-chart-layer";
import { TimeGraphRowController } from "../time-graph-row-controller";
import { TimeGraphAnnotationComponent, TimeGraphAnnotationComponentOptions, TimeGraphAnnotationStyle } from "../components/time-graph-annotation";
import { TimeGraphRectangle } from "../components/time-graph-rectangle";

export interface TimeGraphRowElementMouseInteractions {
    click?: (el: TimeGraphRowElement, ev: PIXI.InteractionEvent) => void
    mouseover?: (el: TimeGraphRowElement, ev: PIXI.InteractionEvent) => void
    mouseout?: (el: TimeGraphRowElement, ev: PIXI.InteractionEvent) => void
    mousedown?: (el: TimeGraphRowElement, ev: PIXI.InteractionEvent) => void
    mouseup?: (el: TimeGraphRowElement, ev: PIXI.InteractionEvent) => void
}

export interface TimeGraphChartProviders {
    dataProvider: (range: TimelineChart.TimeGraphRange, resolution: number) => Promise<{ rows: TimelineChart.TimeGraphRowModel[], range: TimelineChart.TimeGraphRange, resolution: number }> | { rows: TimelineChart.TimeGraphRowModel[], range: TimelineChart.TimeGraphRange, resolution: number } | undefined
    rowElementStyleProvider?: (el: TimelineChart.TimeGraphState) => TimeGraphRowElementStyle | undefined
    rowAnnotationStyleProvider?: (el: TimelineChart.TimeGraphAnnotation) => TimeGraphAnnotationStyle | undefined
    rowStyleProvider?: (row: TimelineChart.TimeGraphRowModel) => TimeGraphRowStyle | undefined
}

export const keyBoardNavs: Record<string, Array<string>> = {
    "zoomin": ['w', 'i'],
    "zoomout": ['s', 'k'],
    "panleft": ['a', 'j'],
    "panright": ['d', 'l']
}

export type TimeGraphRowStyleHook = (row: TimelineChart.TimeGraphRowModel) => TimeGraphRowStyle | undefined;

export class TimeGraphChart extends TimeGraphChartLayer {

    protected rows: TimelineChart.TimeGraphRowModel[];
    protected rowComponents: Map<TimelineChart.TimeGraphRowModel, TimeGraphRow>;
    protected rowStateComponents: Map<TimelineChart.TimeGraphState, TimeGraphRowElement>;
    protected rowAnnotationComponents: Map<TimelineChart.TimeGraphAnnotation, TimeGraphAnnotationComponent>;
    protected rowElementMouseInteractions: TimeGraphRowElementMouseInteractions;
    protected selectedElementModel: TimelineChart.TimeGraphState;
    protected selectedElementChangedHandler: ((el: TimelineChart.TimeGraphState) => void)[] = [];
    protected providedRange: TimelineChart.TimeGraphRange;
    protected providedResolution: number;
    protected visibleEntries: number[] = [];

    protected fetching: boolean;

    protected isNavigating: boolean;

    protected mousePanning: boolean = false;
    protected mouseZooming: boolean = false;
    protected mouseButtons: number = 0;
    protected mouseDownButton: number;
    protected mouseStartX: number;
    protected mouseEndX: number;
    protected mouseZoomingStart: number;
    protected zoomingSelection?: TimeGraphRectangle;

    constructor(id: string,
        protected providers: TimeGraphChartProviders,
        protected rowController: TimeGraphRowController) {
        super(id, rowController);
        this.providedRange = { start: 0, end: 0 };
        this.providedResolution = 1;
        this.isNavigating = false;
    }

    protected afterAddToContainer() {
        this.stage.cursor = 'default';
        let mousePositionX = 1;
        const horizontalDelta = 3;
        let triggerKeyEvent = false;

        const moveHorizontally = (magnitude: number) => {
            const xOffset = -(magnitude / this.stateController.zoomFactor);
            let start = Math.max(0, this.unitController.viewRange.start - xOffset);
            let end = start + this.unitController.viewRangeLength;
            if (end > this.unitController.absoluteRange) {
                end = this.unitController.absoluteRange;
                start = end - this.unitController.viewRangeLength;
            }
            this.unitController.viewRange = {
                start,
                end
            }
        }

        const moveVertically = (magnitude: number) => {
            if (this.rowController.totalHeight <= this.stateController.canvasDisplayHeight) {
                return;
            }
            let verticalOffset = Math.max(0, this.rowController.verticalOffset + magnitude);
            if (this.rowController.totalHeight - verticalOffset <= this.stateController.canvasDisplayHeight) {
                verticalOffset = this.rowController.totalHeight - this.stateController.canvasDisplayHeight;
            }
            this.rowController.verticalOffset = verticalOffset;
            this.visibleEntries = [];
            this.updateChart();
        }

        const adjustZoom = (zoomPosition: number, zoomIn: boolean) => {
            const newViewRangeLength = Math.max(1, Math.min(this.unitController.absoluteRange,
                this.unitController.viewRangeLength * (zoomIn ? 0.8 : 1.25)));
            const center = this.unitController.viewRange.start + zoomPosition;
            const start = Math.max(0, Math.min(this.unitController.absoluteRange - newViewRangeLength,
                center - zoomPosition * newViewRangeLength / this.unitController.viewRangeLength));
            const end = start + newViewRangeLength;
            if (Math.trunc(start) !== Math.trunc(end)) {
                this.unitController.viewRange = {
                    start,
                    end
                }
            }
        };

        const mouseMoveHandler = (event: MouseEvent) => {
            mousePositionX = event.offsetX;
        };

        const keyDownHandler = (event: KeyboardEvent) => {
            const keyPressed = event.key;
            if (triggerKeyEvent) {
                if (keyPressed === 'Control' && this.mouseButtons === 0 && !event.shiftKey && !event.altKey) {
                    this.stage.cursor = 'grabbing';
                } else if (this.stage.cursor === 'grabbing' && !this.mousePanning &&
                    (keyPressed === 'Shift' || keyPressed === 'Alt')) {
                    this.stage.cursor = 'default';
                }
                if (keyBoardNavs['zoomin'].indexOf(keyPressed) >= 0) {
                    const zoomPosition = (mousePositionX / this.stateController.zoomFactor);
                    adjustZoom(zoomPosition, true);

                } else if (keyBoardNavs['zoomout'].indexOf(keyPressed) >= 0) {
                    const zoomPosition = (mousePositionX / this.stateController.zoomFactor);
                    adjustZoom(zoomPosition, false);

                } else if (keyBoardNavs['panleft'].indexOf(keyPressed) >= 0) {
                    moveHorizontally(-horizontalDelta);

                } else if (keyBoardNavs['panright'].indexOf(keyPressed) >= 0) {
                    moveHorizontally(horizontalDelta);
                }
                event.preventDefault();
            }
        };
        const keyUpHandler = (event: KeyboardEvent) => {
            const keyPressed = event.key;
            if (triggerKeyEvent) {
                if (this.stage.cursor === 'grabbing' && !this.mousePanning && keyPressed === 'Control' ) {
                    this.stage.cursor = 'default';
                }
            }
        };

        this.stage.addListener('mouseover', (event: MouseEvent) => {
            triggerKeyEvent = true;
        });

        this.stage.addListener('mouseout', (event: MouseEvent) => {
            triggerKeyEvent = false;
            if (this.stage.cursor === 'grabbing' && !this.mousePanning) {
                this.stage.cursor = 'default';
            }
        });

        this.stage.on('mousedown', (event: PIXI.InteractionEvent) => {
            this.mouseButtons = event.data.buttons;
            // if only middle button or only Ctrl+left button is pressed
            if ((event.data.button !== 1 || event.data.buttons !== 4) &&
                (event.data.button !== 0 || event.data.buttons !== 1 ||
                    !event.data.originalEvent.ctrlKey ||
                    event.data.originalEvent.shiftKey ||
                    event.data.originalEvent.altKey ||
                    this.stage.cursor !== 'grabbing')) {
                return;
            }
            this.mousePanning = true;
            this.mouseDownButton = event.data.button;
            this.mouseStartX = event.data.global.x;
            this.stage.cursor = 'grabbing';
        });
        this.stage.on('mousemove', (event: PIXI.InteractionEvent) => {
            this.mouseButtons = event.data.buttons;
            if (this.mousePanning) {
                if ((this.mouseDownButton == 1 && (this.mouseButtons & 4) === 0) ||
                    (this.mouseDownButton == 0 && (this.mouseButtons & 1) === 0)) {
                    // handle missed button mouseup event
                    this.mousePanning = false;
                    const orig = event.data.originalEvent;
                    if (!orig.ctrlKey || orig.shiftKey || orig.altKey) {
                        this.stage.cursor = 'default';
                    }
                    return;
                }
                const horizontalDelta = this.mouseStartX - event.data.global.x;
                moveHorizontally(horizontalDelta);
                this.mouseStartX = event.data.global.x;
            }
            if (this.mouseZooming) {
                this.mouseEndX = event.data.global.x;
                this.updateZoomingSelection();
            }
        });
        const mouseUpHandler = (event: PIXI.InteractionEvent) => {
            this.mouseButtons = event.data.buttons;
            if (event.data.button === this.mouseDownButton && this.mousePanning) {
                this.mousePanning = false;
                const orig = event.data.originalEvent;
                if (!orig.ctrlKey || orig.shiftKey || orig.altKey) {
                    this.stage.cursor = 'default';
                }
            }
        };
        this.stage.on('mouseup', mouseUpHandler);
        this.stage.on('mouseupoutside', mouseUpHandler);

        const mouseWheelHandler = (ev: WheelEvent) => {
            if (ev.ctrlKey) {
                const zoomPosition = (ev.offsetX / this.stateController.zoomFactor);
                const zoomIn = ev.deltaY < 0;
                adjustZoom(zoomPosition, zoomIn);

            } else if (ev.shiftKey) {
                moveHorizontally(ev.deltaY);
            } else {
                if (Math.abs(ev.deltaY) > Math.abs(ev.deltaX)) {
                    moveVertically(ev.deltaY);
                } else {
                    moveHorizontally(ev.deltaX);
                }
            }
            ev.preventDefault();
        };

        this.onCanvasEvent('mousemove', mouseMoveHandler);
        this.onCanvasEvent('keydown', keyDownHandler);
        this.onCanvasEvent('keyup', keyUpHandler);
        this.onCanvasEvent('mousewheel', mouseWheelHandler);
        this.onCanvasEvent('wheel', mouseWheelHandler);
        this.onCanvasEvent('contextmenu', (e: MouseEvent) => {
            e.preventDefault();
        });
        const mouseDownListener = (e: MouseEvent) => {
            this.mouseButtons = e.buttons;
            // if only right button is pressed
            if (e.button === 2 && e.buttons === 2 && this.stage.cursor === 'default') {
                this.mouseZooming = true;
                this.mouseDownButton = e.button;
                this.mouseStartX = e.offsetX;
                this.mouseEndX = e.offsetX;
                this.mouseZoomingStart = this.unitController.viewRange.start + (this.mouseStartX / this.stateController.zoomFactor);
                this.stage.cursor = 'col-resize';
                // this is the only way to detect mouseup outside of right button
                document.addEventListener('mouseup', mouseUpListener);
                this.updateZoomingSelection();
            }
        };
        const mouseUpListener = (e: MouseEvent) => {
            this.mouseButtons = e.buttons;
            if (e.button === this.mouseDownButton && this.mouseZooming) {
                this.mouseZooming = false;
                this.mouseEndX = e.offsetX;
                const start = this.mouseZoomingStart;
                const end = this.unitController.viewRange.start + (this.mouseEndX / this.stateController.zoomFactor);
                if (start !== end) {
                    this.unitController.viewRange = {
                        start: Math.max(Math.min(start, end), this.unitController.viewRange.start),
                        end: Math.min(Math.max(start, end), this.unitController.viewRange.end)
                    }
                }
                this.stage.cursor = 'default';
                document.removeEventListener('mouseup', mouseUpListener);
                this.updateZoomingSelection();
            }
        };
        this.onCanvasEvent('mousedown', mouseDownListener);

        this.rowController.onVerticalOffsetChangedHandler(verticalOffset => {
            this.layer.position.y = -verticalOffset;
            this.visibleEntries = [];
        });

        this.unitController.onViewRangeChanged(() => {
            this.updateScaleAndPosition();
            if (!this.fetching && this.unitController.viewRangeLength !== 0) {
                this.maybeFetchNewData();
            }
            if (this.mouseZooming) {
                this.updateZoomingSelection();
            }
        });
        if (this.unitController.viewRangeLength && this.stateController.canvasDisplayWidth) {
            this.maybeFetchNewData();
        }
    }

    updateChart() {
        const update = true;
        if (this.unitController && this.stateController) {
            this.maybeFetchNewData(update);
        }
    }

    update() {
        this.updateScaleAndPosition();
    }

    updateZoomingSelection() {
        if (this.zoomingSelection) {
            this.removeChild(this.zoomingSelection);
            delete this.zoomingSelection;
        }
        if (this.mouseZooming) {
            const mouseStartX = (this.mouseZoomingStart - this.unitController.viewRange.start) * this.stateController.zoomFactor;
            this.zoomingSelection = new TimeGraphRectangle({
                color: 0xbbbbbb,
                opacity: 0.2,
                position: {
                    x: mouseStartX,
                    y: 0
                },
                height: this.layer.height,
                width: this.mouseEndX - mouseStartX
            });
            this.addChild(this.zoomingSelection);
        }
    }

    protected async maybeFetchNewData(update?: boolean) {
        const resolution = this.unitController.viewRangeLength / this.stateController.canvasDisplayWidth;
        const viewRange = this.unitController.viewRange;
        if (viewRange && (
            viewRange.start < this.providedRange.start ||
            viewRange.end > this.providedRange.end ||
            resolution < this.providedResolution ||
            update
        )) {
            this.fetching = true;
            try {
                const rowData = await this.providers.dataProvider(viewRange, resolution);
                if (rowData) {
                    this.providedResolution = rowData.resolution;
                    this.providedRange = rowData.range;
                    this.setRowModel(rowData.rows);
                    this.removeChildren();
                    this.addRows(this.rows, this.rowController.rowHeight);
                    if (this.isNavigating) {
                        this.selectStateInNavigation();
                    }
                    if (this.mouseZooming) {
                        this.updateZoomingSelection();
                    }
                }
            } finally {
                this.fetching = false;
                this.isNavigating = false;
            }
        }
    }

    public getVisibleEntries(): number[] {
        if (this.visibleEntries.length == 0) {
            this.updateScaleAndPosition();
        }
        return this.visibleEntries;
    }

    protected updateScaleAndPosition() {
        if (this.rows) {
            const top = 0;
            const bottom = this.stateController.canvasDisplayHeight;
            this.visibleEntries = [];
            this.rows.forEach((row: TimelineChart.TimeGraphRowModel) => {
                const comp = this.rowComponents.get(row);
                if (comp) {
                    const opts: TimeGraphRect = {
                        height: this.rowController.rowHeight,
                        position: {
                            x: 0,
                            y: comp.position.y - this.rowController.verticalOffset
                        },
                        width: this.stateController.canvasDisplayWidth
                    }
                    comp.update(opts);
                    const cTop = comp.position.y;
                    const cBottom = comp.height + cTop;
                    if (cTop <= bottom && top <= cBottom) {
                        this.visibleEntries.push(comp.model.id);
                    }
                }
                row.states.forEach((state: TimelineChart.TimeGraphState, elementIndex: number) => {
                    const el = this.rowStateComponents.get(state);
                    if (el) {
                        const start = state.range.start;
                        const end = state.range.end;
                        const opts: TimeGraphStyledRect = {
                            height: el.height,
                            position: {
                                x: this.getPixels(start - this.unitController.viewRange.start),
                                y: el.position.y
                            },
                            // min width of a state should never be less than 1 (for visibility)
                            width: Math.max(1, this.getPixels(end) - this.getPixels(start)),
                            displayWidth: this.getPixels(Math.min(this.unitController.viewRange.end, end)) - this.getPixels(Math.max(this.unitController.viewRange.start, start))
                        }
                        el.update(opts);
                    }
                });
                row.annotations.forEach((annotation: TimelineChart.TimeGraphAnnotation, elementIndex: number) => {
                    const el = this.rowAnnotationComponents.get(annotation);
                    if (el) {
                        // only handle ticks for now
                        const start = annotation.range.start;
                        const opts: TimeGraphAnnotationComponentOptions = {
                            position: {
                                x: this.getPixels(start - this.unitController.viewRange.start),
                                y: el.displayObject.y
                            }
                        }
                        el.update(opts);
                    }
                });
            });
        }
    }

    protected handleSelectedRowElementChange() {
        this.selectedElementChangedHandler.forEach(handler => handler(this.selectedElementModel));
    }

    protected addRow(row: TimelineChart.TimeGraphRowModel, height: number, rowIndex: number) {
        const rowId = 'row_' + rowIndex;
        const rowStyle = this.providers.rowStyleProvider ? this.providers.rowStyleProvider(row) : undefined;
        const rowComponent = new TimeGraphRow(rowId, {
            position: {
                x: 0,
                y: (height * rowIndex)
            },
            width: this.stateController.canvasDisplayWidth,
            height
        }, rowIndex, row, rowStyle);
        rowComponent.displayObject.interactive = true;
        rowComponent.displayObject.on('click', ((e: PIXI.InteractionEvent) => {
            this.selectRow(row);
        }).bind(this));
        this.addChild(rowComponent);
        this.rowComponents.set(row, rowComponent);
        if (this.rowController.selectedRow && this.rowController.selectedRow.id === row.id) {
            this.selectRow(row);
        }
        row.states.forEach((rowElementModel: TimelineChart.TimeGraphState) => {
            const el = this.createNewRowElement(rowElementModel, rowComponent);
            if (el) {
                this.addElementInteractions(el);
                this.addChild(el);
                if (this.selectedElementModel && this.rowController.selectedRow
                    && this.rowController.selectedRow.id === row.id
                    && this.selectedElementModel.range.start === el.model.range.start
                    && this.selectedElementModel.range.end === el.model.range.end) {
                    this.selectRowElement(el.model);
                }
            }
        });
        row.annotations.forEach((annotation: TimelineChart.TimeGraphAnnotation) => {
            const el = this.createNewAnnotation(annotation, rowComponent);
            if (el) {
                this.addChild(el);
            }
        });
    }

    protected createNewAnnotation(annotation: TimelineChart.TimeGraphAnnotation, rowComponent: TimeGraphRow) {
        const start = this.getPixels(annotation.range.start - this.unitController.viewRange.start);
        let el: TimeGraphAnnotationComponent | undefined;
        const elementStyle = this.providers.rowAnnotationStyleProvider ? this.providers.rowAnnotationStyleProvider(annotation) : undefined;
        el = new TimeGraphAnnotationComponent(annotation.id, { position: { x: start, y: rowComponent.position.y + (rowComponent.height * 0.5) } }, elementStyle, rowComponent);
        this.rowAnnotationComponents.set(annotation, el);
        return el;
    }

    protected createNewRowElement(rowElementModel: TimelineChart.TimeGraphState, rowComponent: TimeGraphRow): TimeGraphRowElement | undefined {
        const start = this.getPixels(rowElementModel.range.start - this.unitController.viewRange.start);
        const end = this.getPixels(rowElementModel.range.end - this.unitController.viewRange.start);
        let el: TimeGraphRowElement | undefined;
        const range: TimelineChart.TimeGraphRange = {
            start,
            end
        };
        const displayStart = this.getPixels(Math.max(rowElementModel.range.start, this.unitController.viewRange.start));
        const displayEnd = this.getPixels(Math.min(rowElementModel.range.end, this.unitController.viewRange.end));
        const displayWidth = displayEnd - displayStart;
        const elementStyle = this.providers.rowElementStyleProvider ? this.providers.rowElementStyleProvider(rowElementModel) : undefined;
        el = new TimeGraphRowElement(rowElementModel.id, rowElementModel, range, rowComponent, elementStyle, displayWidth);
        this.rowStateComponents.set(rowElementModel, el);
        return el;
    }

    protected addElementInteractions(el: TimeGraphRowElement) {
        el.displayObject.interactive = true;
        el.displayObject.on('click', ((e: PIXI.InteractionEvent) => {
            if (!this.mousePanning && !this.mouseZooming) {
                this.selectRowElement(el.model);
            }
            if (this.rowElementMouseInteractions && this.rowElementMouseInteractions.click) {
                this.rowElementMouseInteractions.click(el, e);
            }
        }).bind(this));
        el.displayObject.on('mouseover', ((e: PIXI.InteractionEvent) => {
            if (this.rowElementMouseInteractions && this.rowElementMouseInteractions.mouseover) {
                this.rowElementMouseInteractions.mouseover(el, e);
            }
        }).bind(this));
        el.displayObject.on('mouseout', ((e: PIXI.InteractionEvent) => {
            if (this.rowElementMouseInteractions && this.rowElementMouseInteractions.mouseout) {
                this.rowElementMouseInteractions.mouseout(el, e);
            }
        }).bind(this));
        el.displayObject.on('mousedown', ((e: PIXI.InteractionEvent) => {
            if (this.rowElementMouseInteractions && this.rowElementMouseInteractions.mousedown) {
                this.rowElementMouseInteractions.mousedown(el, e);
            }
        }).bind(this));
        el.displayObject.on('mouseup', ((e: PIXI.InteractionEvent) => {
            if (this.rowElementMouseInteractions && this.rowElementMouseInteractions.mouseup) {
                this.rowElementMouseInteractions.mouseup(el, e);
            }
        }).bind(this));
    }

    protected addRows(rows: TimelineChart.TimeGraphRowModel[], height: number) {
        if (!this.stateController) {
            throw ('Add this TimeGraphChart to a container before adding rows.');
        }
        this.rowComponents = new Map();
        this.rowStateComponents = new Map();
        this.rowAnnotationComponents = new Map();
        this.rowController.rowHeight = height;
        rows.forEach((row: TimelineChart.TimeGraphRowModel, index: number) => {
            this.addRow(row, height, index);
        });
    }

    protected setRowModel(rows: TimelineChart.TimeGraphRowModel[]) {
        this.rows = rows;
    }

    protected updateElementStyle(model: TimelineChart.TimeGraphState) {
        const style = this.providers.rowElementStyleProvider && this.providers.rowElementStyleProvider(model);
        const component = this.rowStateComponents.get(model);
        component && style && (component.style = style);
    }

    protected updateRowStyle(model: TimelineChart.TimeGraphRowModel) {
        const style = this.providers.rowStyleProvider && this.providers.rowStyleProvider(model);
        const component = this.rowComponents.get(model);
        component && style && (component.style = style);
    }

    registerRowElementMouseInteractions(interactions: TimeGraphRowElementMouseInteractions) {
        this.rowElementMouseInteractions = interactions;
    }

    onSelectedRowElementChanged(handler: (el: TimelineChart.TimeGraphState | undefined) => void) {
        this.selectedElementChangedHandler.push(handler);
    }

    getRowModels(): TimelineChart.TimeGraphRowModel[] {
        return this.rows;
    }

    getElementById(id: string): TimeGraphRowElement | undefined {
        const element: TimeGraphComponent | undefined = this.children.find((child) => {
            return child.id === id;
        });
        return element as TimeGraphRowElement;
    }

    selectRow(row: TimelineChart.TimeGraphRowModel) {
        if (this.rowController.selectedRow) {
            delete this.rowController.selectedRow.selected;
            this.updateRowStyle(this.rowController.selectedRow);
        }
        this.rowController.selectedRow = row;
        row.selected = true;
        this.updateRowStyle(row);
    }

    getSelectedRowElement(): TimelineChart.TimeGraphState {
        return this.selectedElementModel;
    }

    selectRowElement(model: TimelineChart.TimeGraphState | undefined) {
        if (this.selectedElementModel) {
            delete this.selectedElementModel.selected;
            this.updateElementStyle(this.selectedElementModel);
        }
        if (model) {
            const el = this.getElementById(model.id);
            if (el) {
                const row = el.row;
                if (row) {
                    this.selectedElementModel = el.model;
                    el.model.selected = true;
                    this.updateElementStyle(this.selectedElementModel);
                    this.selectRow(row.model);
                }
            }
        }
        this.handleSelectedRowElementChange();
    }

    setNavigationFlag(flag: boolean) {
        this.isNavigating = flag;
    }

    protected selectStateInNavigation() {
        const row = this.rowController.selectedRow;
        if (row && this.unitController.selectionRange) {
            const cursorPosition = this.unitController.selectionRange.end;
            const rowElement = row.states.find((rowElementModel: TimelineChart.TimeGraphState) => rowElementModel.range.start === cursorPosition || rowElementModel.range.end === cursorPosition);
            this.selectRowElement(rowElement);
        }
        this.setNavigationFlag(false);
    }
}
