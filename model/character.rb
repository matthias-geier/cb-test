module Character
  extend self

  FIELDS = %w(id uid cid updated_at)

  LIST_KEY = "characters"

  def list_key(uid)
    "#{Universe.universe_key(uid)}/#{LIST_KEY}"
  end

  def character_key(uid, cid)
    "#{list_key(uid)}/#{cid}"
  end

  def list(uid)
    $redis.smembers(list_key(uid)).sort
  end

  def exists?(uid, cid)
    $redis.exists(list_key(uid)) &&
      $redis.sismember(list_key(uid), cid)
  end

  def create(uid, fields)
    cid = fields.delete(:cid)
    full_id = "#{uid}_#{cid}"
    $redis.sadd(list_key(uid), cid)
    $redis.hset(character_key(uid, cid), "cid", cid)

    return update(uid, cid, fields.merge(uid: uid))
  end

  def update(uid, cid, fields)
    fields.delete(:cid)
    full_id = character_key(uid, cid)
    ($redis.hgetall(full_id).keys - FIELDS - fields.keys).each do |field|
      $redis.hdel(full_id, field)
    end

    fields.each do |field, value|
      if value.nil? || value.empty?
        $redis.hdel(full_id, field)
      else
        $redis.hset(full_id, field, value)
      end
    end
    touch(full_id)
    return to_h(uid, cid)
  end

  def backup(uid)
    list(uid).map do |cid|
      db_hash = to_h(uid, cid)
      db_hash.delete("id")
      db_hash.delete("uid")
      db_hash.delete("updated_at")
      next db_hash
    end
  end

  def delete(uid, cid)
    $redis.srem(uid, cid)
    $redis.del(character_key(uid, cid))
  end

  def touch(full_id)
    $redis.hset(full_id, "updated_at", Time.now.to_i)
  end

  def to_h(uid, cid)
    full_id = character_key(uid, cid)
    db_hash = $redis.hgetall(full_id)
    db_hash["id"] = full_id
    db_hash["updated_at"] = Time.at(db_hash["updated_at"].to_i).utc

    return db_hash
  end
end
