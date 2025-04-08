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
        const options = {
            placement: this.placementValue,
            triggerType: this.triggerTypeValue,
            ...this.instanceEventHandlers(['hide', 'show', 'toggle']),
        }
        this.instance = new Tooltip(this.targetElement, this.element, options)
    }

}
