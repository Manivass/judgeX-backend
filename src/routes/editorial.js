const express = require("express");
const Editorial = require("../models/editorial");
const userAuth = require("../middleware/userAuth");

const editorial = express.Router();

editorial.get("/geteditorial/:id", userAuth, async (req, res) => {
  try {
    const loggedUser = req.user;
    // if (!loggedUser.premium) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Only premium users can see the editorial",
    //   });
    // }

    const { id } = req.params;
    console.log(id);
    const editorials = await Editorial.find();

    console.log(editorials);

    const editorialData = await Editorial.findOne({
      questionNumber: Number(id),
    });
    console.log(editorialData);

    if (!editorialData) {
      return res.status(404).json({
        success: false,
        message: "No editorial found",
      });
    }
    console.log(editorial);

    return res.status(200).json({
      success: true,
      message: "Successfully fetched",
      editorial: editorialData,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = editorial;
