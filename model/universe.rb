require "securerandom"

module Universe
  extend self
  include SimpleCan

  LIST_KEY = "universes"

  def universe_key(uid)
    "#{LIST_KEY}/#{uid}"
  end

  def new_id
    SecureRandom.hex(6)
  end

  def exists?(uid)
    $redis.exists(universe_key(uid))
  end

  def create
    while (uid = new_id)
      break unless exists?(uid)
    end

    $redis.hset(universe_key(uid), "uid", uid)
    touch(uid)
    $redis.sadd(LIST_KEY, uid)
    AccessKey.create(uid)
    return to_h(uid)
  end

  def list(access_keys)
    AccessKey.list_uids(access_keys) { |uid, cap| to_h(uid, false) }
  end

  def update(uid, fields)
    fields.each do |field, value|
      if value.nil? || value.empty?
        $redis.hdel(universe_key(uid), field)
      else
        $redis.hset(universe_key(uid), field, value)
      end
    end
    touch(uid)
    return to_h(uid)
  end

  def backup(uid)
    db_hash = $redis.hgetall(universe_key(uid))
    db_hash.delete("updated_at")
    db_hash.delete("uid")
    db_hash["props"] = Prop.backup(uid)
    db_hash["stories"] = Story.backup(uid)
    return db_hash
  end

  def restore(uid, data)
    Prop.list(uid).each { |pid| Prop.delete(uid, pid) }
    (data.delete("props") || []).each { |prop| Prop.create(uid, prop) }

    Story.list(uid).each { |story| Story.delete(uid, story["sid"]) }
    (data.delete("stories") || []).each do |story|
      poses = story.delete("poses")
      created_story = Story.create(uid, story)
      poses.each { |pose| Story.pose(uid, created_story["sid"], pose) }
    end

    update(uid, data)
  end

  def delete(uid)
    return false unless exists?(uid)
    Prop.list(uid).each { |pid| Prop.delete(uid, pid) }
    $redis.del(Prop.list_key(uid))
    Story.list(uid).each { |story| Story.delete(uid, story["sid"]) }
    $redis.del(Story.list_key(uid))
    AccessKey.list(uid).each { |k| AccessKey.delete(k) }
    $redis.del(universe_key(uid))
    $redis.srem(LIST_KEY, uid)
    return true
  end

  def touch(uid)
    $redis.hset(universe_key(uid), "updated_at", Time.now.to_i)
  end

  def to_h(uid, full = true)
    db_hash = $redis.hgetall(universe_key(uid))
    db_hash["updated_at"] = Time.at(db_hash["updated_at"].to_i).utc
    if manage?
      db_hash["access_keys"] = AccessKey.list(uid).map { |k| AccessKey.to_h(k) }
    end
    return db_hash unless full

    db_hash["props"] = Prop.list(uid)
    db_hash["stories"] = Story.list(uid)
    return db_hash
  end
end
