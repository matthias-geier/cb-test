require "securerandom"

module Universe
  extend self

  LIST_KEY = "universes"

  def new_id
    SecureRandom.hex
  end

  def exists?(id)
    $redis.exists(id)
  end

  def create
    while (id = new_id)
      break unless $redis.exists(id)
    end

    touch(id)
    $redis.sadd(LIST_KEY, id)
    return to_h(id)
  end

  def list
    $redis.smembers(LIST_KEY)
  end

  def delete(id)
    return false unless exists?(id)
    Character.list(id).each { |sid| Character.delete(sid) }
    $redis.del(Character.list_key(id))
    Story.list(id).each { |sid| Story.delete(sid) }
    $redis.del(Story.list_key(id))
    $redis.del(Story.pose_key(id))
    $redis.del(id)
    $redis.srem(LIST_KEY, id)
    return true
  end

  def touch(id)
    $redis.hset(id, "updated_at", Time.now.to_i)
  end

  def to_h(id)
    db_hash = $redis.hgetall(id)
    db_hash["id"] = id
    db_hash["updated_at"] = Time.at(db_hash["updated_at"].to_i).utc
    db_hash["characters"] = Character.list(id)
    db_hash["stories"] = Story.list(id)

    return db_hash
  end
end
