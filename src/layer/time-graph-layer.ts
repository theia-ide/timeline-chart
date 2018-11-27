import { TimeGraphComponent } from "../components/time-graph-component";
import { TimeGraphUnitController } from "../time-graph-unit-controller";
import { TimeGraphStateController } from "../time-graph-state-controller";

export abstract class TimeGraphLayer {
    protected canvas: HTMLCanvasElement;
    protected stateController: TimeGraphStateController;
    protected unitController: TimeGraphUnitController;
    protected children: PIXI.DisplayObject[];
    protected stage: PIXI.Container;

    constructor(protected id: string) {
        this.children = [];
    }

    protected addChild(child: TimeGraphComponent) {
        if(!this.stage){
            throw("Layers must be added to a container before components can be added.");
        }
        child.render();
        this.stage.addChild(child.displayObject);
        this.children.push(child.displayObject);
    }

    /**
    This method is called by the container this layer is added to.
    */
    initializeLayer(canvas:HTMLCanvasElement, stage: PIXI.Container, stateController: TimeGraphStateController, unitController: TimeGraphUnitController) {
        this.canvas = canvas;
        this.stage = stage;
        this.stateController = stateController;
        this.unitController = unitController;
        this.init();
    }

    protected removeChildren() {
        this.children.forEach(child => this.stage.removeChild(child));
    }

    protected init() { }

    protected abstract update(): void;
}