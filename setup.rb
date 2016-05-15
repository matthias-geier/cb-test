require 'json'
require 'redis'

Cargobull::Initialize.dir "controller"

$env = Cargobull.env.update(Cargobull.env.get, {
  default_path: "index.html",
  ctype: "application/json",
  e403: { status: 403, body: "Forbidden" }.to_json,
  e404: { status: 404, body: "Not found" }.to_json,
  e405: { status: 405, body: "Method not allowed" }.to_json,
  e500: { status: 500, body: "Internal error" }.to_json,
  transform_in: ->(v) do
    begin
      v[:body] = JSON.parse(v[:body].read) if v[:body].respond_to?(:read)
      [v]
    rescue JSON::ParserError
      [v]
    end
  end,
  transform_out: ->(v){ JSON.dump(v) }
})
