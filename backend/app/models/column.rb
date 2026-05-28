class Column < ApplicationRecord
  belongs_to :newspaper
  has_many :entries, class_name: "ColumnEntry", dependent: :destroy

  validates :name, presence: true, uniqueness: { scope: :newspaper_id }
end
