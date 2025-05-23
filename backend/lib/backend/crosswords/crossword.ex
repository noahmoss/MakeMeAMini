defmodule Backend.Crosswords.Crossword do
  use Ecto.Schema
  import Ecto.Changeset

  schema "crosswords" do
    field :data, :map
    field :key, :string

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(crossword, attrs) do
    crossword
    |> cast(attrs, [:key, :data])
    |> validate_required([:key])
  end
end
