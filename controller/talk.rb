
module Talk
  REDIS_URI = URI.parse(ENV["REDIS_URL"] || "redis://localhost:6379/")
  REDIS = Redis.new(host: REDIS_URI.host, port: REDIS_URI.port, db: 0,
    password: REDIS_URI.password)

  def self.read(params)
    { status: 200, body: REDIS.sort("channels", order: "alpha") }
  end

  def self.create(params)
    payload = params[:body]
    if !payload.is_a?(Array) ||
      !payload.all?{ |p| p.is_a?(String) && p =~ /^[a-z]+$/ }

      return { status: 500, body: "Malformed payload" }
    end

    added, existed = payload.partition do |channel|
      REDIS.sadd("channels", channel)
    end

    return { status: 200, body: { added: added,
      existed: existed } }
  end

  def self.update(params)
  end

  def self.delete(params)
    payload = params[:body]
    if !payload.is_a?(Array) || !payload.all?{ |p| p.is_a?(String) }
      return { status: 500, body: "Malformed payload" }
    end

    deleted, not_found = payload.partition do |channel|
      REDIS.srem("channels", channel)
    end

    return { status: 200, body: { deleted: deleted,
      not_found: not_found } }
  end
end
