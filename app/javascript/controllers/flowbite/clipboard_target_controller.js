import { default as TargetController } from 'controllers/flowbite/target_controller'

// Placeholder controller, allows component to be used as an outlet for other controllers.
export default class extends TargetController {
  connect() {
    // console.log("flowbite-clipboard-target connected")
    super.connect()
  }
}