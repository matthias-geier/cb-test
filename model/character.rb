module Character
  extend self

  FIELDS = %w(id uid cid updated_at)

  LIST_SUFFIX = "_characters"

  def list_key(uid)
    "#{uid}#{LIST_SUFFIX}"
  end

  def list(uid)
    $redis.smembers(list_key(uid)).sort
  end

  def exists?(uid, cid)
    $redis.exists(list_key(uid)) &&
      $redis.sismember(list_key(uid), cid)
  end

  def create(uid, fields)
    cid = fields.delete(:id)
    full_id = "#{uid}_#{cid}"
    $redis.sadd(list_key(uid), cid)
    $redis.hset(full_id, "cid", cid)

    return update(full_id, fields.merge(uid: uid))
  end

  def update(uid, cid, fields)
    fields.delete(:cid)
    id = "#{uid}_#{cid}"
    ($redis.hgetall(id).keys - FIELDS - fields.keys).each do |field|
      $redis.hdel(id, field)
    end

    fields.each do |field, value|
      if value.nil? || value.empty?
        $redis.hdel(id, field)
      else
        $redis.hset(id, field, value)
      end
    end
    touch(id)
    return to_h(uid, cid)
  end

  def delete(uid, cid)
    id = "#{uid}_#{cid}"
    obj = to_h(uid, cid)
    $redis.srem(obj["uid"], obj["cid"])
    $redis.del(id)
  end

  def touch(id)
    $redis.hset(id, "updated_at", Time.now.to_i)
  end

  def to_h(uid, cid)
    id = "#{uid}_#{cid}"
    db_hash = $redis.hgetall(id)
    db_hash["id"] = id
    db_hash["updated_at"] = Time.at(db_hash["updated_at"].to_i).utc

    return db_hash
  end
end
