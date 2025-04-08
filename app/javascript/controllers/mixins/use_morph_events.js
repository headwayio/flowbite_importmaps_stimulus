export const useMorphEvents = controller => {
  Object.assign(controller, {
    connectMorphEvents() {
      // console.log("flowbite-morph-events connected")
      this.onBeforeMorph = this.beforeMorph.bind(this)
      this.onAfterMorph = this.afterMorph.bind(this)
      window.addEventListener('turbo:before-morph-element', this.onBeforeMorph)
      window.addEventListener('turbo:morph', this.onAfterMorph)
    },

    disconnectMorphEvents() {
      // console.log("flowbite-morph-events disconnected")
      window.removeEventListener('turbo:morph', this.onAfterMorph)
      window.removeEventListener('turbo:before-morph-element', this.onBeforeMorph)
    }
  })

  if (!controller.beforeMorph) {
    console.log("flowbite-morph-events beforeMorph not defined")
    controller.beforeMorph = _ => null

  }

  if (!controller.afterMorph) {
    console.log("flowbite-morph-events afterMorph not defined")
    controller.afterMorph = _ => null
  }
}