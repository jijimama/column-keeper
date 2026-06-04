class AddScrapeColumnsToColumns < ActiveRecord::Migration[7.2]
  def change
    add_column :columns, :scrape_enabled, :boolean, default: false, null: false
    add_column :columns, :scrape_base_url, :string
    add_column :columns, :scrape_list_selector, :string
    add_column :columns, :scrape_list_index, :integer, default: 0, null: false
    add_column :columns, :scrape_detail_base_url, :string
    add_column :columns, :scrape_detail_selector, :string
    add_column :columns, :scrape_date_selector, :string
    add_column :columns, :scrape_date_regexp, :string
    add_column :columns, :scrape_replace_rules, :text
  end
end
