import { default as TriggerController } from 'controllers/flowbite/trigger_controller'
import Drawer from 'flowbite/components/drawer';

export default class extends TriggerController {
  static outlets = ['flowbite--drawer-target']
  static targets = ['icon']
  static values = {
    action: { type: String, default: 'toggle' },
    placement: { type: String, default: 'left' },
    bodyScrolling: { type: Boolean, default: false },
    backdrop: { type: Boolean, default: true },
    edge: { type: Boolean, default: false },
    edgeOffset: { type: String, default: 'bottom-[60px]' },
    backdropClasses: { type: String, default: 'bg-slate-900/50 dark:bg-slate-900/80 fixed inset-0 z-30' },
    iconClassOpen: { type: String, default: '' },
    iconClassClose: { type: String, default: '' },
  }

  connect() {
    // console.log("flowbite-drawer-trigger connected")
    super.connect()
    this.onClick = this.click.bind(this)
    this.element.addEventListener('click', this.onClick)
  }

  disconnect() {
    this.element.removeEventListener('click', this.onClick)
    super.disconnect()
  }

  flowbiteDrawerTargetOutletConnected(outlet, element) {
    // console.log("flowbite-drawer-target outlet connected", element)
    this.targetElement = element
  }

  flowbiteDrawerTargetOutletDisconnected(outlet, element) {
    // console.log("flowbite-drawer-target outlet DISconnected element", element)
    // console.log("flowbite-drawer-target outlet DISconnected outlet", outlet)
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
          bodyScrolling: this.bodyScrollingValue,
          backdrop: this.backdropValue,
          edge: this.edgeValue,
          edgeOffset: this.edgeOffsetValue,
          backdropClasses: this.backdropClassesValue,
          onShow: () => this.#handleEvent('show'),
          onHide: () => this.#handleEvent('hide'),
        }

        const instanceOptions = {
          id: this.targetElement.id,
          override: true
        };

        return new Drawer(this.targetElement, options, instanceOptions);
      }
    );

    return this.instance;
  }

  #handleEvent(eventName) {
    // console.log(`flowbite-drawer-trigger #handleEvent ${eventName}`)

    // NOTE: this is not currently in use, but we may want to add it at some
    // point and it serves as a good example of manipulating an icon based on
    // the state of the drawer using an icon target element. hasIconTarget is
    // a helper method that checks if the iconTarget is present in the DOM.
    if (this.hasIconTarget) {
      const visible = this.instance.isVisible()
      this.iconTarget.classList.toggle(this.iconClassCloseValue, visible)
      this.iconTarget.classList.toggle(this.iconClassOpenValue, !visible)
    }

    // TODO: determine if we need to leverage event dispatching or if we should
    // just perform any necessary actions directly
    this.dispatchInstanceEvent(eventName)

    // Directly call resetForms on the target controller
    if (eventName === 'hide') {
      // this.targetController.resetForms() // commented out, but here for reference
    }

    // handles focusing an input in the drawer on SHOW ONLY. Further steps are
    // necessary to focus the field after the drawer is updated
    if (eventName === 'show') {
      this.targetController.focusFirstAutofocusField()
    }
  }

  click(e) {
    console.log("flowbite-drawer-trigger click", this.actionValue)

    // Handle custom action for drawer switching
    if (this.actionValue === 'switch-drawer') {
      // Get target drawer ID from the data attribute
      const switchFromDrawerId = this.element.getAttribute('data-switch-from-drawer-id')
      const switchToDrawerId = this.element.getAttribute('data-switch-to-drawer-id')
      this.switchDrawers(switchFromDrawerId, switchToDrawerId)
      return
    }

    switch (this.actionValue) {
      case 'toggle':
        this.instance.toggle()
        break
      case 'show':
        this.instance.show()
        break
      case 'hide':
        this.instance.hide()
        break
    }
  }

  switchDrawers(currentDrawerId, targetDrawerId) {
    console.log(`Switching from drawer #${currentDrawerId} to #${targetDrawerId}`)

    if (currentDrawerId && targetDrawerId) {
      // Get both drawer elements
      const currentDrawer = document.getElementById(currentDrawerId)
      const targetDrawer = document.getElementById(targetDrawerId)

      // console.log("Current drawer", currentDrawer)
      // console.log("Target drawer", targetDrawer)

      if (currentDrawer && targetDrawer) {
        // Temporarily disable transitions
        currentDrawer.classList.add('!transition-none')
        targetDrawer.classList.add('!transition-none')

        // Get controllers
        const application = window.Stimulus || window.stimulus_application

        // When we were using the outlet, we got this for free and could just
        // call this.instance.hide()
        const triggerController = application.getControllerForElementAndIdentifier(
          currentDrawer,
          'flowbite--drawer-target'
        )
        const targetController = application.getControllerForElementAndIdentifier(
          targetDrawer,
          'flowbite--drawer-target'
        )

        if (targetController && targetController.instance) {
          console.log("Showing target drawer", targetController.instance)

          triggerController.instance.hide()
          targetController.instance.show()

          // Re-enable transitions after a short delay
          setTimeout(() => {
            currentDrawer.classList.remove('transition-none')
            targetDrawer.classList.remove('transition-none')
          }, 50)
        }
      }
    }
  }
}