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
        const options = {
            transition: this.transitionValue,
            duration: this.durationValue,
            timing: this.timingValue,
            // ...this.instanceEventHandlers(['hide']),
            onHide: () => this.#handleHide(),
        }
        this.instance = new Dismiss(this.targetElement, this.element, options)
    }

    #handleHide() {
        this.#stopAutoHide()
        this.dispatchInstanceEvent('hide')
    }

}
