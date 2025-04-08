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
        const options = {
            ...this.instanceEventHandlers(['collapse', 'expand', 'toggle']),
        }
        this.instance = new Collapse(this.targetElement, this.element, options)
    }

}
