FactoryBot.define do
  factory :column do
    newspaper
    sequence(:name) { |n| "テストコラム#{n}" }
  end
end
