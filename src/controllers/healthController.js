import asyncHandler from "../utils/asyncHandler.js";

const healthcheck = asyncHandler(async (req, res) => {
  //TODO: build a healthcheck response that simply returns the OK status as json with a message
  console.log("Health Check Request");
  res.status(200).send("working correctly");
});

export { healthcheck };
