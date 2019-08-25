const express = require('express')
const app = express()
const fetch = require('node-fetch')
const session = require('express-session')
const bodyParser = require("body-parser");//handle post request
const questions = require('./questions').questions


app.use(express.static('public'));
app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000 } }))

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


const hello = (name_p) => {

  let str = 'hello human, what is your name?';
  if (name_p) {
    str = `nice to meet you ${name_p}, I'm mister quizzy`
  }

  return {
    message: {
      loading: true,
      delay: 1000,
      content: str
    }
  };
}

const ask_name = () => {
  return {
    input: {
      action: {
        placeholder: "type your name here"
      }
    }
  };
}

const question = (index) => {
  return {
    message: {
      loading: true,
      delay: 1000,
      content: questions[index].question
    }
  };
}

const choices = (index) => {
  return {
    choices: {
      delay: 1000,
      action: [
        { // show only one button
          text: questions[index].choices[0],
          value: questions[index].choices[0]
        },
        { // show only one button
          text: questions[index].choices[1],
          value: questions[index].choices[1]
        },
        { // show only one button
          text: questions[index].choices[2],
          value: questions[index].choices[2]
        }
      ]
    }
  };
}

const show_answer = (success, solution) => {
  let text = ` boooo its false; good answer is ${solution}`

  if (success) {
    text = "YES!";
  }

  return {
    message: {
      loading: true,
      delay: 3000,
      content: text
    }
  };
}


const score = (name, score, nb_question) => {
  return {
    message: {
      loading: true,
      delay: 1000,
      content: `Thank you for playing${name}, your score is ${score}/${nb_question}`
    }
  };
};

const replay = ()=>{
  return {
    message: {
      loading: true,
      delay: 1000,
      content: `replay...`
    }
  };
}

app.post('/next', (req, res, next) => {
  let data;
  let { state } = req.session
  console.log(`post /next :enter state is ${state}`);
  if (state == undefined) {
    data = hello()
    state = "hello"
  } else if (state == "hello") {
    data = ask_name()
    state = "ask"
  } else if (state == "ask") {
    const name = req.body.value
    req.session.name = name
    data = hello(name)
    state = "quiz"
  } else if (state == "quiz") {

    if (req.session.question_number == undefined) {
      req.session.question_number = 0;
    } else {
      req.session.question_number++;
    }
    const question_number = req.session.question_number;

    if (question_number < questions.length) {
      data = question(question_number)
      state = "choices"
    } else {
      data = score(req.session.name, req.session.score, questions.length)
      state = 'finish'
    }
  } else if (state == "choices") {
    const question_number = req.session.question_number;
    data = choices(question_number);
    state = "answer"
  } else if (state == "answer") {
    const question_number = req.session.question_number;
    const answer = req.body.value;
    const solution = questions[question_number].answer;
    const success = answer == solution;

    if (req.session.score == undefined) {
      req.session.score = 0;
    }
    if (success) {
      req.session.score++;
    }

    data = show_answer(success, solution);
    state = "quiz";
  }else if (state == 'finish'){
    req.session.score = 0;
    req.session.question_number = undefined;
    data = replay();
    state = 'quiz'
  }
  console.log(`post /next :exit state is ${state}`);

  req.session.state = state;
  const str = JSON.stringify(data)
  res.end(str);
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})