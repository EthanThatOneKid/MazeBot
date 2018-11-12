class Maze {

  constructor(rooms) {
    this.rooms = rooms;
    this.data = [[]];
    this.dict = {};
  }

  append(room) {
    console.log(room);
  }

  pushCol() {
    for (let y = 0; y < this.data.length; y++)
      this.data[y].push({});
  }

  pushRow() {
    this.data.push(new Array(this.data[0].length).fill({}));
  }

  unshiftCol() {
    for (let y = 0; y < this.data.length; y++)
      this.data[y].unshift({});
  }

  unshiftRow() {
    this.data.unshift(new Array(this.data[0].length).fill({}));
  }

}
