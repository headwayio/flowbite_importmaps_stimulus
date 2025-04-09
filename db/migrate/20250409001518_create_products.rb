class CreateProducts < ActiveRecord::Migration[8.0]
  def change
    create_table :products do |t|
      t.string :name
      t.string :category
      t.string :brand
      t.text :description
      t.decimal :price
      t.datetime :release_date

      t.timestamps
    end
  end
end
