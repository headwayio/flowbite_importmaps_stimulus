class LazyFrameComponent < ViewComponent::Base
  attr_reader :id, :url, :load_on, :loading_class

  def initialize(id:, url: nil, load_on: "connect", loading_class: "animate-pulse bg-gray-200 rounded-md")
    @id = id
    @url = url
    @load_on = load_on
    @loading_class = loading_class
  end

  def containing_component_id
    if @load_on.is_a?(Hash)
      # Extract the component ID from the nested event hash
      # Format: { event: { show: 'updateProductModal' }}
      @load_on[:event].values.first
    else
      nil
    end
  end

  def load_on_event_type
    if @load_on.is_a?(Hash) && @load_on[:event].is_a?(Hash)
      # Get the event type (e.g., "show")
      @load_on[:event].keys.first.to_s
    else
      "show" # Default to "show" for backward compatibility
    end
  end

  def load_on_json
    if @load_on.is_a?(Hash)
      { strategy: @load_on.keys.first.to_s }.to_json
    else
      { strategy: @load_on }.to_json
    end
  end

  def frame_id
    id.to_s.gsub(/[^a-z0-9_]/i, "_").downcase
  end
end
