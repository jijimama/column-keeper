# Be sure to restart your server when you modify this file.

# Next.js dev server (localhost:3000) から Rails API (localhost:3001) を呼ぶための CORS 設定。
# ローカル単体運用前提なので origins は明示的に1つだけ許可。

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins "http://localhost:3000"

    resource "*",
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head]
  end
end
