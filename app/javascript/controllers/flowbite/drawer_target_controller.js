import { default as TargetController } from 'controllers/flowbite/target_controller'

export default class extends TargetController {
  #turboStreamActive = false

  static targets = ["form"]

  connect() {
    console.log("flowbite-drawer-target connected")
    super.connect()

    document.addEventListener('turbo:before-stream-render', this.#markTurboStreamActive.bind(this))
  }

  disconnect() {
    document.removeEventListener('turbo:before-stream-render', this.#markTurboStreamActive.bind(this))
    super.disconnect()
  }

  // Can be called directly through a data-action or when leveraging the
  // hide_drawer method in the turbo_stream_extension.rb initializer.
  hide() {
    if (this.instance) {
      this.instance.hide()
    }
  }

  // Can be called directly through a data-action or when leveraging the
  // show_drawer method in the turbo_stream_extension.rb initializer.
  show() {
    if (this.instance) {
      this.instance.show()
    }
  }

  // Can be called directly through a data-action or when leveraging the
  // drawer_action method in the turbo_stream_extension.rb initializer.
  // turbo_stream.drawer_action("new-task-drawer-#{@stage.id}", action: 'focusFirstAutofocusField', reset_forms: true)
  //
  // This method is smart enough to determine if it was called from client-side
  // or server-side and will wrap the call to .focus() in the correct microtask
  // strategy: setTimeout, or ideally requestAnimationFrame, as it's faster
  focusFirstAutofocusField() {
    const autofocusField = this.element.querySelector('[autofocus]')
    if (!autofocusField) return

    // Determine if this is a direct call from client-side or through Turbo Stream
    const isClientSide = this.#isCalledFromClientSide()

    // console.log(`Focusing autofocus field (${isClientSide ? 'client-side' : 'server-side'}):`, autofocusField)

    if (isClientSide) {
      // Use longer timeout for client-side calls
      setTimeout(() => {
        autofocusField.focus()
      }, 100)
    } else {
      // Use requestAnimationFrame for server-side/Turbo Stream calls
      requestAnimationFrame(() => {
        autofocusField.focus()
      })
    }
  }

  // Can be called directly through a data-action or when leveraging the
  // drawer_action method in the turbo_stream_extension.rb initializer.
  // turbo_stream.drawer_action("new-task-drawer-#{@stage.id}", reset_forms: true)
  resetForms() {
    // Reset all forms or specific form targets
    if (this.hasFormTarget) {
      this.formTargets.forEach(form => {
        console.log("Resetting form in drawer")
        form.reset()
      })
    } else {
      console.log("Resetting all forms in drawer")
      // Fall back to all forms if no targets specified
      const forms = this.element.querySelectorAll('form')
      forms.forEach(form => form.reset())
    }

    this.focusFirstAutofocusField()
  }

  // Handle successful form submissions through a data-action in a form_with
  // data: { action: "turbo:submit-end->flowbite--drawer-target#handleSuccess" }
  handleSuccess(event) {
    console.log("Form submitted successfully")
    // this.hide()
    this.resetForms()
  }

  #isCalledFromClientSide() {
    if (this.#turboStreamActive) {
      return false
    }
    // Default: when in doubt, assume it's client-side for more reliable focusing
    return true
  }

  #markTurboStreamActive() {
    console.log("Marking Turbo Stream active")
    this.#turboStreamActive = true
    // Set a timeout to reset the flag to avoid needing to hook into the
    // turbo:stream-render event, which doesn't fire when doing
    // turbo_stream.update("id", partial: 'name', locals: { ... })
    setTimeout(() => { this.#turboStreamActive = false }, 1000)
  }
}