require "redis"
require "simple_can"

SimpleCan.strategy = SimpleCan::BasicStrategy
Dir["model/*.rb"].each { |f| require "./#{f}" }

task :redis do
  redis_uri = URI.parse(ENV["REDIS_URL"] || "redis://localhost:6379/")
  $redis = Redis.new(host: redis_uri.host, port: redis_uri.port, db: 0,
    password: redis_uri.password)
end

desc "Show some reports"
task reports: :redis do
  universes = $redis.smembers(Universe::LIST_KEY).
    map { |uid| Universe.to_h(uid, true) }.
    sort { |universe, other| universe["updated_at"] <=> other["updated_at"] }.
    reverse
  universes = $redis.smembers(Universe::LIST_KEY).map do |uid|
    Universe.to_h(uid, true)
  end
  universes.sort! do |universe, other|
    universe["updated_at"] <=> other["updated_at"]
  end
  universes.reverse!
  puts "universe count: #{universes.count}"
  universes.each do |universe|
    puts "universe #{universe["title"]} #{universe["uid"]} " \
      "#{universe["updated_at"]} - prop count #{universe["props"].count} - " \
      "story count #{universe["stories"].count} - " \
      "access #{AccessKey.list(universe["uid"]).first}"
  end
end

task delete: :redis do |_t, args|
  args.extras.each do |uid|
    unless Universe.exists?(uid)
      puts "#{uid} not a uid"
      next
    end

    Universe.delete(uid)
  end
end
