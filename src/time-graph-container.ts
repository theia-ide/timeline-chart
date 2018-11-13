import { TimeGraphComponent } from "./time-graph-component";
import * as PIXI from "pixi.js";
import { TimeGraphStateController } from "./time-graph-state-controller";

export interface TimeGraphContainerOptions {
    id: string
    width: number
    height: number
    backgroundColor?: number
}

export abstract class TimeGraphContainer {

    protected _stage: PIXI.Container;
    protected _canvas: HTMLCanvasElement;

    protected _controller: TimeGraphStateController;

    constructor(config: TimeGraphContainerOptions, controller: TimeGraphStateController) {
        const canvas: HTMLCanvasElement = document.createElement('canvas');
        canvas.width = config.width;
        canvas.height = config.height;
        canvas.id = config.id;
        canvas.className = 'time-graph-canvas';
        const application = new PIXI.Application({
            width: config.width,
            height: config.height,
            view: canvas,
            backgroundColor: config.backgroundColor || 0x000000
        });
        application.stage.height = config.height;

        this._stage = application.stage;
        this._canvas = application.view;

        this._controller = controller;
    }

    get canvas(): HTMLCanvasElement {
        return this._canvas;
    }

    get stage(): PIXI.Container {
        return this._stage;
    }

    protected addChild(child: TimeGraphComponent) {
        child.render();
        this._stage.addChild(child.displayObject);
    }

    abstract update(): void;
}