module AccessKey
  extend self

  ACCESS_LIST_KEY = "access_keys"

  def new_access_key
    SecureRandom.hex(8)
  end

  def access_list_key(uid)
    "#{Universe::LIST_KEY}/#{uid}/#{ACCESS_LIST_KEY}"
  end

  def access_key_key(access_key)
    "#{ACCESS_LIST_KEY}/#{access_key}"
  end

  def access?(access_keys, uid)
    access_keys.any? { |k| $redis.hget(access_key_key(k), "uid") == uid }
  end

  def exists?(access_key)
    $redis.exists(access_key_key(access_key))
  end

  def list(uid)
    $redis.smembers(access_list_key(uid))
  end

  def list_uids(access_keys)
    access_keys.map { |k| $redis.hget(access_key_key(k), "uid") }
  end

  def create(uid)
    while (k = new_access_key)
      break unless exists?(k)
    end

    $redis.hset(access_key_key(k), "uid", uid)
    $redis.sadd(access_list_key(uid), k)
    return k
  end

  def delete(access_key)
    uid = $redis.hget(access_key_key(access_key), "uid")
    $redis.del(access_key_key(access_key))
    $redis.srem(access_list_key(uid), access_key)
  end
end
