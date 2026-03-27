const { Gig } = require("../models");
const { CustomException } = require("../utils");

// ✅ Create new gig
const createGig = async (request, response) => {
  try {
    if (!request.isSeller) {
      throw CustomException("Only sellers can create new Gigs!", 403);
    }

    const gig = new Gig({
      userID: request.userID,
      ...request.body,
    });

    await gig.save();

    return response.status(201).send(gig);
  } catch ({ message, status = 500 }) {
    return response.status(status).send({
      error: true,
      message,
    });
  }
};

// ✅ Delete gig
const deleteGig = async (request, response) => {
  const { _id } = request.params;

  try {
    const gig = await Gig.findOne({ _id });

    if (!gig) {
      throw CustomException("Gig not found!", 404);
    }

    if (request.userID === gig.userID.toString()) {
      await Gig.deleteOne({ _id });
      return response.send({
        error: false,
        message: "Gig has been successfully deleted!",
      });
    }

    throw CustomException(
      "Invalid request! Cannot delete other user gigs!",
      403
    );
  } catch ({ message, status = 500 }) {
    return response.status(status).send({
      error: true,
      message,
    });
  }
};

// ✅ Get single gig
const getGig = async (request, response) => {
  const { _id } = request.params;

  try {
    const gig = await Gig.findOne({ _id }).populate(
      "userID",
      "username country image createdAt email description"
    );

    if (!gig) {
      throw CustomException("Gig not found!", 404);
    }

    return response.send(gig);
  } catch ({ message, status = 500 }) {
    return response.status(status).send({
      error: true,
      message,
    });
  }
};

// ✅ Get gigs with filters (Updated here!)
const getGigs = async (request, response) => {
  const {
    category,
    search,
    max,
    min,
    userID,
    sort = "createdAt",
  } = request.query;

  try {
    const filters = {
      ...(userID && { userID }),
      ...(category && { category: { $regex: category, $options: "i" } }),
      ...(search && { title: { $regex: search, $options: "i" } }),
      ...((min || max) && {
        price: {
          ...(min && { $gte: parseInt(min) }),
          ...(max && { $lte: parseInt(max) }),
        },
      }),
    };

    const gigs = await Gig.find(filters)
      .sort({ [sort]: -1 })
      .populate(
        "userID",
        "username cover email description isSeller _id image"
      );

    // ✅ Return empty array instead of 404
    return response.send(gigs);
  } catch ({ message, status = 500 }) {
    return response.status(status).send({
      error: true,
      message,
    });
  }
};

module.exports = {
  createGig,
  deleteGig,
  getGig,
  getGigs,
};
