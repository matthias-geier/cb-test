module StoryHelpers
  extend Grape::API::Helpers

  def validate_uid!
    return if Universe.exists?(params[:uid])
    error!({status: 404, body: "Universe not found"}, 404)
  end

  def validate_sid!
    return if Story.exists?(params[:uid], params[:sid])
    error!({status: 404, body: "Story not found in Universe"}, 404)
  end

  def validate_pose!
    return if Story.pose_exists?(params[:uid], params[:sid], params[:num])
    error!({status: 404, body: "Story pose not found"}, 404)
  end

  def validate_pid!
    return if Prop.exists?(params[:uid], params[:pid])
    error!({status: 404, body: "Prop not found in Universe"}, 404)
  end
end

module ParamHelpers
  extend Grape::API::Helpers

  def validate_params!
    if params.values.any? { |v| v.to_s.length > 1000 }
      error!({status: 400, body: "Field can contain max 1000 characters"}, 400)
    elsif params.count > 25
      error!({status: 400, body: "Max 25 fields allowed"}, 400)
    end
  end
end

module MessageHelpers
  extend Grape::API::Helpers

  def broadcast!
    action = {"PUT" => "update", "POST" => "create", "DELETE" => "delete"}
    payload = {action: action[route.options[:method]]}
    payload[:scope] = route.options[:namespace].split("/").grep(/^[^:]/).last
    [:uid, :sid, :access_key, :pid].each do |elem|
      payload[elem] = params[elem] if params.key?(elem)
    end
    AccessKey.broadcast(access_keys, payload)
  end
end

module SessionHelpers
  extend Grape::API::Helpers
  include SimpleCan

  def access_keys
    JSON.parse(env["rack.session"]["keys"] || "[]").select do |k|
      AccessKey.exists?(k)
    end
  end

  def append_access_keys!(keys)
    updated_keys = (access_keys | keys).select { |k| AccessKey.exists?(k) }
    return override_access_keys!(updated_keys)
  end

  def override_access_keys!(keys)
    env["rack.session"]["keys"] = keys.to_json
    return keys
  end

  def access_uid!
    relevant_keys = AccessKey.relevant_for(access_keys, params[:uid])
    max_cap = AccessKey.max_capability(relevant_keys)
    !relevant_keys.empty? &&
      (UniverseApi.capability = SimpleCan.strategy.roles[max_cap]) ||
      error!({status: 403, body: "Cannot access Universe"}, 403)
  end

  def last_access_key!
    cap = SimpleCan.strategy.to_capability("manage")
    keys = AccessKey.list(params[:uid]) - [params[:access_key]]
    if AccessKey.max_capability(keys) == cap ||
       declared(params)["cap"].nil?
      return
    end
    error!({status: 409, body: "Cannot modify last manage access key"}, 409)
  end
end

class UniverseApi < Grape::API
  include SimpleCan

  version 'v2', using: :accept_version_header
  format :json
  prefix :api

  before do
    header "Cache-Control", "no-cache"
  end

  after do
    UniverseApi.capability = nil
  end

  rescue_from SimpleCan::Unauthorized do |e|
    UniverseApi.capability = nil
    error!({status: 401, body: e.message}, 401)
  end

  helpers MessageHelpers
  helpers SessionHelpers
  helpers StoryHelpers
  helpers ParamHelpers

  namespace :session do
    get do
      {status: 200, body: access_keys}
    end

    params do
      requires :access_keys, type: Array, desc: "Known universe access keys"
    end
    post do
      {status: 200, body: override_access_keys!(params["access_keys"])}
    end
  end

  namespace :universe do
    get do
      {status: 200, body: Universe.list(access_keys)}
    end

    post do
      UniverseApi.capability = "manage" # of course I can manage my new stuff
      universe = Universe.create
      append_access_keys!(universe["access_keys"].map { |k| k["id"] })
      status(201)
      {status: 201, body: universe}
    end

    params do
      requires :uid, type: String, desc: "Universe id"
    end
    namespace ":uid" do
      after_validation do
        validate_uid!
        access_uid!
      end

      get do
        read!
        {status: 200, body: Universe.to_h(params[:uid])}
      end

      get "messages" do
        {status: 200, body: AccessKey.messages(params[:uid], access_keys)}
      end

      params do
        optional :title, type: String, desc: "Universe title"
      end
      put do
        write!
        data = Universe.update(params[:uid], declared(params))
        broadcast!
        {status: 200, body: data}
      end

      delete do
        manage!
        Universe.delete(params[:uid])
        status(204)
        ""
      end

      namespace "access_key" do
        after_validation do
          manage!
        end

        post do
          AccessKey.create(params[:uid])
          status(201)
          {status: 201, body: Universe.to_h(params[:uid])}
        end

        params do
          requires :access_key, type: String, desc: "Access key"
        end
        namespace ":access_key" do
          after_validation do
            last_access_key!
          end

          params do
            optional :cap, type: String, desc: "Capability",
              values: SimpleCan.strategy.roles
            optional :title, type: String, desc: "Access key title"
          end
          put do
            validate_params!
            {
              status: 200,
              body: AccessKey.update(params[:access_key], declared(params))
            }
          end

          delete do
            AccessKey.delete(params[:access_key])
            status(204)
            ""
          end
        end
      end

      get "backup" do
        manage!
        data = Universe.backup(params[:uid])
        content_type "application/octet-stream"
        title = "backup_#{params[:uid]}"
        title += "_#{data["title"]}" if data["title"]
        header['Content-Disposition'] = "attachment;filename=#{title}.json"
        env['api.format'] = :binary
        data.to_json
      end

      params do
        requires :data, type: Hash, desc: "Universe dump"
      end
      post "restore" do
        manage!
        Universe.restore(params[:uid], params[:data])
        broadcast!
        {status: 200, body: true}
      end

      namespace :prop do
        get do
          read!
          {status: 200, body: Prop.list(params[:uid])}
        end

        params do
          requires :pid, type: String, regexp: /\A[a-z_]+\z/,
            desc: "Unique Prop id"
        end
        post do
          write!
          if Prop.exists?(params[:uid], params[:pid])
            error!({status: 400, body: "Prop id taken"}, 400)
          end

          if params[:pid].size >= 25
            error!({status: 400, body: "Prop id must be shorter than 25"}, 400)
          end
          validate_params!
          broadcast!
          status(201)
          {status: 201, body: Prop.create(params[:uid], params)}
        end

        params do
          requires :pid, type: String, desc: "Prop id"
        end
        namespace ":pid" do
          after_validation do
            validate_pid!
          end

          get do
            read!
            {status: 200, body: Prop.to_h(params[:uid], params[:pid])}
          end

          put do
            write!
            validate_params!
            data = Prop.update(params[:uid], params[:pid], params)
            broadcast!
            {status: 200, body: data}
          end

          delete do
            write!
            Prop.delete(params[:uid], params[:pid])
            broadcast!
            status(204)
            ""
          end
        end
      end

      namespace :story do
        get do
          read!
          {status: 200, body: Story.list(params[:uid])}
        end

        params do
          requires :num, type: String, regexp: /\A\d+\z/, desc: "Pose num"
        end
        put "swap" do
          write!
          Story.swap_story(params[:uid], params[:num])
          broadcast!
          {status: 200, body: Story.list(params[:uid])}
        end

        params do
          requires :title, type: String, allow_blank: false, desc: "Story title"
        end
        post do
          write!
          broadcast!
          status(201)
          {status: 201, body: Story.create(params[:uid], declared(params))}
        end

        params do
          requires :sid, type: String, desc: "Story id"
        end
        namespace ":sid" do
          after_validation do
            validate_sid!
          end

          get do
            read!
            {status: 200, body: Story.to_h(params[:uid], params[:sid])}
          end
        end

        params do
          requires :sid, type: String, desc: "Story id"
        end
        namespace ":sid" do
          before_validation do
            validate_sid!
          end

          after_validation do
            write!
          end

          params do
            optional :title, type: String, allow_blank: false,
              desc: "Story title"
          end
          put do
            data = Story.update(params[:uid], params[:sid], declared(params))
            broadcast!
            {status: 200, body: data}
          end

          delete do
            Story.delete(params[:uid], params[:sid])
            broadcast!
            status(204)
            ""
          end

          params do
            requires :pose, type: String, regexp: /\A.+\z/m,
              desc: "Pose text"
          end
          post "pose" do
            broadcast!
            status(201)
            {status: 201, body: Story.pose(params[:uid], params[:sid],
              params[:pose])}
          end

          params do
            requires :num, type: String, desc: "Pose num"
          end
          delete "pose" do
            Story.unpose(params[:uid], params[:sid], params[:num])
            broadcast!
            status(204)
            ""
          end

          params do
            requires :num, type: String, regexp: /\A\d+\z/, desc: "Pose num"
          end
          put "pose/swap" do
            Story.swap_pose(params[:uid], params[:sid], params[:num])
            broadcast!
            {status: 200, body: Story.to_h(params[:uid], params[:sid])}
          end
        end
      end
    end
  end
end
