class CreateColumns < ActiveRecord::Migration[7.2]
  def change
    create_table :columns do |t|
      t.references :newspaper, null: false, foreign_key: true
      t.string :name, null: false
      t.string :source_url

      t.timestamps
    end
    add_index :columns, [:newspaper_id, :name], unique: true
  end
end
