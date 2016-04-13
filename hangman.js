var requestUrl = "https://strikingly-hangman.herokuapp.com/game/on";
var playerId = "lee.huishan@u.nus.edu";
var sessionId = null;
var targetScore = 0;


function startGame() {

  console.log("startGame()");

  console.log("Game Started");

  targetScore = parseInt($("#targetScore").val(), 10);


  var startGameRequest = {
    "playerId" : playerId,
    "action" : "startGame"
  };

  var startGameResponse = JsonResponse(requestUrl, JSON.stringify(startGameRequest));
  console.log(startGameResponse);
  sessionId = startGameResponse.sessionId;

  for (var i = 0; i < startGameResponse.data.numberOfWordsToGuess; i++) {
    var listOfWrongAlphabets = "";
    var nextWordRequest = {
      "sessionId" : sessionId,
      "action" : "nextWord"
    };

    var nextWordResponse = JsonResponse(requestUrl, JSON.stringify(nextWordRequest));
    console.log("nextWordResponse : " + nextWordResponse);
    var word = nextWordResponse.data.word;
    console.log("word : " + word);

  while (listOfWrongAlphabets.length< startGameResponse.data.numberOfGuessAllowedForEachWord) {

    console.log("start while loop in startGame()");

    console.log("listOfWrongAlphabets.length :" + listOfWrongAlphabets.length);
    console.log("startGameResponse.data.numberOfGuessAllowedForEachWord : "+ startGameResponse.data.numberOfGuessAllowedForEachWord);


      var guessAlphabet = findWord(word, listOfWrongAlphabets);
      console.log("guessAlphabet : " + guessAlphabet);
      if (guessAlphabet == "") {
          break;
      }

      console.log("guessAlphabet: "+guessAlphabet);
      var guessWordRequest = {
        "sessionId" : sessionId,
        "action": "guessWord",
        "guess" : guessAlphabet
      };

      var guessWordResponse = JsonResponse(requestUrl, JSON.stringify(guessWordRequest));
      word = guessWordResponse.data.word;
      console.log("current word : " + word);

      if (!checkIfContainAlphabets(word, guessAlphabet)) {
        listOfWrongAlphabets += guessAlphabet;
        console.log("guessAlphabet :" + guessAlphabet);
      }

      if (!checkIfContainAlphabets(word, "*")) {

        console.log("You guessed the word : " + word);
        break;
      }


    }

    console.log("Question number: " + i);

  }

  var getResultRequest = {
    "sessionId" : sessionId,
    "action" : "getResult"
  };

  getResultResponse = JsonResponse(requestUrl, JSON.stringify(getResultRequest));
  console.log(getResultResponse);
    var submitResultRequest = {
      "sessionId" : sessionId,
      "action" : "submitResult"
    };
    console.log(submitResultRequest);
    submitResultResponse = JsonResponse(requestUrl, JSON.stringify(submitResultRequest));
    console.log(submitResultResponse);
    $("#score").text(submitResultResponse.data.score);


}

function JsonResponse(requestUrl, requestData) {

  var xhttp = null;

  if (window.XMLHttpRequest) {
    xhttp = new XMLHttpRequest();
  }

  else {
    xhttp = new ActiveXObject("Microsoft.XMLHTTP");
  }

  xhttp.open("POST", requestUrl, false);
  xhttp.setRequestHeader("Content-type", "application/json");
  console.log(requestUrl,requestData);
  xhttp.send(requestData);

  if (xhttp.readyState == 4 && xhttp.status == 200) {
    return (JSON.parse(xhttp.responseText));
  }


  else
  return console.log("Error occurred when trying to load page");
}


function findWord(word, wrongAlphabets) {
  try {


    var dictionaryUrl = "http://api.wordnik.com:80/v4/words.json/search/" + word + "?caseSensitive=false&minCorpusCount=5&maxCorpusCount=-1&minDictionaryCount=1&maxDictionaryCount=-1&minLength=" + word.length + "&maxLength=" + word.length + "&skip=0&limit=100000&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5"

    var xhttp = null;

    if (window.XMLHttpRequest) {
      xhttp = new XMLHttpRequest();
    }

    else {
      xhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xhttp.open("GET", dictionaryUrl, false);
    xhttp.send();


    var dictionaryResultList = JSON.parse(xhttp.responseText);


    if (dictionaryResultList !== null) {

      var totalResults = dictionaryResultList.totalResults;
      var searchResults = dictionaryResultList.searchResults;

      if (totalResults > 0) {
        var matchedResults = [];
        for (var i = 0; i < searchResults.length; i++) {

          var wordResult  = searchResults[i].word;
          if (!checkIfContainAlphabets(wordResult, wrongAlphabets)) {
            matchedResults.push(wordResult.toUpperCase());
          }

        }
      }

      return alphabetWithHighestFrequency(matchedResults, wrongAlphabets, word);
    }
      else {
        return getRandomChar(word, wrongAlphabets);
      }

  }
  catch (err) {
    console.log(err);

  }
}

function checkIfContainAlphabets(wordResult, wrongAlphabets) {

  var wordUpper = wordResult.toUpperCase();
  var wrongAlphabetsUpper = wrongAlphabets.toUpperCase();

  for (var i = 0; i < wrongAlphabetsUpper.length; i++) {
    if (wordUpper.indexOf(wrongAlphabetsUpper[i]) != -1) {
      return true;
    }
  }
  return false;
}

function alphabetWithHighestFrequency(matchedResults, wrongAlphabets, currentWord) {
  console.log("inside alphabetWithHighestFrequency");
  console.log("wrongAlphabets: " + wrongAlphabets);
  console.log("currentWord: " + currentWord);
  var freq = {};
  var A2Z = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var upperCurrentWord = currentWord.toUpperCase();
  var charsToExclude = upperCurrentWord.ReplaceAll("*", "") + currentWord.toUpperCase();

  var updatedA2Z = "";

  for (var i = 0; i < A2Z.length; i++) {
    if (checkIfContainAlphabets(charsToExclude, A2Z[i])) {} else {
      updatedA2Z += A2Z[i];
    }
  }

  for (var i=0; i<matchedResults.length;i++) {

    for (var j = 0 ; j < matchedResults[i].length; j++) {
      var alphabet = matchedResults[i].charAt(j);
      if (freq[alphabet]) {
        freq[alphabet]++;
      } else {
        freq[alphabet] = 1;
      }
    }

  }
  console.log(freq);

  if (freq.length == 0) {
    return "";
  }

  var highestFreqChar = "";
  var highestFreqCount = 0;

  console.log("updatedA2Z : "+ updatedA2Z);


    for (key in freq) {
      if (freq.hasOwnProperty(key)) {
        if (updatedA2Z.indexOf(key) > -1) {
          if (freq[key] > highestFreqCount) {
            highestFreqChar = key;
            highestFreqCount = freq[key];

          }
        }
      }
    }



  return highestFreqChar;
}

function getRandomChar(word, listOfWrongAlphabets) {
    var upperQuery = word.toUpperCase(),
        A2Z = "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        charsToRemove = upperQuery.ReplaceAll("*", "") + listOfWrongAlphabets.toUpperCase(),
        stripped = "";
    for (var i = 0; i < A2Z.length; i++) {
        if (checkIfContainAlphabets(charsToRemove, A2Z[i])) {} else {
            stripped += A2Z[i];
        }
    }
    var rnum = Math.floor(Math.random() * stripped.length);
    var result = stripped[rnum].toUpperCase();
    console.log("get random: " + result);
    return result;
}

function ReplaceAll(Source, stringToFind, stringToReplace) {
  var temp = Source,
  index = temp.indexOf(stringToFind);
  while (index != -1) {
    temp = temp.replace(stringToFind, stringToReplace);
    index = temp.indexOf(stringToFind);
  }
  return temp;
}

String.prototype.ReplaceAll = function (stringToFind, stringToReplace) {
  var temp = this,
  index = temp.indexOf(stringToFind);
  while (index != -1) {
    temp = temp.replace(stringToFind, stringToReplace);
    index = temp.indexOf(stringToFind);
  }
  return temp;
}
