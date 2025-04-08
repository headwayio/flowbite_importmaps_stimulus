import { default as TriggerController } from 'controllers/flowbite/trigger_controller'
import Collapse from 'flowbite/components/collapse'

export default class extends TriggerController {

  static outlets = ['flowbite--collapse-target']
  static values = {
    transition: { type: String, default: 'transition-opacity' },
    duration: { type: Number, default: 300 },
    timing: { type: String, default: 'ease-out' },
  }

  flowbiteCollapseTargetOutletConnected(outlet, element) {
    this.targetElement = element
  }

  flowbiteCollapseTargetOutletDisconnected(outlet, element) {
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
          transition: this.transitionValue,
          duration: this.durationValue,
          timing: this.timingValue,
          onCollapse: () => this.dispatchInstanceEvent('collapse'),
          onExpand: () => this.dispatchInstanceEvent('expand'),
          onToggle: () => this.dispatchInstanceEvent('toggle')
        }

        const instanceOptions = {
          id: this.targetElement.id,
          override: true
        };

        return new Collapse(this.targetElement, this.element, options, instanceOptions);
      }
    );

    return this.instance;
  }
}
