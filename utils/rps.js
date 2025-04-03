let player_score = 0;
let computer_score = 0;
let game_counter = 0;

// get computer response
const comp_play = () => {
  let rand = Math.random();

  let computer_choice = "";

  if (rand < 0.34) {
    computer_choice = "rock";
  } else if (rand <= 0.67) {
    computer_choice = "paper";
  } else {
    computer_choice = "scissors";
  }

  return computer_choice;
};

export const compareChoices = (player_choice) => {
  let result = "";
  let computer_choice = comp_play();

  if (player_choice === computer_choice) {
    result = "draw";
    return [result, player_choice, computer_choice];
  } else if (player_choice === "rock") {
    if (computer_choice === "scissors") {
      player_score++;
      result = "player";
      return [result, player_choice, computer_choice];
    } else {
      computer_score++;
      result = "computer";
      return [result, player_choice, computer_choice];
    }
  } else if (player_choice === "paper") {
    if (computer_choice === "rock") {
      player_score++;
      result = "player";
      return [result, player_choice, computer_choice];
    } else {
      computer_score++;
      result = "computer";
      return [result, player_choice, computer_choice];
    }
  } else if (player_choice === "scissors") {
    if (computer_choice === "paper") {
      player_score++;
      result = "player";
      return [result, player_choice, computer_choice];
    } else {
      computer_score++;
      result = "computer";
      return [result, player_choice, computer_choice];
    }
  }
};

export const getPercent = (score) => {
  let percent = (100 * score) / 3;
  return percent;
};

const get_score = () => {
  if (player_score > computer_score) {
    console.log("Player wins the game!");
    console.log(`${player_score} : ${computer_score}`);
    // return "player";
  } else {
    console.log("Computer wins the game!");
    console.log(`${player_score} : ${computer_score}`);
    // return "computer";
  }
};

export const stringFormatter = (str) => {
  // if(str){
  if (str) {
    let n = str.length;
    if (n > 4) {
      return str.slice(0, 8) + "..." + str.slice(-2, n);
    }
    return str;
  }
  return;
};
