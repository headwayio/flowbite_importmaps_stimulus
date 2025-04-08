import { Controller } from '@hotwired/stimulus'
import { useMorphEvents } from 'controllers/mixins/use_morph_events'
import ComponentRegistry from 'controllers/flowbite/component_registry'

export default class extends Controller {

  connect() {
    // console.log("flowbite-trigger superclass connected")
    useMorphEvents(this)
    this.connectMorphEvents()
  }

  disconnect() {
    console.log("flowbite-trigger superclass disconnected")
    this.destroyInstance()
    this.disconnectMorphEvents()
  }

  beforeMorph(e) {
    // console.log("flowbite-trigger beforeMorph", e.target)
    if (e.target === this.targetElement) { // Must be implemented in child controller
      console.log("flowbite-trigger beforeMorph == true")
      this.morphed = true
    }
  }

  afterMorph(e) {
    console.log("flowbite-trigger afterMorph", e.target)
    if (this.morphed) {
      console.log("flowbite-trigger afterMorph morphed == true")
      this.morphed = false
      if (this.instance) {
        console.log("flowbite-trigger afterMorph destroying and creating instance")
        this.destroyInstance()
        this.createInstance() // Must be implemented in child controller
      }
    }
  }

  destroyInstance() {
    if (this.instance && this.targetElement) {
      const instanceId = this.instance._instanceId;

      if (instanceId) {
        console.log(`Removing instance reference for ${instanceId}`);
        ComponentRegistry.removeInstance(instanceId);
      } else {
        console.warn("Instance has no _instanceId property");

        // Fallback to direct destroy if we can't use the registry
        if (typeof this.instance.destroy === 'function') {
          this.instance.destroy();
        }
      }

      this.instance = null;
    }
  }

  dispatchInstanceEvent(name) {
    const detail = { [this.componentName]: this.instance }

    // Dispatch to this controller
    this.dispatch(name, { detail })

    // Dispatch to the target element (for target controller to pick up)
    if (this.targetElement) {
      const event = new CustomEvent(name, {
        bubbles: true,
        cancelable: true,
        detail
      })
      this.targetElement.dispatchEvent(event)
    }
  }

  instanceEventHandlers(names) {
    return names.reduce((result, name) => {
      const option = `on${String(name[0]).toUpperCase() + String(name).slice(1)}`
      result[option] = this.instanceEventHandler(name)
      return result
    }, {})
  }

  instanceEventHandler(name) {
    return () => this.dispatchInstanceEvent(name)
  }

  get componentName() {
    return /flowbite--(?<component>[a-z]+)-trigger/.exec(this.identifier).groups.component
  }

  // This doesn't work, because in the flowbiteDropdownTargetOutletConnected callback,
  // flowbiteDropdownTargetOutletElement returns the element, but hasFlowbiteDropdownTargetOutletElement returns false.
  // get targetElement() {
  //     if (this.hasFlowbiteDropdownTargetOutletElement) {
  //         return this.flowbiteDropdownTargetOutletElement
  //     } else {
  //         return null
  //     }
  // }

  #targetElement = null

  get targetElement() {
    return this.#targetElement
  }

  get targetController() {
    return this.context.outletObserver.outletsByName.getValuesForKey(`flowbite--${this.componentName}-target`)[0]
  }

  set targetElement(element) {
    this.#targetElement = element
    if (element) {
      // Don't immediately create a new instance
      // Instead, wait for createInstance() to use the registry
      this.createInstance()
      this.targetController.instance = this.instance
      this.targetController.triggerController = this
    } else {
      this.destroyInstance()

      const tc = this.targetController
      if (tc) {
        tc.instance = null
        tc.triggerController = null
      }
    }
  }

  // Override this in derived classes to use the registry
  createInstanceBase(elementId, createCallback) {
    // Get or create an instance from the registry
    return ComponentRegistry.getInstance(elementId, createCallback);
  }
}