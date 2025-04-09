class LazyFrameComponent < ViewComponent::Base
  attr_reader :id, :url, :load_on, :loading_class

  def initialize(id:, url: nil, load_on: "connect", loading_class: "animate-pulse bg-gray-200 rounded-md")
    @id = id
    @url = url
    @load_on = load_on
    @loading_class = loading_class
  end

  def load_on_json
    if @load_on.is_a?(Hash)
      { strategy: "event", event: @load_on[:event] }.to_json
    else
      { strategy: @load_on }.to_json
    end
  end

  def frame_id
    id.to_s.gsub(/[^a-z0-9_]/i, "_").downcase
  end
end
