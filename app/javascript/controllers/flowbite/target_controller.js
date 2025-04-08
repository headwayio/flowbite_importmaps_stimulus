import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  #instance = null

  get instance() {
    // console.log("flowbite-target GET instance", this.#instance)
    return this.#instance
  }

  set instance(instance) {
    // console.log("flowbite-target SET instance", instance)
    this.#instance = instance
  }
}