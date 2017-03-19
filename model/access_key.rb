module AccessKey
  extend self

  FIELDS = %w(id access_key uid cap updated_at)

  HASH_ACCESS_KEY = "hash_access_key/%{key}"
  SET_UNIVERSE_ACCESS_KEYS = "set_universes/%{uid}/access_keys"

  def new_access_key
    SecureRandom.hex(20)
  end

  def hash_access_key(key)
    HASH_ACCESS_KEY % {key: key}
  end

  def set_universe_access_keys(uid)
    SET_UNIVERSE_ACCESS_KEYS % {uid: uid}
  end

  def relevant_for(access_keys, uid)
    access_keys.select { |k| $redis.hget(hash_access_key(k), "uid") == uid }
  end

  def max_capability(access_keys)
    access_keys.map { |k| $redis.hget(hash_access_key(k), "cap").to_i }.max
  end

  def exists?(access_key)
    $redis.exists(hash_access_key(access_key))
  end

  def list(uid)
    $redis.smembers(set_universe_access_keys(uid))
  end

  def list_uids(access_keys)
    access_keys.map do |key|
      yield($redis.hget(hash_access_key(key), "uid"),
        $redis.hget(hash_access_key(key), "cap").to_i)
    end
  end

  def create(uid)
    while (key = new_access_key) && exists?(key); end

    full_id = hash_access_key(key)
    $redis.hset(full_id, "id", key)
    $redis.hset(full_id, "uid", uid)
    $redis.hset(full_id, "cap", SimpleCan.strategy.to_capability("manage"))
    $redis.sadd(set_universe_access_keys(uid), key)
    touch(full_id)
    return key
  end

  def update(access_key, fields)
    FIELDS.each { |k| fields.delete(k) }
    full_id = hash_access_key(access_key)
    ($redis.hgetall(full_id).keys - FIELDS - fields.keys).each do |field|
      $redis.hdel(full_id, field)
    end

    fields["cap"] = SimpleCan.strategy.to_capability(fields["cap"])

    fields.each do |field, value|
      if value.nil? || value.to_s.empty?
        $redis.hdel(full_id, field)
      else
        $redis.hset(full_id, field, value)
      end
    end
    touch(full_id)
    return to_h(access_key)
  end

  def delete(access_key)
    uid = $redis.hget(hash_access_key(access_key), "uid")
    $redis.del(hash_access_key(access_key))
    $redis.srem(set_universe_access_keys(uid), access_key)
  end

  def touch(full_id)
    $redis.hset(full_id, "updated_at", Time.now.to_i)
  end

  def to_h(access_key)
    full_id = hash_access_key(access_key)
    db_hash = $redis.hgetall(full_id)
    db_hash["updated_at"] = Time.at(db_hash["updated_at"].to_i).utc
    db_hash["cap"] = SimpleCan.strategy.roles[db_hash["cap"].to_i]

    return db_hash
  end
end
