import { default as TriggerController } from 'controllers/flowbite/trigger_controller'
import Modal from 'flowbite/components/modal'

export default class extends TriggerController {
  #previousFocus = null

  static outlets = ['flowbite--modal-target']
  static values = {
    backdrop: { type: String, default: 'dynamic' }, // 'dynamic' or 'static' - dynamic allows the modal to be closed by clicking the backdrop, while static does not
    backdropClasses: { type: String, default: 'bg-gray-900/50 dark:bg-gray-900/80 fixed inset-0 z-40' },
    closable: { type: Boolean, default: true },
    placement: { type: String, default: 'top-center' }, // {top|center|bottom}-{left|center|right} (eg. top-left or bottom-right).
    action: { type: String, default: 'toggle' }, // 'toggle', 'show', 'hide'
    // TODO: we may want to make this the default. When would you ever want to keep the parent modal open when opening another from within it?
    closeParent: { type: Boolean, default: false } // If true, the modal will be closed when the trigger is clicked. Only used when opening another modal from the current modal, essentially
  }

  connect() {
    console.log("flowbite-modal-trigger connected")
    this.onClick = this.click.bind(this)
    this.element.addEventListener('click', this.onClick)
    super.connect()
  }

  disconnect() {
    this.element.removeEventListener('click', this.onClick)
    super.disconnect()
  }

  flowbiteModalTargetOutletConnected(outlet, element) {
    this.targetElement = element
    // console.log("flowbite-modal-target outlet connected", this.targetElement)
  }

  flowbiteModalTargetOutletDisconnected(outlet, element) {
    this.targetElement = null
    // console.log("flowbite-modal-target outlet disconnected")
  }

  #handleToggle(event) {
    // console.log('Modal toggle event received', event)
    if (this.targetController.instance.isVisible()) {
      this.#handleHide(event)
    } else {
      this.#handleShow(event)
    }
  }

  #handleShow(event) {
    // Store the element that had focus before the modal opened
    this.#previousFocus = document.activeElement
    // console.log('Modal show event received, previous focus was:', this.#previousFocus)

    setTimeout(() => {
      const autofocusField = this.targetElement.querySelector('[autofocus]')
      if (autofocusField) {
        autofocusField.focus()
      } else {
        const focusable = this.targetElement.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (focusable.length > 0) {
          focusable[0].focus()
        }
      }
    }, 200)
  }

  #handleHide(event) {
    // Return focus to the element that was focused before the modal opened
    if (this.#previousFocus && typeof this.#previousFocus.focus === 'function') {
      // console.log('Hide event received, returning focus to:', this.#previousFocus)
      this.#previousFocus.focus()
    }
  }

  createInstance() {
    // Skip creation if the target element doesn't exist
    if (!this.targetElement) return null;

    // Use the registry to create or retrieve an instance
    this.instance = this.createInstanceBase(
      this.targetElement.id,
      'modal',
      () => {
        const options = {
          backdrop: this.backdropValue,
          backdropClasses: this.backdropClassesValue,
          closable: this.closableValue,
          placement: this.placementValue,
          onHide: () => {
            this.#handleHide();
            // Dispatch the hide event so other controllers can listen for it
            this.dispatchInstanceEvent('hide');
          },
          onShow: () => {
            this.#handleShow();
            // Dispatch the show event so other controllers can listen for it
            this.dispatchInstanceEvent('show');
          },
          onToggle: () => {
            this.#handleToggle();
            // Dispatch the toggle event so other controllers can listen for it
            this.dispatchInstanceEvent('toggle');
          }
        }

        const instanceOptions = {
          id: this.targetElement.id,
          override: true
        };

        return new Modal(this.targetElement, options, instanceOptions);
      }
    );

    return this.instance;
  }

  click(e) {
    // console.log("flowbite-modal-trigger click", e)
    // console.log("flowbite-modal-trigger actionValue", this.actionValue)

    if (this.closeParentValue) {
      const parentModal = this.element.closest('[data-controller~="flowbite--modal-target"]');
      if (parentModal) {
        const parentModalId = parentModal.id;
        const parentInstance = window.ComponentRegistry.getInstance(parentModalId);
        if (parentInstance) {
          parentInstance.hide();
        }
      }
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
}
