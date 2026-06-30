const express = require("express");
const axios = require("axios");
const userAuth = require("../middleware/userAuth");
const Question = require("../models/questions");
const Submission = require("../models/submission");
const { validateSubmissionCode } = require("../validation");
const runCodeLimit = require("../middleware/rateLimit");
const { languageNumber } = require("../constant");

require("dotenv").config();
const code = express.Router();

code.post("/run", runCodeLimit, async (req, res) => {
  try {
    const { code, language_id, stdin } = req.body;
    // STEP 1 → submit code
    const submission = await axios.post(
      "https://judge0-ce.p.rapidapi.com/submissions",
      {
        source_code: code, // code
        language_id,
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

    res.json({
      success: true,
      result: result.data,
    });

    setTimeout(() => {}, 1000);
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "execution failed",
    });
  }
});

code.post("/codeSubmission/:problemId", userAuth, async (req, res) => {
  try {
    const loggedUser = req.user;

    const { code, language_id } = req.body;

    const problemId = req.params.problemId;

    const isProblemAvailable =
      await Question.findById(problemId).populate("title");

    if (!isProblemAvailable) {
      return res
        .status(404)
        .json({ success: false, message: "no question found" });
    }

    let testcases = isProblemAvailable.testcase.filter(
      (val) => val.ishidden === true,
    );

    let testcaseResults = [];

    let finalResult;
    let finalVerdict = "Wrong Answer";

    for (let testcase of testcases) {

      // STEP 1 → submit code
      const submission = await axios.post(
        "https://judge0-ce.p.rapidapi.com/submissions",
        {
          source_code: code, // code
          language_id,
          stdin: testcase.input,
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

      if (result.data.status.description !== "Accepted") {
        const status = result.data.status.description;

        if (status.includes("Runtime Error")) {
          finalVerdict = "Runtime Error";
        } else if (status.includes("Compilation Error")) {
          finalVerdict = "Compilation Error";
        } else if (status.includes("Time Limit Exceeded")) {
          finalVerdict = "Time Limit Exceeded";
        } else {
          finalVerdict = status;
        }
      }

      const expectedOutput = testcase.output.trim();

      const actualOutput = result?.data?.stdout?.trim();

      testcaseResults.push(expectedOutput === actualOutput ? "pass" : "fail");

      finalResult = result;
    }

    validateSubmissionCode({
      sourceCode: code,
      language: languageNumber[language_id],
      verdict: finalVerdict,
      executionTime: finalResult?.data?.time,
      memory: finalResult?.data?.memory,
    });

    const newSubmission = new Submission({
      userId: loggedUser._id,
      problemId: isProblemAvailable._id,
      sourceCode: code,
      language: languageNumber[language_id],
      verdict: finalVerdict,
      executionTime: finalResult?.data?.time,
      memory: finalResult?.data?.memory,
      testcaseResults,
    });
    await newSubmission.save();
    res.status(201).json({
      success: true,
      message: "successfully saved...",
      testcaseResults,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

code.get("/getResult/:problemId", userAuth, async (req, res) => {
  try {
    let problemId = req.params.problemId;
    const findResult = await Submission.find({
      userId: req.user._id,
      problemId,
    }).sort({ createdAt: -1 });

    if (findResult.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "no question found" });
    }

    res.status(200).json({ success: true, submission: findResult[0] });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = code;
