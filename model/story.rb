module Story
  extend self

  LIST_KEY = "stories"
  POSE_KEY = "poses"

  def list_key(uid)
    "#{Universe.universe_key(uid)}/#{LIST_KEY}"
  end

  def story_key(uid, sid)
    "#{list_key(uid)}/#{sid}"
  end

  def pose_key(uid, sid)
    "#{story_key(uid, sid)}/#{POSE_KEY}"
  end

  def new_id
    Time.now.to_i.to_s
  end

  def list(uid)
    $redis.zrange(list_key(uid), 0, -1, with_scores: true).map do |sid, key|
      to_h(uid, sid, false).merge("score" => key.to_i)
    end
  end

  def exists?(uid, sid)
    $redis.exists(list_key(uid)) &&
      $redis.exists(story_key(uid, sid))
  end

  def pose_exists?(uid, sid, num)
    exists?(uid, sid) &&
      $redis.zrank(pose_key(uid, sid), num.to_i)
  end

  def create(uid, fields)
    sid = new_id
    while exists?(uid, sid)
      sid = (sid.to_i + 1).to_s
    end
    story_count = $redis.zcard(list_key(uid))
    $redis.zadd(list_key(uid), story_count + 1, sid)
    $redis.hset(story_key(uid, sid), "sid", sid)

    return update(uid, sid, fields.merge(uid: uid))
  end

  def update(uid, sid, fields)
    full_id = story_key(uid, sid)
    fields.each do |field, value|
      if value.nil? || value.empty?
        $redis.hdel(full_id, field)
      else
        $redis.hset(full_id, field, value)
      end
    end
    touch(full_id)
    return to_h(uid, sid)
  end

  def backup(uid)
    list(uid).map do |story|
      story["poses"] = $redis.
        zrangebyscore(pose_key(uid, story["sid"]), 0, "+inf")
      story.delete("sid")
      story.delete("uid")
      story.delete("updated_at")
      story.delete("score")
      next story
    end
  end

  def delete(uid, sid)
    $redis.del(story_key(uid, sid))
    $redis.del(pose_key(uid, sid))
    num = $redis.zscore(list_key(uid), sid).to_i
    deleted = false
    $redis.zrangebyscore(list_key(uid), num, "+inf").
      each_with_index do |story, i|

      if i == 0
        deleted = $redis.zrem(list_key(uid), story)
        break unless deleted
      else
        $redis.zincrby(list_key(uid), -1, story)
      end
    end
    return deleted
  end

  def touch(full_id)
    $redis.hset(full_id, "updated_at", Time.now.to_i)
  end

  def to_h(uid, sid, full = true)
    full_id = story_key(uid, sid)
    db_hash = $redis.hgetall(full_id)
    db_hash["updated_at"] = Time.at(db_hash["updated_at"].to_i).utc
    return db_hash unless full

    db_hash["poses"] = $redis.zrange(pose_key(uid, sid), 0, -1,
      with_scores: true).
      reduce([]) { |acc, (pose, key)| acc << [key.to_i, pose] }
    return db_hash
  end

  def pose(uid, sid, pose)
    while $redis.zscore(pose_key(uid, sid), pose)
      pose += " "
    end
    pose_count = $redis.zcard(pose_key(uid, sid))
    $redis.zadd(pose_key(uid, sid), pose_count + 1, pose)
    touch(story_key(uid, sid))

    return to_h(uid, sid)
  end

  def unpose(uid, sid, num)
    return to_h(uid, sid) if num !~ /^\d+$/
    num = num.to_i
    $redis.zrangebyscore(pose_key(uid, sid), num, "+inf").
      each_with_index do |pose, i|

      if i == 0
        $redis.zrem(pose_key(uid, sid), pose)
      else
        $redis.zincrby(pose_key(uid, sid), -1, pose)
      end
    end
    touch(story_key(uid, sid))

    return to_h(uid, sid)
  end

  def swap_pose(uid, sid, num)
    key = pose_key(uid, sid)
    touch(story_key(uid, sid)) if swap(key, num)
  end

  def swap_story(uid, num)
    swap(list_key(uid), num)
  end

  def swap(full_id, num)
    num = num.to_i
    elem, next_elem = $redis.zrangebyscore(full_id, num, num + 1)

    return if elem.nil? || next_elem.nil?

    $redis.zrem(full_id, next_elem)
    $redis.zincrby(full_id, 1, elem)
    $redis.zadd(full_id, num, next_elem)
    return true
  end
end
