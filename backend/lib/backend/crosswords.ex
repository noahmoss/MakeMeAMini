defmodule Backend.Crosswords do
  import Ecto.Query, warn: false
  alias Backend.Repo
  alias Backend.Crosswords.Crossword

  def get_by_key(key), do: Repo.get_by(Crossword, key: key)

  def create_crossword(attrs) do
    %Crossword{}
    |> Crossword.changeset(attrs)
    |> Repo.insert(conflict_target: :key, on_conflict: {:replace, [:data, :updated_at]})
  end
end
