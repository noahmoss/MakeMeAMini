defmodule Backend.Repo.Migrations.AddUniqueIndexToCrosswordKey do
  use Ecto.Migration

  def change do
    create unique_index(:crosswords, [:key])
  end
end
