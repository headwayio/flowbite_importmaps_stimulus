import { default as TriggerController } from 'controllers/flowbite/trigger_controller'
import Clipboard from 'flowbite/components/clipboard'

export default class extends TriggerController {

  static outlets = ['flowbite--clipboard-target']
  static targets = ['icon', 'label']
  static values = {
    htmlEntities: { type: Boolean, default: false },
    mode: { type: String, default: 'input' },
    successText: { type: String },
    defaultText: { type: String },
    successIcon: { type: String },
    defaultIcon: { type: String },
  }

  flowbiteClipboardTargetOutletConnected(outlet, element) {
    this.targetElement = element
  }

  flowbiteClipboardTargetOutletDisconnected(outlet, element) {
    this.targetElement = null
  }

  disconnect() {
    this.#clearResetTimer()
    super.disconnect()
  }

  createInstance() {
    // Skip creation if the target element doesn't exist
    if (!this.targetElement) return null;

    // Use the registry to create or retrieve an instance
    this.instance = this.createInstanceBase(
      this.targetElement.id,
      () => {
        const options = {
          contentType: this.modeValue,
          htmlEntities: this.htmlEntitiesValue,
          onCopy: () => {
            this.#clearResetTimer()
            if (this.hasIconTarget) {
              this.iconTarget.classList.remove(this.defaultIconValue)
              this.iconTarget.classList.add(this.successIconValue)
            }
            if (this.hasLabelTarget) {
              this.labelTarget.style.minWidth = `${this.labelTarget.offsetWidth}px`
              this.labelTarget.innerText = this.successTextValue
            }
            this.resetTimer = setTimeout(() => this.#reset(), 2000)
            this.dispatchInstanceEvent('copy')
          },
        }

        const instanceOptions = {
          id: this.targetElement.id,
          override: true
        };

        return new Clipboard(this.element, this.targetElement, options, instanceOptions);
      }
    );

    return this.instance;
  }

  #clearResetTimer() {
    if (this.resetTimer) {
      clearTimeout(this.resetTimer)
      this.resetTimer = null
    }
  }

  #reset() {
    if (this.hasIconTarget) {
      this.iconTarget.classList.remove(this.successIconValue)
      this.iconTarget.classList.add(this.defaultIconValue)
    }
    if (this.hasLabelTarget) {
      this.labelTarget.innerText = this.defaultTextValue
    }
  }

}
