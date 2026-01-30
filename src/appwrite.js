import { Client, ID, TablesDB, Query } from "appwrite";
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const TABLE_ID = import.meta.env.VITE_APPWRITE_TABLE_ID;
const ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT;

const MAX_COUNT = 1000;

const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID);

const database = new TablesDB(client);

export const updateSearchCount = async (searchTerm, movie) => {
  const normalizedTerm = searchTerm.toLowerCase().trim();

  // 1. Use Appwrite SDK to check if the search term exists in the database
  try {
    const result = await database.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_ID,
      queries: [Query.equal("searchTerm", normalizedTerm)],
    });
    // .upsertRow function can be used for both updating and creating rows

    // 2. If it exists, update the count.
    if (result.total > 0) {
      const row = result.rows[0];

      const newCount = Math.min(row.count + 1, MAX_COUNT);

      await database.updateRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_ID,
        rowId: row.$id,
        data: {
          count: newCount,
        },
      });
      // 3. If it doesn't exist, create a new row with the search term and  count initialized to 1
    } else {
      await database.createRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_ID,
        rowId: ID.unique(),

        data: {
          searchTerm: normalizedTerm,
          count: 1,
          movie_id: movie.id,
          poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        },
      });
    }
  } catch (error) {
    console.error("Error updating search count:", error);
  }
};

export const getFavouriteMovies = async () => {
  try {
    const result = await database.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_ID,
      queries: [Query.limit(5), Query.orderDesc("count")],
    });
    return result.rows;
  } catch (error) {
    console.error("Error fetching favourite movies:", error);
    return [];
  }
};
