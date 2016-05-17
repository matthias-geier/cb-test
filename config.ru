require 'grape'
require 'redis'

Dir["model/*.rb"].each { |f| require "./#{f}" }

redis_uri = URI.parse(ENV["REDIS_URL"] || "redis://localhost:6379/")
$redis = Redis.new(host: redis_uri.host, port: redis_uri.port, db: 0,
  password: redis_uri.password)

module StoryHelpers
  extend Grape::API::Helpers

  def validate_uid!
    return if Universe.exists?(params[:uid] || params[:id])
    error!({status: 404, body: "Universe not found"}, 404)
  end

  def validate_sid!
    return if Story.exists?(params[:uid], params[:sid] || params[:id])
    error!({status: 404, body: "Story not found in Universe"}, 404)
  end

  def validate_pose!
    return if Story.pose_exists?(params[:uid], params[:sid], params[:timestamp])
    error!({status: 404, body: "Story pose not found"}, 404)
  end

  def validate_cid!
    return if Character.exists?(params[:uid], params[:cid] || params[:id])
    error!({status: 404, body: "Character not found in Universe"}, 404)
  end
end

class UniverseApi < Grape::API
  version 'v1', using: :accept_version_header
  format :json
  prefix :api

  helpers StoryHelpers

  desc "provides access to the universe"
  namespace :universe do
    get do
      {status: 200, body: Universe.list}
    end

    params do
      requires :id, type: String, desc: "Universe id"
    end
    get ":id" do
      validate_uid!
      {status: 200, body: Universe.to_h(params[:id])}
    end

    post do
      {status: 200, body: Universe.create}
    end

    params do
      requires :id, type: String, desc: "Universe id"
      optional :title, type: String, desc: "Story title"
    end
    put ":id" do
      validate_uid!
      {status: 200, body: Universe.update(params[:id], declared(params))}
    end

    params do
      requires :id, type: String, desc: "Universe id"
    end
    delete ":id" do
      validate_uid!
      Universe.delete(params[:id])
      {status: 200, body: {deleted: params[:id]}}
    end

    params do
      requires :uid, type: String, desc: "Universe id"
    end
    namespace ":uid" do
      before_validation do
        validate_uid!
      end

      namespace :character do
        get do
          {status: 200, body: Character.list(params[:uid])}
        end

        params do
          requires :id, type: String, desc: "Character id"
        end
        get ":id" do
          validate_cid!
          {status: 200, body: Character.to_h(params[:uid], params[:id])}
        end

        params do
          requires :id, type: String, desc: "Unique character id"
        end
        post do
          if Character.exists?(params[:uid], params[:id])
            error!({status: 500, body: "Character id taken"}, 500)
          end
          {status: 200, body: Character.create(params[:uid], params)}
        end

        params do
          requires :id, type: String, desc: "Character id"
        end
        put ":id" do
          validate_cid!
          {
            status: 200,
            body: Character.update(params[:uid], params[:id], params)
          }
        end

        params do
          requires :id, type: String, desc: "Character id"
        end
        delete ":id" do
          validate_cid!
          {status: 200, body: Character.delete(params[:uid], params[:id])}
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
          requires :id, type: String, desc: "Story id"
        end
        get ":id" do
          validate_sid!
          {status: 200, body: Story.to_h(params[:id])}
        end

        params do
          requires :title, type: String, desc: "Story title"
        end
        post do
          {status: 200, body: Story.create(params[:uid], declared(params))}
        end

        params do
          requires :id, type: String, desc: "Story id"
          optional :title, type: String, desc: "Story title"
        end
        put ":id" do
          validate_sid!
          {status: 200, body: Story.update(params[:id], declared(params))}
        end

        params do
          requires :id, type: String, desc: "Story id"
        end
        delete ":id" do
          validate_sid!
          {status: 200, body: Story.delete(params[:id])}
        end

        params do
          requires :sid, type: String, desc: "Story id"
        end
        namespace ":sid" do
          before_validation do
            validate_sid!
          end

          params do
            requires :pose, type: String, desc: "Pose text"
          end
          post "pose" do
            {status: 200, body: Story.pose(params[:sid], params[:pose])}
          end

          params do
            requires :timestamp, type: String, desc: "Pose timestamp"
          end
          delete "pose" do
            {status: 200, body: Story.unpose(params[:sid], params[:timestamp])}
          end
        end
      end
    end
  end
end

class ServeRoot
  def initialize(app)
    @app = app
  end

  def call(env)
    if env["PATH_INFO"] =~ /^\/api\//
      @app.call(env)
    else
      files = Rack::Static.new(@app, root: "files", urls: [""])
      status, headers, response = files.call(env)
      if status == 404
        env["PATH_INFO"] = "/index.html"
        status, headers, response = files.call(env)
      end
      return [status, headers, response]
    end
  end
end

use ServeRoot
run UniverseApi
