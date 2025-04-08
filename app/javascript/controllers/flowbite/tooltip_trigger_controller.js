import { default as TriggerController } from 'controllers/flowbite/trigger_controller'
import Tooltip from 'flowbite/components/tooltip'

export default class extends TriggerController {

  static outlets = ['flowbite--tooltip-target']
  static values = {
    placement: { type: String, default: 'top' },
    triggerType: { type: String, default: 'hover' },
  }

  flowbiteTooltipTargetOutletConnected(outlet, element) {
    this.targetElement = element
  }

  flowbiteTooltipTargetOutletDisconnected(outlet, element) {
    this.targetElement = null
  }

  createInstance() {
    // Skip creation if the target element doesn't exist
    if (!this.targetElement) return null;

    // Use the registry to create or retrieve an instance
    this.instance = this.createInstanceBase(
      this.targetElement.id,
      () => {
        const options = {
          placement: this.placementValue,
          triggerType: this.triggerTypeValue,
          onHide: () => this.dispatchInstanceEvent('hide'),
          onShow: () => this.dispatchInstanceEvent('show'),
          onToggle: () => this.dispatchInstanceEvent('toggle')
        }

        const instanceOptions = {
          id: this.targetElement.id,
          override: true
        };

        return new Tooltip(this.targetElement, this.element, options, instanceOptions);
      }
    );

    return this.instance;
  }
}
