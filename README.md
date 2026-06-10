/addQuestion api - to add the question

/questions - to see all the question

/editQuestion/:id - to edit the question

/deleteQuestion/:id - to delete the question

created submission schema

/run/:problemId , /codeSubmission/:problemId and get the result of testcase

/leaderboard - to get the list of solved problems

install express-rate-limit - to stop 10 seconds for every compilation

code :-
rateLimit = require("express-rate-limit")

const runCodeLimit = rateLimit({
windowMs : 1000 \* 10 ,
max : 1 ,
message : {
success : false ,
message : "put what you want",
}
})
