const express = require("express");

const code = express.code();

code.post("/run", async (req, res) => {
  try {
    const { code, language_id, stdin } = req.body;

    // STEP 1 → submit code
    const submission = await axios.post(
      "https://judge0-ce.p.rapidapi.com/submissions",
      {
        source_code: code, // code
        language_id, //
        stdin,
      },
      {
        params: {
          base64_encoded: "false",
          wait: "false",
        },
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Key": process.env.RAPID_API_KEY,
          "X-RapidAPI-Host": process.env.RAPID_API_HOST,
        },
      },
    );

    const token = submission.data.token;

    // STEP 2 → poll result
    let result;

    while (true) {
      result = await axios.get(
        `https://judge0-ce.p.rapidapi.com/submissions/${token}`,
        {
          params: {
            base64_encoded: "false",
          },
          headers: {
            "X-RapidAPI-Key": process.env.RAPID_API_KEY,
            "X-RapidAPI-Host": process.env.RAPID_API_HOST,
          },
        },
      );

      const statusId = result.data.status.id;

      // processing
      if (statusId === 1 || statusId === 2) {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        continue;
      }

      break;
    }

    return res.json({
      success: true,
      result: result.data,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,
      message: "execution failed",
    });
  }
});

module.exports = code;
