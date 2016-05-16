module Story
  extend self

  LIST_SUFFIX = "_stories"
  POSE_SUFFIX = "_poses"

  def list_key(uid)
    "#{uid}#{LIST_SUFFIX}"
  end

  def pose_key(id)
    "#{id}#{POSE_SUFFIX}"
  end

  def new_id(uid)
    "#{uid}_#{Time.now.to_i}"
  end

  def list(uid)
    $redis.zrange(list_key(uid), 0, -1)
  end

  def exists?(uid, id)
    $redis.exists(list_key(uid)) &&
      $redis.exists(id)
  end

  def pose_exists?(uid, id, timestamp)
    exists?(uid, id) &&
      $redis.zrank(pose_key(id), timestamp.to_i)
  end

  def create(uid, fields)
    id = new_id(uid)
    story_count = $redis.zcard(list_key(uid))
    $redis.zadd(list_key(uid), story_count + 1, id)

    return update(id, fields.merge(uid: uid))
  end

  def update(id, fields)
    fields.each do |field, value|
      if value.nil? || value.empty?
        $redis.hdel(id, field)
      else
        $redis.hset(id, field, value)
      end
    end
    touch(id)
    return to_h(id)
  end

  def delete(id)
    obj = to_h(id)
    $redis.zrem(obj["uid"], obj["id"])
    $redis.del(id)
  end

  def touch(id)
    $redis.hset(id, "updated_at", Time.now.to_i)
  end

  def to_h(id)
    db_hash = $redis.hgetall(id)
    db_hash["id"] = id
    db_hash["updated_at"] = Time.at(db_hash["updated_at"].to_i).utc
    db_hash["poses"] = $redis.zrange(pose_key(id), 0, -1, with_scores: true).
      reduce([]) { |acc, (pose, key)| acc << [key.to_i, pose] }

    return db_hash
  end

  def pose(id, pose)
    timestamp = Time.now.to_i
    $redis.zadd(pose_key(id), timestamp, pose)
    touch(id)

    return to_h(id)
  end

  def unpose(id, timestamp)
    t = timestamp.to_i
    $redis.zrangebyscore(pose_key(id), t, t).each do |pose|
      $redis.zrem(pose_key(id), pose)
    end
    touch(id)

    return to_h(id)
  end
end
