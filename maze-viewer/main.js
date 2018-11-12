let game_data;
let cy;

const cy_els = [];

(async () => {
  const response = await fetch("../tbg/game_data.json");
  game_data = await response.json();
  for (let room_data of game_data.rooms) {
    const [id, room] = Object.entries(room_data)[0];
    cy_els.push({data: {id}});
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
    style: [ // the stylesheet for the graph
      {selector: 'node', style: {'background-color': '#666', 'label': 'data(id)'}},
      {selector: 'edge', style: {'width': 3, 'line-color': '#ccc', 'target-arrow-color': '#ccc', 'target-arrow-shape': 'triangle'}}
    ],
    layout: {name: 'grid', rows: 1}
  });

})();

// var cy = cytoscape({
//         container: document.getElementById('cy-container'),
//         style: [
//     {
//         selector: 'node',
//         style: {
//             shape: 'hexagon',
//             'background-color': 'red',
//             label: 'data(id)'
//         }
//     }],
//     layout: {
//     name: 'grid'
// },
//         elements: [
//   // nodes
//   { data: { id: 'a' } },
//   { data: { id: 'b' } },
//   { data: { id: 'c' } },
//   { data: { id: 'd' } },
//   { data: { id: 'e' } },
//   { data: { id: 'f' } },
//   // edges
//   {
//     data: {
//       id: 'ab',
//       source: 'a',
//       target: 'b'
//     }
//   },
//   {
//     data: {
//       id: 'cd',
//       source: 'c',
//       target: 'd'
//     }
//   },
//   {
//     data: {
//       id: 'ef',
//       source: 'e',
//       target: 'f'
//     }
//   },
//   {
//     data: {
//       id: 'ac',
//       source: 'a',
//       target: 'd'
//     }
//   },
//   {
//     data: {
//       id: 'be',
//       source: 'b',
//       target: 'e'
//     }
//   }
// ]
//       });
