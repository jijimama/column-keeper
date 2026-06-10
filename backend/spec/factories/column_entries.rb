FactoryBot.define do
  factory :column_entry do
    column
    sequence(:published_on) { |n| Date.new(2025, 1, 1) + n.days }
    content { "テスト本文。" }
  end
end
