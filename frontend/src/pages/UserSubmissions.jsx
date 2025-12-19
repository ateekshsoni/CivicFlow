import { dbPromise } from "../db/db";

const UserSubmissions = () => {
  const fetchSubmissions = async () => {
    try {
      const db = await dbPromise;
      const allSubmissions = await db.getAll("submissions");
      console.log("User Submissions:", allSubmissions);
      // You can set this data to state and render it as needed
    } catch (error) {
      console.error("Failed to fetch submissions:", error);
    }
  };

  return (
    <div>
      <button
        onClick={fetchSubmissions}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Load My Submissions
      </button>
    </div>
  );
};

export default UserSubmissions;
