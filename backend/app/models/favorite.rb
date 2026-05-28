class Favorite < ApplicationRecord
  belongs_to :column_entry

  validates :column_entry_id, uniqueness: true
end
