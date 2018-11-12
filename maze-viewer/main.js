let game_data;
let cy;
const cy_els = [];

const data_url = "https://raw.githubusercontent.com/EthanThatOneKid/MazeBot/master/tbg/game_data.json";

(async () => {
  const response = await fetch(data_url);
  game_data = await response.json();
  for (let room_data of game_data.rooms) {
    const [id, room] = Object.entries(room_data)[0];
    const {alias} = room;
    cy_els.push({data: {id, alias}});
    for (let exit of Object.values(room.exits)) {
      if (exit == -1) continue;
      cy_els.push({
        data: {
          id: id + exit,
          source: id,
          target: exit
        }
      });
    }
  }

  cy = cytoscape({
    container: document.querySelector("#cy-container"),
    elements: cy_els,
    style: [
      {selector: 'node', style: {'background-color': '#666', 'label': 'data(alias)'}},
      {selector: 'edge', style: {'width': 3, 'line-color': '#ccc', 'target-arrow-color': '#ccc', 'target-arrow-shape': 'triangle'}}
    ],
    layout: {name: 'breadthfirst'}
  });

})();
