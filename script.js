"use strict";

const WORDS = [
  "aga",
  "ande",
  "andra",
  "ara",
  "arm",
  "att",
  "backar",
  "bagare",
  "bank",
  "bar",
  "braka",
  "dar",
  "fader",
  "fakta",
  "falla",
  "fasta",
  "gast",
  "halsa",
  "har",
  "kladd",
  "knacka",
  "kram",
  "langa",
  "lapp",
  "lat",
  "man",
  "massa",
  "nacka",
  "natt",
  "par",
  "platt",
  "rad",
  "raka",
  "rata",
  "ratt",
  "saga",
  "saker",
  "salta",
  "sand",
  "satt",
  "skall",
  "slatt",
  "small",
  "spratt",
  "stall",
  "stank",
  "svalt",
  "svarta",
  "tacka",
  "talja",
  "tank",
  "tar",
  "tavla",
  "trana",
  "tratt",
  "tratt",
  "val",
  "vanlig",
  "vantar",
  "varken",
  "vaska",
];

(async () => {
  const voice = await getVoice();
  const wordContainer = document.getElementById("word");
  const answerButtons = Array.from(document.querySelectorAll("input[type=radio]"));
  const letterButtons = Array.from(document.querySelectorAll("button[data-letter]"));
  const feedback = document.getElementById("feedback");
  const progress = document.getElementById("progress");
  const list = [];
  nextWord();

  WORDS.forEach(() => {
    const answer = document.createElement("span");
    progress.appendChild(answer);
  });

  letterButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      if (button.dataset.letter === "a") {
        speak(unToggleWord(list[0]));
      } else {

        speak(toggleWord(list[0]));
      }
    });
  });

  const next = document.getElementById("next");
  next.addEventListener("click", async () => {
    if (next.disabled) return;

    nextWord();
    answerButtons.forEach((button) => {
      button.checked = false;
    });
    feedback.className = "";
    next.disabled = true;
  });

  answerButtons
    .forEach((button) => {
      button.addEventListener("click", function (event) {
        if (feedback.className !== "") {
          event.preventDefault();
          return;
        }
        next.removeAttribute("disabled");
        const word = list[0];

        const answer = this.value === "a"
          ? unToggleWord(word)
          : toggleWord(word);

        if (word === answer) {
          feedback.classList.add("correct");
          feedback.classList.remove("wrong");
          setProgress("correct", word);
        } else {
          feedback.classList.remove("correct");
          feedback.classList.add("wrong");
          setProgress("wrong", word);
        }
      });
    });

  // The speech synthesis is loaded asynchronously,
  // so we need to poll it in order to populate the list
  async function getVoice() {
    const desiredLanguge = "sv-SE";
    const voices = await new Promise((resolve) => {
      const interval = setInterval(() => {
        const voiceArray = window.speechSynthesis.getVoices();
        if (voiceArray.length > 0) {
          resolve(voiceArray);
          clearInterval(interval);
        }
      }, 50);
    });

    if (location.hash === "#voices") {
      const debug = document.createElement("pre");
      debug.style.textAlign = "left";
      debug.innerText = JSON.stringify(
        voices.map((v) => {
          return {
            name: v.name,
            lang: v.lang,
          };
        }), null, 2);
      document.body.appendChild(debug);
    }

    return voices
      .find((item) => {
        // Sometimes, the language and country code is
        // separated with underscore, and sometimes with a hyphen...
        return item.lang.replace("_", "-") === desiredLanguge;
      });
  }

  function speak(word) {
    if (window.speechSynthesis.speaking) return;

    // Use lower-case to avoid making the TTS thinking the word is an abbreviation
    const utterance = new SpeechSynthesisUtterance(word.toLowerCase());
    utterance.voice = voice;
    utterance.rate = 0.75;
    window.speechSynthesis.speak(utterance);
  }

  function nextWord() {
    shuffleAnswers();
    list.shift();

    if (list.length === 0) {
      resetProgress();
      list.push(...shuffle(WORDS)
        .map((word) => {
          if (Math.random() < 0.5) {
            return toggleWord(word);
          }
          return word;
        })
        .map((word) => {
          if (Math.random() < 0.5) {
            return word.toUpperCase();
          }
          return word;
        }),
      );
    }

    wordContainer.innerText = list[0];
    wordContainer.style.fontFamily = Math.random() < 0.5 ? "serif" : "sans-serif";
  }

  function shuffleAnswers() {
    if (Math.random() < 0.5) {
      letterButtons[0].dataset.letter = "a";
      letterButtons[1].dataset.letter = "ä";
      answerButtons[0].value = "a";
      answerButtons[1].value = "ä";
    } else {
      letterButtons[0].dataset.letter = "ä";
      letterButtons[1].dataset.letter = "a";
      answerButtons[0].value = "ä";
      answerButtons[1].value = "a";
    }
  }
})();

function setProgress(className, word) {
  const answer = document.querySelector("#progress > span:not([class])");
  answer.title = word;
  answer.classList.add(className);
}

function resetProgress() {
  const answers = document.querySelectorAll("#progress > span");
  Array.from(answers).forEach((answer) => {
    answer.removeAttribute("class");
    answer.removeAttribute("title");
  });
}

function shuffle(array) {
  const arrayCopy = array.slice();
  const shuffledArray = [];

  while (shuffledArray.length < array.length) {
    const randomIndex = Math.random() * arrayCopy.length;
    const [ randomItem ] = arrayCopy.splice(randomIndex, 1);
    shuffledArray.push(randomItem);
  }

  return shuffledArray;
}

function toggleWord(word) {
  if (/ä/i.test(word)) {
    return word;
  }
  return word
    .replace("a", "ä")
    .replace("A", "Ä");
}

function unToggleWord(word) {
  return word
    .replace("ä", "a")
    .replace("Ä", "A");
}
