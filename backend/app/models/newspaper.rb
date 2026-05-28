class Newspaper < ApplicationRecord
  has_many :columns, dependent: :destroy

  validates :name, presence: true, uniqueness: true
end
