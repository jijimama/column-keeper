class ColumnEntry < ApplicationRecord
  belongs_to :column
  has_one :favorite, dependent: :destroy

  validates :published_on, presence: true, uniqueness: { scope: :column_id }
  validates :content, presence: true
end
