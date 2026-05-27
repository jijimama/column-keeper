class CreateFavorites < ActiveRecord::Migration[7.2]
  def change
    create_table :favorites do |t|
      t.references :column_entry, null: false, foreign_key: true, index: { unique: true }

      t.timestamps
    end
  end
end
