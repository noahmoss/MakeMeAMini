defmodule BackendWeb.CrosswordController do
  use BackendWeb, :controller

  alias Backend.Crosswords

  def create(conn, %{"data" => data}) do
    key = Nanoid.generate()

    case Crosswords.create_crossword(%{key: key, data: data}) do
      {:ok, _} ->
        json(conn, %{status: "ok", key: key})

      {:error, changeset} ->
        conn |> put_status(:bad_request) |> json(%{error: changeset_errors(changeset)})
    end
  end

  def show(conn, %{"key" => key}) do
    case Crosswords.get_by_key(key) do
      nil -> send_resp(conn, 404, "Not found")
      crossword -> json(conn, crossword.data)
    end
  end

  defp changeset_errors(changeset) do
    Ecto.Changeset.traverse_errors(changeset, fn {msg, opts} ->
      Enum.reduce(opts, msg, fn {k, v}, acc -> String.replace(acc, "%{#{k}}", to_string(v)) end)
    end)
  end
end
