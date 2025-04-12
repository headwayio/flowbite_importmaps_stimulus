import { default as TriggerController } from 'controllers/flowbite/trigger_controller'
import Dismiss from 'flowbite/components/dismiss'

export default class extends TriggerController {
  #previousFocus = null
  #lastActiveElement = null
  #focusObserverInterval = null

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

    // Start tracking the active element to know what was focused before our button
    this.startTrackingFocus()

    if (this.autoHideTimeoutValue > 0) {
      this.#startAutoHide(this.autoHideTimeoutValue)
    }
  }

  disconnect() {
    this.stopTrackingFocus()
    this.element.removeEventListener('click', this.onClick)
    this.#stopAutoHide()
    super.disconnect()
  }

  startTrackingFocus() {
    // Track focus changes to remember the last focused element before our button
    this.#focusObserverInterval = setInterval(() => {
      // Only update if the active element is not our dismiss button
      if (document.activeElement !== this.element && document.activeElement !== document.body) {
        this.#lastActiveElement = document.activeElement;
      }
    }, 100);
  }

  stopTrackingFocus() {
    if (this.#focusObserverInterval) {
      clearInterval(this.#focusObserverInterval);
      this.#focusObserverInterval = null;
    }
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
    // Store the last active element before our button was clicked
    this.#previousFocus = this.#lastActiveElement;

    // If we don't have a previous focus reference yet, try to find a suitable element
    if (!this.#previousFocus || this.#previousFocus === this.element) {
      // Find the closest parent container that would be a logical focus target
      this.#previousFocus = this.element.closest('[tabindex], button, a, input, select, textarea') ||
        document.querySelector('main') ||
        document.body;
    }

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

    // Return focus to the element that was focused before hiding
    if (this.#previousFocus && typeof this.#previousFocus.focus === 'function') {
      // Small timeout to ensure DOM updates are complete
      setTimeout(() => {
        this.#previousFocus.focus();
        this.#previousFocus = null;
      }, 10);
    }

    this.dispatchInstanceEvent('hide')
  }
}
