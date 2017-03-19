module Prop
  extend self

  FIELDS = %w(id uid pid updated_at)

  LIST_KEY = "characters"

  def list_key(uid)
    "#{Universe.universe_key(uid)}/#{LIST_KEY}"
  end

  def character_key(uid, pid)
    "#{list_key(uid)}/#{pid}"
  end

  def list(uid)
    $redis.smembers(list_key(uid)).sort
  end

  def exists?(uid, pid)
    $redis.exists(list_key(uid)) &&
      $redis.sismember(list_key(uid), pid)
  end

  def create(uid, fields)
    pid = fields.delete(:pid)
    full_id = "#{uid}_#{pid}"
    $redis.sadd(list_key(uid), pid)
    $redis.hset(character_key(uid, pid), "pid", pid)

    return update(uid, pid, fields.merge(uid: uid))
  end

  def update(uid, pid, fields)
    FIELDS.each { |k| fields.delete(k) }
    full_id = character_key(uid, pid)
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
    return to_h(uid, pid)
  end

  def backup(uid)
    list(uid).map do |pid|
      db_hash = to_h(uid, pid)
      db_hash.delete("uid")
      db_hash.delete("updated_at")
      next db_hash
    end
  end

  def delete(uid, pid)
    $redis.srem(list_key(uid), pid)
    $redis.del(character_key(uid, pid))
  end

  def touch(full_id)
    $redis.hset(full_id, "updated_at", Time.now.to_i)
  end

  def to_h(uid, pid)
    full_id = character_key(uid, pid)
    db_hash = $redis.hgetall(full_id)
    db_hash["updated_at"] = Time.at(db_hash["updated_at"].to_i).utc

    return db_hash
  end
end
