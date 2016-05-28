require "securerandom"

module Universe
  extend self

  LIST_KEY = "universes"

  def universe_key(id)
    "#{LIST_KEY}/#{id}"
  end

  def new_id
    SecureRandom.hex(6)
  end

  def exists?(id)
    $redis.exists(universe_key(id))
  end

  def create
    while (id = new_id)
      break unless exists?(id)
    end

    touch(id)
    $redis.sadd(LIST_KEY, id)
    AccessKey.create(id)
    return to_h(id)
  end

  def list(access_keys)
    AccessKey.list_uids(access_keys).map { |uid| to_h(uid, false) }
  end

  def update(id, fields)
    fields.each do |field, value|
      if value.nil? || value.empty?
        $redis.hdel(universe_key(id), field)
      else
        $redis.hset(universe_key(id), field, value)
      end
    end
    touch(id)
    return to_h(id)
  end

  def delete(id)
    return false unless exists?(id)
    Character.list(id).each { |sid| Character.delete(id, sid) }
    $redis.del(Character.list_key(id))
    Story.list(id).each { |story| Story.delete(id, story["id"]) }
    $redis.del(Story.list_key(id))
    AccessKey.list(id).each { |k| $redis.del(AccessKey.access_key_key(k)) }
    $redis.del(AccessKey.access_list_key(id))
    $redis.del(universe_key(id))
    $redis.srem(LIST_KEY, id)
    return true
  end

  def touch(id)
    $redis.hset(universe_key(id), "updated_at", Time.now.to_i)
  end

  def to_h(id, full = true)
    db_hash = $redis.hgetall(universe_key(id))
    db_hash["id"] = id
    db_hash["updated_at"] = Time.at(db_hash["updated_at"].to_i).utc
    db_hash["access_keys"] = AccessKey.list(id)
    return db_hash unless full

    db_hash["characters"] = Character.list(id)
    db_hash["stories"] = Story.list(id)
    return db_hash
  end
end
