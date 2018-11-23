export type TimeGraphInteractionType = 'mouseover' | 'mouseout' | 'mousemove' | 'mousedown' | 'mouseup' | 'mouseupoutside' | 'click';
export type TimeGraphInteractionHandler = (event: PIXI.interaction.InteractionEvent) => void;

export type TimeGraphComponentOptions = {}

export interface TimeGraphElementStyle {
    color?: number
    opacity?: number
}
export interface TimeGraphElementPosition {
    x: number
    y: number
}
export interface TimeGraphHorizontalElement {
    position: TimeGraphElementPosition
    width: number
}
export interface TimeGraphVerticalElement {
    position: TimeGraphElementPosition
    height: number
}
export interface TimeGraphLineStyle extends TimeGraphElementStyle {
    thickness?: number
}
export type TimeGraphRect = TimeGraphHorizontalElement & TimeGraphVerticalElement;
export type TimeGraphStyledRect = TimeGraphRect & TimeGraphElementStyle;
export type TimeGraphHorizontalLine = TimeGraphHorizontalElement & TimeGraphLineStyle;
export type TimeGraphVerticalLine = TimeGraphVerticalElement & TimeGraphLineStyle;

export abstract class TimeGraphComponent {
    protected _displayObject: PIXI.Graphics;
    protected options: TimeGraphComponentOptions;

    constructor(protected _id: string) {
        this._displayObject = new PIXI.Graphics();
    }

    get id(): string {
        return this._id;
    }

    get displayObject(): PIXI.Graphics {
        return this._displayObject;
    }

    clear() {
        this._displayObject.clear();
    }

    update(opts?: TimeGraphComponentOptions) {
        if (opts) {
            this.options = opts;
        }
        this.clear();
        this.render();
    }

    abstract render(): void;

    protected rect(opts: TimeGraphStyledRect) {
        const { position, width, height, color, opacity } = opts;
        this.displayObject.beginFill((color || 0x000000), (opacity || 1));
        this.displayObject.drawRect(position.x, position.y, width, height);
        this.displayObject.endFill();
    }

    protected hline(opts: TimeGraphHorizontalLine) {
        const { position, width, thickness, color } = opts;
        this.displayObject.lineStyle(thickness || 1, color || 0x000000);
        this.displayObject.moveTo(position.x, position.y);
        this.displayObject.lineTo(position.x + width, position.y);
    }

    protected vline(opts: TimeGraphVerticalLine) {
        const { position, height, thickness, color } = opts;
        this.displayObject.lineStyle(thickness || 1, color || 0x000000);
        this.displayObject.moveTo(position.x, position.y);
        this.displayObject.lineTo(position.x, position.y + height);
    }

    addEvent(event: TimeGraphInteractionType, handler: TimeGraphInteractionHandler, displayObject: PIXI.DisplayObject) {
        displayObject.interactive = true;
        displayObject.on(event, (e: PIXI.interaction.InteractionEvent) => {
            if (handler) {
                handler(e);
            }
        });
    }
}