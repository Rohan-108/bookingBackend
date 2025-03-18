import mongoose from "mongoose";

export const runInTransaction = async (callback) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    await callback(session);
    // Commit the changes
    await session.commitTransaction();
  } catch (error) {
    // Rollback any changes made in the database
    await session.abortTransaction();
    throw error;
  } finally {
    // Ending the session
    await session.endSession();
  }
};
