module LazyFrames
  extend ActiveSupport::Concern

  # Sends a turbo_stream response for lazy-loaded frames
  #
  # @param frames [Hash] a hash mapping frame IDs to rendering options
  # Example:
  #   render_lazy_frames({
  #     "user_stats" => { partial: "dashboard/user_stats", locals: { user: current_user } },
  #     "recent_activity" => { partial: "dashboard/recent_activity", locals: { activities: @activities } }
  #   })
  def render_lazy_frames(frames)
    respond_to do |format|
      format.turbo_stream do
        streams = frames.map do |frame_id, options|
          if options.is_a?(Hash)
            # Handle partial options
            turbo_stream.update(frame_id, **options, method: :morph)
          else
            # Handle template string
            turbo_stream.update(frame_id, template: options, method: :morph)
          end
        end

        render turbo_stream: streams
      end
    end
  end
end
