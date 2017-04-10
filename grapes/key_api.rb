class KeyApi < Grape::API
  version 'v1', using: :accept_version_header
  format :json

  before do
    header "Cache-Control", "no-cache"
  end

  helpers SessionHelpers

  namespace :key do
    params do
      requires :access_key, type: String, desc: "Access key"
    end
    get ":access_key" do
      uid = AccessKey.list_uids([params["access_key"]]) { |uid, cap| uid }.first
      if uid.nil?
        error!({status: 403, body: "Cannot access Universe"}, 403)
      end
      append_access_keys!([params["access_key"]])
      redirect "/universe/#{uid}", permanent: true
    end
  end
end
