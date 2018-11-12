let game_data;

(async () => {
  const response = await fetch("../tbg/game_data.json");
  game_data = await response.json();
  console.log(game_data);
})();
