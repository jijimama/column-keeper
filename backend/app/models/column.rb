class Column < ApplicationRecord
  belongs_to :newspaper
  has_many :entries, class_name: "ColumnEntry", dependent: :destroy

  serialize :scrape_replace_rules, coder: JSON, type: Hash

  validates :name, presence: true, uniqueness: { scope: :newspaper_id }

  # ColumnScraper / ScrapesController が期待する config Hash を返す
  def scrape_config
    {
      "base_url"        => scrape_base_url,
      "list_selector"   => scrape_list_selector,
      "list_index"      => scrape_list_index,
      "detail_base_url" => scrape_detail_base_url,
      "detail_selector" => scrape_detail_selector,
      "date_selector"   => scrape_date_selector,
      "date_regexp"     => scrape_date_regexp,
      "replace_rules"   => scrape_replace_rules.presence
    }
  end
end
