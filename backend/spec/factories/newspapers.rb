FactoryBot.define do
  factory :newspaper do
    sequence(:name) { |n| "テスト新聞#{n}" }
  end
end
