const UNIT_SIZE = 25;
const DEFAULT_PANEL_COLOR = 'silver';

export interface PanelBounds {
  x: number,
  y: number,
  w: number,
  h: number,
}

export interface PanelState {
  isPressed: boolean;
  isToggled: boolean;
}

export type DrawCallback = (ctx: CanvasRenderingContext2D,
                            bounds: PanelBounds,
                            state: PanelState) => void;

export class Panel {
  unitWidth: number;
  unitHeight: number;
  drawCallbacks: DrawCallback[] = [];
  color: string = DEFAULT_PANEL_COLOR;
  private isPressable: boolean = false;
  isToggleable: boolean = false;
  isClickable: boolean = false;
  state: PanelState;
  toggleOnCallback?: () => void;
  toggleOffCallback?: () => void;
  clickCallback?: () => void;

  constructor(unitWidth: number, unitHeight: number) {
    this.unitWidth = unitWidth;
    this.unitHeight = unitHeight;
    this.state = {
      isPressed: false,
      isToggled: false,
    };
  }

  onMouseDown() {
    if (!this.isPressable)
      return;
    this.state.isPressed = true;
  }

  onMouseUp() {
    if (!this.isPressable)
      return;
    if (this.isToggleable) {
      this.state.isToggled = !this.state.isToggled;
      if (this.state.isToggled && this.toggleOnCallback)
        this.toggleOnCallback();
      else if (!this.state.isToggled && this.toggleOffCallback)
        this.toggleOffCallback();
    } 
    if (this.state.isPressed && this.isClickable && this.clickCallback)
      this.clickCallback();
    this.state.isPressed = false;
  }

  onMouseExit() {
    if (!this.isPressable)
      return;
    this.state.isPressed = false;
  }

  setColor(color: string): Panel {
    this.color = color;

    return this;
  }

  addDrawCallback(callback: DrawCallback): Panel {
    this.drawCallbacks.push(callback);

    return this;
  }

  clickable(callback: () => void): Panel {
    if (this.isToggleable)
      throw new Error('Cannot be both clickable and toggleable');
    this.isClickable = true;
    this.isPressable = true;
    this.clickCallback = callback;

    return this;
  }

  toggleable(toggleOnCallback?: () => void, toggleOffCallback?: () => void): Panel {
    if (this.isClickable)
      throw new Error('Cannot be both clickable and toggleable');
    this.isToggleable = true;
    this.isPressable = true;
    this.toggleOnCallback = toggleOnCallback;
    this.toggleOffCallback = toggleOffCallback;

    return this;
  }

  draw(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.fillRect(x, y, this.unitWidth*UNIT_SIZE, this.unitHeight*UNIT_SIZE);

    const bounds = {
      x, y,
      w: this.unitWidth*UNIT_SIZE, h: this.unitHeight*UNIT_SIZE
    };
    this.drawCallbacks.forEach(cb => cb(ctx, bounds, this.state));
  }
}

type UnitOffset = {x: number, y: number};

export class PanelContainer {
  private x: number;
  private y: number;
  private unitWidth: number;
  private unitHeight: number;
  private childPanels = new Map<Panel, UnitOffset>();
  debug: boolean = false;

  constructor(x: number, y: number, unitWidth: number, unitHeight: number) {
    this.x = x;
    this.y = y;
    this.unitWidth = unitWidth;
    this.unitHeight = unitHeight;

    document.addEventListener('mousedown', e => {
      for (const [panel, unitOffset] of this.childPanels.entries()) {
        if (e.clientX > this.x + unitOffset.x*UNIT_SIZE
            && e.clientX < this.x + unitOffset.x*UNIT_SIZE + panel.unitWidth*UNIT_SIZE
            && e.clientY > this.y + unitOffset.y*UNIT_SIZE
            && e.clientY < this.y + unitOffset.y*UNIT_SIZE + panel.unitHeight*UNIT_SIZE) {
           panel.onMouseDown();
           break;
        }
      }
    });

    document.addEventListener('mouseup', e => {
      for (const [panel, unitOffset] of this.childPanels.entries()) {
        if (e.clientX > this.x + unitOffset.x*UNIT_SIZE
            && e.clientX < this.x + unitOffset.x*UNIT_SIZE + panel.unitWidth*UNIT_SIZE
            && e.clientY > this.y + unitOffset.y*UNIT_SIZE
            && e.clientY < this.y + unitOffset.y*UNIT_SIZE + panel.unitHeight*UNIT_SIZE) {
           panel.onMouseUp();
           break;
        }
      }
    });

    document.addEventListener('mousemove', e => {
      if (e.buttons == 0)
        return;
      for (const [panel, unitOffset] of this.childPanels.entries()) {
        const prevX = e.clientX - e.movementX;
        const prevY = e.clientY - e.movementY;
        if (prevX >= this.x + unitOffset.x*UNIT_SIZE
            && prevX <= this.x + unitOffset.x*UNIT_SIZE + panel.unitWidth*UNIT_SIZE
            && prevY >= this.y + unitOffset.y*UNIT_SIZE
            && prevY <= this.y + unitOffset.y*UNIT_SIZE + panel.unitHeight*UNIT_SIZE
            && (e.clientX < this.x + unitOffset.x*UNIT_SIZE
            || e.clientX > this.x + unitOffset.x*UNIT_SIZE + panel.unitWidth*UNIT_SIZE
            || e.clientY < this.y + unitOffset.y*UNIT_SIZE
            || e.clientY > this.y + unitOffset.y*UNIT_SIZE + panel.unitHeight*UNIT_SIZE)) {
           panel.onMouseExit();
        }
      }
    });
  }

  addPanel(panel: Panel, unitXOffset: number, unitYOffset: number) {
    // TODO check for overlap
    this.childPanels.set(panel, {x: unitXOffset, y: unitYOffset});
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.childPanels.forEach((unitOffset, panel) => {
      panel.draw(ctx, this.x + unitOffset.x*UNIT_SIZE, this.y + unitOffset.y*UNIT_SIZE);
    });

    if (this.debug) {
      // draw debug grid
      ctx.fillStyle = 'black';
      ctx.font = '10px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let col = 0; col < this.unitWidth; ++col) {
        ctx.fillText(col.toString(), this.x + col*UNIT_SIZE + UNIT_SIZE/2, this.y - 30);
      }
      for (let row = 0; row < this.unitHeight; ++row) {
        ctx.fillText(row.toString(), this.x - 30, this.y + row*UNIT_SIZE + UNIT_SIZE/2);
      }

      ctx.beginPath();
      ctx.strokeStyle = 'indianred';
      ctx.lineWidth = 1;
      for (let col = 0; col <= this.unitWidth; ++col) {
        ctx.moveTo(this.x + col*UNIT_SIZE, this.y);
        ctx.lineTo(this.x + col*UNIT_SIZE, this.y + this.unitHeight*UNIT_SIZE);
        ctx.stroke();
      }
      for (let row = 0; row <= this.unitHeight; ++row) {
        ctx.moveTo(this.x, this.y + row*UNIT_SIZE);
        ctx.lineTo(this.x + this.unitWidth*UNIT_SIZE, this.y + row*UNIT_SIZE);
        ctx.stroke();
      }
    }
  }
}
