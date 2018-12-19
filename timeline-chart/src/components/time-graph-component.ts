export type TimeGraphInteractionType = 'mouseover' | 'mouseout' | 'mousemove' | 'mousedown' | 'mouseup' | 'mouseupoutside' | 'click';
export type TimeGraphInteractionHandler = (event: PIXI.interaction.InteractionEvent) => void;

export type TimeGraphComponentOptions = {}

export interface ViewportInformation {
    x: VisibleRange;
    y: VisibleRange;
}

export interface VisibleRange {
    /*
     * the first visible logical unit
     */
    start: number;

    /*
     * the last visible logical unit
     */
    end: number;

    /*
     * how many pixel are used to represent one logical unit
     */
    pixelFactor: number;
}

export interface TimeGraphElementStyle {
    color?: number
    opacity?: number
    borderWidth?: number
    borderColor?: number
    borderRadius?: number
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
    protected viewportInformation: ViewportInformation;

    constructor(protected _id: string, displayObject?: PIXI.Graphics) {
        this._displayObject = displayObject || new PIXI.Graphics();
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

    update(viewportInformation: ViewportInformation) {
        this.viewportInformation = viewportInformation;
        this.clear();
        this.render();
    }

    abstract render(): void;

    protected rect(opts: TimeGraphStyledRect) {
        const { position, width, height, color, opacity, borderColor, borderWidth, borderRadius } = opts;
        this.displayObject.lineStyle(borderWidth || 0, borderColor || 0x000000);
        this.displayObject.beginFill((color || 0xffffff), (opacity !== undefined ? opacity : 1));
        this.displayObject.drawRoundedRect(this.toXpx(position.x) + 0.5, this.toYpx(position.y) + 0.5, this.toWidthPx(width), this.toHeightPx(height), borderRadius || 0);
        this.displayObject.endFill();
    }

    protected hline(opts: TimeGraphHorizontalLine) {
        const { position, width, thickness, color, opacity } = opts;
        this.displayObject.lineStyle(thickness || 1, color || 0x000000, (opacity !== undefined ? opacity : 1));
        this.displayObject.moveTo(this.toXpx(position.x), this.toYpx(position.y) + 0.5);
        this.displayObject.lineTo(this.toXpx(position.x + width), this.toYpx(position.y) + 0.5);
    }

    protected vline(opts: TimeGraphVerticalLine) {
        const { position, height, thickness, color, opacity } = opts;
        this.displayObject.lineStyle(thickness || 1, color || 0x000000, (opacity !== undefined ? opacity : 1));
        this.displayObject.moveTo(this.toXpx(position.x + 0.5), this.toYpx(position.y));
        this.displayObject.lineTo(this.toXpx(position.x + 0.5), this.toYpx(position.y + height));
    }

    protected text(label: string, position: TimeGraphElementPosition) {
        const result = new PIXI.Text(label, {
            fontSize: 10
        });
        result.x = this.toXpx(position.x);
        result.y = this.toXpx(position.y);
        this._displayObject.addChild(result);
    }

    protected toXpx(logicalX: number): number {
        return this.toWidthPx(logicalX) - this.toWidthPx(this.viewportInformation.x.start);
    }

    protected toYpx(logicalY: number): number {
        return this.toHeightPx(logicalY) - this.toHeightPx(this.viewportInformation.y.start);
    }

    protected toWidthPx(logical: number): number {
        return logical * this.viewportInformation.x.pixelFactor;
    }

    protected toHeightPx(logical: number): number {
        return logical * this.viewportInformation.y.pixelFactor;
    }

    addEvent(event: TimeGraphInteractionType, handler: TimeGraphInteractionHandler, displayObject: PIXI.DisplayObject) {
        displayObject.interactive = true;
        displayObject.on(event, ((e: PIXI.interaction.InteractionEvent) => {
            if (handler) {
                handler(e);
            }
        }).bind(this));
    }
}