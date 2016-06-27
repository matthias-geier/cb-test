require 'grape'
require 'redis'

Dir["model/*.rb"].each { |f| require "./#{f}" }
require './grapes/universe_api.rb'
require './grapes/key_api.rb'

redis_uri = URI.parse(ENV["REDIS_URL"] || "redis://localhost:6379/")
$redis = Redis.new(host: redis_uri.host, port: redis_uri.port, db: 0,
  password: redis_uri.password)

class ServeRoot
  def initialize(app)
    @app = app
  end

  def call(env)
    if env["PATH_INFO"] =~ /^\/api\// || env["PATH_INFO"] =~ /^\/key\//
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

use Rack::Session::Cookie, key: "d9d8fJkJKD30sd", path: "/", secret: "moobar",
  expire_after: 2592000
use ServeRoot
run Rack::Cascade.new([KeyApi, UniverseApi])
