import { LitElement, html, customElement, css, property } from 'lit-element';
import { computeDomain, HomeAssistant } from 'custom-card-helpers';

@customElement('number-picker-card')
export class NumberPicker extends LitElement {

  @property() hass?: HomeAssistant;
  @property() value: number = 0;
  config?: {entity: string};
  step = 1;
  min = 0;
  max = 100;
  unit = "";
  icon = "";
  timer = 0;

  setConfig(config) {
    if (!config.entity) {
      throw new Error("You need to define an entity");
    }
    this.config = config;
  }

  firstUpdated() {
    if(!this.hass || !this.config) return;
    const stateObj = this.hass.states[this.config.entity];
    if(!stateObj) throw new Error("Entity not found");
    this.value = Number(stateObj.state);
    this.step = Number(stateObj.attributes.step);
    this.min = Number(stateObj.attributes.min);
    this.max = Number(stateObj.attributes.max);
    this.unit = String(stateObj.attributes.unit_of_measurement);
    this.icon = String(stateObj.attributes.icon);
  }

  getCardSize() {
    return 1;
  }

  render() {
    return html`
      <ha-card>

        <div class="icon-container">
        <ha-icon icon="${this.icon}" class="icon">
        </ha-icon>
        </div>

        <div class="value-container">
        <mwc-button @click="${this.upClick}">
          <ha-icon icon="hass:chevron-up"></ha-icon>
        </mwc-button>

        <div class="value">
          ${this.step < 1 ? this.value.toFixed(1) : this.value}<span class="unit">${this.unit}</span>
        </div>

        <mwc-button @click="${this.downClick}">
          <ha-icon icon="hass:chevron-down"></ha-icon>
        </mwc-button>
        </div>
      </ha-card>
    `;
  }

  upClick() {
    let value = this.value + this.step;
    if(value > this.max) value = this.max;
    this.value = value;
    this.setTimer();
  }

  downClick() {
    let value = this.value - this.step;
    if(value < this.min) value = this.min;
    this.value = value;
    this.setTimer();
  }

  setTimer() {
    clearTimeout(this.timer);
    this.timer = window.setTimeout(() => {
      this.hass!.callService("input_number", "set_value", {
        entity_id: this.config!.entity,
        value: this.value
      })
    }, 1000);
  }

  static styles = css`

    ha-card {
      display: grid;
      grid-template-columns: max-content 1fr;
      grid-template-rows: min-content;
      grid-template-areas: 'icon value';
      grid-gap: 10px 20px;
      align-items: center;
      color: var(--text-primary-color);
    }

    div.icon-container {
      grid-area: icon;
      margin: 0px 5px;
    }

    div.value-container {
      grid-area: value;
      display: flex;
      align-items: center;
      flex-direction: column;
      min-width: 150px;
    }

   mwc-button {
      --mdc-icon-size: 48px;
      margin: 5px 0px;
      min-width: 150px;
    }

    div.value {
      font-size: 42px;
      text-align: center;
      margin: 15px 0px;
    }

    .unit {
      font-size: 36px;
      padding: -10px 0px 10px 5px;
    }

    .icon {
      --mdc-icon-size: 42px;
    }
  `;
}

