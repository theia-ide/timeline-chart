import * as PIXI from "pixi.js-legacy"
import * as keyboardKey from "keyboard-key"

import { TimeGraphCursor } from "../components/time-graph-cursor";
import { TimelineChart } from "../time-graph-model";
import { TimeGraphChartLayer } from "./time-graph-chart-layer";
import { TimeGraphRowController } from "../time-graph-row-controller";
import { TimeGraphChart } from "./time-graph-chart";

export class TimeGraphChartCursors extends TimeGraphChartLayer {
    protected mouseSelecting: boolean = false;
    protected mouseButtons: number = 0;
    protected shiftKeyDown: boolean;
    protected firstCursor?: TimeGraphCursor;
    protected secondCursor?: TimeGraphCursor;
    protected color: number = 0x0000ff;
    protected zoomSelecting: boolean = false;

    constructor(id: string, protected chartLayer: TimeGraphChart, protected rowController: TimeGraphRowController, style?: { color?: number }) {
        super(id, rowController);
        if (style && style.color) {
            this.color = style.color;
        }
    }

    protected afterAddToContainer() {
        this.mouseSelecting = false;
        this.shiftKeyDown = false
        this.stage.interactive = true;

        const keyDownHandler = (event: KeyboardEvent) => {
            if (event.key === 'Shift' && this.mouseButtons === 0 && !event.ctrlKey && !event.altKey) {
                this.stage.cursor = 'crosshair';
            } else if (this.stage.cursor === 'crosshair' && !this.mouseSelecting &&
                (event.key === 'Control' || event.key === 'Alt')) {
                this.stage.cursor = 'default';
            }
            this.shiftKeyDown = event.shiftKey;
            // TODO: keyCode is deprecated. We should change these.
            if (event.keyCode === keyboardKey.ArrowLeft) {
                this.navigateOrSelectLeft();
            } else if (event.keyCode === keyboardKey.ArrowRight) {
                this.navigateOrSelectRight();
            } else if (event.keyCode === keyboardKey.ArrowUp) {
                this.navigateUp();
            } else if (event.keyCode === keyboardKey.ArrowDown) {
                this.navigateDown();
            }
        };

        const keyUpHandler = (event: KeyboardEvent) => {
            this.shiftKeyDown = event.shiftKey;
            if (this.stage.cursor === 'crosshair' && !this.mouseSelecting && event.key === 'Shift' ) {
                this.stage.cursor = 'default';
            }
        };

        this.onCanvasEvent('keydown', keyDownHandler);
        this.onCanvasEvent('keyup', keyUpHandler);

        this.stage.on('mousedown', (event: PIXI.InteractionEvent) => {
            this.mouseButtons = event.data.buttons;
            // if only left button is pressed with or without Shift key
            if (event.data.button !== 0 || event.data.buttons !== 1 ||
                event.data.originalEvent.ctrlKey || event.data.originalEvent.altKey) {
                return;
            }
            const extendSelection = event.data.originalEvent.shiftKey && this.stage.cursor === 'crosshair';
            this.mouseSelecting = true;
            this.stage.cursor = 'crosshair';
            const mouseX = event.data.global.x;
            const xpos = this.unitController.viewRange.start + (mouseX / this.stateController.zoomFactor);
            this.chartLayer.selectRowElement(undefined);
            if (extendSelection) {
                const start = this.unitController.selectionRange ? this.unitController.selectionRange.start : 0;
                this.unitController.selectionRange = {
                    start,
                    end: xpos
                }
            } else {
                this.unitController.selectionRange = {
                    start: xpos,
                    end: xpos
                }
            }
        });
        this.stage.on('mousemove', (event: PIXI.InteractionEvent) => {
            this.mouseButtons = event.data.buttons;
            if ((this.zoomSelecting || this.mouseSelecting) && this.unitController.selectionRange) {
                if ((this.mouseButtons & 1) === 0) {
                    // handle missed button mouseup event
                    this.mouseSelecting = false;
                    const orig = event.data.originalEvent;
                    if (!orig.shiftKey || orig.ctrlKey || orig.altKey) {
                        this.stage.cursor = 'default';
                    }
                    return;
                }
                const mouseX = event.data.global.x;
                const xStartPos = this.unitController.selectionRange.start;
                const xEndPos = this.unitController.viewRange.start + (mouseX / this.stateController.zoomFactor);
                this.unitController.selectionRange = {
                    start: xStartPos,
                    end: xEndPos
                }
            }
        });
        const mouseUpHandler = (event: PIXI.InteractionEvent) => {
            this.mouseButtons = event.data.buttons;
            if (this.mouseSelecting && event.data.button === 0) {
                this.mouseSelecting = false;
                const orig = event.data.originalEvent;
                if (!orig.shiftKey || orig.ctrlKey || orig.altKey) {
                    this.stage.cursor = 'default';
                }
            }
        };
        // Zoom selection
        this.stage.on('rightdown', (event: PIXI.InteractionEvent) => {
            const mouseX = event.data.global.x;
            const xpos = this.unitController.viewRange.start + (mouseX / this.stateController.zoomFactor);
            this.zoomSelecting = true;
            this.stage.cursor = 'crosshair';
            this.unitController.selectionRange = {
                start: xpos,
                end: xpos
            }
        });
        const rightUpHandler = (event: PIXI.InteractionEvent) => {
            if (this.zoomSelecting) {
                this.zoomSelecting = false;
                this.stage.cursor = 'default';
                if (this.unitController.selectionRange) {
                    const minimum = Math.min(this.unitController.selectionRange.start,
                        this.unitController.selectionRange.end);
                    const maximum = Math.max(this.unitController.selectionRange.start,
                        this.unitController.selectionRange.end);
                    this.unitController.viewRange = {
                        start: minimum,
                        end: maximum
                    }
                    this.removeCursors();
                    this.unitController.selectionRange = undefined;
                }
            }
        }
        this.stage.on('rightup', rightUpHandler);
        this.stage.on('rightupoutside', rightUpHandler);
        // Disable Context Menu to allow for right click selection
        this.onCanvasEvent('contextmenu', (e => {
            e.preventDefault();
            return false;
        }));
        this.stage.on('mouseup', mouseUpHandler);
        this.stage.on('mouseupoutside', mouseUpHandler);
        // right mouse button is not detected on stage
        this.onCanvasEvent('mousedown', (e: MouseEvent) => {
            this.mouseButtons = e.buttons;
            // if right button is pressed
            if (e.button === 2) {
                // this is the only way to detect mouseup outside of right button
                const mouseUpListener = (e: MouseEvent) => {
                    this.mouseButtons = e.buttons;
                    if (e.button === 2) {
                        document.removeEventListener('mouseup', mouseUpListener);
                    }
                }
                document.addEventListener('mouseup', mouseUpListener);
            }
        });

        this.unitController.onViewRangeChanged(() => this.update());
        this.unitController.onSelectionRangeChange(() => this.update());
        this.update();
    }

    public maybeCenterCursor() {
        if (this.unitController.selectionRange) {
            const cursorPosition = this.unitController.selectionRange.end;
            if (cursorPosition < this.unitController.viewRange.start || cursorPosition > this.unitController.viewRange.end) {
                this.centerCursor();
            }
        }
    };

    protected navigateOrSelectLeft() {
        const row = this.rowController.selectedRow;
        if (row && this.unitController.selectionRange) {
            const cursorPosition = this.unitController.selectionRange.end;
            const prevState = row.states.slice().reverse().find((rowElementModel: TimelineChart.TimeGraphState) => cursorPosition > rowElementModel.range.end ||
                (cursorPosition > rowElementModel.range.start && cursorPosition <= rowElementModel.range.end));

            if (prevState) {
                const newPos = cursorPosition > prevState.range.end ? prevState.range.end : prevState.range.start;
                this.unitController.selectionRange = { start: this.shiftKeyDown ? this.unitController.selectionRange.start : newPos, end: newPos };
                this.chartLayer.selectRowElement(prevState);
            } else {
                this.unitController.selectionRange = { start: this.shiftKeyDown ? this.unitController.selectionRange.start : row.prevPossibleState, end: row.prevPossibleState };
                this.chartLayer.setNavigationFlag(true);
            }
            this.maybeCenterCursor();
        }
    }

    protected navigateOrSelectRight() {
        const row = this.rowController.selectedRow;
        if (row && this.unitController.selectionRange) {
            const cursorPosition = this.unitController.selectionRange.end;
            const nextState = row.states.find((rowElementModel: TimelineChart.TimeGraphState) => cursorPosition < rowElementModel.range.start ||
                (cursorPosition >= rowElementModel.range.start && cursorPosition < rowElementModel.range.end));

            if (nextState) {
                const newPos = cursorPosition < nextState.range.start ? nextState.range.start : nextState.range.end;
                this.unitController.selectionRange = { start: this.shiftKeyDown ? this.unitController.selectionRange.start : newPos, end: newPos };
                this.chartLayer.selectRowElement(nextState);
            } else {
                this.unitController.selectionRange = { start: this.shiftKeyDown ? this.unitController.selectionRange.start : row.nextPossibleState, end: row.nextPossibleState };
                this.chartLayer.setNavigationFlag(true);
            }
            this.maybeCenterCursor();
        }
    }

    protected navigateDown() {
        const rows = this.chartLayer.getRowModels();
        let selectedRow = this.rowController.selectedRow;
        const idx = rows.findIndex(row => row === selectedRow);
        if (idx < rows.length) {
            this.chartLayer.selectRow(rows[idx + 1]);
        }
        selectedRow = this.rowController.selectedRow;
        const state = selectedRow.states.find(state => {
            if (this.unitController.selectionRange) {
                return state.range.start <= this.unitController.selectionRange.start && state.range.end > this.unitController.selectionRange.start;
            }
            return false;
        });
        state && this.chartLayer.selectRowElement(state);
    }

    protected navigateUp() {
        const rows = this.chartLayer.getRowModels();
        let selectedRow = this.rowController.selectedRow;
        const idx = rows.findIndex(row => row === selectedRow);
        if (idx > 0) {
            this.chartLayer.selectRow(rows[idx - 1]);
        }
        selectedRow = this.rowController.selectedRow;
        const state = selectedRow.states.find(state => {
            if (this.unitController.selectionRange) {
                return state.range.start <= this.unitController.selectionRange.start && state.range.end > this.unitController.selectionRange.start;
            }
            return false;
        })
        state && this.chartLayer.selectRowElement(state);
    }

    centerCursor() {
        if (this.unitController.selectionRange) {
            const cursorPosition = this.unitController.selectionRange.end;
            const halfViewRangeLength = this.unitController.viewRangeLength / 2;
            let startViewRange = cursorPosition - halfViewRangeLength;
            let endViewRange = cursorPosition + halfViewRangeLength;

            if (startViewRange < 0) {
                endViewRange -= startViewRange;
                startViewRange = 0;
            } else if (endViewRange > this.unitController.absoluteRange) {
                startViewRange -= (endViewRange - this.unitController.absoluteRange);
                endViewRange = this.unitController.absoluteRange;
            }

            this.unitController.viewRange = {
                start: startViewRange,
                end: endViewRange
            }
        }
    }

    removeCursors() {
        if (this.firstCursor) {
            this.firstCursor.destroy();
            this.firstCursor = undefined;
        }
        if (this.secondCursor) {
            this.secondCursor.destroy();
            this.secondCursor = undefined;
        }
    }

    update() {
        if (this.unitController.selectionRange) {
            const firstCursorPosition = this.getPixels(this.unitController.selectionRange.start - this.unitController.viewRange.start);
            const secondCursorPosition = this.getPixels(this.unitController.selectionRange.end - this.unitController.viewRange.start);
            const firstCursorOptions = {
                color: this.color,
                height: this.stateController.canvasDisplayHeight,
                position: {
                    x: firstCursorPosition,
                    y: 0
                }
            };
            if (!this.firstCursor) {
                this.firstCursor = new TimeGraphCursor(firstCursorOptions);
                this.addChild(this.firstCursor);
            } else {
                this.firstCursor.update(firstCursorOptions);
            }
            if (secondCursorPosition !== firstCursorPosition) {
                const secondCursorOptions = {
                    color: this.color,
                    height: this.stateController.canvasDisplayHeight,
                    position: {
                        x: secondCursorPosition,
                        y: 0
                    }
                };
                if (!this.secondCursor) {
                    this.secondCursor = new TimeGraphCursor(secondCursorOptions);
                    this.addChild(this.secondCursor);
                } else {
                    this.secondCursor.update(secondCursorOptions);
                }
            } else if (!!this.secondCursor) {
                this.removeChild(this.secondCursor);
                delete this.secondCursor;
            }
        } else {
            this.removeCursors();
        }
    }
}