class CreateColumnEntries < ActiveRecord::Migration[7.2]
  def change
    create_table :column_entries do |t|
      t.references :column, null: false, foreign_key: true
      t.date :published_on, null: false
      t.text :content, null: false
      t.string :source_url
      t.integer :view_count, null: false, default: 0
      t.datetime :last_viewed_at

      t.timestamps
    end
    add_index :column_entries, [:column_id, :published_on], unique: true
  end
end
