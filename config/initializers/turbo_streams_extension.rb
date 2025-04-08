module TurboStreamsExtension
  # ----------------
  # MODAL EXTENSIONS
  # ----------------
  def modal_action(modal_id, options = {})
    action = options[:action] || "hide"
    clear_form = options[:clear_form] || false

    # create an immediately invoked function expression (IIFE) to handle the modal
    append("turbo-stream-js-container",
      html: raw("<script>
        (function() {
          try {
            // Get the modal element
            const $modalElement = document.getElementById('#{modal_id}');
            const modalComponent = window.ComponentRegistry.getInstance('#{modal_id}');

            // Initialize modal object
            if (modalComponent) {
              // Perform the specified action on the modal. Default to 'hide'
              modalComponent.#{action}();

              // Clear form fields if requested
              #{if clear_form
                  "
                  // Find all forms in the modal
                  const forms = $modalElement.querySelectorAll('form');
                  forms.forEach(form => {
                    // Get all input, select, and textarea elements
                    const fields = form.querySelectorAll('input, select, textarea');

                    // Clear each field
                    fields.forEach(field => {
                      if (field.type === 'checkbox' || field.type === 'radio') {
                        field.checked = false;
                      } else if (field.type !== 'submit' && field.type !== 'button') {
                        field.value = '';
                      }
                    });

                    // Reset any select elements to their first option
                    const selects = form.querySelectorAll('select');
                    selects.forEach(select => {
                      if (select.options.length > 0) {
                        select.selectedIndex = 0;
                      }
                    });
                  });
                  "
                else
                  ""
                end}
            }
          } catch (e) {
            console.error('Error calling #{action}() on modal:', e);
          }
        })();
      </script>")
    )
  end

  def hide_modal(modal_id, options = {})
    modal_action(modal_id, options.merge(action: "hide"))
  end

  # ----------------
  # TOAST EXTENSIONS
  # ----------------
  def show_toast(type, message, options = {})
    id = options[:id] || "toast-#{type}-#{SecureRandom.hex(4)}"

    append(
      "flash",
      partial: "shared/flash",
      locals: {
        "#{type}": message.html_safe,
        "#{type}_id": id
      }
    )
  end

  def toast_notice(message, options = {})
    show_toast("notice", message, options)
  end

  def toast_alert(message, options = {})
    show_toast("alert", message, options)
  end

  # ----------------
  # DRAWER EXTENSIONS
  # ----------------
  def drawer_action(drawer_id, options = {})
    action = options[:action]
    reset_forms = options[:reset_forms] || false

    append("turbo-stream-js-container",
      html: raw("<script>
        (function() {
          try {
            // Get the drawer element
            const $drawerElement = document.getElementById('#{drawer_id}');

            if ($drawerElement) {
              // Check if element has Stimulus controller attached
              if ($drawerElement.hasAttribute('data-controller') &&
                  $drawerElement.getAttribute('data-controller').includes('flowbite--drawer-target')) {

                // Get the Stimulus controller instance using Stimulus API
                const application = window.Stimulus || window.stimulus_application;
                if (!application) {
                  console.error('Stimulus application not found');
                  return;
                }

                // Find all controllers on this element
                const controllers = application.getControllerForElementAndIdentifier(
                  $drawerElement,
                  'flowbite--drawer-target'
                );

                if (controllers) {
                  console.log('Found drawer target controller:', controllers);

                  // Call the appropriate action on the controller
                  if ('#{action}' === 'hide') {
                    controllers.hide();
                    console.log('Called hide() on drawer controller');
                  }
                  if ('#{action}' === 'show') {
                    controllers.show();
                    console.log('Called show() on drawer controller');
                  }
                  if ('#{action}' === 'focusFirstAutofocusField') {
                    controllers.focusFirstAutofocusField();
                    console.log('Called focusFirstAutofocusField() on drawer controller');
                  }
                  #{if reset_forms
                      "
                    // Reset forms regardless of the action
                    controllers.resetForms();
                    console.log('Called resetForms() on drawer controller');
                    "
                    else
                      ""
                    end}
                } else {
                  console.error('Drawer target controller not found on element');
                }
              } else {
                console.error('Element does not have drawer-target controller');
              }
            } else {
              console.error('Drawer element not found:', '#{drawer_id}');
            }
          } catch (e) {
            console.error('Error calling #{action}() on drawer:', e);
          }
        })();
      </script>")
    )
  end

  def hide_drawer(drawer_id, options = {})
    drawer_action(drawer_id, options.merge(action: "hide"))
  end

  def show_drawer(drawer_id, options = {})
    drawer_action(drawer_id, options.merge(action: "show"))
  end
end

Turbo::Streams::TagBuilder.prepend(TurboStreamsExtension)
