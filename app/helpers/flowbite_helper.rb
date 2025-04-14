module FlowbiteHelper
  # Modal Trigger Button Helper
  #
  # @param target_id [String] ID of the modal to be triggered (without #)
  # @param options [Hash] Additional options for button
  # @option options [String] :class CSS classes for the button
  # @option options [String] :text Button text (if not using block)
  # @option options [String] :type Button type (default: "button")
  # @option options [Hash] :data Additional data attributes to add
  # @option options [Array] :controllers Additional controllers to add
  # @option options [String] :placement Modal placement
  # @option options [String] :action Toggle/Show/Hide action
  # @option options [String] :class_override Complete replacement for default classes
  # @yield Block content for the button
  def flowbite_modal(id, options = {}, &block)
    default_options = {
      class: "hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full h-full",
      tabindex: "-1",
      "aria-hidden": "true"
    }

    # Handle class overrides or merging
    if options[:class_override]
      options[:class] = options[:class_override]
      options.delete(:class_override)
    elsif options[:class].present?
      options[:class] = TailwindMerge::Merger.new.merge([default_options[:class], options[:class]])
    end

    options = default_options.merge(options)
    options[:id] = id
    options[:data] ||= {}
    options[:data][:controller] = "flowbite--modal-target"

    content_tag(:div, options, &block)
  end

  def flowbite_modal_trigger(target_id, options = {}, &block)
    default_options = {
      type: "button",
      class: "text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800",
      action: "toggle"
    }

    # Handle class overrides or merging
    if options[:class_override]
      options[:class] = options[:class_override]
      options.delete(:class_override)
    elsif options[:class].present?
      options[:class] = TailwindMerge::Merger.new.merge([default_options[:class], options[:class]])
    end

    options = default_options.merge(options)

    # Extract controllers and data attributes
    controllers = ["flowbite--modal-trigger"]
    controllers.concat(Array(options.delete(:controllers))) if options[:controllers]

    # Setup data attributes
    data = {
      controller: controllers.join(" "),
      "flowbite--modal-trigger-flowbite--modal-target-outlet": "##{target_id}",
      "flowbite--modal-trigger-action-value": options[:action],
      "flowbite--modal-trigger-close-parent-value": options[:close_parent]
    }

    # Add placement if specified
    data["flowbite--modal-trigger-placement-value"] = options[:placement] if options[:placement]

    # Merge any additional data attributes
    data.merge!(options[:data] || {})

    # Replace options data with our processed data
    options[:data] = data

    # Remove our custom options that aren't HTML attributes
    options.delete(:controllers)
    options.delete(:placement)
    options.delete(:action)

    # Create the button
    if block_given?
      button_tag(options, &block)
    else
      button_tag(options[:text], options)
    end
  end

  def flowbite_modal_trigger_x(target_id, options = {})
    # Default options for X close button
    default_options = {
      # Override the default modal trigger button classes entirely for the X button
      class_override: "text-gray-400 absolute top-2.5 right-2.5 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white",
      action: "hide",
      title: "Close modal",
      aria: { label: "Close modal" }
    }

    # Handle class overrides or merging
    if options[:class_override]
      options[:class] = options[:class_override]
      options.delete(:class_override)
    elsif options[:class].present?
      options[:class] = TailwindMerge::Merger.new.merge([default_options[:class], options[:class]])
    end

    # Merge provided options with defaults
    options = default_options.merge(options)

    # Call the existing flowbite_modal_trigger helper with block
    flowbite_modal_trigger(target_id, options) do
      icon(:x_close) +
      content_tag(:span, options.delete(:title), class: "sr-only")
    end
  end

  def resource_modal_trigger(target_id, resource_path, options = {}, &block)
    options[:controllers] ||= []
    options[:controllers] << "resource-modal"
    options[:data] ||= {}
    options[:data]["resource-modal-path-value"] = resource_path

    flowbite_modal_trigger(target_id, options, &block)
  end

  def flowbite_dropdown(id, options = {}, &block)
    default_options = {
      class: "hidden z-10 w-44 bg-white rounded divide-y divide-gray-100 shadow dark:bg-gray-700 dark:divide-gray-600"
    }

    # Handle class overrides or merging
    if options[:class_override]
      options[:class] = options[:class_override]
      options.delete(:class_override)
    elsif options[:class].present?
      options[:class] = TailwindMerge::Merger.new.merge([default_options[:class], options[:class]])
    end

    options = default_options.merge(options)
    options[:id] = id
    options[:data] ||= {}
    options[:data][:controller] = "flowbite--dropdown-target"

    content_tag(:div, options, &block)
  end

  def flowbite_dropdown_trigger(target_id, options = {}, &block)
    default_options = {
      type: "button",
      # TODO: do we want to have these default classes for a dropdown?
      # class: "text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-4 py-2.5 text-center inline-flex items-center"
      class: ""
    }

    # Handle class overrides or merging
    if options[:class_override]
      options[:class] = options[:class_override]
      options.delete(:class_override)
    elsif options[:class].present?
      options[:class] = TailwindMerge::Merger.new.merge([default_options[:class], options[:class]])
    end

    options = default_options.merge(options)

    # Extract controllers and data attributes
    controllers = ["flowbite--dropdown-trigger"]
    controllers.concat(Array(options.delete(:controllers))) if options[:controllers]

    # Setup data attributes
    data = {
      controller: controllers.join(" "),
      "flowbite--dropdown-trigger-flowbite--dropdown-target-outlet": "##{target_id}"
    }

    # Add placement if specified
    data["flowbite--dropdown-trigger-placement-value"] = options[:placement] if options[:placement]

    # Merge any additional data attributes
    data.merge!(options[:data] || {})

    # Replace options data with our processed data
    options[:data] = data

    # Remove our custom options that aren't HTML attributes
    options.delete(:controllers)
    options.delete(:placement)

    # Create the button
    if block_given?
      button_tag(options, &block)
    else
      button_tag(options[:text], options)
    end
  end

  def flowbite_dismiss(id, options = {}, &block)
    default_options = {
      class: "p-4 mb-4 text-red-800 border border-red-300 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-800",
      role: "alert"
    }

    # Handle class overrides or merging
    if options[:class_override]
      options[:class] = options[:class_override]
      options.delete(:class_override)
    elsif options[:class].present?
      options[:class] = TailwindMerge::Merger.new.merge([default_options[:class], options[:class]])
    end

    options = default_options.merge(options)
    options[:id] = id
    options[:data] ||= {}
    options[:data][:controller] = "flowbite--dismiss-target"

    content_tag(:div, options, &block)
  end

  def flowbite_dismiss_trigger(target_id, options = {}, &block)
    default_options = {
      type: "button",
      class: "text-red-800 bg-transparent border border-red-800 hover:bg-red-900 hover:text-white focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-xs px-3 py-1.5 text-center dark:hover:bg-red-600 dark:border-red-600 dark:text-red-500 dark:hover:text-white dark:focus:ring-red-800",
      aria: { label: "Close" }
    }

    # Handle class overrides or merging
    if options[:class_override]
      options[:class] = options[:class_override]
      options.delete(:class_override)
    elsif options[:class].present?
      options[:class] = TailwindMerge::Merger.new.merge([default_options[:class], options[:class]])
    end

    options = default_options.merge(options)

    # Extract controllers and data attributes
    controllers = ["flowbite--dismiss-trigger"]
    controllers.concat(Array(options.delete(:controllers))) if options[:controllers]

    # Setup data attributes
    data = {
      controller: controllers.join(" "),
      "flowbite--dismiss-trigger-flowbite--dismiss-target-outlet": "##{target_id}"
    }

    # Merge any additional data attributes
    data.merge!(options[:data] || {})

    # Replace options data with our processed data
    options[:data] = data

    # Remove our custom options that aren't HTML attributes
    options.delete(:controllers)

    # Create the button
    if block_given?
      button_tag(options, &block)
    else
      button_tag(options[:text], options)
    end
  end

  def flowbite_tooltip(id, options = {}, &block)
    default_options = {
      class: "absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700",
      role: "tooltip"
    }

    # Handle class overrides or merging
    if options[:class_override]
      options[:class] = options[:class_override]
      options.delete(:class_override)
    elsif options[:class].present?
      options[:class] = TailwindMerge::Merger.new.merge([default_options[:class], options[:class]])
    end

    options = default_options.merge(options)
    options[:id] = id
    options[:data] ||= {}
    options[:data][:controller] = "flowbite--tooltip-target"

    content_tag(:div, options) do
      (block_given? ? capture(&block) : options[:text].to_s) +
      content_tag(:div, "", class: "tooltip-arrow", data: { popper_arrow: true })
    end
  end

  def flowbite_tooltip_trigger(target_id, options = {}, &block)
    default_options = {
      type: "text",
      class: ""
    }

    # Handle class overrides or merging
    if options[:class_override]
      options[:class] = options[:class_override]
      options.delete(:class_override)
    elsif options[:class].present?
      options[:class] = TailwindMerge::Merger.new.merge([default_options[:class], options[:class]])
    end

    options = default_options.merge(options)

    # Extract controllers and data attributes
    controllers = ["flowbite--tooltip-trigger"]
    controllers.concat(Array(options.delete(:controllers))) if options[:controllers]

    # Setup data attributes
    data = {
      controller: controllers.join(" "),
      "tooltip-target": target_id, # Add the data-tooltip-target attribute
      "flowbite--tooltip-trigger-flowbite--tooltip-target-outlet": "##{target_id}"
    }

    # Add placement and trigger-type if specified
    # placement options: top, bottom, left, right
    # trigger_type options: hover, click, focus
    data["flowbite--tooltip-trigger-placement-value"] = options[:placement] if options[:placement]
    data["flowbite--tooltip-trigger-trigger-type-value"] = options[:trigger_type] if options[:trigger_type]

    # Merge any additional data attributes
    data.merge!(options[:data] || {})

    # Replace options data with our processed data
    options[:data] = data

    # Remove our custom options that aren't HTML attributes
    options.delete(:controllers)
    options.delete(:placement)
    options.delete(:trigger_type)

    # Create the element - button or span depending on type
    if options[:type] == "text" || options[:type] == "span"
      options.delete(:type)  # Remove type as it's not valid for span
      content_tag(:span, options) do
        block_given? ? capture(&block) : options[:text].to_s
      end
    else
      if block_given?
        button_tag(options, &block)
      else
        button_tag(options[:text], options)
      end
    end
  end
end