# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.2].define(version: 2026_05_27_234450) do
  create_table "column_entries", force: :cascade do |t|
    t.integer "column_id", null: false
    t.date "published_on", null: false
    t.text "content", null: false
    t.string "source_url"
    t.integer "view_count", default: 0, null: false
    t.datetime "last_viewed_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["column_id", "published_on"], name: "index_column_entries_on_column_id_and_published_on", unique: true
    t.index ["column_id"], name: "index_column_entries_on_column_id"
  end

  create_table "columns", force: :cascade do |t|
    t.integer "newspaper_id", null: false
    t.string "name", null: false
    t.string "source_url"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["newspaper_id", "name"], name: "index_columns_on_newspaper_id_and_name", unique: true
    t.index ["newspaper_id"], name: "index_columns_on_newspaper_id"
  end

  create_table "favorites", force: :cascade do |t|
    t.integer "column_entry_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["column_entry_id"], name: "index_favorites_on_column_entry_id", unique: true
  end

  create_table "newspapers", force: :cascade do |t|
    t.string "name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_newspapers_on_name", unique: true
  end

  add_foreign_key "column_entries", "columns"
  add_foreign_key "columns", "newspapers"
  add_foreign_key "favorites", "column_entries"
end
