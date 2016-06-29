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

  def validate_cid!
    return if Character.exists?(params[:uid], params[:cid])
    error!({status: 404, body: "Character not found in Universe"}, 404)
  end
end

module SessionHelpers
  extend Grape::API::Helpers

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
    return if AccessKey.access?(access_keys, params[:uid])
    error!({status: 403, body: "Cannot access Universe"}, 403)
  end

  def last_access_key!
    return if AccessKey.list(params[:uid]).size > 1
    error!({status: 500, body: "Cannot destroy last access key"}, 500)
  end
end

class UniverseApi < Grape::API
  version 'v1', using: :accept_version_header
  format :json
  prefix :api

  before do
    header "Cache-Control", "no-cache"
  end

  helpers SessionHelpers
  helpers StoryHelpers

  namespace :session do
    get do
      {status: 200, body: access_keys}
    end

    params do
      requires :keys, type: Array, desc: "Known universe access keys"
    end
    post do
      {status: 200, body: override_access_keys!(params["keys"])}
    end
  end

  namespace :universe do
    get do
      {status: 200, body: Universe.list(access_keys)}
    end

    params do
      requires :uid, type: String, desc: "Universe id"
    end
    get ":uid" do
      validate_uid!
      access_uid!
      {status: 200, body: Universe.to_h(params[:uid])}
    end

    post do
      universe = Universe.create
      append_access_keys!(universe["access_keys"])
      {status: 200, body: universe}
    end

    params do
      requires :uid, type: String, desc: "Universe id"
      optional :title, type: String, desc: "Universe title"
    end
    put ":uid" do
      validate_uid!
      access_uid!
      {status: 200, body: Universe.update(params[:uid], declared(params))}
    end

    params do
      requires :uid, type: String, desc: "Universe id"
    end
    delete ":uid" do
      validate_uid!
      access_uid!
      Universe.delete(params[:uid])
      {status: 200, body: {deleted: params[:uid]}}
    end

    params do
      requires :uid, type: String, desc: "Universe id"
    end
    post ":uid/access_key" do
      validate_uid!
      access_uid!
      AccessKey.create(params[:uid])
      {status: 200, body: Universe.to_h(params[:uid])}
    end

    params do
      requires :uid, type: String, desc: "Universe id"
      requires :access_key, type: String, desc: "Access key"
    end
    delete ":uid/access_key" do
      validate_uid!
      access_uid!
      last_access_key!
      AccessKey.delete(params[:access_key])
      {status: 200, body: Universe.to_h(params[:uid])}
    end

    params do
      requires :uid, type: String, desc: "Universe id"
    end
    namespace ":uid" do
      before_validation do
        validate_uid!
      end

      get "backup" do
        {status: 200, body: Universe.backup(params[:uid])}
      end

      params do
        requres :data, type: String, desc: "Universe dump"
      end
      post "restore" do
        Universe.restore(params[:uid], params[:data])
        {status: 200, body: true)}
      end

      namespace :character do
        get do
          {status: 200, body: Character.list(params[:uid])}
        end

        params do
          requires :cid, type: String, desc: "Character id"
        end
        get ":cid" do
          validate_cid!
          {status: 200, body: Character.to_h(params[:uid], params[:cid])}
        end

        params do
          requires :cid, type: String, regexp: /\A[a-z_]+\z/,
            desc: "Unique character id"
        end
        post do
          if Character.exists?(params[:uid], params[:cid])
            error!({status: 500, body: "Character id taken"}, 500)
          end
          {status: 200, body: Character.create(params[:uid], params)}
        end

        params do
          requires :cid, type: String, desc: "Character id"
        end
        put ":cid" do
          validate_cid!
          {
            status: 200,
            body: Character.update(params[:uid], params[:cid], params)
          }
        end

        params do
          requires :cid, type: String, desc: "Character id"
        end
        delete ":cid" do
          validate_cid!
          {status: 200, body: Character.delete(params[:uid], params[:cid])}
        end
      end
    end

    params do
      requires :uid, type: String, desc: "Universe id"
    end
    namespace ":uid" do
      before_validation do
        validate_uid!
      end

      namespace :story do
        get do
          {status: 200, body: Story.list(params[:uid])}
        end

        params do
          requires :num, type: String, regexp: /\A\d+\z/, desc: "Pose num"
        end
        put "swap" do
          Story.swap_story(params[:uid], params[:num])
          {status: 200, body: Story.list(params[:uid])}
        end

        params do
          requires :sid, type: String, desc: "Story id"
        end
        get ":sid" do
          validate_sid!
          {status: 200, body: Story.to_h(params[:uid], params[:sid])}
        end

        params do
          requires :title, type: String, allow_blank: false, desc: "Story title"
        end
        post do
          {status: 200, body: Story.create(params[:uid], declared(params))}
        end

        params do
          requires :sid, type: String, desc: "Story id"
          optional :title, type: String, allow_blank: false, desc: "Story title"
        end
        put ":sid" do
          validate_sid!
          {status: 200, body: Story.update(params[:uid], params[:sid],
            declared(params))}
        end

        params do
          requires :sid, type: String, desc: "Story id"
        end
        delete ":sid" do
          validate_sid!
          {status: 200, body: Story.delete(params[:uid], params[:sid])}
        end

        params do
          requires :sid, type: String, desc: "Story id"
        end
        namespace ":sid" do
          before_validation do
            validate_sid!
          end

          params do
            requires :pose, type: String, regexp: /\A.+\z/m,
              desc: "Pose text"
          end
          post "pose" do
            {status: 200, body: Story.pose(params[:uid], params[:sid],
              params[:pose])}
          end

          params do
            requires :num, type: String, desc: "Pose num"
          end
          delete "pose" do
            {status: 200, body: Story.unpose(params[:uid], params[:sid],
              params[:num])}
          end

          params do
            requires :num, type: String, regexp: /\A\d+\z/, desc: "Pose num"
          end
          put "pose/swap" do
            Story.swap_pose(params[:uid], params[:sid], params[:num])
            {status: 200, body: Story.to_h(params[:uid], params[:sid])}
          end
        end
      end
    end
  end
end
