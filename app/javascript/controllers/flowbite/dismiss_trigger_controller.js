import { default as TriggerController } from 'controllers/flowbite/trigger_controller'
import Dismiss from 'flowbite/components/dismiss'

export default class extends TriggerController {

  static outlets = ['flowbite--dismiss-target']
  static values = {
    transition: { type: String, default: 'transition-opacity' },
    duration: { type: Number, default: 300 },
    timing: { type: String, default: 'ease-out' },
    autoHideTimeout: { type: Number, default: 0 }
  }

  connect() {
    super.connect()
    this.onClick = this.click.bind(this)
    this.element.addEventListener('click', this.onClick)

    if (this.autoHideTimeoutValue > 0) {
      this.#startAutoHide(this.autoHideTimeoutValue)
    }
  }

  disconnect() {
    this.element.removeEventListener('click', this.onClick)
    this.#stopAutoHide()
    super.disconnect()
  }

  #startAutoHide(timeout) {
    this.autoHideTimeoutTimer = setTimeout(() => this.instance?.hide(), timeout)
  }

  #stopAutoHide() {
    if (this.autoHideTimeoutTimer) {
      clearTimeout(this.autoHideTimeoutTimer)
      this.autoHideTimeoutTimer = null
    }
  }

  flowbiteDismissTargetOutletConnected(outlet, element) {
    this.targetElement = element
  }

  flowbiteDismissTargetOutletDisconnected(outlet, element) {
    this.targetElement = null
  }

  click(e) {
    this.instance?.hide()
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
          onHide: () => this.#handleHide(),
        }

        const instanceOptions = {
          id: this.targetElement.id,
          override: true
        };

        return new Dismiss(this.targetElement, this.element, options, instanceOptions);
      }
    );

    return this.instance;
  }

  #handleHide() {
    this.#stopAutoHide()
    this.dispatchInstanceEvent('hide')
  }

}
