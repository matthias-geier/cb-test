# optional flag when using the lib without installing
# $LOAD_PATH.unshift("../lib")
require 'cargobull'

# curl calls
# > curl -X GET localhost:3000/api/talk
# > curl -X POST -d '["moo", "bar"]' -H "Content-Type: application/json"
#   localhost:3000/api/talk
# > curl -X DELETE -d '["moo", "bar"]' -H "Content-Type: application/json"
#   localhost:3000/api/talk

run Cargobull.runner($env)
