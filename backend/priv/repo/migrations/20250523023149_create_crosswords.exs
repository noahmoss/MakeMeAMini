defmodule Backend.Repo.Migrations.CreateCrosswords do
  use Ecto.Migration

  def change do
    create table(:crosswords) do
      add :key, :string
      add :data, :map

      timestamps(type: :utc_datetime)
    end
  end
end
