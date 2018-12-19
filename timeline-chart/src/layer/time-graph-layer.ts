import { TimeGraphComponent } from "../components/time-graph-component";
import { TimeGraphUnitController } from "../time-graph-unit-controller";
import { TimeGraphStateController } from "../time-graph-state-controller";

export abstract class TimeGraphLayer {
    private canvas: HTMLCanvasElement;
    protected stateController: TimeGraphStateController;
    protected unitController: TimeGraphUnitController;
    protected children: TimeGraphComponent[];
    protected stage: PIXI.Container;

    constructor(protected id: string) {
        this.children = [];
    }

    protected addChild(child: TimeGraphComponent) {
        if(!this.stage){
            throw("Layers must be added to a container before components can be added.");
        }
        this.stage.addChild(child.displayObject);
        this.children.push(child);
    }

    /**
    This method is called by the container this layer is added to.
    */
    initializeLayer(canvas:HTMLCanvasElement, stage: PIXI.Container, stateController: TimeGraphStateController, unitController: TimeGraphUnitController) {
        this.canvas = canvas;
        this.stage = stage;
        this.stateController = stateController;
        this.unitController = unitController;
        this.afterAddToContainer();
    }

    protected onCanvasEvent(type: string, handler: (event:Event)=>void){
        this.canvas.addEventListener(type, handler);
    }

    protected removeChildren() {
        this.children.forEach(child => this.stage.removeChild(child.displayObject));
        this.children = [];
    }

    protected afterAddToContainer() { }

    protected abstract update(): void;
}