class Quiz {
  constructor() {
    // Initializing properties for the quiz
    this.currentQuestionIndex = 0; //Index of current question
    this.score = 0; // User's current score
    this.timer = null; //Timer object
    this.timeLeft = 30; //Time left for each question
    this.questions = []; //Array to store quiz questions
    this.userAnswers = []; //Array to store user's answer
    this.correctAnswers = []; //Array to store correct answer
    this.skippedQuestions = new Set(); //Set to track skipped questions
    this.unansweredTimes = {}; //Object to store remaining time for unanswered questions

    // DOM elements
    this.setupSection = document.getElementById("quiz-setup");
    this.startButton = document.getElementById("start-quiz-btn");
    this.quizContainer = document.getElementById("quiz-container");
    this.resultsScreen = document.getElementById("results-screen");
    this.timerContainer = document.getElementById("timer-container");
    this.timerElement = document.getElementById("timer");
    this.progressBar = document.getElementById("progress-bar");
    this.completedText = document.getElementById("completed-text");
    this.nextButton = document.getElementById("next-btn");
    this.prevButton = document.getElementById("prev-btn");
    this.categorySelect = document.getElementById("category");
    this.difficultySelect = document.getElementById("difficulty");
    this.retakeButton = document.getElementById("retake-btn");
    this.shareButton = document.getElementById("share-btn");
    this.scoreDisplay = document.getElementById("score-display");
    this.questionNavBar = document.getElementById("question-nav-bar");

    // Bind methods
    this.startQuiz = this.startQuiz.bind(this);
    this.showQuestion = this.showQuestion.bind(this);
    this.checkAnswer = this.checkAnswer.bind(this);
    this.nextQuestion = this.nextQuestion.bind(this);
    this.prevQuestion = this.prevQuestion.bind(this);
    this.startTimer = this.startTimer.bind(this);
    this.stopTimer = this.stopTimer.bind(this);
    this.retakeQuiz = this.retakeQuiz.bind(this);
    this.shareResults = this.shareResults.bind(this);
    this.createQuestionNavBar = this.createQuestionNavBar.bind(this);
    this.handleNavClick = this.handleNavClick.bind(this);
    this.updateNavBar = this.updateNavBar.bind(this);

    // Event listeners
    this.startButton.addEventListener("click", this.startQuiz);
    this.nextButton.addEventListener("click", this.nextQuestion);
    this.prevButton.addEventListener("click", this.prevQuestion);
    this.retakeButton.addEventListener("click", this.retakeQuiz);
    this.shareButton.addEventListener("click", this.shareResults);
  }

  //  Initialize the quiz setup section and hide other sections
  init() {
    this.setupSection.style.display = "block";
    this.quizContainer.style.display = "none";
    this.resultsScreen.style.display = "none";

    // Reset current question index
    this.currentQuestionIndex = 0;

    // Recreate the question navigation bar if it's not done in retakeQuiz
    this.createQuestionNavBar();
  }

  // Starting the quiz
  startQuiz() {
    const category = this.categorySelect.value;
    const difficulty = this.difficultySelect.value;

    this.setupSection.style.display = "none";
    this.quizContainer.style.display = "block";
    this.loadQuestions(category, difficulty);
  }

  // Loading questions from API based on selected category and difficulty
  loadQuestions(category, difficulty) {
    this.questions.length = 0;
    this.userAnswers.length = 0;
    this.correctAnswers.length = 0;
    this.skippedQuestions.clear();
    this.unansweredTimes = {};

    const url = `https://opentdb.com/api.php?amount=10&category=${category}&difficulty=${difficulty}&type=multiple`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data.results.length === 0) {
          alert("No questions found. Please try again.");
          return;
        }

        const fetchedQuestions = data.results.slice(0, 10);
        this.questions.push(...fetchedQuestions);

        this.userAnswers.length = this.questions.length;
        this.correctAnswers.length = this.questions.length;

        this.createQuestionNavBar(); //Create navigation bar
        this.showQuestion(); //Show the first question
      });
  }

  //Display current question and its options
  showQuestion(restartTimer = true) {
    if (this.questions.length === 0) {
      alert("No questions available.");
      return;
    }

    const question = this.questions[this.currentQuestionIndex];
    document.getElementById("question-text").textContent =
      this.decodeHtmlEntities(question.question);

    const optionsSection = document.getElementById("options-section");
    optionsSection.innerHTML = "";

    //Display answer options
    const options = [question.correct_answer, ...question.incorrect_answers];
    options.sort(() => Math.random() - 0.5); //Shuffling of options

    options.forEach((option, index) => {
      const button = document.createElement("button");
      button.textContent = this.decodeHtmlEntities(option);
      button.setAttribute("data-option", String.fromCharCode(65 + index));
      optionsSection.appendChild(button);

      // If the question has already been answered
      if (this.userAnswers[this.currentQuestionIndex] !== undefined) {
        button.disabled = true;
        if (option === question.correct_answer) {
          button.classList.add("correct");
        }
        if (option === this.userAnswers[this.currentQuestionIndex]) {
          if (option !== question.correct_answer) {
            button.classList.add("incorrect");
          }
        }
      } else {
        // Allow the user to select an option if the question hasn't been answered
        button.onclick = () => this.checkAnswer(option);
      }
    });

    //Display status of the answer
    const status = document.createElement("div");
    if (this.userAnswers[this.currentQuestionIndex] === undefined) {
      status.classList.add("no-answer");
    } else if (
      this.userAnswers[this.currentQuestionIndex] !== question.correct_answer
    ) {
      status.textContent = "Your answer was incorrect";
      status.classList.add("incorrect");
    } else {
      status.textContent = "Your answer was correct";
      status.classList.add("correct");
    }
    optionsSection.appendChild(status);

    this.updateProgress();

    this.stopTimer();

    if (this.unansweredTimes[this.currentQuestionIndex] === 0) {
      this.timerElement.textContent = "Time up!";
      this.disableOptions();
    } else if (this.userAnswers[this.currentQuestionIndex] !== undefined) {
      this.timerElement.textContent = "Done!";
    } else if (restartTimer) {
      this.timeLeft = this.unansweredTimes[this.currentQuestionIndex];
      this.startTimer();
    }

    this.updateNavBar();
  }

  //Create Question navigation bar
  createQuestionNavBar() {
    this.questionNavBar.innerHTML = "";

    this.questions.forEach((_, index) => {
      const button = document.createElement("div");
      button.className = "nav-button";
      button.textContent = index + 1;
      button.setAttribute("data-index", index);
      button.addEventListener("click", this.handleNavClick);

      this.questionNavBar.appendChild(button);
    });

    this.updateNavBar();
  }

  //Handle navigation button
  handleNavClick(event) {
    const index = parseInt(event.target.getAttribute("data-index"), 10);

    // Save the remaining time for the current question if unanswered
    if (this.userAnswers[this.currentQuestionIndex] === undefined) {
      this.unansweredTimes[this.currentQuestionIndex] = this.timeLeft;
    }

    this.stopTimer();

    this.currentQuestionIndex = index;

    this.resetButtonStyles();

    // Check if the new question was already answered or time ran out
    if (this.unansweredTimes[this.currentQuestionIndex] === 0) {
      this.timerElement.textContent = "Time up!";
      this.disableOptions();
    } else if (this.userAnswers[this.currentQuestionIndex] !== undefined) {
      this.timerElement.textContent = "Done";
      this.showQuestion(false);
    } else {
      this.showQuestion(true);
    }

    this.updateNavBar();
  }

  //Updating navigation bar
  updateNavBar() {
    const buttons = this.questionNavBar.querySelectorAll(".nav-button");
    buttons.forEach((button, index) => {
      button.classList.toggle("active", index === this.currentQuestionIndex);

      if (this.userAnswers[index] !== undefined) {
        button.classList.add("answered");
      } else {
        button.classList.remove("answered");
      }
    });
  }

  //Decoding dummy text to readable text when loading questions from API

  decodeHtmlEntities(text) {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = text;
    return textarea.value;
  }

  //Checking user's answer and updating the score

  checkAnswer(selectedOption) {
    const question = this.questions[this.currentQuestionIndex];
    const correctAnswer = question.correct_answer;

    // Mark the user's answer and the correct answer
    this.userAnswers[this.currentQuestionIndex] = selectedOption;
    this.correctAnswers[this.currentQuestionIndex] = correctAnswer;

    const optionsButtons = document.querySelectorAll("#options-section button");
    optionsButtons.forEach((button) => {
      button.disabled = true;

      if (button.textContent === correctAnswer) {
        button.classList.add("correct");
      } else if (button.textContent === selectedOption) {
        button.classList.add("incorrect");
      }
    });

    // Stop the timer and save the remaining time for unanswered questions
    if (this.unansweredTimes[this.currentQuestionIndex] === undefined) {
      this.unansweredTimes[this.currentQuestionIndex] = this.timeLeft;
    }

    // Update the score if the selected option is correct
    if (selectedOption === correctAnswer) {
      this.score += 10;
    }

    this.updateScoreDisplay();

    this.stopTimer();
    setTimeout(() => this.nextQuestion(), 1000);
  }

  resetButtonStyles() {
    const buttons = document.querySelectorAll("#options-section button");
    buttons.forEach((button) => {
      button.classList.remove("correct", "incorrect");
      button.disabled = false;
    });

    const status = document.querySelector("#options-section .no-answer");
    if (status) {
      status.remove();
    }
  }

  //Moving to next question
  nextQuestion() {
    this.resetButtonStyles();

    if (this.currentQuestionIndex < this.questions.length - 1) {
      // Save the remaining time if the question is unanswered
      if (this.userAnswers[this.currentQuestionIndex] === undefined) {
        this.unansweredTimes[this.currentQuestionIndex] = this.timeLeft;
      }
      if (this.timeLeft === 0) {
        this.stopTimer();
        this.disableOptions();
      }

      this.currentQuestionIndex++;
      this.showQuestion(true);
    } else {
      this.showResults();
    }
  }

  //Moving to previous question
  prevQuestion() {
    this.resetButtonStyles();

    if (this.currentQuestionIndex > 0) {
      // Save the remaining time for the current question
      if (this.userAnswers[this.currentQuestionIndex] === undefined) {
        this.unansweredTimes[this.currentQuestionIndex] = this.timeLeft;
      }
      this.currentQuestionIndex--;
      if (this.timerElement.textContent === "Time Up!") {
        this.stopTimer();
        this.disableOptions();
      }
      // Show the previous question and prevent restarting the timer if the question was skipped
      if (this.userAnswers[this.currentQuestionIndex] === undefined) {
        this.showQuestion(true);
      } else {
        this.showQuestion(false);
      }
    }
  }

  //Starting the timer for current question
  startTimer() {
    this.timeLeft = this.unansweredTimes[this.currentQuestionIndex] || 30;
    this.timerElement.textContent = this.formatTime(this.timeLeft);

    this.timer = setInterval(() => {
      this.timeLeft--;
      this.timerElement.textContent = this.formatTime(this.timeLeft);

      if (this.timeLeft <= 0) {
        clearInterval(this.timer);
        this.timeLeft = 0;
        this.timerElement.textContent = "Time up!";
        this.disableOptions();
      }
    }, 1000);
  }

  //Stopping the timer
  stopTimer() {
    clearInterval(this.timer);
  }

  //Formatting time as MM:SS
  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes < 10 ? "0" : ""}${minutes}:${
      remainingSeconds < 10 ? "0" : ""
    }${remainingSeconds}`;
  }

  // Updating progress
  updateProgress() {
    const progressPercentage =
      ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
    this.progressBar.style.width = `${progressPercentage}%`;
    this.completedText.textContent = `${this.currentQuestionIndex + 1}/${
      this.questions.length
    } completed`;
  }

  //Updating score
  updateScoreDisplay() {
    this.scoreDisplay.textContent = `Score: ${this.score}`;
  }

  //Showing results with final score
  showResults() {
    this.quizContainer.style.display = "none";
    this.resultsScreen.style.display = "block";

    const scorePercentage = (this.score / (this.questions.length * 10)) * 100;
    document.getElementById("final-score").textContent = `${scorePercentage}%`;
  }

  //Retaking quiz and resetting all values
  retakeQuiz() {
    this.setupSection.style.display = "block";
    this.resultsScreen.style.display = "none";
    this.quizContainer.style.display = "none";

    this.init();
    this.score = 0;
    this.updateScoreDisplay();
    this.createQuestionNavBar();

    // CurrentQuestionIndex set to 0
    this.currentQuestionIndex = 0;
  }

  //Share result on different platform
  shareResults() {
    const scorePercentage = (this.score / (this.questions.length * 10)) * 100;
    const shareMessage = `I scored ${scorePercentage}% in the quiz!`;

    // Copy the message to clipboard
    navigator.clipboard
      .writeText(shareMessage)
      .then(() => {
        const modal = document.createElement("div");
        modal.className = "share-modal";

        const modalContent = `
                    <div class="share-modal-content">
                        <h2>Share Your Results</h2>
                        <p>Your results have been copied to clipboard.</p>
                        <p>Share on:</p>
                        <button id="share-teams">Microsoft Teams</button>
                        <button id="share-linkedin">LinkedIn</button>
                        <button id="share-outlook">Outlook</button>
                        <button id="close-modal">Close</button>
                    </div>
                `;
        modal.innerHTML = modalContent;
        document.body.appendChild(modal);

        document.getElementById("share-teams").addEventListener("click", () => {
          window.open("https://teams.microsoft.com/", "_blank");
        });

        document
          .getElementById("share-linkedin")
          .addEventListener("click", () => {
            window.open("https://www.linkedin.com/", "_blank");
          });

        document
          .getElementById("share-outlook")
          .addEventListener("click", () => {
            window.open("https://outlook.live.com/", "_blank");
          });

        document.getElementById("close-modal").addEventListener("click", () => {
          modal.remove();
        });
      })
      .catch((err) => {
        alert("Failed to copy results to clipboard.");
        console.error("Error copying to clipboard:", err);
      });
  }

  //Disabling options to prevent user from entering multiple options
  disableOptions() {
    const optionsButtons = document.querySelectorAll("#options-section button");
    optionsButtons.forEach((button) => {
      button.disabled = true;
    });
  }
}

//Create a new Quiz instance and initialize it
const quiz = new Quiz();
quiz.init();
